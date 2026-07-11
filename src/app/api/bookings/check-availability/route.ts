import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { generateTimeSlots, resolveDefaultLocationId } from '@/lib/availability'
import { z } from 'zod'

const schema = z.object({
  origin_location_id: z.string().min(1),
  destination_location_id: z.string().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = schema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Parámetros inválidos', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const { origin_location_id, destination_location_id, date } = parsed.data

    if (origin_location_id === destination_location_id) {
      return NextResponse.json(
        { error: 'El origen y destino no pueden ser iguales' },
        { status: 400 }
      )
    }

    const supabase = createServiceClient()

    // Get route
    const { data: route, error: routeError } = await supabase
      .from('routes')
      .select('*')
      .eq('origin_location_id', origin_location_id)
      .eq('destination_location_id', destination_location_id)
      .eq('active', true)
      .single()

    if (routeError || !route) {
      return NextResponse.json(
        { error: 'Ruta no disponible' },
        { status: 404 }
      )
    }

    // Get vehicle
    const { data: vehicle, error: vehicleError } = await supabase
      .from('vehicle')
      .select('*')
      .eq('active', true)
      .single()

    if (vehicleError || !vehicle) {
      return NextResponse.json(
        { error: 'No hay vehículos disponibles' },
        { status: 404 }
      )
    }

    // Get settings
    const { data: settingsRows } = await supabase.from('settings').select('*')
    const settings: Record<string, string> = {}
    settingsRows?.forEach((s: { key: string; value: string }) => {
      settings[s.key] = s.value
    })

    const minNoticeHours = parseInt(settings.min_booking_notice_hours || '6')
    const locationMode = settings.vehicle_location_mode || 'persistent'

    const { data: locations } = await supabase.from('locations').select('*')
    const defaultLocationId = resolveDefaultLocationId(
      locationMode,
      settings.default_start_location,
      locations || [],
      vehicle.default_location_id
    )

    // Get confirmed bookings for date range
    const dateStart = new Date(`${date}T00:00:00-05:00`).toISOString()
    const dateEnd = new Date(`${date}T23:59:59-05:00`).toISOString()

    const { data: bookings } = await supabase
      .from('bookings')
      .select('*')
      .eq('vehicle_id', vehicle.id)
      .in('status', ['CONFIRMED', 'PAID_FULL', 'PENDING_PAYMENT'])
      .or(`pickup_datetime.gte.${new Date(`${date}T00:00:00-05:00`).toISOString()},vehicle_release_datetime.gte.${dateStart}`)

    // Get blocks that overlap with this date
    const { data: blocks } = await supabase
      .from('vehicle_blocks')
      .select('*')
      .eq('vehicle_id', vehicle.id)
      .lt('starts_at', dateEnd)
      .gt('ends_at', dateStart)

    const slots = generateTimeSlots(
      date,
      route,
      bookings || [],
      blocks || [],
      defaultLocationId,
      locationMode,
      minNoticeHours
    )

    const availableSlots = slots.filter((s) => s.available)

    return NextResponse.json({
      slots,
      available_count: availableSlots.length,
      route: {
        id: route.id,
        estimated_duration_minutes: route.estimated_duration_minutes,
        buffer_minutes: route.buffer_minutes,
        base_price_cop: route.base_price_cop,
      },
      deposit_percentage: parseInt(settings.deposit_percentage || '50'),
    })
  } catch (err) {
    console.error('Availability error:', err)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

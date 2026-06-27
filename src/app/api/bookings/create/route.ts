import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { isSlotAvailable } from '@/lib/availability'
import { generateBookingCode } from '@/lib/utils'
import { isSundayOrHoliday } from '@/lib/surcharge'
import { addMinutes } from 'date-fns'
import { z } from 'zod'

const schema = z.object({
  origin_location_id: z.string().min(1),
  destination_location_id: z.string().min(1),
  pickup_datetime: z.string().datetime({ offset: true }),
  passengers_count: z.number().int().min(1).max(10),
  luggage_count: z.number().int().min(0).max(20),
  customer_name: z.string().min(2).max(200),
  customer_email: z.string().email(),
  customer_phone: z.string().min(7).max(20),
  pickup_address: z.string().min(5).max(500),
  dropoff_address: z.string().min(5).max(500),
  notes: z.string().max(1000).optional(),
  payment_type: z.enum(['deposit', 'full']).default('deposit'),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = schema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const data = parsed.data

    if (data.origin_location_id === data.destination_location_id) {
      return NextResponse.json(
        { error: 'El origen y destino no pueden ser iguales' },
        { status: 400 }
      )
    }

    const supabase = createServiceClient()

    // Get route (server-side, never trust client)
    const { data: route, error: routeError } = await supabase
      .from('routes')
      .select('*')
      .eq('origin_location_id', data.origin_location_id)
      .eq('destination_location_id', data.destination_location_id)
      .eq('active', true)
      .single()

    if (routeError || !route) {
      return NextResponse.json({ error: 'Ruta no disponible' }, { status: 404 })
    }

    // Get vehicle
    const { data: vehicle } = await supabase
      .from('vehicle')
      .select('*')
      .eq('active', true)
      .single()

    if (!vehicle) {
      return NextResponse.json({ error: 'Sin vehículos disponibles' }, { status: 404 })
    }

    // Validate passengers/luggage capacity
    if (data.passengers_count > vehicle.capacity_passengers) {
      return NextResponse.json(
        { error: `El vehículo tiene capacidad máxima de ${vehicle.capacity_passengers} pasajeros` },
        { status: 400 }
      )
    }

    // Get settings
    const { data: settingsRows } = await supabase.from('settings').select('*')
    const settings: Record<string, string> = {}
    settingsRows?.forEach((s: { key: string; value: string }) => {
      settings[s.key] = s.value
    })

    const minNoticeHours = parseInt(settings.min_booking_notice_hours || '6')
    const maxDaysAhead = parseInt(settings.max_booking_days_ahead || '60')
    const depositPercentage = parseInt(settings.deposit_percentage || '50')
    const sundaySurchargePct = parseInt(settings.sunday_surcharge_pct || '10')
    const locationMode = settings.vehicle_location_mode || 'persistent'

    // Validate future date limit
    const pickupDate = new Date(data.pickup_datetime)
    const now = new Date()
    const maxDate = new Date(now.getTime() + maxDaysAhead * 24 * 60 * 60 * 1000)
    if (pickupDate > maxDate) {
      return NextResponse.json(
        { error: `Solo se permiten reservas hasta ${maxDaysAhead} días en el futuro` },
        { status: 400 }
      )
    }

    // Get existing bookings that could conflict (broader window)
    const { data: existingBookings } = await supabase
      .from('bookings')
      .select('*')
      .eq('vehicle_id', vehicle.id)
      .in('status', ['CONFIRMED', 'PAID_FULL', 'PENDING_PAYMENT'])

    // Get blocks
    const { data: blocks } = await supabase
      .from('vehicle_blocks')
      .select('*')
      .eq('vehicle_id', vehicle.id)

    // Server-side availability check
    const { available, reason } = isSlotAvailable(
      pickupDate,
      route,
      existingBookings || [],
      blocks || [],
      vehicle.default_location_id,
      locationMode,
      minNoticeHours
    )

    if (!available) {
      return NextResponse.json(
        { error: reason || 'Horario no disponible' },
        { status: 409 }
      )
    }

    // Calculate prices server-side (with Sunday/holiday surcharge)
    const dateStr = pickupDate.toISOString().slice(0, 10)
    const surchargeAmount = isSundayOrHoliday(dateStr)
      ? Math.round(Number(route.base_price_cop) * sundaySurchargePct / 100)
      : 0
    const totalPrice = Number(route.base_price_cop) + surchargeAmount
    const depositAmount = Math.round(totalPrice * (depositPercentage / 100))
    const balanceAmount = totalPrice - depositAmount
    const chargeAmount = data.payment_type === 'full' ? totalPrice : depositAmount

    const estimatedArrival = addMinutes(pickupDate, route.estimated_duration_minutes)
    const vehicleRelease = addMinutes(estimatedArrival, route.buffer_minutes)

    // Create booking in PENDING_PAYMENT state (using transaction pattern)
    const bookingCode = generateBookingCode()

    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .insert({
        booking_code: bookingCode,
        customer_name: data.customer_name.trim(),
        customer_email: data.customer_email.toLowerCase().trim(),
        customer_phone: data.customer_phone.trim(),
        origin_location_id: data.origin_location_id,
        destination_location_id: data.destination_location_id,
        pickup_address: data.pickup_address.trim(),
        dropoff_address: data.dropoff_address.trim(),
        pickup_datetime: pickupDate.toISOString(),
        estimated_arrival_datetime: estimatedArrival.toISOString(),
        vehicle_release_datetime: vehicleRelease.toISOString(),
        passengers_count: data.passengers_count,
        luggage_count: data.luggage_count,
        notes: data.notes?.trim() || null,
        route_id: route.id,
        vehicle_id: vehicle.id,
        total_price_cop: totalPrice,
        deposit_amount_cop: depositAmount,
        balance_amount_cop: balanceAmount,
        status: 'PENDING_PAYMENT',
        payment_status: 'PENDING',
      })
      .select()
      .single()

    if (bookingError || !booking) {
      console.error('Booking creation error:', bookingError)
      return NextResponse.json(
        { error: 'Error al crear la reserva. Intenta de nuevo.' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      booking_id: booking.id,
      booking_code: bookingCode,
      total_price_cop: totalPrice,
      charge_amount_cop: chargeAmount,
      deposit_amount_cop: depositAmount,
      balance_amount_cop: balanceAmount,
      payment_type: data.payment_type,
    })
  } catch (err) {
    console.error('Create booking error:', err)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

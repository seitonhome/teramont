import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { getVehicleStateAt, resolveDefaultLocationId } from '@/lib/availability'
import { toZonedTime } from 'date-fns-tz'

const TIMEZONE = 'America/Bogota'

export async function GET(req: NextRequest) {
  try {
    const authClient = await createClient()
    const { data: { session } } = await authClient.auth.getSession()
    if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const supabase = createServiceClient()

    const [vehicleRes, bookingsRes, blocksRes, settingsRes, locationsRes] = await Promise.all([
      supabase.from('vehicle').select('*').eq('active', true).single(),
      supabase
        .from('bookings')
        .select('*')
        .in('status', ['CONFIRMED', 'PAID_FULL', 'PENDING_PAYMENT']),
      supabase.from('vehicle_blocks').select('*'),
      supabase.from('settings').select('*'),
      supabase.from('locations').select('*'),
    ])

    const vehicle = vehicleRes.data
    if (!vehicle) return NextResponse.json({ state_label: 'Sin vehículo' })

    const settings: Record<string, string> = {}
    settingsRes.data?.forEach((s: { key: string; value: string }) => {
      settings[s.key] = s.value
    })

    const locations = locationsRes.data || []
    const getLocationName = (id: string) =>
      locations.find((l: { id: string; name: string }) => l.id === id)?.name || 'Desconocido'

    const locationMode = settings.vehicle_location_mode || 'persistent'
    const defaultLocationId = resolveDefaultLocationId(
      locationMode,
      settings.default_start_location,
      locations,
      vehicle.default_location_id
    )

    const now = new Date()
    const state = getVehicleStateAt(
      now,
      bookingsRes.data || [],
      blocksRes.data || [],
      defaultLocationId,
      locationMode
    )

    let stateLabel = ''
    switch (state.status) {
      case 'available':
        stateLabel = `Disponible en ${getLocationName(state.location_id)}`
        break
      case 'in_service':
        stateLabel = `En servicio desde ${getLocationName(state.location_id)}`
        break
      case 'buffer':
        stateLabel = `Buffer operativo en ${getLocationName(state.location_id)}`
        break
      case 'blocked':
        stateLabel = 'Bloqueado manualmente'
        break
      case 'repositioning':
        stateLabel = 'En reposicionamiento'
        break
    }

    const nowBogota = toZonedTime(now, TIMEZONE)

    return NextResponse.json({
      state,
      state_label: stateLabel,
      location_name: getLocationName(state.location_id),
      current_time_bogota: nowBogota.toISOString(),
    })
  } catch (err) {
    console.error('Vehicle state error:', err)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

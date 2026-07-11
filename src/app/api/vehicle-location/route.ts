import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { getVehicleStateAt, resolveDefaultLocationId } from '@/lib/availability'

export async function GET() {
  try {
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
    if (!vehicle) {
      return NextResponse.json({ status: 'unavailable', location_name: null })
    }

    const settings: Record<string, string> = {}
    settingsRes.data?.forEach((s: { key: string; value: string }) => {
      settings[s.key] = s.value
    })

    const locations = locationsRes.data || []
    const locationMode = settings.vehicle_location_mode || 'persistent'
    const defaultLocationId = resolveDefaultLocationId(
      locationMode,
      settings.default_start_location,
      locations,
      vehicle.default_location_id
    )

    const state = getVehicleStateAt(
      new Date(),
      bookingsRes.data || [],
      blocksRes.data || [],
      defaultLocationId,
      locationMode
    )

    const locationName =
      locations.find((l: { id: string; name: string }) => l.id === state.location_id)?.name || null

    // Only expose a coarse, customer-safe status — never booking details.
    const publicStatus =
      state.status === 'available' ? 'available' :
      state.status === 'in_service' || state.status === 'buffer' ? 'in_service' :
      'unavailable'

    return NextResponse.json({
      status: publicStatus,
      location_name: publicStatus === 'available' ? locationName : null,
    })
  } catch (err) {
    console.error('Vehicle location error:', err)
    return NextResponse.json({ status: 'unavailable', location_name: null })
  }
}

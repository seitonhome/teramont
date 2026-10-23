import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    if (!/^[0-9a-f-]{36}$/i.test(id)) {
      return NextResponse.json({ error: 'Reserva no encontrada' }, { status: 404 })
    }
    const supabase = createServiceClient()

    const { data, error } = await supabase
      .from('bookings')
      .select(`
        id, booking_code, status, payment_status,
        pickup_datetime, estimated_arrival_datetime,
        pickup_address, dropoff_address, passengers_count,
        total_price_cop, deposit_amount_cop, balance_amount_cop,
        origin:origin_location_id(name),
        destination:destination_location_id(name)
      `)
      .eq('id', id)
      .single()

    if (error || !data) {
      return NextResponse.json({ error: 'Reserva no encontrada' }, { status: 404 })
    }

    const { origin, destination, ...booking } = data
    return NextResponse.json({
      booking,
      origin_name: (origin as unknown as { name: string })?.name || '',
      destination_name: (destination as unknown as { name: string })?.name || '',
    })
  } catch {
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

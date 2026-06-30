import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { z } from 'zod'

const schema = z.object({
  booking_code: z.string().min(1).max(20).transform((v) => v.toUpperCase().trim()),
  customer_email: z.string().email().transform((v) => v.toLowerCase().trim()),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = schema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 })
    }

    const { booking_code, customer_email } = parsed.data
    const supabase = createServiceClient()

    const { data, error } = await supabase
      .from('bookings')
      .select(`
        id, booking_code, status, payment_status,
        pickup_datetime, estimated_arrival_datetime,
        pickup_address, dropoff_address,
        passengers_count, luggage_count,
        total_price_cop, deposit_amount_cop, balance_amount_cop,
        customer_name, notes,
        origin:origin_location_id(name),
        destination:destination_location_id(name)
      `)
      .eq('booking_code', booking_code)
      .eq('customer_email', customer_email)
      .single()

    if (error || !data) {
      return NextResponse.json({ error: 'Reserva no encontrada' }, { status: 404 })
    }

    return NextResponse.json({
      booking: data,
      origin_name: (data.origin as unknown as { name: string })?.name || '',
      destination_name: (data.destination as unknown as { name: string })?.name || '',
    })
  } catch {
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

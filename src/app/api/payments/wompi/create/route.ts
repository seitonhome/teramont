import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { createWompiTransaction } from '@/lib/wompi'
import { z } from 'zod'

const schema = z.object({
  booking_id: z.string().min(1),
  payment_type: z.enum(['deposit', 'full']).default('deposit'),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = schema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 })
    }

    const { booking_id, payment_type } = parsed.data
    const supabase = createServiceClient()

    // Get booking
    const { data: booking, error } = await supabase
      .from('bookings')
      .select('*, origin:origin_location_id(name), destination:destination_location_id(name)')
      .eq('id', booking_id)
      .in('status', ['PENDING_PAYMENT', 'CONFIRMED'])
      .single()

    if (error || !booking) {
      return NextResponse.json({ error: 'Reserva no encontrada' }, { status: 404 })
    }

    // Already has approved payment?
    if (booking.payment_status === 'APPROVED') {
      return NextResponse.json({ error: 'Esta reserva ya tiene un pago aprobado' }, { status: 400 })
    }

    const amountCop =
      payment_type === 'full'
        ? Number(booking.total_price_cop)
        : Number(booking.deposit_amount_cop)

    const reference = `${booking.booking_code}-${payment_type === 'full' ? 'full' : 'dep'}-${Date.now()}`

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
    const redirectUrl = `${baseUrl}/reserva/confirmacion?booking_id=${booking_id}&reference=${reference}`

    const { checkout_url, error: wompiError } = await createWompiTransaction({
      amount_in_cents: amountCop * 100,
      currency: 'COP',
      customer_email: booking.customer_email,
      reference,
      redirect_url: redirectUrl,
      customer_data: {
        full_name: booking.customer_name,
        phone_number: booking.customer_phone,
      },
    })

    if (wompiError || !checkout_url) {
      return NextResponse.json(
        { error: wompiError || 'Error al crear el pago' },
        { status: 500 }
      )
    }

    // Save payment record
    const { data: payment } = await supabase
      .from('payments')
      .insert({
        booking_id,
        provider: 'wompi',
        provider_reference: reference,
        amount_cop: amountCop,
        currency: 'COP',
        payment_type,
        status: 'PENDING',
        checkout_url,
      })
      .select()
      .single()

    return NextResponse.json({
      checkout_url,
      payment_id: payment?.id,
      reference,
      amount_cop: amountCop,
    })
  } catch (err) {
    console.error('Wompi create error:', err)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

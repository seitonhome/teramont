import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { verifyWompiWebhookSignature, mapWompiStatus } from '@/lib/wompi'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    if (!verifyWompiWebhookSignature(body)) {
      return NextResponse.json({ error: 'Firma inválida' }, { status: 401 })
    }

    const event = body?.event
    const transaction = body?.data?.transaction

    if (!transaction) {
      return NextResponse.json({ received: true })
    }

    const reference = transaction.reference as string
    const wompiStatus = transaction.status as string
    const transactionId = transaction.id as string
    const amountInCents = transaction.amount_in_cents as number

    const supabase = createServiceClient()

    // Find payment by reference
    const { data: payment } = await supabase
      .from('payments')
      .select('*, booking:booking_id(*)')
      .eq('provider_reference', reference)
      .single()

    if (!payment) {
      // Try to find by partial reference (booking_code)
      const bookingCode = reference?.split('-').slice(0, 3).join('-')
      console.log('Payment not found for reference:', reference, 'booking code hint:', bookingCode)
      return NextResponse.json({ received: true })
    }

    const mappedStatus = mapWompiStatus(wompiStatus)

    // Update payment
    await supabase
      .from('payments')
      .update({
        provider_transaction_id: String(transactionId),
        status: mappedStatus,
        raw_response: body,
      })
      .eq('id', payment.id)

    const booking = payment.booking as Record<string, unknown>

    // Update booking based on payment status
    if (mappedStatus === 'APPROVED') {
      const isFullPayment =
        payment.payment_type === 'full' ||
        Math.abs((amountInCents / 100) - Number(booking.total_price_cop)) < 1

      await supabase
        .from('bookings')
        .update({
          status: isFullPayment ? 'PAID_FULL' : 'CONFIRMED',
          payment_status: 'APPROVED',
        })
        .eq('id', booking.id as string)

      console.log(`Booking ${booking.booking_code} CONFIRMED via Wompi webhook`)
    } else if (mappedStatus === 'DECLINED' || mappedStatus === 'ERROR') {
      await supabase
        .from('bookings')
        .update({
          status: 'PAYMENT_FAILED',
          payment_status: mappedStatus,
        })
        .eq('id', booking.id as string)

      console.log(`Booking ${booking.booking_code} PAYMENT_FAILED`)
    } else if (mappedStatus === 'VOIDED') {
      await supabase
        .from('bookings')
        .update({
          status: 'EXPIRED',
          payment_status: 'VOIDED',
        })
        .eq('id', booking.id as string)
    }

    return NextResponse.json({ received: true })
  } catch (err) {
    console.error('Webhook error:', err)
    return NextResponse.json({ error: 'Error procesando webhook' }, { status: 500 })
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { mapWompiStatus } from '@/lib/wompi'

const WOMPI_BASE_URL =
  process.env.WOMPI_ENVIRONMENT === 'production'
    ? 'https://production.wompi.co/v1'
    : 'https://sandbox.wompi.co/v1'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const reference = searchParams.get('reference')

    if (!reference) {
      return NextResponse.json({ error: 'reference requerido' }, { status: 400 })
    }

    const supabase = createServiceClient()

    // Find our payment record
    const { data: payment } = await supabase
      .from('payments')
      .select('*, booking:booking_id(*)')
      .eq('provider_reference', reference)
      .single()

    if (!payment) {
      return NextResponse.json({ error: 'Pago no encontrado' }, { status: 404 })
    }

    const booking = payment.booking as Record<string, unknown>

    // If already confirmed, no need to call Wompi
    if (
      payment.status === 'APPROVED' ||
      booking.status === 'CONFIRMED' ||
      booking.status === 'PAID_FULL'
    ) {
      return NextResponse.json({ status: 'APPROVED', booking })
    }

    // Query Wompi for the current transaction status
    const wompiRes = await fetch(
      `${WOMPI_BASE_URL}/transactions?reference=${encodeURIComponent(reference)}`,
      {
        headers: { Authorization: `Bearer ${process.env.WOMPI_PRIVATE_KEY}` },
        cache: 'no-store',
      }
    )

    if (!wompiRes.ok) {
      return NextResponse.json({ status: 'PENDING', booking })
    }

    const wompiData = await wompiRes.json()
    const transactions: Array<Record<string, unknown>> = wompiData?.data || []

    // Find the most recent APPROVED transaction, else take the last one
    const approved = transactions.find((t) => t.status === 'APPROVED')
    const latest = approved || transactions[transactions.length - 1]

    if (!latest) {
      return NextResponse.json({ status: 'PENDING', booking })
    }

    const mappedStatus = mapWompiStatus(latest.status as string)
    const transactionId = latest.id as string
    const amountInCents = latest.amount_in_cents as number

    // Update payment record
    await supabase
      .from('payments')
      .update({
        provider_transaction_id: String(transactionId),
        status: mappedStatus,
        raw_response: latest,
      })
      .eq('id', payment.id)

    // Update booking status
    if (mappedStatus === 'APPROVED') {
      const isFullPayment =
        payment.payment_type === 'full' ||
        Math.abs(amountInCents / 100 - Number(booking.total_price_cop)) < 1

      await supabase
        .from('bookings')
        .update({
          status: isFullPayment ? 'PAID_FULL' : 'CONFIRMED',
          payment_status: 'APPROVED',
        })
        .eq('id', booking.id as string)

      return NextResponse.json({
        status: 'APPROVED',
        booking: {
          ...booking,
          status: isFullPayment ? 'PAID_FULL' : 'CONFIRMED',
          payment_status: 'APPROVED',
        },
      })
    }

    if (mappedStatus === 'DECLINED' || mappedStatus === 'ERROR') {
      await supabase
        .from('bookings')
        .update({ status: 'PAYMENT_FAILED', payment_status: mappedStatus })
        .eq('id', booking.id as string)

      return NextResponse.json({ status: mappedStatus, booking })
    }

    if (mappedStatus === 'VOIDED') {
      await supabase
        .from('bookings')
        .update({ status: 'EXPIRED', payment_status: 'VOIDED' })
        .eq('id', booking.id as string)

      return NextResponse.json({ status: 'VOIDED', booking })
    }

    return NextResponse.json({ status: mappedStatus, booking })
  } catch (err) {
    console.error('Wompi verify error:', err)
    return NextResponse.json({ error: 'Error verificando pago' }, { status: 500 })
  }
}

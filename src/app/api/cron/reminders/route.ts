import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { sendReminderEmail } from '@/lib/emails'

export async function GET(req: NextRequest) {
  const secret = req.headers.get('authorization')
  if (secret !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const supabase = createServiceClient()

    const now = new Date()
    // Window: bookings with pickup between 20h and 28h from now
    const windowStart = new Date(now.getTime() + 20 * 60 * 60 * 1000)
    const windowEnd = new Date(now.getTime() + 28 * 60 * 60 * 1000)

    const { data: bookings, error } = await supabase
      .from('bookings')
      .select(`
        *,
        origin:origin_location_id(name),
        destination:destination_location_id(name)
      `)
      .in('status', ['CONFIRMED', 'PAID_FULL'])
      .gte('pickup_datetime', windowStart.toISOString())
      .lte('pickup_datetime', windowEnd.toISOString())

    if (error) {
      console.error('Cron reminders query error:', error)
      return NextResponse.json({ error: 'DB error' }, { status: 500 })
    }

    if (!bookings || bookings.length === 0) {
      return NextResponse.json({ sent: 0, message: 'No bookings in window' })
    }

    const results = await Promise.allSettled(
      bookings.map((b) =>
        sendReminderEmail({
          bookingCode: b.booking_code,
          customerName: b.customer_name,
          customerEmail: b.customer_email,
          customerPhone: b.customer_phone,
          originName: (b.origin as { name: string })?.name || '',
          destinationName: (b.destination as { name: string })?.name || '',
          pickupDatetime: b.pickup_datetime,
          estimatedArrival: b.estimated_arrival_datetime,
          pickupAddress: b.pickup_address,
          dropoffAddress: b.dropoff_address,
          passengersCount: b.passengers_count,
          totalPriceCop: b.total_price_cop,
          depositAmountCop: b.deposit_amount_cop,
          balanceAmountCop: b.balance_amount_cop,
          notes: b.notes,
        })
      )
    )

    const sent = results.filter((r) => r.status === 'fulfilled').length
    const failed = results.filter((r) => r.status === 'rejected').length

    return NextResponse.json({ sent, failed, total: bookings.length })
  } catch (err) {
    console.error('Cron reminders error:', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}

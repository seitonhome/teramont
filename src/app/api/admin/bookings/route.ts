import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  try {
    const authClient = await createClient()
    const { data: { session } } = await authClient.auth.getSession()
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const supabase = createServiceClient()
    const { searchParams } = new URL(req.url)
    const limit = parseInt(searchParams.get('limit') || '50')
    const status = searchParams.get('status')
    const date = searchParams.get('date')

    let query = supabase
      .from('bookings')
      .select(`
        *,
        origin:origin_location_id(name),
        destination:destination_location_id(name),
        payments(*)
      `)
      .order('pickup_datetime', { ascending: false })
      .limit(limit)

    if (status) {
      query = query.eq('status', status)
    }
    if (date) {
      query = query
        .gte('pickup_datetime', `${date}T00:00:00-05:00`)
        .lte('pickup_datetime', `${date}T23:59:59-05:00`)
    }

    const { data, error } = await query

    if (error) throw error

    return NextResponse.json({ bookings: data })
  } catch (err) {
    console.error('Admin bookings error:', err)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

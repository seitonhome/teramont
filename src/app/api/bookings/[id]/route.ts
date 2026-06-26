import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = createServiceClient()

    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        origin:origin_location_id(name),
        destination:destination_location_id(name)
      `)
      .eq('id', id)
      .single()

    if (error || !data) {
      return NextResponse.json({ error: 'Reserva no encontrada' }, { status: 404 })
    }

    return NextResponse.json({
      booking: data,
      origin_name: (data.origin as { name: string })?.name || '',
      destination_name: (data.destination as { name: string })?.name || '',
    })
  } catch {
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

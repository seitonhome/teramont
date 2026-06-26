import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = createServiceClient()
    const { data, error } = await supabase
      .from('routes')
      .select(`
        id,
        estimated_duration_minutes,
        buffer_minutes,
        base_price_cop,
        active,
        origin:origin_location_id(id, name, slug),
        destination:destination_location_id(id, name, slug)
      `)
      .eq('active', true)
      .order('estimated_duration_minutes')

    if (error) throw error

    return NextResponse.json({ routes: data })
  } catch {
    return NextResponse.json({ error: 'Error al cargar rutas' }, { status: 500 })
  }
}

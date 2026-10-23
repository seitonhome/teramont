import { NextResponse } from 'next/server'
import { createServiceClient, isAdminRequest } from '@/lib/supabase/server'

export async function GET() {
  try {
    if (!(await isAdminRequest())) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const supabase = createServiceClient()
    const { data, error } = await supabase
      .from('reviews')
      .select('id, name, location, date, rating, text_es, text_en, email, booking_code, verified, lang, status, created_at, reviewed_at')
      .order('created_at', { ascending: false })

    if (error) throw error
    return NextResponse.json({ reviews: data })
  } catch (err) {
    console.error('Admin reviews GET error:', err)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

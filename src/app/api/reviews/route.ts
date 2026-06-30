import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = createServiceClient()
    const { data, error } = await supabase
      .from('reviews')
      .select('name, location, date, rating, text_es, text_en')
      .eq('active', true)
      .order('sort_order', { ascending: true })

    if (error || !data) return NextResponse.json([])
    return NextResponse.json(data)
  } catch {
    return NextResponse.json([])
  }
}

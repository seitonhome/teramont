import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient, isAdminRequest } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  try {
    if (!(await isAdminRequest())) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const supabase = createServiceClient()
    const { data, error } = await supabase.from('settings').select('*').order('key')

    if (error) throw error
    return NextResponse.json({ settings: data })
  } catch {
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    if (!(await isAdminRequest())) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const body = await req.json()
    const supabase = createServiceClient()

    const updates = Object.entries(body as Record<string, string>)

    for (const [key, value] of updates) {
      await supabase
        .from('settings')
        .upsert({ key, value: String(value) }, { onConflict: 'key' })
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

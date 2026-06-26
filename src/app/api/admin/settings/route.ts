import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  try {
    const authClient = await createClient()
    const { data: { session } } = await authClient.auth.getSession()
    if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

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
    const authClient = await createClient()
    const { data: { session } } = await authClient.auth.getSession()
    if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

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

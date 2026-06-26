import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { z } from 'zod'

const patchSchema = z.object({
  base_price_cop: z.number().positive().optional(),
  estimated_duration_minutes: z.number().int().positive().optional(),
  buffer_minutes: z.number().int().positive().optional(),
  active: z.boolean().optional(),
})

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authClient = await createClient()
    const { data: { session } } = await authClient.auth.getSession()
    if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const { id } = await params
    const body = await req.json()
    const parsed = patchSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: 'Datos inválidos', details: parsed.error.flatten() }, { status: 400 })
    }

    const supabase = createServiceClient()
    const { data, error } = await supabase
      .from('routes')
      .update(parsed.data)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ route: data })
  } catch (err) {
    console.error('Admin route patch error:', err)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

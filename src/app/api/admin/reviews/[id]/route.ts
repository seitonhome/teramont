import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient, isAdminRequest } from '@/lib/supabase/server'
import { z } from 'zod'

const patchSchema = z.object({
  status: z.enum(['pending', 'approved', 'rejected']),
})

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!(await isAdminRequest())) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const { id } = await params
    const parsed = patchSchema.safeParse(await req.json())
    if (!parsed.success) {
      return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 })
    }

    const supabase = createServiceClient()
    const { data, error } = await supabase
      .from('reviews')
      .update({
        status: parsed.data.status,
        // `active` kept in sync for older code paths that still read it
        active: parsed.data.status === 'approved',
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select('id, status')
      .single()

    if (error) throw error
    return NextResponse.json({ review: data })
  } catch (err) {
    console.error('Admin review PATCH error:', err)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!(await isAdminRequest())) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const { id } = await params
    const supabase = createServiceClient()
    const { error } = await supabase.from('reviews').delete().eq('id', id)
    if (error) throw error

    return NextResponse.json({ deleted: true })
  } catch (err) {
    console.error('Admin review DELETE error:', err)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

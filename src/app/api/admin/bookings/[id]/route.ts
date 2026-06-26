import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { z } from 'zod'

const patchSchema = z.object({
  status: z.enum([
    'CONFIRMED', 'PAID_FULL', 'CANCELLED_BY_ADMIN',
    'COMPLETED', 'NO_SHOW', 'CANCELLED_BY_CLIENT',
  ]).optional(),
  payment_status: z.enum(['APPROVED', 'DECLINED', 'REFUNDED', 'PARTIALLY_REFUNDED']).optional(),
  cancellation_reason: z.string().max(500).optional(),
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
      return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 })
    }

    const supabase = createServiceClient()
    const updates: Record<string, unknown> = { ...parsed.data }

    if (updates.status === 'CANCELLED_BY_ADMIN') {
      updates.cancelled_at = new Date().toISOString()
    }

    const { data, error } = await supabase
      .from('bookings')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ booking: data })
  } catch (err) {
    console.error('Admin booking patch error:', err)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

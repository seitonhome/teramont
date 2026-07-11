import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { z } from 'zod'

const schema = z.object({
  block_type: z.enum([
    'MANUAL_UNAVAILABLE', 'MAINTENANCE', 'REPOSITIONING',
    'PERSONAL_USE', 'CLEANING', 'OTHER',
  ]),
  origin_location_id: z.string().min(1).nullable().optional(),
  destination_location_id: z.string().min(1).nullable().optional(),
  starts_at: z.string().datetime({ offset: true }),
  ends_at: z.string().datetime({ offset: true }),
  reason: z.string().max(200).nullable().optional(),
  notes: z.string().max(1000).nullable().optional(),
})

export async function GET(req: NextRequest) {
  try {
    const authClient = await createClient()
    const { data: { session } } = await authClient.auth.getSession()
    if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const supabase = createServiceClient()
    const { data, error } = await supabase
      .from('vehicle_blocks')
      .select(`
        *,
        origin:origin_location_id(name),
        destination:destination_location_id(name)
      `)
      .order('starts_at', { ascending: false })

    if (error) throw error
    return NextResponse.json({ blocks: data })
  } catch (err) {
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const authClient = await createClient()
    const { data: { session } } = await authClient.auth.getSession()
    if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const body = await req.json()
    const parsed = schema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: 'Datos inválidos', details: parsed.error.flatten() }, { status: 400 })
    }

    if (new Date(parsed.data.starts_at) >= new Date(parsed.data.ends_at)) {
      return NextResponse.json({ error: 'La fecha de fin debe ser posterior a la de inicio' }, { status: 400 })
    }

    const supabase = createServiceClient()

    // Get vehicle
    const { data: vehicle } = await supabase.from('vehicle').select('id').eq('active', true).single()
    if (!vehicle) return NextResponse.json({ error: 'Sin vehículo' }, { status: 404 })

    const { data, error } = await supabase
      .from('vehicle_blocks')
      .insert({
        ...parsed.data,
        vehicle_id: vehicle.id,
        created_by: session.user.id,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ block: data }, { status: 201 })
  } catch (err) {
    console.error('Admin blocks POST error:', err)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

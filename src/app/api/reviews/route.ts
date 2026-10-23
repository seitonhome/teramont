import { NextRequest, NextResponse, after } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { sendAdminReviewNotification } from '@/lib/emails'
import { z } from 'zod'

// Only approved reviews reach the home page; email and booking code never leave the server
export async function GET() {
  try {
    const supabase = createServiceClient()
    const { data, error } = await supabase
      .from('reviews')
      .select('name, location, date, rating, text_es, text_en, verified')
      .eq('status', 'approved')
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false })

    if (error || !data) return NextResponse.json([])
    return NextResponse.json(data)
  } catch {
    return NextResponse.json([])
  }
}

const MONTHS_ES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre']
const MONTHS_EN = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

const schema = z.object({
  name: z.string().trim().min(2).max(60),
  location: z.string().trim().max(60).optional().default(''),
  rating: z.number().int().min(1).max(5),
  text: z.string().trim().min(10).max(800),
  email: z.string().trim().toLowerCase().email().max(200),
  booking_code: z.string().trim().toUpperCase().max(20).optional().default(''),
  lang: z.enum(['es', 'en']).default('es'),
  // Honeypot: real visitors never see this field
  website: z.string().max(0).optional().default(''),
})

export async function POST(req: NextRequest) {
  try {
    const parsed = schema.safeParse(await req.json())
    if (!parsed.success) {
      return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 })
    }
    const data = parsed.data
    const supabase = createServiceClient()

    // One pending review per email per day, and a global cap against floods
    const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    const [{ count: byEmail }, { count: recent }] = await Promise.all([
      supabase.from('reviews').select('id', { count: 'exact', head: true }).eq('email', data.email).gte('created_at', dayAgo),
      supabase.from('reviews').select('id', { count: 'exact', head: true }).eq('status', 'pending').gte('created_at', dayAgo),
    ])
    if ((byEmail ?? 0) > 0 || (recent ?? 0) >= 30) {
      return NextResponse.json({ error: 'too_many' }, { status: 429 })
    }

    // A matching paid or completed booking marks the review as a verified trip
    let verified = false
    if (data.booking_code) {
      const { data: booking } = await supabase
        .from('bookings')
        .select('id')
        .eq('booking_code', data.booking_code)
        .eq('customer_email', data.email)
        .in('status', ['CONFIRMED', 'PAID_FULL', 'COMPLETED'])
        .maybeSingle()
      verified = !!booking
    }

    const now = new Date()
    const months = data.lang === 'en' ? MONTHS_EN : MONTHS_ES
    const { error } = await supabase.from('reviews').insert({
      name: data.name,
      location: data.location,
      date: `${months[now.getMonth()]} ${now.getFullYear()}`,
      rating: data.rating,
      text_es: data.text,
      text_en: null,
      email: data.email,
      booking_code: data.booking_code || null,
      verified,
      lang: data.lang,
      status: 'pending',
      active: false,
      sort_order: 100,
    })
    if (error) throw error

    // after() keeps the function alive until the email is sent
    after(() =>
      sendAdminReviewNotification({
        name: data.name,
        location: data.location,
        rating: data.rating,
        text: data.text,
        verified,
      }).catch((err) => console.error('Review notification error:', err))
    )

    return NextResponse.json({ received: true }, { status: 201 })
  } catch (err) {
    console.error('Create review error:', err)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

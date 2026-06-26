import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { formatDatetimeBogota } from '@/lib/utils'

export async function GET(req: NextRequest) {
  try {
    const authClient = await createClient()
    const { data: { session } } = await authClient.auth.getSession()
    if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const supabase = createServiceClient()
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        booking_code, customer_name, customer_email, customer_phone,
        pickup_datetime, estimated_arrival_datetime, vehicle_release_datetime,
        passengers_count, luggage_count, pickup_address, dropoff_address,
        total_price_cop, deposit_amount_cop, balance_amount_cop,
        status, payment_status, notes, created_at, cancelled_at, cancellation_reason,
        origin:origin_location_id(name),
        destination:destination_location_id(name)
      `)
      .order('pickup_datetime', { ascending: false })

    if (error) throw error

    const rows = (data || []).map((b) => {
      const origin = (b.origin as unknown) as { name: string } | null
      const destination = (b.destination as unknown) as { name: string } | null
      return [
        b.booking_code,
        b.customer_name,
        b.customer_email,
        b.customer_phone,
        origin?.name || '',
        destination?.name || '',
        b.pickup_datetime ? formatDatetimeBogota(b.pickup_datetime) : '',
        b.estimated_arrival_datetime ? formatDatetimeBogota(b.estimated_arrival_datetime) : '',
        b.passengers_count,
        b.luggage_count,
        `"${(b.pickup_address || '').replace(/"/g, '""')}"`,
        `"${(b.dropoff_address || '').replace(/"/g, '""')}"`,
        b.total_price_cop,
        b.deposit_amount_cop,
        b.balance_amount_cop,
        b.status,
        b.payment_status,
        `"${(b.notes || '').replace(/"/g, '""')}"`,
        b.created_at ? formatDatetimeBogota(b.created_at) : '',
        b.cancelled_at ? formatDatetimeBogota(b.cancelled_at) : '',
        `"${(b.cancellation_reason || '').replace(/"/g, '""')}"`,
      ].join(',')
    })

    const headers = [
      'Código', 'Cliente', 'Email', 'Teléfono',
      'Origen', 'Destino', 'Fecha recogida', 'Llegada estimada',
      'Pasajeros', 'Maletas', 'Dirección recogida', 'Dirección destino',
      'Total COP', 'Anticipo COP', 'Saldo COP',
      'Estado', 'Estado pago', 'Notas',
      'Creada', 'Cancelada', 'Motivo cancelación',
    ].join(',')

    const csv = [headers, ...rows].join('\n')
    const bom = '﻿' // UTF-8 BOM for Excel compatibility

    return new NextResponse(bom + csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="teramont-reservas-${new Date().toISOString().slice(0, 10)}.csv"`,
      },
    })
  } catch (err) {
    console.error('CSV export error:', err)
    return NextResponse.json({ error: 'Error al exportar' }, { status: 500 })
  }
}

'use client'

import { useState, useEffect } from 'react'
import { AdminGuard } from '@/components/admin/AdminGuard'
import { AdminSidebar } from '@/components/admin/AdminSidebar'
import { Badge } from '@/components/ui/badge'
import { formatCOP, formatDatetimeBogota } from '@/lib/utils'
import { Calendar, DollarSign, Clock, CheckCircle, Loader2 } from 'lucide-react'
import type { Booking } from '@/types'
import { format } from 'date-fns'
import { toZonedTime } from 'date-fns-tz'

const TIMEZONE = 'America/Bogota'

const STATUS_LABELS: Record<string, { label: string; variant: 'default' | 'success' | 'warning' | 'destructive' | 'secondary' | 'outline' | 'gold' }> = {
  CONFIRMED: { label: 'Confirmada', variant: 'success' },
  PAID_FULL: { label: 'Pago total', variant: 'success' },
  PENDING_PAYMENT: { label: 'Pago pendiente', variant: 'warning' },
  COMPLETED: { label: 'Completada', variant: 'secondary' },
  CANCELLED_BY_CLIENT: { label: 'Cancelada', variant: 'destructive' },
  CANCELLED_BY_ADMIN: { label: 'Cancelada (admin)', variant: 'destructive' },
  PAYMENT_FAILED: { label: 'Pago fallido', variant: 'destructive' },
  EXPIRED: { label: 'Expirada', variant: 'secondary' },
  DRAFT: { label: 'Borrador', variant: 'outline' },
}

export default function DashboardPage() {
  const [bookings, setBookings] = useState<(Booking & { origin: { name: string }; destination: { name: string } })[]>([])
  const [loading, setLoading] = useState(true)
  const [vehicleState, setVehicleState] = useState<string>('Cargando...')

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    try {
      const [bRes, vRes] = await Promise.all([
        fetch('/api/admin/bookings?limit=10'),
        fetch('/api/admin/vehicle-state'),
      ])

      if (bRes.ok) {
        const data = await bRes.json()
        setBookings(data.bookings || [])
      }

      if (vRes.ok) {
        const data = await vRes.json()
        setVehicleState(data.state_label || 'Disponible')
      }
    } finally {
      setLoading(false)
    }
  }

  const today = format(toZonedTime(new Date(), TIMEZONE), 'yyyy-MM-dd')
  const todayBookings = bookings.filter(b =>
    b.pickup_datetime?.startsWith(today) &&
    (b.status === 'CONFIRMED' || b.status === 'PAID_FULL')
  )
  const confirmedTotal = bookings
    .filter(b => b.status === 'CONFIRMED' || b.status === 'PAID_FULL')
    .reduce((sum, b) => sum + Number(b.total_price_cop), 0)

  return (
    <AdminGuard>
      <div className="flex min-h-screen bg-stone-100">
        <AdminSidebar />
        <main className="flex-1 p-6 lg:p-8 overflow-auto">
          <div className="mb-8">
            <h1 className="text-2xl font-semibold text-stone-900">Dashboard</h1>
            <p className="text-stone-500 text-sm mt-1">
              {format(toZonedTime(new Date(), TIMEZONE), "EEEE d 'de' MMMM 'de' yyyy")}
            </p>
          </div>

          {/* KPI cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
            <div className="bg-white rounded-xl border border-stone-200 p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-stone-500 uppercase tracking-wider">Hoy</span>
                <Calendar size={18} className="text-gold" />
              </div>
              <p className="text-3xl font-semibold text-stone-900">{todayBookings.length}</p>
              <p className="text-xs text-stone-500 mt-1">reservas confirmadas</p>
            </div>

            <div className="bg-white rounded-xl border border-stone-200 p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-stone-500 uppercase tracking-wider">Ingresos</span>
                <DollarSign size={18} className="text-gold" />
              </div>
              <p className="text-2xl font-semibold text-stone-900">{formatCOP(confirmedTotal)}</p>
              <p className="text-xs text-stone-500 mt-1">total en reservas</p>
            </div>

            <div className="bg-white rounded-xl border border-stone-200 p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-stone-500 uppercase tracking-wider">Vehículo</span>
                <Clock size={18} className="text-gold" />
              </div>
              <p className="text-sm font-semibold text-stone-900 leading-snug">{vehicleState}</p>
              <p className="text-xs text-stone-500 mt-1">estado actual</p>
            </div>

            <div className="bg-white rounded-xl border border-stone-200 p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-stone-500 uppercase tracking-wider">Total</span>
                <CheckCircle size={18} className="text-gold" />
              </div>
              <p className="text-3xl font-semibold text-stone-900">
                {bookings.filter(b => b.status === 'CONFIRMED' || b.status === 'PAID_FULL').length}
              </p>
              <p className="text-xs text-stone-500 mt-1">reservas confirmadas</p>
            </div>
          </div>

          {/* Recent bookings */}
          <div className="bg-white rounded-xl border border-stone-200">
            <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between">
              <h2 className="font-semibold text-stone-900">Últimas reservas</h2>
              <a href="/admin/bookings" className="text-xs text-gold hover:underline">
                Ver todas
              </a>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 size={24} className="animate-spin text-stone-400" />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-stone-100">
                      <th className="text-left px-6 py-3 text-xs font-medium text-stone-500 uppercase tracking-wider">Código</th>
                      <th className="text-left px-6 py-3 text-xs font-medium text-stone-500 uppercase tracking-wider">Cliente</th>
                      <th className="text-left px-6 py-3 text-xs font-medium text-stone-500 uppercase tracking-wider">Ruta</th>
                      <th className="text-left px-6 py-3 text-xs font-medium text-stone-500 uppercase tracking-wider">Fecha</th>
                      <th className="text-left px-6 py-3 text-xs font-medium text-stone-500 uppercase tracking-wider">Precio</th>
                      <th className="text-left px-6 py-3 text-xs font-medium text-stone-500 uppercase tracking-wider">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {bookings.map((b) => {
                      const statusInfo = STATUS_LABELS[b.status] || { label: b.status, variant: 'secondary' }
                      return (
                        <tr key={b.id} className="hover:bg-stone-50 transition-colors">
                          <td className="px-6 py-3 font-mono text-xs text-stone-600">{b.booking_code}</td>
                          <td className="px-6 py-3">
                            <p className="font-medium text-stone-900">{b.customer_name}</p>
                            <p className="text-xs text-stone-500">{b.customer_email}</p>
                          </td>
                          <td className="px-6 py-3 text-stone-600">
                            {b.origin?.name} → {b.destination?.name}
                          </td>
                          <td className="px-6 py-3 text-stone-600 text-xs">
                            {formatDatetimeBogota(b.pickup_datetime)}
                          </td>
                          <td className="px-6 py-3 font-medium text-stone-900">
                            {formatCOP(b.total_price_cop)}
                          </td>
                          <td className="px-6 py-3">
                            <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
                          </td>
                        </tr>
                      )
                    })}
                    {bookings.length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-6 py-8 text-center text-stone-400 text-sm">
                          No hay reservas registradas
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>
    </AdminGuard>
  )
}

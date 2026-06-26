'use client'

import { useState, useEffect } from 'react'
import { AdminGuard } from '@/components/admin/AdminGuard'
import { AdminSidebar } from '@/components/admin/AdminSidebar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { formatCOP, formatDatetimeBogota, buildWhatsAppLink } from '@/lib/utils'
import { Loader2, Search, CheckCircle, XCircle, Flag, Download, AlertOctagon, MessageCircle } from 'lucide-react'
import type { Booking } from '@/types'
import { toast } from '@/hooks/use-toast'

const WHATSAPP = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '573001234567'

const STATUS_LABELS: Record<string, { label: string; variant: 'default' | 'success' | 'warning' | 'destructive' | 'secondary' | 'outline' | 'gold' }> = {
  CONFIRMED: { label: 'Confirmada', variant: 'success' },
  PAID_FULL: { label: 'Pago total', variant: 'success' },
  PENDING_PAYMENT: { label: 'Pago pendiente', variant: 'warning' },
  COMPLETED: { label: 'Completada', variant: 'secondary' },
  CANCELLED_BY_CLIENT: { label: 'Cancelada cliente', variant: 'destructive' },
  CANCELLED_BY_ADMIN: { label: 'Cancelada admin', variant: 'destructive' },
  PAYMENT_FAILED: { label: 'Pago fallido', variant: 'destructive' },
  EXPIRED: { label: 'Expirada', variant: 'secondary' },
  DRAFT: { label: 'Borrador', variant: 'outline' },
  NO_SHOW: { label: 'No se presentó', variant: 'destructive' },
}

type BookingWithRelations = Booking & {
  origin: { name: string }
  destination: { name: string }
}

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<BookingWithRelations[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  useEffect(() => {
    fetchBookings()
  }, [])

  async function fetchBookings() {
    setLoading(true)
    try {
      const url = statusFilter
        ? `/api/admin/bookings?limit=200&status=${statusFilter}`
        : '/api/admin/bookings?limit=200'
      const res = await fetch(url)
      if (res.ok) {
        const data = await res.json()
        setBookings(data.bookings || [])
      }
    } finally {
      setLoading(false)
    }
  }

  async function updateStatus(id: string, status: string, reason?: string) {
    setActionLoading(id)
    try {
      const res = await fetch(`/api/admin/bookings/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, cancellation_reason: reason }),
      })
      if (res.ok) {
        toast({ title: 'Estado actualizado correctamente' })
        fetchBookings()
      } else {
        const data = await res.json()
        toast({ title: data.error || 'Error al actualizar', variant: 'destructive' })
      }
    } finally {
      setActionLoading(null)
    }
  }

  function downloadCSV() {
    window.open('/api/admin/bookings/export', '_blank')
  }

  const filtered = bookings.filter(
    (b) =>
      b.booking_code.toLowerCase().includes(search.toLowerCase()) ||
      b.customer_name.toLowerCase().includes(search.toLowerCase()) ||
      b.customer_email.toLowerCase().includes(search.toLowerCase()) ||
      b.customer_phone.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <AdminGuard>
      <div className="flex min-h-screen bg-stone-100">
        <AdminSidebar />
        <main className="flex-1 p-6 lg:p-8 overflow-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-semibold text-stone-900">
              Reservas
              <span className="ml-2 text-sm font-normal text-stone-400">
                ({filtered.length})
              </span>
            </h1>
            <div className="flex items-center gap-2">
              <Button onClick={fetchBookings} variant="outline" size="sm">
                Actualizar
              </Button>
              <Button onClick={downloadCSV} variant="outline" size="sm" className="text-emerald-700 border-emerald-200 hover:bg-emerald-50">
                <Download size={14} />
                Exportar CSV
              </Button>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3 mb-5">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
              <Input
                placeholder="Buscar por código, nombre, email o teléfono..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 bg-white"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-11 rounded-sm border border-input bg-white px-3 text-sm text-foreground"
            >
              <option value="">Todos los estados</option>
              <option value="CONFIRMED">Confirmadas</option>
              <option value="PAID_FULL">Pago total</option>
              <option value="PENDING_PAYMENT">Pago pendiente</option>
              <option value="COMPLETED">Completadas</option>
              <option value="CANCELLED_BY_ADMIN">Canceladas admin</option>
              <option value="PAYMENT_FAILED">Pago fallido</option>
              <option value="NO_SHOW">No se presentó</option>
            </select>
          </div>

          <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 size={24} className="animate-spin text-stone-400" />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-stone-100 bg-stone-50">
                      <th className="text-left px-4 py-3 text-xs font-medium text-stone-500 uppercase tracking-wider">Código</th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-stone-500 uppercase tracking-wider">Cliente</th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-stone-500 uppercase tracking-wider">Ruta</th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-stone-500 uppercase tracking-wider">Fecha viaje</th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-stone-500 uppercase tracking-wider">Precio</th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-stone-500 uppercase tracking-wider">Estado</th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-stone-500 uppercase tracking-wider">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {filtered.map((b) => {
                      const statusInfo = STATUS_LABELS[b.status] || { label: b.status, variant: 'secondary' }
                      const isActive = b.status === 'CONFIRMED' || b.status === 'PAID_FULL' || b.status === 'PENDING_PAYMENT'
                      const whatsappLink = buildWhatsAppLink(
                        WHATSAPP,
                        b.booking_code
                      )

                      return (
                        <tr key={b.id} className="hover:bg-stone-50 transition-colors">
                          <td className="px-4 py-3 font-mono text-xs text-stone-600 whitespace-nowrap">
                            {b.booking_code}
                          </td>
                          <td className="px-4 py-3">
                            <p className="font-medium text-stone-900">{b.customer_name}</p>
                            <p className="text-xs text-stone-500">{b.customer_phone}</p>
                            <p className="text-xs text-stone-400">{b.customer_email}</p>
                          </td>
                          <td className="px-4 py-3 text-stone-600 whitespace-nowrap">
                            {b.origin?.name} → {b.destination?.name}
                            <p className="text-xs text-stone-400">
                              {b.passengers_count}p · {b.luggage_count} maletas
                            </p>
                          </td>
                          <td className="px-4 py-3 text-stone-600 text-xs whitespace-nowrap">
                            {formatDatetimeBogota(b.pickup_datetime)}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <p className="font-medium text-stone-900">{formatCOP(b.total_price_cop)}</p>
                            {Number(b.balance_amount_cop) > 0 && b.status !== 'PAID_FULL' && (
                              <p className="text-xs text-amber-600 font-medium">
                                Saldo: {formatCOP(b.balance_amount_cop)}
                              </p>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <Badge variant={statusInfo.variant as 'default'}>{statusInfo.label}</Badge>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1">
                              {actionLoading === b.id ? (
                                <Loader2 size={14} className="animate-spin text-stone-400" />
                              ) : (
                                <>
                                  {/* Marcar completado */}
                                  {isActive && (
                                    <button
                                      onClick={() => updateStatus(b.id, 'COMPLETED')}
                                      title="Marcar como completado"
                                      className="p-1.5 rounded hover:bg-emerald-50 text-emerald-600 transition-colors"
                                    >
                                      <CheckCircle size={14} />
                                    </button>
                                  )}

                                  {/* Marcar no se presentó */}
                                  {isActive && (
                                    <button
                                      onClick={() => updateStatus(b.id, 'NO_SHOW')}
                                      title="Marcar como no se presentó"
                                      className="p-1.5 rounded hover:bg-orange-50 text-orange-500 transition-colors"
                                    >
                                      <AlertOctagon size={14} />
                                    </button>
                                  )}

                                  {/* Marcar saldo pagado */}
                                  {b.status === 'CONFIRMED' && Number(b.balance_amount_cop) > 0 && (
                                    <button
                                      onClick={() => updateStatus(b.id, 'PAID_FULL')}
                                      title="Confirmar saldo pagado"
                                      className="p-1.5 rounded hover:bg-gold/10 text-gold transition-colors"
                                    >
                                      <Flag size={14} />
                                    </button>
                                  )}

                                  {/* Cancelar */}
                                  {isActive && (
                                    <button
                                      onClick={() => {
                                        const reason = window.prompt('Motivo de cancelación:')
                                        if (reason !== null) {
                                          updateStatus(b.id, 'CANCELLED_BY_ADMIN', reason)
                                        }
                                      }}
                                      title="Cancelar reserva"
                                      className="p-1.5 rounded hover:bg-red-50 text-red-500 transition-colors"
                                    >
                                      <XCircle size={14} />
                                    </button>
                                  )}

                                  {/* Reenviar confirmación por WhatsApp */}
                                  {(b.status === 'CONFIRMED' || b.status === 'PAID_FULL') && (
                                    <a
                                      href={whatsappLink}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      title="Contactar por WhatsApp"
                                      className="p-1.5 rounded hover:bg-green-50 text-green-600 transition-colors"
                                    >
                                      <MessageCircle size={14} />
                                    </a>
                                  )}
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                    {filtered.length === 0 && !loading && (
                      <tr>
                        <td colSpan={7} className="px-4 py-10 text-center text-stone-400 text-sm">
                          No hay reservas con los filtros seleccionados
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <p className="text-xs text-stone-400 mt-3">
            El CSV incluye todos los campos de la reserva en formato compatible con Excel.
          </p>
        </main>
      </div>
    </AdminGuard>
  )
}

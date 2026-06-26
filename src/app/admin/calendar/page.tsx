'use client'

import { useState, useEffect } from 'react'
import { AdminGuard } from '@/components/admin/AdminGuard'
import { AdminSidebar } from '@/components/admin/AdminSidebar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatCOP, formatTimeBogota } from '@/lib/utils'
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react'
import { format, addDays, subDays, startOfWeek, endOfWeek } from 'date-fns'
import { toZonedTime } from 'date-fns-tz'
import type { Booking, VehicleBlock } from '@/types'

const TIMEZONE = 'America/Bogota'

const HOURS = Array.from({ length: 15 }, (_, i) => i + 6)

type BookingWithRelations = Booking & {
  origin: { name: string }
  destination: { name: string }
}

type BlockWithRelations = VehicleBlock & {
  origin: { name: string } | null
  destination: { name: string } | null
}

const STATUS_COLORS: Record<string, string> = {
  CONFIRMED: 'bg-emerald-100 border-emerald-300 text-emerald-800',
  PAID_FULL: 'bg-emerald-200 border-emerald-400 text-emerald-900',
  PENDING_PAYMENT: 'bg-amber-100 border-amber-300 text-amber-800',
  COMPLETED: 'bg-stone-100 border-stone-300 text-stone-600',
  CANCELLED_BY_ADMIN: 'bg-red-100 border-red-200 text-red-600',
  PAYMENT_FAILED: 'bg-red-50 border-red-200 text-red-500',
}

export default function AdminCalendarPage() {
  const [currentDate, setCurrentDate] = useState(
    toZonedTime(new Date(), TIMEZONE)
  )
  const [bookings, setBookings] = useState<BookingWithRelations[]>([])
  const [blocks, setBlocks] = useState<BlockWithRelations[]>([])
  const [loading, setLoading] = useState(true)

  const dateStr = format(currentDate, 'yyyy-MM-dd')

  useEffect(() => {
    fetchData(dateStr)
  }, [dateStr])

  async function fetchData(date: string) {
    setLoading(true)
    try {
      const [bRes, blRes] = await Promise.all([
        fetch(`/api/admin/bookings?date=${date}&limit=50`),
        fetch('/api/admin/blocks'),
      ])

      if (bRes.ok) {
        const data = await bRes.json()
        setBookings(data.bookings || [])
      }
      if (blRes.ok) {
        const data = await blRes.json()
        setBlocks(data.blocks || [])
      }
    } finally {
      setLoading(false)
    }
  }

  const todayBlocks = blocks.filter((b) => {
    const blockStart = toZonedTime(new Date(b.starts_at), TIMEZONE)
    const blockEnd = toZonedTime(new Date(b.ends_at), TIMEZONE)
    const dayStart = new Date(dateStr + 'T00:00:00')
    const dayEnd = new Date(dateStr + 'T23:59:59')
    return blockStart <= dayEnd && blockEnd >= dayStart
  })

  const formatHour = (h: number) => {
    const ampm = h >= 12 ? 'pm' : 'am'
    const displayH = h % 12 || 12
    return `${displayH}:00 ${ampm}`
  }

  return (
    <AdminGuard>
      <div className="flex min-h-screen bg-stone-100">
        <AdminSidebar />
        <main className="flex-1 p-6 lg:p-8 overflow-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentDate(subDays(currentDate, 1))}
                className="h-9 w-9"
              >
                <ChevronLeft size={16} />
              </Button>
              <h1 className="text-xl font-semibold text-stone-900">
                {format(currentDate, "EEEE d 'de' MMMM 'de' yyyy")}
              </h1>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentDate(addDays(currentDate, 1))}
                className="h-9 w-9"
              >
                <ChevronRight size={16} />
              </Button>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentDate(toZonedTime(new Date(), TIMEZONE))}
            >
              Hoy
            </Button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 size={24} className="animate-spin text-stone-400" />
            </div>
          ) : (
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Timeline */}
              <div className="lg:col-span-2 bg-white rounded-xl border border-stone-200 overflow-hidden">
                <div className="px-5 py-4 border-b border-stone-100">
                  <p className="font-semibold text-stone-900">Línea de tiempo del vehículo</p>
                </div>

                <div className="overflow-x-auto">
                  <div className="min-w-[600px] p-4">
                    {/* Hour labels */}
                    <div className="flex mb-2">
                      <div className="w-16 flex-shrink-0" />
                      <div className="flex-1 flex">
                        {HOURS.map((h) => (
                          <div
                            key={h}
                            className="flex-1 text-xs text-stone-400 text-center border-l border-stone-100"
                          >
                            {formatHour(h)}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Bookings row */}
                    <div className="flex items-center mb-2">
                      <div className="w-16 flex-shrink-0 text-xs text-stone-500 font-medium pr-2">
                        Reservas
                      </div>
                      <div className="flex-1 relative h-12 bg-stone-50 rounded border border-stone-100">
                        {bookings
                          .filter(b => b.status === 'CONFIRMED' || b.status === 'PAID_FULL' || b.status === 'PENDING_PAYMENT')
                          .map((b) => {
                            const startH = toZonedTime(new Date(b.pickup_datetime), TIMEZONE).getHours()
                            const startM = toZonedTime(new Date(b.pickup_datetime), TIMEZONE).getMinutes()
                            const endH = toZonedTime(new Date(b.vehicle_release_datetime), TIMEZONE).getHours()
                            const endM = toZonedTime(new Date(b.vehicle_release_datetime), TIMEZONE).getMinutes()

                            const totalMins = HOURS.length * 60
                            const startMins = (startH - 6) * 60 + startM
                            const durationMins = (endH - startH) * 60 + (endM - startM)

                            const left = Math.max(0, (startMins / totalMins) * 100)
                            const width = Math.min(100 - left, (durationMins / totalMins) * 100)

                            const colorClass = STATUS_COLORS[b.status] || 'bg-blue-100 border-blue-200'

                            return (
                              <div
                                key={b.id}
                                className={`absolute top-1 h-10 rounded border text-xs px-2 flex items-center overflow-hidden ${colorClass}`}
                                style={{ left: `${left}%`, width: `${width}%` }}
                                title={`${b.booking_code} | ${b.origin?.name} → ${b.destination?.name}`}
                              >
                                <span className="truncate font-medium">{b.origin?.name} → {b.destination?.name}</span>
                              </div>
                            )
                          })}
                      </div>
                    </div>

                    {/* Blocks row */}
                    {todayBlocks.length > 0 && (
                      <div className="flex items-center">
                        <div className="w-16 flex-shrink-0 text-xs text-stone-500 font-medium pr-2">
                          Bloqueos
                        </div>
                        <div className="flex-1 relative h-8 bg-stone-50 rounded border border-stone-100">
                          {todayBlocks.map((b) => {
                            const startH = toZonedTime(new Date(b.starts_at), TIMEZONE).getHours()
                            const startM = toZonedTime(new Date(b.starts_at), TIMEZONE).getMinutes()
                            const endH = toZonedTime(new Date(b.ends_at), TIMEZONE).getHours()
                            const endM = toZonedTime(new Date(b.ends_at), TIMEZONE).getMinutes()

                            const totalMins = HOURS.length * 60
                            const startMins = Math.max(0, (startH - 6) * 60 + startM)
                            const durationMins = (endH - startH) * 60 + (endM - startM)

                            const left = Math.max(0, (startMins / totalMins) * 100)
                            const width = Math.min(100 - left, (durationMins / totalMins) * 100)

                            return (
                              <div
                                key={b.id}
                                className="absolute top-0.5 h-7 rounded bg-stone-300 border border-stone-400 text-xs px-1 flex items-center overflow-hidden"
                                style={{ left: `${left}%`, width: `${width}%` }}
                                title={b.reason || b.block_type}
                              >
                                <span className="truncate text-stone-700">{b.reason || b.block_type}</span>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Day summary */}
              <div className="space-y-4">
                <div className="bg-white rounded-xl border border-stone-200 p-5">
                  <p className="font-semibold text-stone-900 mb-4">
                    Reservas del día ({bookings.length})
                  </p>
                  <div className="space-y-3">
                    {bookings.length === 0 ? (
                      <p className="text-sm text-stone-400">Sin reservas para este día</p>
                    ) : (
                      bookings.map((b) => (
                        <div
                          key={b.id}
                          className="p-3 rounded-lg border border-stone-100 bg-stone-50"
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-mono text-stone-500">{b.booking_code}</span>
                            <Badge
                              variant={
                                b.status === 'CONFIRMED' || b.status === 'PAID_FULL'
                                  ? 'success'
                                  : b.status === 'PENDING_PAYMENT'
                                  ? 'warning'
                                  : 'secondary'
                              }
                            >
                              {b.status === 'CONFIRMED'
                                ? 'Confirmada'
                                : b.status === 'PAID_FULL'
                                ? 'Pago total'
                                : b.status === 'PENDING_PAYMENT'
                                ? 'Pendiente'
                                : b.status}
                            </Badge>
                          </div>
                          <p className="text-sm font-medium text-stone-900">{b.customer_name}</p>
                          <p className="text-xs text-stone-600">
                            {b.origin?.name} → {b.destination?.name}
                          </p>
                          <p className="text-xs text-stone-500 mt-1">
                            {formatTimeBogota(b.pickup_datetime)} → {formatTimeBogota(b.vehicle_release_datetime)}
                          </p>
                          <p className="text-xs font-semibold text-stone-900 mt-1">
                            {formatCOP(b.total_price_cop)}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {todayBlocks.length > 0 && (
                  <div className="bg-white rounded-xl border border-stone-200 p-5">
                    <p className="font-semibold text-stone-900 mb-3">Bloqueos ({todayBlocks.length})</p>
                    <div className="space-y-2">
                      {todayBlocks.map((b) => (
                        <div key={b.id} className="p-2.5 rounded-lg bg-stone-100 text-xs">
                          <p className="font-medium text-stone-700">{b.block_type.replace('_', ' ')}</p>
                          {b.reason && <p className="text-stone-500">{b.reason}</p>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    </AdminGuard>
  )
}

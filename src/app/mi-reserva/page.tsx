'use client'

import { useState, useEffect } from 'react'
import { Navbar } from '@/components/landing/Navbar'
import { Footer } from '@/components/landing/Footer'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { formatCOP, formatDatetimeBogota } from '@/lib/utils'
import { getLocaleClient } from '@/lib/locale'
import { translations } from '@/lib/i18n'
import type { Locale } from '@/lib/i18n'
import { Search, AlertCircle, Loader2, CheckCircle, Clock } from 'lucide-react'

interface BookingResult {
  id: string
  booking_code: string
  status: string
  payment_status: string
  pickup_datetime: string
  estimated_arrival_datetime: string
  pickup_address: string
  dropoff_address: string
  passengers_count: number
  luggage_count: number
  total_price_cop: number
  deposit_amount_cop: number
  balance_amount_cop: number
  customer_name: string
  notes?: string
}

const STATUS_LABELS: Record<string, { es: string; en: string; color: string }> = {
  CONFIRMED:       { es: 'Confirmada',        en: 'Confirmed',        color: 'text-emerald-600' },
  PAID_FULL:       { es: 'Pagada completo',    en: 'Fully paid',       color: 'text-emerald-600' },
  PENDING_PAYMENT: { es: 'Pago pendiente',     en: 'Pending payment',  color: 'text-amber-600' },
  PAYMENT_FAILED:  { es: 'Pago fallido',       en: 'Payment failed',   color: 'text-red-500' },
  CANCELLED:       { es: 'Cancelada',          en: 'Cancelled',        color: 'text-red-500' },
  COMPLETED:       { es: 'Completada',         en: 'Completed',        color: 'text-muted-foreground' },
}

export default function MyBookingPage() {
  const [locale, setLocale] = useState<Locale>('es')
  const [code, setCode] = useState('')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ booking: BookingResult; origin_name: string; destination_name: string } | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    setLocale(getLocaleClient())
  }, [])

  const t = translations[locale].myBooking
  const c = translations[locale].confirmation

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setResult(null)
    setLoading(true)

    try {
      const res = await fetch('/api/bookings/lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ booking_code: code, customer_email: email }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(t.notFound)
        return
      }
      setResult(data)
    } catch {
      setError(t.notFound)
    } finally {
      setLoading(false)
    }
  }

  const statusInfo = result ? STATUS_LABELS[result.booking.status] : null

  return (
    <>
      <Navbar forceDark />
      <main className="min-h-screen bg-background pt-24 pb-16">
        <div className="max-w-xl mx-auto px-4">
          <div className="text-center mb-10">
            <p className="text-gold text-xs tracking-[0.4em] uppercase font-medium mb-3">{t.label}</p>
            <h1 className="text-4xl font-light text-foreground mb-3" style={{ fontFamily: 'var(--font-display)' }}>
              {t.title}
            </h1>
            <p className="text-muted-foreground text-sm">{t.subtitle}</p>
          </div>

          <form onSubmit={handleSearch} className="bg-white rounded-xl border border-border p-6 space-y-4 mb-6">
            <div>
              <Label className="mb-2 block text-sm">{t.code}</Label>
              <Input
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder={t.codePlaceholder}
                required
                className="font-mono tracking-widest"
              />
            </div>
            <div>
              <Label className="mb-2 block text-sm">{t.email}</Label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
                required
              />
            </div>
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gold hover:bg-gold/90 text-white h-11"
            >
              {loading ? (
                <><Loader2 size={16} className="animate-spin" /> {t.loading}</>
              ) : (
                <><Search size={16} /> {t.search}</>
              )}
            </Button>
          </form>

          {error && (
            <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">
              <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">{t.notFound}</p>
                <p className="text-red-500/80 mt-0.5">{t.notFoundSub}</p>
              </div>
            </div>
          )}

          {result && (
            <div className="bg-white rounded-xl border border-border p-6 space-y-4">
              <div className="flex items-center justify-between mb-2">
                <h2 className="font-semibold text-foreground">{c.bookingDetails}</h2>
                <span className="text-sm font-mono text-gold border border-gold/30 bg-gold/5 px-3 py-1 rounded-full">
                  {result.booking.booking_code}
                </span>
              </div>

              {statusInfo && (
                <div className={`flex items-center gap-2 text-sm font-medium ${statusInfo.color}`}>
                  {result.booking.status === 'CONFIRMED' || result.booking.status === 'PAID_FULL' || result.booking.status === 'COMPLETED'
                    ? <CheckCircle size={16} />
                    : <Clock size={16} />
                  }
                  {statusInfo[locale]}
                </div>
              )}

              <div className="space-y-3 text-sm">
                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-muted-foreground">{c.route}</span>
                  <span className="font-medium">{result.origin_name} → {result.destination_name}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-muted-foreground">{c.datetime}</span>
                  <span className="font-medium text-right">{formatDatetimeBogota(result.booking.pickup_datetime)}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-muted-foreground">{c.arrival}</span>
                  <span className="font-medium text-right">{formatDatetimeBogota(result.booking.estimated_arrival_datetime)}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-muted-foreground">{c.pickup}</span>
                  <span className="font-medium text-right max-w-[240px]">{result.booking.pickup_address}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-muted-foreground">{c.dropoff}</span>
                  <span className="font-medium text-right max-w-[240px]">{result.booking.dropoff_address}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-muted-foreground">{c.passengers}</span>
                  <span className="font-medium">{result.booking.passengers_count}</span>
                </div>
              </div>

              <div className="p-4 bg-secondary/40 rounded-lg space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{c.totalPrice}</span>
                  <span className="font-medium">{formatCOP(result.booking.total_price_cop)}</span>
                </div>
                <div className="flex justify-between text-emerald-700">
                  <span>{c.depositPaid}</span>
                  <span className="font-semibold">{formatCOP(result.booking.deposit_amount_cop)}</span>
                </div>
                {result.booking.balance_amount_cop > 0 && (
                  <div className="flex justify-between text-amber-700">
                    <span>{c.balanceDue}</span>
                    <span className="font-semibold">{formatCOP(result.booking.balance_amount_cop)}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}

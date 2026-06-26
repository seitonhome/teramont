'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Navbar } from '@/components/landing/Navbar'
import { Footer } from '@/components/landing/Footer'
import { Button } from '@/components/ui/button'
import { formatCOP, formatDatetimeBogota, buildWhatsAppLink } from '@/lib/utils'
import { CheckCircle, Clock, AlertCircle, MessageCircle, ArrowRight, Loader2 } from 'lucide-react'
import type { Booking } from '@/types'

const WHATSAPP = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '573001234567'

export function ConfirmationClient() {
  const params = useSearchParams()
  const bookingId = params.get('booking_id')
  const reference = params.get('reference')

  const [booking, setBooking] = useState<Booking | null>(null)
  const [status, setStatus] = useState<'loading' | 'confirmed' | 'pending' | 'failed'>('loading')
  const [originName, setOriginName] = useState('')
  const [destinationName, setDestinationName] = useState('')

  useEffect(() => {
    if (!bookingId) {
      setStatus('failed')
      return
    }

    async function verifyAndLoad() {
      try {
        // If we have a reference, verify payment status directly with Wompi
        // This is the primary confirmation mechanism (no webhook needed)
        if (reference) {
          const verifyRes = await fetch(
            `/api/payments/wompi/verify?reference=${encodeURIComponent(reference)}`
          )
          if (verifyRes.ok) {
            const verifyData = await verifyRes.json()
            const wompiStatus: string = verifyData.status

            if (wompiStatus === 'APPROVED') {
              // Fetch full booking details with location names
              const res = await fetch(`/api/bookings/${bookingId}`)
              if (res.ok) {
                const data = await res.json()
                setBooking(data.booking)
                setOriginName(data.origin_name || '')
                setDestinationName(data.destination_name || '')
              }
              setStatus('confirmed')
              return
            }

            if (wompiStatus === 'DECLINED' || wompiStatus === 'ERROR' || wompiStatus === 'VOIDED') {
              setStatus('failed')
              return
            }
          }
        }

        // Fallback: read booking status from DB
        const res = await fetch(`/api/bookings/${bookingId}`)
        if (!res.ok) { setStatus('failed'); return }
        const data = await res.json()
        const b: Booking = data.booking
        setBooking(b)
        setOriginName(data.origin_name || '')
        setDestinationName(data.destination_name || '')

        if (b.status === 'CONFIRMED' || b.status === 'PAID_FULL') {
          setStatus('confirmed')
        } else if (b.status === 'PAYMENT_FAILED' || b.status === 'EXPIRED') {
          setStatus('failed')
        } else {
          setStatus('pending')
        }
      } catch {
        setStatus('failed')
      }
    }

    verifyAndLoad()
  }, [bookingId, reference])

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 size={40} className="animate-spin text-gold mx-auto mb-4" />
          <p className="text-muted-foreground">Verificando tu pago...</p>
        </div>
      </div>
    )
  }

  if (status === 'failed') {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-background pt-24 pb-16">
          <div className="max-w-lg mx-auto px-4 text-center">
            <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-6">
              <AlertCircle size={36} className="text-red-500" />
            </div>
            <h1 className="text-3xl font-light mb-3" style={{ fontFamily: 'var(--font-display)' }}>
              Pago no completado
            </h1>
            <p className="text-muted-foreground mb-8">
              No pudimos confirmar tu pago. El horario ha sido liberado. Puedes intentar de nuevo.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild size="lg">
                <Link href="/reservar">Intentar de nuevo</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <a href={`https://wa.me/${WHATSAPP}`} target="_blank" rel="noopener noreferrer">
                  <MessageCircle size={18} />
                  Escribir por WhatsApp
                </a>
              </Button>
            </div>
          </div>
        </main>
        <Footer />
      </>
    )
  }

  if (status === 'pending') {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-background pt-24 pb-16">
          <div className="max-w-lg mx-auto px-4 text-center">
            <div className="w-20 h-20 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-6">
              <Clock size={36} className="text-amber-500" />
            </div>
            <h1 className="text-3xl font-light mb-3" style={{ fontFamily: 'var(--font-display)' }}>
              Pago en proceso
            </h1>
            <p className="text-muted-foreground mb-4">
              Tu pago está siendo procesado. Recibirás una confirmación cuando sea aprobado.
            </p>
            {booking && (
              <p className="text-sm font-medium text-foreground mb-8">
                Código de reserva: <span className="text-gold">{booking.booking_code}</span>
              </p>
            )}
            <Button asChild variant="outline" size="lg">
              <a href={`https://wa.me/${WHATSAPP}`} target="_blank" rel="noopener noreferrer">
                <MessageCircle size={18} />
                Confirmar por WhatsApp
              </a>
            </Button>
          </div>
        </main>
        <Footer />
      </>
    )
  }

  if (!booking) return null

  const whatsappLink = buildWhatsAppLink(WHATSAPP, booking.booking_code)

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background pt-20 pb-16">
        {/* Success header */}
        <div className="text-white py-14" style={{ background: 'linear-gradient(135deg, #060F1E 0%, #0A1628 100%)' }}>
          <div className="max-w-2xl mx-auto px-4 text-center">
            <div className="w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-6">
              <CheckCircle size={40} className="text-emerald-400" />
            </div>
            <h1
              className="text-4xl font-light text-white mb-2"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              ¡Reserva confirmada!
            </h1>
            <p className="text-stone-400">
              Tu viaje privado está reservado. Nos vemos pronto.
            </p>
          </div>
        </div>

        <div className="max-w-2xl mx-auto px-4 py-10 space-y-5">
          {/* Booking details */}
          <div className="bg-white rounded-xl border border-border p-6 lg:p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-semibold text-foreground">Detalles de tu reserva</h2>
              <span className="text-sm font-mono text-gold border border-gold/30 bg-gold/5 px-3 py-1 rounded-full">
                {booking.booking_code}
              </span>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between py-2 border-b border-border">
                <span className="text-muted-foreground">Ruta</span>
                <span className="font-medium">{originName} → {destinationName}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-border">
                <span className="text-muted-foreground">Fecha y hora</span>
                <span className="font-medium text-right">
                  {formatDatetimeBogota(booking.pickup_datetime)}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-border">
                <span className="text-muted-foreground">Llegada estimada</span>
                <span className="font-medium text-right">
                  {formatDatetimeBogota(booking.estimated_arrival_datetime)}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-border">
                <span className="text-muted-foreground">Dirección de recogida</span>
                <span className="font-medium text-right max-w-[240px]">{booking.pickup_address}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-border">
                <span className="text-muted-foreground">Dirección de destino</span>
                <span className="font-medium text-right max-w-[240px]">{booking.dropoff_address}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-border">
                <span className="text-muted-foreground">Pasajeros</span>
                <span className="font-medium">{booking.passengers_count}</span>
              </div>
            </div>

            {/* Payment summary */}
            <div className="mt-5 p-4 bg-secondary/40 rounded-lg space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Precio total</span>
                <span className="font-medium">{formatCOP(booking.total_price_cop)}</span>
              </div>
              <div className="flex justify-between text-emerald-700">
                <span>Anticipo pagado</span>
                <span className="font-semibold">{formatCOP(booking.deposit_amount_cop)}</span>
              </div>
              {booking.balance_amount_cop > 0 && (
                <div className="flex justify-between text-amber-700">
                  <span>Saldo antes del viaje</span>
                  <span className="font-semibold">{formatCOP(booking.balance_amount_cop)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Policy reminder */}
          <div className="bg-white rounded-xl border border-border p-6 text-sm text-muted-foreground leading-relaxed">
            <p className="font-semibold text-foreground mb-2">Políticas de cancelación</p>
            <p>
              Cancelaciones realizadas con más de 24 horas de anticipación pueden ser
              reprogramadas o reembolsadas. Cancelaciones dentro de las 24 horas previas al
              servicio no son reembolsables.
            </p>
          </div>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              asChild
              size="lg"
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white h-13"
            >
              <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
                <MessageCircle size={18} />
                Confirmar por WhatsApp
              </a>
            </Button>
            <Button asChild variant="outline" size="lg" className="flex-1 h-13">
              <Link href="/">
                Volver al inicio
                <ArrowRight size={18} />
              </Link>
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}

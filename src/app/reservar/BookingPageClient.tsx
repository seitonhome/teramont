'use client'

import { useSearchParams } from 'next/navigation'
import { Navbar } from '@/components/landing/Navbar'
import { Footer } from '@/components/landing/Footer'
import { BookingForm } from '@/components/booking/BookingForm'

export function BookingPageClient() {
  const params = useSearchParams()
  const from = params.get('from') || ''
  const to = params.get('to') || ''

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background pt-20 lg:pt-24">
        {/* Header */}
        <div className="bg-stone-950 text-white py-14 lg:py-20">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <p className="text-gold text-xs tracking-[0.4em] uppercase font-medium mb-4">
              Reserva tu viaje
            </p>
            <h1
              className="text-4xl lg:text-5xl font-light text-white mb-3"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Viaje privado premium
            </h1>
            <p className="text-stone-400 text-base">
              Completa los datos y confirma tu reserva en minutos.
              {from && to ? ` Ruta seleccionada: ${from} → ${to}.` : ''}
            </p>
          </div>
        </div>

        {/* Form */}
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <BookingForm initialOrigin={from} initialDestination={to} />
        </div>
      </main>
      <Footer />
    </>
  )
}

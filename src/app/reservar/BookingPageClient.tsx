'use client'

import { useSearchParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Navbar } from '@/components/landing/Navbar'
import { Footer } from '@/components/landing/Footer'
import { BookingForm } from '@/components/booking/BookingForm'
import { getLocaleClient } from '@/lib/locale'
import { translations } from '@/lib/i18n'
import type { Locale } from '@/lib/i18n'

export function BookingPageClient() {
  const params = useSearchParams()
  const from = params.get('from') || ''
  const to = params.get('to') || ''
  const [locale, setLocale] = useState<Locale>('es')

  useEffect(() => {
    setLocale(getLocaleClient())
  }, [])

  const p = translations[locale].pages.book

  return (
    <>
      <Navbar forceDark />
      <main className="min-h-screen bg-background pt-20 lg:pt-24">
        <div className="text-white py-14 lg:py-20" style={{ background: 'linear-gradient(135deg, #060F1E 0%, #0A1628 100%)' }}>
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <p className="text-gold text-xs tracking-[0.4em] uppercase font-medium mb-4">{p.label}</p>
            <h1 className="text-4xl lg:text-5xl font-light text-white mb-3" style={{ fontFamily: 'var(--font-display)' }}>
              {p.title}
            </h1>
            <p className="text-base" style={{ color: 'rgb(140 165 200)' }}>
              {p.formSubtitle}
              {from && to ? ` ${from} → ${to}.` : ''}
            </p>
          </div>
        </div>

        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <BookingForm initialOrigin={from} initialDestination={to} />
        </div>
      </main>
      <Footer />
    </>
  )
}

import { Navbar } from '@/components/landing/Navbar'
import { Footer } from '@/components/landing/Footer'
import { Routes } from '@/components/landing/Routes'
import { PricingBanner } from '@/components/landing/PricingBanner'
import { getLocale } from '@/lib/locale-server'
import { translations } from '@/lib/i18n'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Routes & rates — Teramont Private Rides',
}

export default async function RutasPage() {
  const locale = await getLocale()
  const p = translations[locale].pages.routes

  return (
    <>
      <Navbar forceDark />
      <main className="min-h-screen bg-background pt-20">
        <div className="text-white py-14" style={{ background: 'linear-gradient(135deg, #060F1E 0%, #0A1628 100%)' }}>
          <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
            <p className="text-gold text-xs tracking-[0.4em] uppercase font-medium mb-4">{p.label}</p>
            <h1 className="text-4xl font-light text-white mb-3" style={{ fontFamily: 'var(--font-display)' }}>
              {p.title}
            </h1>
            <p style={{ color: 'rgb(140 165 200)' }}>{p.subtitle}</p>
          </div>
        </div>
        <Routes />
        <PricingBanner />
      </main>
      <Footer />
    </>
  )
}

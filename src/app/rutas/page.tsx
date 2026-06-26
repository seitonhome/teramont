import { Navbar } from '@/components/landing/Navbar'
import { Footer } from '@/components/landing/Footer'
import { Routes } from '@/components/landing/Routes'
import { PricingBanner } from '@/components/landing/PricingBanner'

export const metadata = {
  title: 'Rutas y tarifas — Teramont Private Rides',
}

export default function RutasPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background pt-20">
        <div className="bg-stone-950 text-white py-14">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
            <p className="text-gold text-xs tracking-[0.4em] uppercase font-medium mb-4">
              Destinos
            </p>
            <h1
              className="text-4xl font-light text-white mb-3"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Rutas y tarifas
            </h1>
            <p className="text-stone-400">
              Todos los traslados disponibles entre Cartagena, Barú y Barranquilla.
            </p>
          </div>
        </div>
        <Routes />
        <PricingBanner />
      </main>
      <Footer />
    </>
  )
}

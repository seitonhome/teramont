import { Navbar } from '@/components/landing/Navbar'
import { Footer } from '@/components/landing/Footer'
import { FAQSection } from '@/components/landing/FAQ'

export const metadata = {
  title: 'Preguntas frecuentes — Teramont Private Rides',
}

export default function FAQPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background pt-20">
        <div className="bg-stone-950 text-white py-14">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
            <p className="text-gold text-xs tracking-[0.4em] uppercase font-medium mb-4">
              Soporte
            </p>
            <h1
              className="text-4xl font-light text-white"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Preguntas frecuentes
            </h1>
          </div>
        </div>
        <FAQSection />
      </main>
      <Footer />
    </>
  )
}

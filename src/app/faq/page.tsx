import { Navbar } from '@/components/landing/Navbar'
import { Footer } from '@/components/landing/Footer'
import { FAQSection } from '@/components/landing/FAQ'
import { getLocale } from '@/lib/locale-server'
import { translations } from '@/lib/i18n'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'FAQ — Teramont Private Rides',
}

export default async function FAQPage() {
  const locale = await getLocale()
  const p = translations[locale].pages.faq

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background pt-20">
        <div className="text-white py-14" style={{ background: 'linear-gradient(135deg, #060F1E 0%, #0A1628 100%)' }}>
          <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
            <p className="text-gold text-xs tracking-[0.4em] uppercase font-medium mb-4">{p.label}</p>
            <h1 className="text-4xl font-light text-white" style={{ fontFamily: 'var(--font-display)' }}>
              {p.title}
            </h1>
          </div>
        </div>
        <FAQSection />
      </main>
      <Footer />
    </>
  )
}

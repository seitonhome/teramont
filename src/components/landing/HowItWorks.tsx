import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'
import { getLocale } from '@/lib/locale-server'
import { translations } from '@/lib/i18n'

export async function HowItWorks() {
  const locale = await getLocale()
  const h = translations[locale].howItWorks

  return (
    <section id="como-funciona" className="py-24 lg:py-32 text-white" style={{ background: 'linear-gradient(135deg, #060F1E 0%, #0A1628 100%)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 lg:mb-20">
          <p className="text-gold text-xs tracking-[0.4em] uppercase font-medium mb-4">
            {h.sectionLabel}
          </p>
          <h2 className="text-4xl lg:text-5xl font-light text-white mb-4" style={{ fontFamily: 'var(--font-display)' }}>
            {h.title}
          </h2>
          <p className="max-w-lg mx-auto text-base" style={{ color: 'rgb(140 165 200)' }}>
            {h.subtitle}
          </p>
        </div>

        <div className="relative">
          {/* Connector line (desktop) */}
          <div className="hidden lg:block absolute top-8 left-[10%] right-[10%] h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-6">
            {h.steps.map((step, index) => (
              <div key={index} className="relative flex flex-col items-center text-center">
                <div
                  className="relative w-16 h-16 rounded-full border border-gold/30 flex items-center justify-center mb-5 z-10"
                  style={{ background: 'rgba(10,22,40,0.8)' }}
                >
                  <span className="text-gold text-lg font-light" style={{ fontFamily: 'var(--font-display)' }}>
                    {String(index + 1).padStart(2, '0')}
                  </span>
                </div>
                <h3 className="font-semibold text-white mb-2 text-base">{step.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: 'rgb(140 165 200)' }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="text-center mt-14">
          <Button asChild size="lg" className="bg-gold hover:bg-gold/90 text-white px-10 h-14 text-base tracking-wide">
            <Link href="/reservar">
              {h.cta}
              <ArrowRight size={18} />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}

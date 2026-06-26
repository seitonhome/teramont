import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight, ChevronDown } from 'lucide-react'
import { getLocale } from '@/lib/locale-server'
import { translations } from '@/lib/i18n'

export async function Hero() {
  const locale = await getLocale()
  const h = translations[locale].hero

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background: azul medianoche profundo */}
      <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, #060F1E 0%, #0A1628 45%, #0D2144 100%)' }} />

      {/* Dot pattern en dorado champán */}
      <div className="absolute inset-0 opacity-[0.04]">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, rgb(193 148 54) 1px, transparent 0)`,
            backgroundSize: '40px 40px',
          }}
        />
      </div>

      {/* Gold accent lines */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold to-transparent opacity-60" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold to-transparent opacity-30" />

      {/* Content */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Premium badge */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 border border-gold/30 rounded-full bg-gold/5 text-gold text-xs tracking-widest uppercase font-medium max-w-full">
            <span className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse flex-shrink-0" />
            <span>{h.badge}</span>
          </div>
        </div>

        {/* Main headline */}
        <h1
          className="text-5xl sm:text-6xl lg:text-7xl font-light text-white leading-tight mb-6 tracking-tight"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          {h.title1}
          <br />
          <span className="font-semibold italic text-gold">{h.titleAccent}</span>
          <br />
          {h.title2}
        </h1>

        {/* Subheadline */}
        <p className="text-lg sm:text-xl max-w-2xl mx-auto mb-4 leading-relaxed font-light" style={{ color: 'rgb(180 196 220)' }}>
          {h.subtitle}{' '}
          <span className="text-white font-medium">{h.subtitleCities}</span>{' '}
          {h.subtitleEnd}
        </p>

        <p className="text-sm tracking-wider uppercase mb-12" style={{ color: 'rgb(100 130 165)' }}>
          {h.tagline}
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button
            asChild
            size="lg"
            className="bg-gold hover:bg-gold/90 text-white px-10 h-14 text-base tracking-wide shadow-lg shadow-gold/20 transition-all hover:shadow-xl hover:shadow-gold/30 hover:-translate-y-0.5"
          >
            <Link href="/reservar">
              {h.cta}
              <ArrowRight size={18} />
            </Link>
          </Button>

          <Button
            asChild
            variant="outline"
            size="lg"
            className="border-white/30 text-white bg-white/5 hover:bg-white/10 hover:border-white/50 h-14 px-8 text-base tracking-wide backdrop-blur-sm"
          >
            <Link href="#rutas">{h.ctaRoutes}</Link>
          </Button>
        </div>

        {/* Trust indicators */}
        <div className="mt-16 flex flex-wrap items-center justify-center gap-8 text-xs tracking-widest uppercase" style={{ color: 'rgb(100 130 165)' }}>
          {h.trust.map((item) => (
            <span key={item} className="flex items-center gap-2">
              <span className="w-1 h-1 rounded-full bg-gold" />
              {item}
            </span>
          ))}
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2" style={{ color: 'rgb(80 110 150)' }}>
        <span className="text-xs tracking-widest uppercase">{h.scrollLabel}</span>
        <ChevronDown size={16} className="animate-bounce" />
      </div>
    </section>
  )
}

import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { ArrowRight, ChevronDown } from 'lucide-react'
import { getLocale } from '@/lib/locale-server'
import { translations } from '@/lib/i18n'
import { formatCOP } from '@/lib/utils'
import { createServiceClient } from '@/lib/supabase/server'

const FALLBACK_MIN_PRICE = 150000

async function getMinPrice() {
  try {
    const supabase = createServiceClient()
    const { data } = await supabase
      .from('routes')
      .select('base_price_cop')
      .eq('active', true)
      .order('base_price_cop', { ascending: true })
      .limit(1)
    return data?.[0] ? Number(data[0].base_price_cop) : FALLBACK_MIN_PRICE
  } catch {
    return FALLBACK_MIN_PRICE
  }
}

export async function Hero() {
  const locale = await getLocale()
  const h = translations[locale].hero
  const minPrice = await getMinPrice()

  return (
    <section className="relative min-h-[100svh] flex items-end lg:items-center overflow-hidden bg-[#060F1E]">
      {/* Foto real: la Teramont frente a la Torre del Reloj */}
      {/* En celular la foto ocupa la parte de arriba; en escritorio, todo el fondo */}
      <div className="absolute inset-x-0 top-0 h-[42svh] lg:h-auto lg:inset-0">
        <Image
          src="/t2.jpg"
          alt={h.imageAlt}
          fill
          priority
          sizes="100vw"
          className="object-cover object-[62%_70%] lg:object-center"
        />
      </div>

      {/* Velo azul medianoche para que el texto se lea sobre la foto */}
      <div
        className="absolute inset-x-0 top-0 h-[42svh] lg:hidden"
        style={{ background: 'linear-gradient(180deg, rgba(6,15,30,0.45) 0%, rgba(6,15,30,0) 30%, rgba(6,15,30,0) 55%, #060F1E 92%)' }}
      />
      <div
        className="absolute inset-0 hidden lg:block"
        style={{ background: 'linear-gradient(90deg, rgba(6,15,30,0.95) 0%, rgba(6,15,30,0.82) 38%, rgba(6,15,30,0.25) 70%, rgba(6,15,30,0.1) 100%)' }}
      />

      {/* Sombra superior para que el menú se lea sobre el cielo */}
      <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-[#060F1E]/80 to-transparent" />

      {/* Gold accent line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold to-transparent opacity-60" />

      {/* Content */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-[34svh] pb-16 lg:py-32">
        <div className="max-w-2xl lg:max-w-xl text-center lg:text-left mx-auto lg:mx-0">
          {/* Premium badge */}
          <div className="hidden sm:flex justify-center lg:justify-start mb-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 border border-gold/40 rounded-full bg-[#060F1E]/50 backdrop-blur-sm text-gold text-xs tracking-widest uppercase font-medium max-w-full">
              <span className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse flex-shrink-0" />
              <span>{h.badge}</span>
            </div>
          </div>

          {/* Main headline */}
          <h1
            className="text-[2.75rem] sm:text-6xl lg:text-7xl font-light text-white leading-[1.05] mb-5 tracking-tight"
            style={{ fontFamily: 'var(--font-display)', textShadow: '0 2px 24px rgba(0,0,0,0.35)' }}
          >
            {h.title1}{' '}
            <br className="sm:hidden" />
            <span className="font-semibold italic text-gold">{h.titleAccent}</span>
            <br />
            {h.title2}
          </h1>

          {/* Subheadline */}
          <p className="text-base sm:text-xl mb-6 sm:mb-8 leading-relaxed font-light" style={{ color: 'rgb(205 216 232)' }}>
            {h.subtitle}{' '}
            <span className="text-white font-medium">{h.subtitleCities}</span>{' '}
            {h.subtitleEnd}
          </p>

          {/* Precio ancla */}
          <div className="inline-flex items-baseline flex-wrap justify-center lg:justify-start gap-x-2 gap-y-1 mb-6 sm:mb-8 px-5 py-2.5 sm:py-3 rounded-xl border border-white/15 bg-white/5 backdrop-blur-sm">
            <span className="text-xs uppercase tracking-widest" style={{ color: 'rgb(170 188 214)' }}>{h.priceFrom}</span>
            <span className="text-3xl font-semibold text-white" style={{ fontFamily: 'var(--font-display)' }}>
              {formatCOP(minPrice)}
            </span>
            <span className="text-sm" style={{ color: 'rgb(170 188 214)' }}>{h.priceUnit}</span>
          </div>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center lg:items-start justify-center lg:justify-start gap-3 sm:gap-4">
            <Button
              asChild
              size="lg"
              className="w-full sm:w-auto bg-gold hover:bg-gold/90 text-white px-10 h-14 text-base tracking-wide shadow-lg shadow-gold/30 transition-all hover:shadow-xl hover:shadow-gold/40 hover:-translate-y-0.5"
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
              className="w-full sm:w-auto border-white/40 text-white bg-white/5 hover:bg-white/15 hover:border-white/60 h-14 px-8 text-base tracking-wide backdrop-blur-sm"
            >
              <Link href="#rutas">{h.ctaRoutes}</Link>
            </Button>
          </div>

          {/* Trust indicators */}
          <div className="mt-10 flex flex-wrap items-center justify-center lg:justify-start gap-x-6 gap-y-3 text-xs tracking-widest uppercase" style={{ color: 'rgb(170 188 214)' }}>
            {h.trust.map((item) => (
              <span key={item} className="flex items-center gap-2">
                <span className="w-1 h-1 rounded-full bg-gold" />
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 hidden sm:flex flex-col items-center gap-2" style={{ color: 'rgb(150 170 200)' }}>
        <span className="text-xs tracking-widest uppercase">{h.scrollLabel}</span>
        <ChevronDown size={16} className="animate-bounce" />
      </div>
    </section>
  )
}

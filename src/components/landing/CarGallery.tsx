'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { getLocaleClient } from '@/lib/locale'

const images = [
  { src: '/t1.jpg', alt: 'Volkswagen Teramont 2024 — exterior' },
  { src: '/t2.jpg', alt: 'Volkswagen Teramont 2024 — interior' },
  { src: '/t3.jpg', alt: 'Volkswagen Teramont 2024 — detalle' },
]

export function CarGallery() {
  const [selected, setSelected] = useState(0)
  const [locale, setLocale] = useState<'es' | 'en'>('es')

  useEffect(() => {
    setLocale(getLocaleClient())
  }, [])

  const prev = () => setSelected((s) => (s - 1 + images.length) % images.length)
  const next = () => setSelected((s) => (s + 1) % images.length)

  return (
    <section className="py-20 lg:py-28 bg-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-center mb-12">
          <p className="text-gold text-xs tracking-[0.4em] uppercase font-medium mb-4">
            {locale === 'es' ? 'El vehículo' : 'The vehicle'}
          </p>
          <h2
            className="text-4xl lg:text-5xl font-light text-foreground"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Volkswagen Teramont 2024
          </h2>
          <p className="mt-4 text-muted-foreground max-w-xl mx-auto">
            {locale === 'es'
              ? 'SUV premium. Aire acondicionado, amplio maletero, asientos cómodos y viaje privado sin compartir.'
              : 'Premium SUV. Air conditioning, large trunk, comfortable seats and a fully private ride.'}
          </p>
        </div>

        {/* Main photo */}
        <div className="relative w-full overflow-hidden rounded-2xl border border-border shadow-lg bg-slate-100 group"
          style={{ aspectRatio: '16/9' }}>
          <Image
            key={selected}
            src={images[selected].src}
            alt={images[selected].alt}
            fill
            className="object-cover transition-opacity duration-300"
            sizes="(max-width: 768px) 100vw, 900px"
            priority={selected === 0}
          />

          {/* Arrow controls */}
          <button
            onClick={prev}
            className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200"
            aria-label="Foto anterior"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={next}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200"
            aria-label="Siguiente foto"
          >
            <ChevronRight size={18} />
          </button>

          {/* Counter */}
          <div className="absolute bottom-3 right-3 bg-black/50 text-white text-xs px-2.5 py-1 rounded-full">
            {selected + 1} / {images.length}
          </div>
        </div>

        {/* Thumbnails — scrollable on mobile */}
        <div className="mt-4 flex gap-2 overflow-x-auto pb-1 justify-start sm:justify-center"
          style={{ scrollbarWidth: 'none' }}>
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setSelected(i)}
              className="relative overflow-hidden rounded-lg border-2 transition-all duration-200 flex-shrink-0"
              style={{
                width: 88,
                height: 58,
                borderColor: selected === i ? '#C19436' : 'transparent',
                boxShadow: selected === i ? '0 0 0 1px #C19436' : 'none',
                opacity: selected === i ? 1 : 0.5,
              }}
              aria-label={img.alt}
            >
              <Image
                src={img.src}
                alt={img.alt}
                fill
                className="object-cover"
                sizes="88px"
              />
            </button>
          ))}
        </div>

        {/* Specs strip */}
        <div className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: locale === 'es' ? 'Pasajeros' : 'Passengers', value: 'Hasta 5' },
            { label: locale === 'es' ? 'Año' : 'Year', value: '2024' },
            { label: locale === 'es' ? 'Climatización' : 'A/C', value: locale === 'es' ? 'Dual zone' : 'Dual zone' },
            { label: locale === 'es' ? 'Maletero' : 'Trunk', value: '700 L' },
          ].map((spec) => (
            <div
              key={spec.label}
              className="text-center py-4 px-3 rounded-xl border border-border bg-slate-50"
            >
              <p className="text-gold text-lg font-semibold">{spec.value}</p>
              <p className="text-xs text-muted-foreground mt-1 uppercase tracking-wide">{spec.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

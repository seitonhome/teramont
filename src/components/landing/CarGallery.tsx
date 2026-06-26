'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { getLocaleClient } from '@/lib/locale'

const images = [
  { src: '/t1.jpg', alt: 'Volkswagen Teramont 2024 — exterior' },
  { src: '/t2.jpg', alt: 'Volkswagen Teramont 2024 — interior' },
]

export function CarGallery() {
  const [selected, setSelected] = useState(0)
  const [locale, setLocale] = useState<'es' | 'en'>('es')

  useEffect(() => {
    setLocale(getLocaleClient())
  }, [])

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
            {locale === 'es' ? 'Volkswagen Teramont 2024' : 'Volkswagen Teramont 2024'}
          </h2>
          <p className="mt-4 text-muted-foreground max-w-xl mx-auto">
            {locale === 'es'
              ? 'SUV premium de 7 plazas. Aire acondicionado, amplio maletero, asientos cómodos y viaje privado sin compartir.'
              : '7-seat premium SUV. Air conditioning, large trunk, comfortable seats and a fully private ride.'}
          </p>
        </div>

        {/* Main photo */}
        <div className="relative w-full overflow-hidden rounded-2xl border border-border shadow-lg bg-slate-100"
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
        </div>

        {/* Thumbnails */}
        {images.length > 1 && (
          <div className="mt-4 flex gap-3 justify-center">
            {images.map((img, i) => (
              <button
                key={i}
                onClick={() => setSelected(i)}
                className="relative overflow-hidden rounded-lg border-2 transition-all duration-200 flex-shrink-0"
                style={{
                  width: 100,
                  height: 65,
                  borderColor: selected === i ? '#C19436' : 'transparent',
                  boxShadow: selected === i ? '0 0 0 1px #C19436' : 'none',
                  opacity: selected === i ? 1 : 0.55,
                }}
                aria-label={img.alt}
              >
                <Image
                  src={img.src}
                  alt={img.alt}
                  fill
                  className="object-cover"
                  sizes="100px"
                />
              </button>
            ))}
          </div>
        )}

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

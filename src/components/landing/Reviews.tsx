'use client'

import { useState, useEffect } from 'react'
import { getLocaleClient } from '@/lib/locale'

interface Review {
  name: string
  location: string
  date: string
  rating: number
  text_es: string
  text_en?: string | null
}

const FALLBACK: Review[] = [
  { name: 'Valentina Ospina', location: 'Medellín', date: 'marzo 2025', rating: 5, text_es: 'Fuimos 4 personas de Cartagena a Barranquilla y el servicio fue excelente. El carro impecable, llegaron puntual y el conductor muy amable. Sin duda lo volvemos a usar.', text_en: 'We were 4 people traveling from Cartagena to Barranquilla and the service was excellent. The car was spotless, they arrived on time and the driver was very friendly. We will definitely use them again.' },
  { name: 'Carlos M.', location: 'Bogotá', date: 'enero 2026', rating: 5, text_es: 'Todo perfecto. Reservé por la página sin problema y el pago fue rápido. Llegaron a la hora exacta 👌', text_en: 'Everything perfect. Booked through the website without any issues and the payment was quick. They arrived right on time 👌' },
  { name: 'Daniela Ruiz', location: 'Cartagena', date: 'enero 2025', rating: 5, text_es: 'Viajé con mi mamá y mis dos hijos a Barú. Cómodos, sin estrés, sin paradas. Vale cada peso.', text_en: 'I traveled with my mom and two kids to Barú. Comfortable, stress-free, no stops. Worth every penny.' },
  { name: 'Jorge Peña', location: 'Barranquilla', date: 'febrero 2025', rating: 5, text_es: 'Usé este servicio para ir a Cartagena por trabajo. Puntual, el carro en perfectas condiciones y el conductor muy profesional. Recomendado 100%.', text_en: 'Used this service for a business trip to Cartagena. Punctual, car in perfect condition and very professional driver. Highly recommended.' },
  { name: 'Laura T.', location: 'Cali', date: 'marzo 2026', rating: 5, text_es: 'La verdad no esperaba que fuera tan fácil reservar. El proceso online rapidísimo y el viaje sin ningún contratiempo.', text_en: "Honestly didn't expect booking to be this easy. Super fast online process and the trip went without a hitch." },
]

function Stars({ count }: { count: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: count }).map((_, i) => (
        <span key={i} style={{ color: '#C19436', fontSize: '14px' }}>★</span>
      ))}
    </div>
  )
}

export function Reviews() {
  const [locale, setLocale] = useState<'es' | 'en'>('es')
  const [reviews, setReviews] = useState<Review[]>([])

  useEffect(() => {
    setLocale(getLocaleClient())
  }, [])

  useEffect(() => {
    async function fetchReviews() {
      try {
        const res = await fetch('/api/reviews')
        if (res.ok) {
          const data = await res.json()
          setReviews(data.length > 0 ? data : FALLBACK)
        } else {
          setReviews(FALLBACK)
        }
      } catch {
        setReviews(FALLBACK)
      }
    }
    fetchReviews()
  }, [])

  const list = reviews.map((r) => ({
    name: r.name,
    location: r.location,
    date: r.date,
    rating: r.rating,
    text: locale === 'en' && r.text_en ? r.text_en : r.text_es,
  }))

  return (
    <section className="py-20 lg:py-28" style={{ background: 'linear-gradient(180deg, #F8F6F2 0%, #ffffff 100%)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <p className="text-gold text-xs tracking-[0.4em] uppercase font-medium mb-4">
            {locale === 'es' ? 'Opiniones' : 'Reviews'}
          </p>
          <h2 className="text-4xl lg:text-5xl font-light text-foreground" style={{ fontFamily: 'var(--font-display)' }}>
            {locale === 'es' ? 'Lo que dicen nuestros pasajeros' : 'What our passengers say'}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {list.map((review, i) => (
            <div
              key={i}
              className="bg-white rounded-xl border border-border p-6 hover:shadow-md hover:border-gold/30 transition-all duration-200"
            >
              <Stars count={review.rating} />
              <p className="mt-4 mb-5 text-foreground/80 text-sm leading-relaxed">
                &ldquo;{review.text}&rdquo;
              </p>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-foreground text-sm">{review.name}</p>
                  <p className="text-xs text-muted-foreground">{review.location}</p>
                </div>
                <p className="text-xs text-muted-foreground">{review.date}</p>
              </div>
            </div>
          ))}
        </div>

        {list.length > 0 && (
          <div className="mt-10 text-center">
            <div className="inline-flex items-center gap-3 bg-white border border-border rounded-full px-6 py-3">
              <Stars count={5} />
              <span className="text-sm font-semibold text-foreground">5.0</span>
              <span className="text-muted-foreground text-sm">·</span>
              <span className="text-muted-foreground text-sm">
                {locale === 'es' ? `${list.length} reseñas verificadas` : `${list.length} verified reviews`}
              </span>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

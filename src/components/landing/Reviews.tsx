'use client'

import { useState, useEffect } from 'react'
import { getLocaleClient } from '@/lib/locale'

const reviews = {
  es: [
    {
      name: 'Valentina Ospina',
      location: 'Medellín',
      date: 'marzo 2025',
      rating: 5,
      text: 'Fuimos 4 personas de Cartagena a Barranquilla y el servicio fue excelente. El carro impecable, llegaron puntual y el conductor muy amable. Sin duda lo volvemos a usar.',
    },
    {
      name: 'Carlos M.',
      location: 'Bogotá',
      date: 'abril 2025',
      rating: 5,
      text: 'Todo perfecto. Reservé por la página sin problema y el pago fue rápido. Llegaron a la hora exacta 👌',
    },
    {
      name: 'Daniela Ruiz',
      location: 'Cartagena',
      date: 'enero 2025',
      rating: 5,
      text: 'Viajé con mi mamá y mis dos hijos a Barú. Cómodos, sin estrés, sin paradas. Vale cada peso.',
    },
    {
      name: 'Jorge Peña',
      location: 'Barranquilla',
      date: 'febrero 2025',
      rating: 5,
      text: 'Usé este servicio para ir a Cartagena por trabajo. Puntual, el carro en perfectas condiciones y el conductor muy profesional. Recomendado 100%.',
    },
    {
      name: 'Laura T.',
      location: 'Cali',
      date: 'mayo 2025',
      rating: 5,
      text: 'La verdad no esperaba que fuera tan fácil reservar. El proceso online rapidísimo y el viaje sin ningún contratiempo.',
    },
  ],
  en: [
    {
      name: 'Valentina Ospina',
      location: 'Medellín',
      date: 'March 2025',
      rating: 5,
      text: 'We were 4 people traveling from Cartagena to Barranquilla and the service was excellent. The car was spotless, they arrived on time and the driver was very friendly. We will definitely use them again.',
    },
    {
      name: 'Carlos M.',
      location: 'Bogotá',
      date: 'April 2025',
      rating: 5,
      text: 'Everything perfect. Booked through the website without any issues and the payment was quick. They arrived right on time 👌',
    },
    {
      name: 'Daniela Ruiz',
      location: 'Cartagena',
      date: 'January 2025',
      rating: 5,
      text: 'I traveled with my mom and two kids to Barú. Comfortable, stress-free, no stops. Worth every penny.',
    },
    {
      name: 'Mike T.',
      location: 'USA',
      date: 'February 2025',
      rating: 5,
      text: 'Used this service for a business trip to Cartagena. Punctual, car in perfect condition and very professional driver. Highly recommended.',
    },
    {
      name: 'Laura T.',
      location: 'Cali',
      date: 'May 2025',
      rating: 5,
      text: "Honestly didn't expect booking to be this easy. Super fast online process and the trip went without a hitch.",
    },
  ],
}

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

  useEffect(() => {
    setLocale(getLocaleClient())
  }, [])

  const list = reviews[locale]

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

        {/* Average rating */}
        <div className="mt-10 text-center">
          <div className="inline-flex items-center gap-3 bg-white border border-border rounded-full px-6 py-3">
            <Stars count={5} />
            <span className="text-sm font-semibold text-foreground">5.0</span>
            <span className="text-muted-foreground text-sm">·</span>
            <span className="text-muted-foreground text-sm">
              {locale === 'es' ? '5 reseñas verificadas' : '5 verified reviews'}
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}

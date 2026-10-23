'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { BadgeCheck, PenLine } from 'lucide-react'
import { getLocaleClient } from '@/lib/locale'

interface Review {
  name: string
  location: string
  date: string
  rating: number
  text_es: string
  text_en?: string | null
  verified?: boolean
}

function Stars({ count }: { count: number }) {
  return (
    <div className="flex gap-0.5" aria-label={`${count} / 5`}>
      {Array.from({ length: count }).map((_, i) => (
        <span key={i} style={{ color: '#C19436', fontSize: '14px' }}>★</span>
      ))}
    </div>
  )
}

export function Reviews() {
  const [locale, setLocale] = useState<'es' | 'en'>('es')
  const [reviews, setReviews] = useState<Review[]>([])
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    setLocale(getLocaleClient())
  }, [])

  // Only reviews approved in /admin/reviews come back from the API
  useEffect(() => {
    async function fetchReviews() {
      try {
        const res = await fetch('/api/reviews')
        if (res.ok) setReviews(await res.json())
      } catch {
        setReviews([])
      } finally {
        setLoaded(true)
      }
    }
    fetchReviews()
  }, [])

  const es = locale === 'es'
  const list = reviews.map((r) => ({
    name: r.name,
    location: r.location,
    date: r.date,
    rating: r.rating,
    verified: !!r.verified,
    text: !es && r.text_en ? r.text_en : r.text_es,
  }))
  const average = list.length > 0 ? list.reduce((sum, r) => sum + r.rating, 0) / list.length : 0

  if (!loaded) return null

  return (
    <section className="py-20 lg:py-28" style={{ background: 'linear-gradient(180deg, #F8F6F2 0%, #ffffff 100%)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <p className="text-gold text-xs tracking-[0.4em] uppercase font-medium mb-4">
            {es ? 'Historias reales' : 'Real stories'}
          </p>
          <h2 className="text-4xl lg:text-5xl font-light text-foreground" style={{ fontFamily: 'var(--font-display)' }}>
            {list.length > 0
              ? es ? 'Lo que dicen quienes ya llegaron con nosotros' : 'What travelers say after riding with us'
              : es ? '¿Ya viajaste con nosotros?' : 'Already rode with us?'}
          </h2>
        </div>

        {list.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {list.map((review, i) => (
              <div
                key={i}
                className="bg-white rounded-xl border border-border p-6 hover:shadow-md hover:border-gold/30 transition-all duration-200 flex flex-col"
              >
                <Stars count={review.rating} />
                <p className="mt-4 mb-5 text-foreground/80 text-sm leading-relaxed flex-1">
                  &ldquo;{review.text}&rdquo;
                </p>
                <div className="flex items-end justify-between gap-3">
                  <div>
                    <p className="font-semibold text-foreground text-sm">{review.name}</p>
                    {review.location && <p className="text-xs text-muted-foreground">{review.location}</p>}
                    {review.verified && (
                      <p className="mt-1 inline-flex items-center gap-1 text-xs text-emerald-700">
                        <BadgeCheck size={13} /> {es ? 'Viaje verificado' : 'Verified ride'}
                      </p>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground whitespace-nowrap">{review.date}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-muted-foreground max-w-md mx-auto">
            {es
              ? 'Sé el primero en contar cómo fue tu viaje. Tu reseña ayuda a otros viajeros a decidirse.'
              : 'Be the first to tell how your ride went. Your review helps other travelers decide.'}
          </p>
        )}

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          {list.length > 0 && (
            <div className="inline-flex items-center gap-3 bg-white border border-border rounded-full px-6 py-3">
              <Stars count={Math.round(average)} />
              <span className="text-sm font-semibold text-foreground">{average.toFixed(1)}</span>
              <span className="text-muted-foreground text-sm">·</span>
              <span className="text-muted-foreground text-sm">
                {es ? `${list.length} ${list.length === 1 ? 'reseña' : 'reseñas'}` : `${list.length} ${list.length === 1 ? 'review' : 'reviews'}`}
              </span>
            </div>
          )}
          <Link
            href="/resena"
            className="inline-flex items-center gap-2 rounded-full border border-gold/40 px-6 py-3 text-sm font-medium text-foreground hover:bg-gold/10 transition-colors"
          >
            <PenLine size={15} className="text-gold" />
            {es ? 'Deja tu reseña' : 'Leave a review'}
          </Link>
        </div>
      </div>
    </section>
  )
}

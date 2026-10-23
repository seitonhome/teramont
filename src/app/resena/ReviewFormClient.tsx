'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Navbar } from '@/components/landing/Navbar'
import { Footer } from '@/components/landing/Footer'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { translations } from '@/lib/i18n'
import type { Locale } from '@/lib/i18n'
import { Star, Loader2, AlertCircle, CheckCircle } from 'lucide-react'

export function ReviewFormClient({ locale }: { locale: Locale }) {
  const searchParams = useSearchParams()
  const [rating, setRating] = useState(0)
  const [hover, setHover] = useState(0)
  const [text, setText] = useState('')
  const [name, setName] = useState('')
  const [location, setLocation] = useState('')
  const [email, setEmail] = useState('')
  const [code, setCode] = useState(() => (searchParams.get('codigo') || '').toUpperCase().slice(0, 20))
  const [website, setWebsite] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [sent, setSent] = useState(false)

  const t = translations[locale].reviewForm

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (rating < 1) {
      setError(t.chooseRating)
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating, text, name, location, email, booking_code: code, lang: locale, website }),
      })
      if (res.status === 429) {
        setError(t.tooMany)
        return
      }
      if (!res.ok) {
        setError(t.error)
        return
      }
      setSent(true)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch {
      setError(t.error)
    } finally {
      setLoading(false)
    }
  }

  const shown = hover || rating

  return (
    <>
      <Navbar forceDark />
      <main className="min-h-screen bg-background pt-24 pb-16">
        <div className="max-w-xl mx-auto px-4">
          {sent ? (
            <div className="bg-white rounded-xl border border-border p-8 text-center">
              <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-5">
                <CheckCircle size={30} className="text-emerald-600" />
              </div>
              <h1 className="text-3xl font-light text-foreground mb-3" style={{ fontFamily: 'var(--font-display)' }}>
                {t.thanksTitle}
              </h1>
              <p className="text-muted-foreground mb-8">{t.thanksText}</p>
              <Button asChild className="bg-gold hover:bg-gold/90 text-white h-11 px-8">
                <Link href="/">{t.backHome}</Link>
              </Button>
            </div>
          ) : (
            <>
              <div className="text-center mb-10">
                <p className="text-gold text-xs tracking-[0.4em] uppercase font-medium mb-3">{t.label}</p>
                <h1 className="text-4xl font-light text-foreground mb-3" style={{ fontFamily: 'var(--font-display)' }}>
                  {t.title}
                </h1>
                <p className="text-muted-foreground text-sm">{t.subtitle}</p>
              </div>

              <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-border p-6 space-y-5">
                <fieldset>
                  <legend className="mb-2 block text-sm font-medium">{t.rating}</legend>
                  <div className="flex items-center gap-1" onMouseLeave={() => setHover(0)}>
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button
                        key={n}
                        type="button"
                        onClick={() => setRating(n)}
                        onMouseEnter={() => setHover(n)}
                        aria-label={`${n} / 5 — ${t.ratingLabels[n - 1]}`}
                        aria-pressed={rating === n}
                        className="p-1.5 rounded-md focus-visible:outline-2 focus-visible:outline-gold"
                      >
                        <Star
                          size={32}
                          className={n <= shown ? 'text-gold fill-gold' : 'text-slate-300'}
                        />
                      </button>
                    ))}
                    <span className="ml-2 text-sm text-muted-foreground min-w-20">
                      {shown > 0 ? t.ratingLabels[shown - 1] : ''}
                    </span>
                  </div>
                </fieldset>

                <div>
                  <Label htmlFor="review-text" className="mb-2 block text-sm">{t.text}</Label>
                  <Textarea
                    id="review-text"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder={t.textPlaceholder}
                    required
                    minLength={10}
                    maxLength={800}
                    rows={5}
                  />
                  <p className="mt-1 text-xs text-muted-foreground text-right">{text.length}/800</p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="review-name" className="mb-2 block text-sm">{t.name}</Label>
                    <Input id="review-name" value={name} onChange={(e) => setName(e.target.value)} placeholder={t.namePlaceholder} required minLength={2} maxLength={60} autoComplete="name" />
                  </div>
                  <div>
                    <Label htmlFor="review-location" className="mb-2 block text-sm">{t.location}</Label>
                    <Input id="review-location" value={location} onChange={(e) => setLocation(e.target.value)} placeholder={t.locationPlaceholder} maxLength={60} autoComplete="address-level2" />
                  </div>
                </div>

                <div>
                  <Label htmlFor="review-email" className="mb-2 block text-sm">{t.email}</Label>
                  <Input id="review-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="tu@email.com" required autoComplete="email" />
                  <p className="mt-1 text-xs text-muted-foreground">{t.emailHint}</p>
                </div>

                <div>
                  <Label htmlFor="review-code" className="mb-2 block text-sm">{t.code}</Label>
                  <Input id="review-code" value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="TPR-..." maxLength={20} className="font-mono tracking-widest" />
                  <p className="mt-1 text-xs text-muted-foreground">{t.codeHint}</p>
                </div>

                {/* Honeypot: hidden from people, bots fill it */}
                <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
                  <label htmlFor="review-website">Website</label>
                  <input id="review-website" tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} />
                </div>

                {error && (
                  <div role="alert" className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
                    <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
                    <p>{error}</p>
                  </div>
                )}

                <Button type="submit" disabled={loading} className="w-full bg-gold hover:bg-gold/90 text-white h-12 text-base">
                  {loading ? <><Loader2 size={16} className="animate-spin" /> {t.sending}</> : t.submit}
                </Button>
              </form>
            </>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}

import type { Metadata } from 'next'
import { Suspense } from 'react'
import { ReviewFormClient } from './ReviewFormClient'
import { getLocale } from '@/lib/locale-server'

export const metadata: Metadata = {
  title: 'Deja tu reseña',
  description: 'Cuéntanos cómo fue tu viaje privado con Teramont Private Rides.',
  robots: { index: false, follow: true },
  alternates: { canonical: 'https://teramont.seitonhome.com/resena' },
}

export default async function ResenaPage() {
  const locale = await getLocale()
  return (
    <Suspense fallback={null}>
      <ReviewFormClient locale={locale} />
    </Suspense>
  )
}

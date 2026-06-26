'use client'

import { useTransition } from 'react'
import { setLocale } from '@/app/actions'
import { getLocaleClient } from '@/lib/locale'
import type { Locale } from '@/lib/i18n'

export function LanguageSwitcher() {
  const [isPending, startTransition] = useTransition()
  const current: Locale = getLocaleClient()

  function toggle() {
    const next: Locale = current === 'es' ? 'en' : 'es'
    startTransition(async () => {
      await setLocale(next)
    })
  }

  return (
    <button
      onClick={toggle}
      disabled={isPending}
      className="flex items-center gap-1 text-xs tracking-widest uppercase font-medium transition-colors hover:text-gold disabled:opacity-50"
      style={{ color: 'inherit', letterSpacing: '0.12em' }}
      aria-label="Switch language"
    >
      <span style={{ opacity: current === 'es' ? 1 : 0.4 }}>ES</span>
      <span className="opacity-30 mx-0.5">|</span>
      <span style={{ opacity: current === 'en' ? 1 : 0.4 }}>EN</span>
    </button>
  )
}

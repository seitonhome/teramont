'use client'

import { getLocaleClient, LOCALE_COOKIE } from '@/lib/locale'
import type { Locale } from '@/lib/i18n'

export function LanguageSwitcher() {
  const current: Locale = getLocaleClient()

  function toggle() {
    const next: Locale = current === 'es' ? 'en' : 'es'
    document.cookie = `${LOCALE_COOKIE}=${next};path=/;max-age=31536000;samesite=lax`
    window.location.reload()
  }

  return (
    <button
      onClick={toggle}
      className="flex items-center gap-1 text-xs tracking-widest uppercase font-medium transition-colors hover:text-gold"
      style={{ color: 'inherit', letterSpacing: '0.12em' }}
      aria-label="Switch language"
    >
      <span style={{ opacity: current === 'es' ? 1 : 0.4 }}>ES</span>
      <span className="opacity-30 mx-0.5">|</span>
      <span style={{ opacity: current === 'en' ? 1 : 0.4 }}>EN</span>
    </button>
  )
}

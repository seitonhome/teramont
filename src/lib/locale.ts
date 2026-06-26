import type { Locale } from './i18n'

export const LOCALE_COOKIE = 'tpr_locale'

// Client-side: read locale from document.cookie
export function getLocaleClient(): Locale {
  if (typeof document === 'undefined') return 'es'
  const match = document.cookie.match(new RegExp(`(?:^|; )${LOCALE_COOKIE}=([^;]*)`))
  const val = match ? decodeURIComponent(match[1]) : 'es'
  return val === 'en' ? 'en' : 'es'
}

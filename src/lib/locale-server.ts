import { cookies } from 'next/headers'
import type { Locale } from './i18n'
import { LOCALE_COOKIE } from './locale'

export async function getLocale(): Promise<Locale> {
  const cookieStore = await cookies()
  const val = cookieStore.get(LOCALE_COOKIE)?.value
  return val === 'en' ? 'en' : 'es'
}

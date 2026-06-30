'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { MessageCircle, Mail } from 'lucide-react'
import { getLocaleClient } from '@/lib/locale'
import { translations } from '@/lib/i18n'

export function Footer() {
  const [locale, setLocale] = useState<'es' | 'en'>('es')
  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '573001234567'
  const contactEmail = process.env.NEXT_PUBLIC_CONTACT_EMAIL || 'hola@teramontrides.com'

  useEffect(() => {
    setLocale(getLocaleClient())
  }, [])

  const f = translations[locale].footer
  const whatsappMessage = translations[locale].whatsapp.message

  return (
    <footer style={{ background: '#060F1E', color: 'rgb(120 148 185)' }}>
      {/* Top CTA bar */}
      <div style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <p className="text-2xl font-light text-white mb-1" style={{ fontFamily: 'var(--font-display)' }}>
              {f.tagline}
            </p>
            <p className="text-sm" style={{ color: 'rgb(120 148 185)' }}>{f.taglineSub}</p>
          </div>
          <Link
            href="/reservar"
            className="inline-flex items-center gap-2 px-8 py-3 bg-gold hover:bg-gold/90 text-white text-sm font-medium tracking-wide rounded-sm transition-colors"
          >
            {f.bookNow}
          </Link>
        </div>
      </div>

      {/* Main footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xl font-light tracking-[0.2em] uppercase text-white" style={{ fontFamily: 'var(--font-display)' }}>
                Teramont
              </span>
              <span className="text-xs tracking-[0.3em] uppercase font-medium text-gold">Private Rides</span>
            </div>
            <p className="text-sm leading-relaxed max-w-xs mb-6" style={{ color: 'rgb(120 148 185)' }}>
              {f.description}
            </p>
            <div className="flex items-center gap-4">
              <a
                href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-green-600 transition-colors"
                style={{ background: 'rgba(255,255,255,0.07)', color: 'rgb(120 148 185)' }}
                aria-label="WhatsApp"
              >
                <MessageCircle size={16} />
              </a>
              <a
                href={`mailto:${contactEmail}`}
                className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-gold transition-colors"
                style={{ background: 'rgba(255,255,255,0.07)', color: 'rgb(120 148 185)' }}
                aria-label="Email"
              >
                <Mail size={16} />
              </a>
            </div>
          </div>

          {/* Rutas */}
          <div>
            <p className="text-xs tracking-[0.3em] uppercase mb-4" style={{ color: 'rgb(80 110 150)' }}>
              {f.routesTitle}
            </p>
            <ul className="space-y-2 text-sm">
              {['Cartagena → Barranquilla', 'Barranquilla → Cartagena', 'Cartagena → Barú', 'Barú → Cartagena', 'Barranquilla → Barú', 'Barú → Barranquilla'].map((r) => (
                <li key={r}>
                  <Link href="/reservar" className="hover:text-gold transition-colors">{r}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Info */}
          <div>
            <p className="text-xs tracking-[0.3em] uppercase mb-4" style={{ color: 'rgb(80 110 150)' }}>
              {f.infoTitle}
            </p>
            <ul className="space-y-2 text-sm">
              <li><Link href="/rutas" className="hover:text-gold transition-colors">{f.links.routesAndPrices}</Link></li>
              <li><Link href="/faq" className="hover:text-gold transition-colors">{f.links.faq}</Link></li>
              <li><Link href="/politicas" className="hover:text-gold transition-colors">{f.links.cancellation}</Link></li>
              <li><Link href="/politicas#terminos" className="hover:text-gold transition-colors">{f.links.terms}</Link></li>
              <li><Link href="/politicas#privacidad" className="hover:text-gold transition-colors">{f.links.privacy}</Link></li>
              <li><Link href="/mi-reserva" className="hover:text-gold transition-colors">{f.links.myBooking}</Link></li>
              <li><a href={`mailto:${contactEmail}`} className="hover:text-gold transition-colors">{contactEmail}</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs" style={{ borderTop: '1px solid rgba(255,255,255,0.07)', color: 'rgb(60 85 120)' }}>
          <p>© {new Date().getFullYear()} Teramont Private Rides. {f.copyright}</p>
          <p>{f.subtitle}</p>
        </div>
      </div>
    </footer>
  )
}

'use client'

import { useState, useEffect } from 'react'
import { MessageCircle } from 'lucide-react'
import { getLocaleClient } from '@/lib/locale'
import { translations } from '@/lib/i18n'
import type { Locale } from '@/lib/i18n'

const WHATSAPP = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '573001234567'

export function WhatsAppButton() {
  const [locale, setLocale] = useState<Locale>('es')
  const [expanded, setExpanded] = useState(false)

  useEffect(() => {
    setLocale(getLocaleClient())
  }, [])

  const w = translations[locale].whatsapp
  const url = `https://wa.me/${WHATSAPP}`

  return (
    <div
      className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2"
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => setExpanded(false)}
    >
      {/* Tooltip card */}
      {expanded && (
        <div
          className="rounded-xl px-4 py-3 text-white shadow-2xl text-sm pointer-events-none select-none"
          style={{
            background: '#060F1E',
            border: '1px solid rgba(255,255,255,0.1)',
            maxWidth: 180,
            animation: 'fadeInUp 0.15s ease-out',
          }}
        >
          <p className="font-semibold text-gold text-xs tracking-wide mb-0.5">{w.customTitle}</p>
          <p style={{ color: 'rgb(160 185 215)', fontSize: '0.72rem' }}>{w.customSub}</p>
        </div>
      )}

      {/* Button */}
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 rounded-full text-white font-medium shadow-lg transition-all duration-200 hover:scale-105 hover:shadow-xl"
        style={{
          background: '#25D366',
          padding: expanded ? '12px 20px' : '14px',
          boxShadow: '0 4px 20px rgba(37,211,102,0.4)',
        }}
        aria-label="WhatsApp"
      >
        <MessageCircle size={22} strokeWidth={2} />
        {expanded && <span className="text-sm whitespace-nowrap">{w.label}</span>}
      </a>

      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}

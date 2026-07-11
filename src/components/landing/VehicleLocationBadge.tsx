'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { MapPin, X } from 'lucide-react'
import { getLocaleClient } from '@/lib/locale'
import { translations } from '@/lib/i18n'
import type { Locale } from '@/lib/i18n'

type VehicleStatus = 'available' | 'in_service' | 'unavailable'

const DISMISS_KEY = 'teramont_vehicle_badge_dismissed'

const DOT_COLOR: Record<VehicleStatus, string> = {
  available: '#22c55e',
  in_service: '#f5a623',
  unavailable: '#8a94a6',
}

export function VehicleLocationBadge() {
  const [locale, setLocale] = useState<Locale>('es')
  const [status, setStatus] = useState<VehicleStatus | null>(null)
  const [locationName, setLocationName] = useState<string | null>(null)
  const [dismissed, setDismissed] = useState(true)

  useEffect(() => {
    setLocale(getLocaleClient())
    if (typeof window !== 'undefined' && !sessionStorage.getItem(DISMISS_KEY)) {
      setDismissed(false)
    }

    fetch('/api/vehicle-location')
      .then((res) => res.json())
      .then((data) => {
        setStatus(data.status)
        setLocationName(data.location_name)
      })
      .catch(() => setStatus(null))
  }, [])

  if (!status || dismissed) return null

  const vl = translations[locale].vehicleLocation

  const message =
    status === 'available' && locationName
      ? vl.available.replace('{location}', locationName)
      : status === 'in_service'
      ? vl.inService
      : vl.unavailable

  const dotColor = DOT_COLOR[status]

  return (
    <div
      className="fixed bottom-6 left-6 z-40 max-w-[280px]"
      style={{ animation: 'vehicleBadgeIn 0.3s ease-out' }}
    >
      <div
        className="relative flex items-start gap-3 rounded-xl pl-4 pr-3 py-3 shadow-2xl"
        style={{
          background: '#060F1E',
          border: '1px solid rgba(193,148,54,0.35)',
        }}
      >
        <button
          onClick={() => {
            sessionStorage.setItem(DISMISS_KEY, '1')
            setDismissed(true)
          }}
          className="absolute -top-2 -right-2 w-5 h-5 rounded-full flex items-center justify-center text-white/70 hover:text-white"
          style={{ background: '#0A1628', border: '1px solid rgba(255,255,255,0.15)' }}
          aria-label="Cerrar"
        >
          <X size={11} />
        </button>

        <span className="relative flex-shrink-0 mt-1.5 flex h-2.5 w-2.5">
          <span
            className="absolute inline-flex h-full w-full rounded-full animate-ping opacity-60"
            style={{ background: dotColor }}
          />
          <span
            className="relative inline-flex rounded-full h-2.5 w-2.5"
            style={{ background: dotColor }}
          />
        </span>

        <div>
          <p className="text-gold text-[10px] font-semibold uppercase tracking-wider mb-0.5">
            {vl.liveLabel}
          </p>
          <p className="text-white text-sm font-medium leading-snug flex items-center gap-1.5">
            <MapPin size={13} className="text-gold flex-shrink-0" />
            {message}
          </p>
          {status === 'available' && (
            <Link
              href="/reservar"
              className="inline-block mt-2 text-xs font-semibold text-gold hover:underline"
            >
              {vl.cta} →
            </Link>
          )}
        </div>
      </div>

      <style>{`
        @keyframes vehicleBadgeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}

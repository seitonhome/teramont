'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { MapPin, X } from 'lucide-react'
import { getLocaleClient } from '@/lib/locale'
import { translations } from '@/lib/i18n'
import type { Locale } from '@/lib/i18n'

type VehicleStatus = 'available' | 'in_service' | 'unavailable'

const DISMISS_KEY = 'teramont_vehicle_badge_dismissed'

// Whole-card color per status (not just a small dot) so the badge reads
// instantly against the site's own dark-navy sections instead of blending in.
const STATUS_STYLES: Record<VehicleStatus, { gradient: string; glow: string; label: string }> = {
  // Gold = brand "go/act now" color, reused from the primary CTA buttons.
  available: {
    gradient: 'linear-gradient(135deg, #d9a63e 0%, #b1791f 100%)',
    glow: 'rgba(217,166,62,0.55)',
    label: '#3a2a06',
  },
  // Warm amber-orange = "in progress", distinct from the gold "available" state.
  in_service: {
    gradient: 'linear-gradient(135deg, #fb923c 0%, #ea580c 100%)',
    glow: 'rgba(234,88,12,0.5)',
    label: '#4a1d05',
  },
  // Muted slate = nothing to act on, deliberately quieter than the other two.
  unavailable: {
    gradient: 'linear-gradient(135deg, #475569 0%, #1e293b 100%)',
    glow: 'rgba(30,41,59,0.4)',
    label: '#e2e8f0',
  },
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
  const style = STATUS_STYLES[status]

  const message =
    status === 'available' && locationName
      ? vl.available.replace('{location}', locationName)
      : status === 'in_service'
      ? vl.inService
      : vl.unavailable

  return (
    <div
      className="fixed bottom-6 left-6 z-40 max-w-[290px]"
      style={{ animation: 'vehicleBadgeIn 0.35s ease-out' }}
    >
      <div
        className="relative flex items-start gap-3 rounded-2xl pl-4 pr-3 py-3.5"
        style={{
          background: style.gradient,
          boxShadow: `0 8px 28px ${style.glow}, 0 2px 8px rgba(0,0,0,0.25)`,
          border: '1px solid rgba(255,255,255,0.25)',
          animation: 'vehicleBadgeGlow 2.4s ease-in-out infinite',
        }}
      >
        <button
          onClick={() => {
            sessionStorage.setItem(DISMISS_KEY, '1')
            setDismissed(true)
          }}
          className="absolute -top-2 -right-2 w-5 h-5 rounded-full flex items-center justify-center text-white/80 hover:text-white"
          style={{ background: '#0A1628', border: '1px solid rgba(255,255,255,0.2)' }}
          aria-label="Cerrar"
        >
          <X size={11} />
        </button>

        <span
          className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full mt-0.5"
          style={{ background: 'rgba(255,255,255,0.22)' }}
        >
          <MapPin size={15} className="text-white" />
        </span>

        <div>
          <div className="flex items-center gap-1.5 mb-0.5">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full rounded-full bg-white animate-ping opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
            </span>
            <p
              className="text-[10px] font-bold uppercase tracking-wider"
              style={{ color: style.label }}
            >
              {vl.liveLabel}
            </p>
          </div>
          <p className="text-white text-sm font-semibold leading-snug drop-shadow-sm">
            {message}
          </p>
          {status === 'available' && (
            <Link
              href="/reservar"
              className="inline-flex items-center gap-1 mt-2 text-xs font-bold text-white bg-black/20 hover:bg-black/30 rounded-full px-3 py-1 transition-colors"
            >
              {vl.cta} →
            </Link>
          )}
        </div>
      </div>

      <style>{`
        @keyframes vehicleBadgeIn {
          from { opacity: 0; transform: translateY(10px) scale(0.96); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes vehicleBadgeGlow {
          0%, 100% { filter: brightness(1); }
          50% { filter: brightness(1.08); }
        }
      `}</style>
    </div>
  )
}

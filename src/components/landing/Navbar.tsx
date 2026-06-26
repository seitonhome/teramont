'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'
import { cn } from '@/lib/utils'
import { getLocaleClient } from '@/lib/locale'
import { translations } from '@/lib/i18n'

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [locale, setLocale] = useState<'es' | 'en'>('es')

  useEffect(() => {
    setLocale(getLocaleClient())
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const nav = translations[locale].nav

  const navLinks = [
    { href: '/#rutas', label: nav.routes },
    { href: '/#como-funciona', label: nav.howItWorks },
    { href: '/faq', label: nav.faq },
    { href: '/politicas', label: nav.policies },
  ]

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        scrolled
          ? 'bg-white/95 backdrop-blur-sm shadow-sm border-b border-border'
          : 'bg-transparent'
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <span
              className={cn(
                'text-xl font-light tracking-[0.2em] uppercase transition-colors',
                scrolled ? 'text-foreground' : 'text-white'
              )}
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Teramont
            </span>
            <span
              className={cn(
                'text-xs tracking-[0.3em] uppercase font-medium transition-colors',
                scrolled ? 'text-gold' : 'text-gold'
              )}
            >
              Private Rides
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-6 lg:gap-8">
            {navLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'text-sm tracking-wide transition-colors hover:text-gold',
                  scrolled ? 'text-foreground/70' : 'text-white/80'
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Right side: lang switcher + CTA */}
          <div className="hidden md:flex items-center gap-4">
            <span className={cn('transition-colors', scrolled ? 'text-foreground/50' : 'text-white/60')}>
              <LanguageSwitcher />
            </span>
            <Button
              asChild
              size="default"
              className={cn(
                'transition-all',
                scrolled
                  ? 'bg-foreground text-background hover:bg-foreground/90'
                  : 'bg-white text-foreground hover:bg-white/90'
              )}
            >
              <Link href="/reservar">{nav.book}</Link>
            </Button>
          </div>

          {/* Mobile toggle */}
          <button
            className={cn(
              'md:hidden p-2 transition-colors',
              scrolled ? 'text-foreground' : 'text-white'
            )}
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Menú"
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-border shadow-lg">
          <div className="px-4 py-6 space-y-4">
            {navLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block text-sm text-foreground/70 hover:text-gold transition-colors py-1"
                onClick={() => setMobileOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <div className="pt-1 pb-1">
              <LanguageSwitcher />
            </div>
            <div className="pt-1">
              <Button asChild className="w-full">
                <Link href="/reservar" onClick={() => setMobileOpen(false)}>
                  {nav.book}
                </Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}

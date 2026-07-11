'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import {
  LayoutDashboard,
  CalendarDays,
  List,
  Route,
  Lock,
  Settings,
  LogOut,
  Car,
  Menu,
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/calendar', label: 'Calendario', icon: CalendarDays },
  { href: '/admin/bookings', label: 'Reservas', icon: List },
  { href: '/admin/routes', label: 'Rutas', icon: Route },
  { href: '/admin/blocks', label: 'Bloqueos', icon: Lock },
  { href: '/admin/settings', label: 'Configuración', icon: Settings },
]

export function AdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [open, setOpen] = useState(false)

  useEffect(() => {
    setOpen(false)
  }, [pathname])

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/admin/login')
    router.refresh()
  }

  return (
    <>
      {/* Mobile top bar */}
      <div
        className="flex items-center justify-between px-4 py-3 lg:hidden"
        style={{ background: '#060F1E', borderBottom: '1px solid rgba(255,255,255,0.07)' }}
      >
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-sm bg-gold/20 flex items-center justify-center">
            <Car size={14} className="text-gold" />
          </div>
          <p className="text-xs font-semibold text-white tracking-wide">Teramont Admin</p>
        </div>
        <button
          onClick={() => setOpen(true)}
          className="p-2 -mr-2 text-white/80 hover:text-white"
          aria-label="Abrir menú"
        >
          <Menu size={20} />
        </button>
      </div>

      {/* Mobile backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar (static on desktop, slide-in drawer on mobile) */}
      <aside
        className={cn(
          'w-64 lg:w-60 flex-shrink-0 flex flex-col min-h-screen fixed inset-y-0 left-0 z-50 lg:static transform transition-transform duration-200',
          open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
        style={{ background: '#060F1E', color: 'rgb(160 180 210)' }}
      >
        {/* Logo */}
        <div
          className="px-6 py-6 flex items-center justify-between"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}
        >
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-sm bg-gold/20 flex items-center justify-center">
              <Car size={16} className="text-gold" />
            </div>
            <div>
              <p className="text-xs font-semibold text-white tracking-wide">Teramont</p>
              <p className="text-[10px] uppercase tracking-wider" style={{ color: 'rgb(80 110 150)' }}>Admin</p>
            </div>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="lg:hidden p-1 text-white/70 hover:text-white"
            aria-label="Cerrar menú"
          >
            <X size={18} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon
            const active = pathname === item.href || pathname.startsWith(item.href + '/')
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors',
                  active
                    ? 'text-white'
                    : 'hover:text-white'
                )}
                style={active
                  ? { background: 'rgba(193,148,54,0.12)', color: 'white' }
                  : { color: 'rgb(120 148 185)' }
                }
              >
                <Icon size={16} className={active ? 'text-gold' : ''} />
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* Logout */}
        <div className="px-3 py-4" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm hover:text-red-400 transition-colors w-full"
            style={{ color: 'rgb(80 110 150)' }}
          >
            <LogOut size={16} />
            Cerrar sesión
          </button>
        </div>
      </aside>
    </>
  )
}

'use client'

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

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/admin/login')
    router.refresh()
  }

  return (
    <aside className="w-60 flex-shrink-0 flex flex-col min-h-screen" style={{ background: '#060F1E', color: 'rgb(160 180 210)' }}>
      {/* Logo */}
      <div className="px-6 py-6" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-sm bg-gold/20 flex items-center justify-center">
            <Car size={16} className="text-gold" />
          </div>
          <div>
            <p className="text-xs font-semibold text-white tracking-wide">Teramont</p>
            <p className="text-[10px] uppercase tracking-wider" style={{ color: 'rgb(80 110 150)' }}>Admin</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-5 space-y-1">
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
  )
}

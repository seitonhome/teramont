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
    <aside className="w-60 flex-shrink-0 bg-stone-950 text-stone-300 flex flex-col min-h-screen">
      {/* Logo */}
      <div className="px-6 py-6 border-b border-stone-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-sm bg-gold/20 flex items-center justify-center">
            <Car size={16} className="text-gold" />
          </div>
          <div>
            <p className="text-xs font-semibold text-white tracking-wide">Teramont</p>
            <p className="text-[10px] text-stone-500 uppercase tracking-wider">Admin</p>
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
                  ? 'bg-stone-800 text-white'
                  : 'text-stone-400 hover:bg-stone-800/60 hover:text-stone-200'
              )}
            >
              <Icon size={16} className={active ? 'text-gold' : ''} />
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 border-t border-stone-800">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-stone-500 hover:text-red-400 hover:bg-stone-800/60 transition-colors w-full"
        >
          <LogOut size={16} />
          Cerrar sesión
        </button>
      </div>
    </aside>
  )
}

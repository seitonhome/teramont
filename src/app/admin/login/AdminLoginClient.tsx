'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, LogIn } from 'lucide-react'

export function AdminLoginClient() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const supabase = createClient()
    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (authError) {
      setError('Credenciales incorrectas. Intenta de nuevo.')
      setLoading(false)
      return
    }

    router.push('/admin/dashboard')
    router.refresh()
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'linear-gradient(135deg, #060F1E 0%, #0A1628 100%)' }}>
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <p className="text-2xl font-light tracking-[0.2em] uppercase text-white mb-1" style={{ fontFamily: 'var(--font-display)' }}>
            Teramont
          </p>
          <p className="text-xs tracking-[0.3em] uppercase text-gold font-medium">
            Panel de administración
          </p>
        </div>

        <div className="rounded-xl p-8" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <h1 className="text-lg font-semibold text-white mb-6 text-center">Iniciar sesión</h1>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <Label className="mb-2 block text-sm" style={{ color: 'rgb(160 185 215)' }}>Email</Label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@teramontrides.com"
                required
                className="text-white focus-visible:ring-gold"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: 'white' }}
              />
            </div>
            <div>
              <Label className="mb-2 block text-sm" style={{ color: 'rgb(160 185 215)' }}>Contraseña</Label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="text-white focus-visible:ring-gold"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: 'white' }}
              />
            </div>

            {error && <p className="text-red-400 text-sm text-center">{error}</p>}

            <Button type="submit" disabled={loading} className="w-full bg-gold hover:bg-gold/90 text-white h-11 mt-2">
              {loading ? <Loader2 size={18} className="animate-spin" /> : <><LogIn size={16} />Entrar al panel</>}
            </Button>
          </form>
        </div>

        <p className="text-center text-xs mt-6" style={{ color: 'rgb(60 85 120)' }}>
          Área privada · Solo administradores
        </p>
      </div>
    </div>
  )
}

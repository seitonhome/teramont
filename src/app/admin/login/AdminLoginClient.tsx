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
    <div className="min-h-screen bg-stone-950 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-10">
          <p
            className="text-2xl font-light tracking-[0.2em] uppercase text-white mb-1"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Teramont
          </p>
          <p className="text-xs tracking-[0.3em] uppercase text-gold font-medium">
            Panel de administración
          </p>
        </div>

        <div className="bg-stone-900 rounded-xl border border-stone-800 p-8">
          <h1 className="text-lg font-semibold text-white mb-6 text-center">
            Iniciar sesión
          </h1>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <Label className="text-stone-300 mb-2 block text-sm">Email</Label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@teramontrides.com"
                required
                className="bg-stone-800 border-stone-700 text-white placeholder:text-stone-500 focus-visible:ring-gold"
              />
            </div>

            <div>
              <Label className="text-stone-300 mb-2 block text-sm">Contraseña</Label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="bg-stone-800 border-stone-700 text-white placeholder:text-stone-500 focus-visible:ring-gold"
              />
            </div>

            {error && (
              <p className="text-red-400 text-sm text-center">{error}</p>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gold hover:bg-gold/90 text-white h-11 mt-2"
            >
              {loading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <>
                  <LogIn size={16} />
                  Entrar al panel
                </>
              )}
            </Button>
          </form>
        </div>

        <p className="text-center text-stone-600 text-xs mt-6">
          Área privada · Solo administradores
        </p>
      </div>
    </div>
  )
}

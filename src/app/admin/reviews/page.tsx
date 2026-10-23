'use client'

import { useState, useEffect } from 'react'
import { AdminGuard } from '@/components/admin/AdminGuard'
import { AdminSidebar } from '@/components/admin/AdminSidebar'
import { Button } from '@/components/ui/button'
import { Loader2, Check, EyeOff, Trash2, RotateCcw, Link2, BadgeCheck, Mail } from 'lucide-react'
import { toast } from '@/hooks/use-toast'
import { formatDatetimeBogota } from '@/lib/utils'

type ReviewStatus = 'pending' | 'approved' | 'rejected'

interface AdminReview {
  id: string
  name: string
  location: string
  date: string
  rating: number
  text_es: string
  text_en: string | null
  email: string | null
  booking_code: string | null
  verified: boolean
  lang: string
  status: ReviewStatus
  created_at: string
}

const TABS: { key: ReviewStatus; label: string; empty: string }[] = [
  { key: 'pending', label: 'Pendientes', empty: 'No hay reseñas esperando aprobación.' },
  { key: 'approved', label: 'Publicadas', empty: 'Todavía no has publicado reseñas.' },
  { key: 'rejected', label: 'Ocultas', empty: 'No hay reseñas ocultas.' },
]

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<AdminReview[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<ReviewStatus>('pending')
  const [busyId, setBusyId] = useState<string | null>(null)

  // Runs once on mount; `loading` already starts true
  async function fetchReviews() {
    try {
      const res = await fetch('/api/admin/reviews')
      const data = await res.json()
      setReviews(data.reviews || [])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReviews()
  }, [])

  async function setStatus(id: string, status: ReviewStatus) {
    setBusyId(id)
    try {
      const res = await fetch(`/api/admin/reviews/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      if (res.ok) {
        const labels = { approved: 'Reseña publicada en el home', rejected: 'Reseña ocultada', pending: 'Reseña devuelta a pendientes' }
        toast({ title: labels[status] })
        setReviews((list) => list.map((r) => (r.id === id ? { ...r, status } : r)))
      } else {
        toast({ title: 'No se pudo actualizar', variant: 'destructive' })
      }
    } finally {
      setBusyId(null)
    }
  }

  async function remove(id: string) {
    if (!confirm('¿Eliminar esta reseña definitivamente?')) return
    setBusyId(id)
    try {
      const res = await fetch(`/api/admin/reviews/${id}`, { method: 'DELETE' })
      if (res.ok) {
        toast({ title: 'Reseña eliminada' })
        setReviews((list) => list.filter((r) => r.id !== id))
      } else {
        toast({ title: 'No se pudo eliminar', variant: 'destructive' })
      }
    } finally {
      setBusyId(null)
    }
  }

  async function copyLink() {
    const url = `${window.location.origin}/resena`
    try {
      await navigator.clipboard.writeText(url)
      toast({ title: 'Enlace copiado', description: url })
    } catch {
      toast({ title: url })
    }
  }

  const counts = {
    pending: reviews.filter((r) => r.status === 'pending').length,
    approved: reviews.filter((r) => r.status === 'approved').length,
    rejected: reviews.filter((r) => r.status === 'rejected').length,
  }
  const visible = reviews.filter((r) => r.status === tab)
  const current = TABS.find((t) => t.key === tab)!

  return (
    <AdminGuard>
      <div className="flex flex-col lg:flex-row min-h-screen bg-slate-100">
        <AdminSidebar />
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
            <div>
              <h1 className="text-2xl font-semibold text-foreground">Reseñas</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Nada se publica en el home hasta que lo apruebes.
              </p>
            </div>
            <Button variant="outline" onClick={copyLink} className="self-start sm:self-auto">
              <Link2 size={16} />
              Copiar enlace para pedir reseña
            </Button>
          </div>

          <div className="flex gap-2 mb-5 overflow-x-auto">
            {TABS.map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  tab === t.key ? 'bg-[#0A1628] text-white' : 'bg-white text-foreground border border-slate-200 hover:bg-slate-50'
                }`}
              >
                {t.label}
                <span className={`ml-2 inline-flex min-w-5 justify-center rounded-full px-1.5 text-xs ${
                  t.key === 'pending' && counts.pending > 0 ? 'bg-gold text-white' : tab === t.key ? 'bg-white/20' : 'bg-slate-100'
                }`}>
                  {counts[t.key]}
                </span>
              </button>
            ))}
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16 bg-white rounded-xl border border-slate-200">
              <Loader2 size={24} className="animate-spin text-muted-foreground" />
            </div>
          ) : visible.length === 0 ? (
            <div className="py-16 text-center text-sm text-muted-foreground bg-white rounded-xl border border-slate-200">
              {current.empty}
            </div>
          ) : (
            <div className="grid gap-4 xl:grid-cols-2">
              {visible.map((r) => (
                <article key={r.id} className="bg-white rounded-xl border border-slate-200 p-5 flex flex-col">
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-gold tracking-widest" aria-label={`${r.rating} de 5 estrellas`}>
                      {'★'.repeat(r.rating)}
                      <span className="text-slate-300">{'★'.repeat(5 - r.rating)}</span>
                    </p>
                    <p className="text-xs text-muted-foreground text-right">
                      {formatDatetimeBogota(r.created_at)}
                    </p>
                  </div>

                  <p className="mt-3 text-sm text-foreground/85 leading-relaxed whitespace-pre-line flex-1">
                    &ldquo;{r.text_es}&rdquo;
                  </p>

                  <div className="mt-4 pt-4 border-t border-slate-100 text-sm">
                    <p className="font-semibold text-foreground">
                      {r.name}
                      {r.location && <span className="font-normal text-muted-foreground"> · {r.location}</span>}
                    </p>
                    <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                      {r.email && (
                        <a href={`mailto:${r.email}`} className="inline-flex items-center gap-1 hover:text-foreground">
                          <Mail size={12} /> {r.email}
                        </a>
                      )}
                      {r.verified ? (
                        <span className="inline-flex items-center gap-1 text-emerald-600 font-medium">
                          <BadgeCheck size={13} /> Viaje verificado {r.booking_code && `(${r.booking_code})`}
                        </span>
                      ) : r.booking_code ? (
                        <span>Código {r.booking_code} no coincide con una reserva pagada</span>
                      ) : null}
                      {r.lang === 'en' && <span>Escrita en inglés</span>}
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {r.status !== 'approved' && (
                      <Button size="sm" disabled={busyId === r.id} onClick={() => setStatus(r.id, 'approved')} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                        <Check size={14} /> Aprobar y publicar
                      </Button>
                    )}
                    {r.status !== 'rejected' && (
                      <Button size="sm" variant="outline" disabled={busyId === r.id} onClick={() => setStatus(r.id, 'rejected')}>
                        <EyeOff size={14} /> Ocultar
                      </Button>
                    )}
                    {r.status !== 'pending' && (
                      <Button size="sm" variant="outline" disabled={busyId === r.id} onClick={() => setStatus(r.id, 'pending')}>
                        <RotateCcw size={14} /> Volver a pendiente
                      </Button>
                    )}
                    <Button size="sm" variant="ghost" disabled={busyId === r.id} onClick={() => remove(r.id)} className="text-red-600 hover:text-red-700 hover:bg-red-50 ml-auto">
                      <Trash2 size={14} /> Eliminar
                    </Button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </main>
      </div>
    </AdminGuard>
  )
}

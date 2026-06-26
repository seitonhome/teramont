'use client'

import { useState, useEffect } from 'react'
import { AdminGuard } from '@/components/admin/AdminGuard'
import { AdminSidebar } from '@/components/admin/AdminSidebar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Loader2, Plus, Trash2 } from 'lucide-react'
import { format } from 'date-fns'
import { toZonedTime, fromZonedTime } from 'date-fns-tz'
import { toast } from '@/hooks/use-toast'
import type { VehicleBlock } from '@/types'

const TIMEZONE = 'America/Bogota'

const LOCATIONS = [
  { id: '11111111-1111-1111-1111-111111111111', name: 'Cartagena' },
  { id: '22222222-2222-2222-2222-222222222222', name: 'Barranquilla' },
  { id: '33333333-3333-3333-3333-333333333333', name: 'Barú' },
]

const BLOCK_TYPE_LABELS: Record<string, string> = {
  MANUAL_UNAVAILABLE: 'No disponible',
  MAINTENANCE: 'Mantenimiento',
  REPOSITIONING: 'Reposicionamiento',
  PERSONAL_USE: 'Uso personal',
  CLEANING: 'Limpieza',
  OTHER: 'Otro',
}

type BlockWithRelations = VehicleBlock & {
  origin: { name: string } | null
  destination: { name: string } | null
}

export default function AdminBlocksPage() {
  const [blocks, setBlocks] = useState<BlockWithRelations[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const [form, setForm] = useState({
    block_type: 'MANUAL_UNAVAILABLE',
    origin_location_id: '',
    destination_location_id: '',
    starts_at_date: format(toZonedTime(new Date(), TIMEZONE), 'yyyy-MM-dd'),
    starts_at_time: '08:00',
    ends_at_date: format(toZonedTime(new Date(), TIMEZONE), 'yyyy-MM-dd'),
    ends_at_time: '18:00',
    reason: '',
    notes: '',
  })

  useEffect(() => {
    fetchBlocks()
  }, [])

  async function fetchBlocks() {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/blocks')
      if (res.ok) {
        const data = await res.json()
        setBlocks(data.blocks || [])
      }
    } finally {
      setLoading(false)
    }
  }

  async function createBlock() {
    setSubmitting(true)
    try {
      const startsAt = fromZonedTime(
        new Date(`${form.starts_at_date}T${form.starts_at_time}:00`),
        TIMEZONE
      )
      const endsAt = fromZonedTime(
        new Date(`${form.ends_at_date}T${form.ends_at_time}:00`),
        TIMEZONE
      )

      const res = await fetch('/api/admin/blocks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          block_type: form.block_type,
          origin_location_id: form.origin_location_id || null,
          destination_location_id:
            form.block_type === 'REPOSITIONING' ? form.destination_location_id || null : null,
          starts_at: startsAt.toISOString(),
          ends_at: endsAt.toISOString(),
          reason: form.reason || null,
          notes: form.notes || null,
        }),
      })

      if (res.ok) {
        toast({ title: 'Bloqueo creado', description: 'El horario ha sido bloqueado.' })
        setShowForm(false)
        fetchBlocks()
      } else {
        const data = await res.json()
        toast({ title: data.error || 'Error', variant: 'destructive' })
      }
    } finally {
      setSubmitting(false)
    }
  }

  async function deleteBlock(id: string) {
    if (!confirm('¿Eliminar este bloqueo?')) return
    const supabase = (await import('@/lib/supabase/client')).createClient()
    await supabase.from('vehicle_blocks').delete().eq('id', id)
    fetchBlocks()
  }

  const formatBlockTime = (dt: string) => {
    const d = toZonedTime(new Date(dt), TIMEZONE)
    return format(d, "d MMM yyyy 'a las' h:mm a")
  }

  return (
    <AdminGuard>
      <div className="flex min-h-screen bg-stone-100">
        <AdminSidebar />
        <main className="flex-1 p-6 lg:p-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-semibold text-stone-900">Bloqueos del vehículo</h1>
            <Button onClick={() => setShowForm(!showForm)} className="bg-gold hover:bg-gold/90 text-white">
              <Plus size={16} />
              Nuevo bloqueo
            </Button>
          </div>

          {/* Create form */}
          {showForm && (
            <div className="bg-white rounded-xl border border-stone-200 p-6 mb-6">
              <h2 className="font-semibold text-stone-900 mb-4">Crear bloqueo</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                <div>
                  <Label className="mb-2 block text-sm">Tipo</Label>
                  <Select value={form.block_type} onValueChange={(v) => setForm({ ...form, block_type: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {Object.entries(BLOCK_TYPE_LABELS).map(([k, v]) => (
                        <SelectItem key={k} value={k}>{v}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="mb-2 block text-sm">
                    {form.block_type === 'REPOSITIONING' ? 'Origen' : 'Ubicación (opcional)'}
                  </Label>
                  <Select
                    value={form.origin_location_id}
                    onValueChange={(v) => setForm({ ...form, origin_location_id: v })}
                  >
                    <SelectTrigger><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
                    <SelectContent>
                      {LOCATIONS.map((l) => (
                        <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {form.block_type === 'REPOSITIONING' && (
                  <div>
                    <Label className="mb-2 block text-sm">Destino</Label>
                    <Select
                      value={form.destination_location_id}
                      onValueChange={(v) => setForm({ ...form, destination_location_id: v })}
                    >
                      <SelectTrigger><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
                      <SelectContent>
                        {LOCATIONS.filter((l) => l.id !== form.origin_location_id).map((l) => (
                          <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div>
                  <Label className="mb-2 block text-sm">Desde — fecha</Label>
                  <Input
                    type="date"
                    value={form.starts_at_date}
                    onChange={(e) => setForm({ ...form, starts_at_date: e.target.value })}
                  />
                </div>
                <div>
                  <Label className="mb-2 block text-sm">Desde — hora</Label>
                  <Input
                    type="time"
                    value={form.starts_at_time}
                    onChange={(e) => setForm({ ...form, starts_at_time: e.target.value })}
                  />
                </div>
                <div>
                  <Label className="mb-2 block text-sm">Hasta — fecha</Label>
                  <Input
                    type="date"
                    value={form.ends_at_date}
                    onChange={(e) => setForm({ ...form, ends_at_date: e.target.value })}
                  />
                </div>
                <div>
                  <Label className="mb-2 block text-sm">Hasta — hora</Label>
                  <Input
                    type="time"
                    value={form.ends_at_time}
                    onChange={(e) => setForm({ ...form, ends_at_time: e.target.value })}
                  />
                </div>
                <div>
                  <Label className="mb-2 block text-sm">Motivo</Label>
                  <Input
                    value={form.reason}
                    onChange={(e) => setForm({ ...form, reason: e.target.value })}
                    placeholder="Ej: Mantenimiento programado"
                  />
                </div>
              </div>
              <div className="flex gap-3">
                <Button
                  onClick={createBlock}
                  disabled={submitting}
                  className="bg-gold hover:bg-gold/90 text-white"
                >
                  {submitting ? <Loader2 size={14} className="animate-spin" /> : null}
                  Crear bloqueo
                </Button>
                <Button variant="outline" onClick={() => setShowForm(false)}>Cancelar</Button>
              </div>
            </div>
          )}

          {/* List */}
          <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 size={24} className="animate-spin text-stone-400" />
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-stone-100 bg-stone-50">
                    <th className="text-left px-5 py-3 text-xs font-medium text-stone-500 uppercase tracking-wider">Tipo</th>
                    <th className="text-left px-5 py-3 text-xs font-medium text-stone-500 uppercase tracking-wider">Ruta</th>
                    <th className="text-left px-5 py-3 text-xs font-medium text-stone-500 uppercase tracking-wider">Inicio</th>
                    <th className="text-left px-5 py-3 text-xs font-medium text-stone-500 uppercase tracking-wider">Fin</th>
                    <th className="text-left px-5 py-3 text-xs font-medium text-stone-500 uppercase tracking-wider">Motivo</th>
                    <th className="px-5 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {blocks.map((b) => (
                    <tr key={b.id} className="hover:bg-stone-50">
                      <td className="px-5 py-3">
                        <Badge variant="secondary">{BLOCK_TYPE_LABELS[b.block_type] || b.block_type}</Badge>
                      </td>
                      <td className="px-5 py-3 text-stone-600">
                        {b.origin?.name || '—'}
                        {b.destination?.name ? ` → ${b.destination.name}` : ''}
                      </td>
                      <td className="px-5 py-3 text-stone-600 text-xs">{formatBlockTime(b.starts_at)}</td>
                      <td className="px-5 py-3 text-stone-600 text-xs">{formatBlockTime(b.ends_at)}</td>
                      <td className="px-5 py-3 text-stone-500 text-xs">{b.reason || '—'}</td>
                      <td className="px-5 py-3">
                        <button
                          onClick={() => deleteBlock(b.id)}
                          className="p-1.5 rounded hover:bg-red-50 text-red-400 transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {blocks.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-5 py-10 text-center text-stone-400 text-sm">
                        No hay bloqueos activos
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </main>
      </div>
    </AdminGuard>
  )
}

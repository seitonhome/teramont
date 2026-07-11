'use client'

import { useState, useEffect } from 'react'
import { AdminGuard } from '@/components/admin/AdminGuard'
import { AdminSidebar } from '@/components/admin/AdminSidebar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { formatCOP, minutesToHoursLabel } from '@/lib/utils'
import { Loader2, Edit2, Save, X } from 'lucide-react'
import type { Route, Location } from '@/types'
import { toast } from '@/hooks/use-toast'

type RouteWithLocations = Route & { origin: Location; destination: Location }

export default function AdminRoutesPage() {
  const [routes, setRoutes] = useState<RouteWithLocations[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValues, setEditValues] = useState<{
    base_price_cop: number
    estimated_duration_minutes: number
    buffer_minutes: number
  } | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchRoutes()
  }, [])

  async function fetchRoutes() {
    setLoading(true)
    try {
      const supabase = (await import('@/lib/supabase/client')).createClient()
      const { data } = await supabase
        .from('routes')
        .select(`
          *,
          origin:origin_location_id(id, name, slug),
          destination:destination_location_id(id, name, slug)
        `)
        .order('id')
      setRoutes((data as unknown as RouteWithLocations[]) || [])
    } finally {
      setLoading(false)
    }
  }

  function startEdit(route: RouteWithLocations) {
    setEditingId(route.id)
    setEditValues({
      base_price_cop: route.base_price_cop,
      estimated_duration_minutes: route.estimated_duration_minutes,
      buffer_minutes: route.buffer_minutes,
    })
  }

  async function saveEdit(routeId: string) {
    if (!editValues) return
    setSaving(true)
    try {
      const res = await fetch(`/api/admin/routes/${routeId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editValues),
      })
      if (res.ok) {
        toast({ title: 'Ruta actualizada correctamente', variant: 'default' })
        setEditingId(null)
        fetchRoutes()
      } else {
        const data = await res.json()
        toast({ title: data.error || 'Error al guardar', variant: 'destructive' })
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <AdminGuard>
      <div className="flex flex-col lg:flex-row min-h-screen bg-slate-100">
        <AdminSidebar />
        <main className="flex-1 p-6 lg:p-8">
          <h1 className="text-2xl font-semibold text-foreground mb-6">Rutas y precios</h1>

          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 size={24} className="animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50">
                      <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Ruta</th>
                      <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Duración</th>
                      <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Buffer</th>
                      <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Precio (COP)</th>
                      <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {routes.map((r) => {
                      const isEditing = editingId === r.id
                      return (
                        <tr key={r.id} className="hover:bg-slate-50">
                          <td className="px-5 py-4 font-medium text-foreground">
                            {r.origin?.name} → {r.destination?.name}
                          </td>
                          <td className="px-5 py-4">
                            {isEditing ? (
                              <Input
                                type="number"
                                value={editValues?.estimated_duration_minutes}
                                onChange={(e) =>
                                  setEditValues((v) => v ? { ...v, estimated_duration_minutes: Number(e.target.value) } : v)
                                }
                                className="w-24 h-8 text-sm"
                                min="30"
                              />
                            ) : (
                              <span className="text-muted-foreground">
                                {minutesToHoursLabel(r.estimated_duration_minutes)}
                              </span>
                            )}
                          </td>
                          <td className="px-5 py-4">
                            {isEditing ? (
                              <Input
                                type="number"
                                value={editValues?.buffer_minutes}
                                onChange={(e) =>
                                  setEditValues((v) => v ? { ...v, buffer_minutes: Number(e.target.value) } : v)
                                }
                                className="w-20 h-8 text-sm"
                                min="0"
                              />
                            ) : (
                              <span className="text-muted-foreground">{r.buffer_minutes} min</span>
                            )}
                          </td>
                          <td className="px-5 py-4">
                            {isEditing ? (
                              <Input
                                type="number"
                                value={editValues?.base_price_cop}
                                onChange={(e) =>
                                  setEditValues((v) => v ? { ...v, base_price_cop: Number(e.target.value) } : v)
                                }
                                className="w-32 h-8 text-sm"
                                min="0"
                                step="1000"
                              />
                            ) : (
                              <span className="font-semibold text-foreground">
                                {formatCOP(r.base_price_cop)}
                              </span>
                            )}
                          </td>
                          <td className="px-5 py-4">
                            {isEditing ? (
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  onClick={() => saveEdit(r.id)}
                                  disabled={saving}
                                  className="h-8 bg-emerald-600 hover:bg-emerald-700 text-white"
                                >
                                  {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                                  Guardar
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => setEditingId(null)}
                                  className="h-8"
                                >
                                  <X size={14} />
                                </Button>
                              </div>
                            ) : (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => startEdit(r)}
                                className="h-8"
                              >
                                <Edit2 size={14} />
                                Editar
                              </Button>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <p className="text-xs text-muted-foreground mt-4">
            Los cambios de precio aplican solo para nuevas reservas.
          </p>
        </main>
      </div>
    </AdminGuard>
  )
}

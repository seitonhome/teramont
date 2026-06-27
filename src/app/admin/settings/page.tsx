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
import { Loader2, Save } from 'lucide-react'
import { toast } from '@/hooks/use-toast'

type Settings = Record<string, string>

const EDITABLE_SETTINGS = [
  {
    key: 'deposit_percentage',
    label: 'Porcentaje de anticipo (%)',
    type: 'number',
    hint: 'Porcentaje que paga el cliente para reservar (0-100)',
  },
  {
    key: 'cancellation_refund_hours',
    label: 'Horas para cancelación reembolsable',
    type: 'number',
    hint: 'Cancelaciones antes de este número de horas son reembolsables',
  },
  {
    key: 'min_booking_notice_hours',
    label: 'Anticipación mínima para reservas (horas)',
    type: 'number',
    hint: 'Número mínimo de horas de anticipación para una reserva',
  },
  {
    key: 'max_booking_days_ahead',
    label: 'Máximo días en el futuro para reservar',
    type: 'number',
    hint: 'Cuántos días en el futuro puede reservar un cliente',
  },
  {
    key: 'sunday_surcharge_pct',
    label: 'Recargo dominical y festivos (%)',
    type: 'number',
    hint: 'Porcentaje adicional que se cobra en domingos y festivos colombianos (ej: 10)',
  },
  {
    key: 'whatsapp_number',
    label: 'Número de WhatsApp',
    type: 'text',
    hint: 'Número completo con código de país (ej: 573001234567)',
  },
  {
    key: 'contact_email',
    label: 'Email de contacto',
    type: 'email',
    hint: 'Email público de contacto del negocio',
  },
  {
    key: 'business_name',
    label: 'Nombre del negocio',
    type: 'text',
    hint: '',
  },
]

const SELECT_SETTINGS = [
  {
    key: 'vehicle_location_mode',
    label: 'Modo de ubicación del vehículo',
    options: [
      { value: 'persistent', label: 'A — Mantener última ubicación (recomendado)' },
      { value: 'reset_daily', label: 'B — Reiniciar en Cartagena a las 5am' },
    ],
    hint: 'Determina desde dónde puede salir el primer servicio de cada día',
  },
  {
    key: 'default_start_location',
    label: 'Ubicación de inicio (modo B)',
    options: [
      { value: 'cartagena', label: 'Cartagena' },
      { value: 'barranquilla', label: 'Barranquilla' },
      { value: 'baru', label: 'Barú' },
    ],
    hint: 'Ciudad donde comienza el vehículo en el modo reset diario',
  },
]

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Settings>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchSettings()
  }, [])

  async function fetchSettings() {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/settings')
      if (res.ok) {
        const data = await res.json()
        const map: Settings = {}
        data.settings?.forEach((s: { key: string; value: string }) => {
          map[s.key] = s.value
        })
        setSettings(map)
      }
    } finally {
      setLoading(false)
    }
  }

  async function saveSettings() {
    setSaving(true)
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      })
      if (res.ok) {
        toast({ title: 'Configuración guardada correctamente' })
      } else {
        toast({ title: 'Error al guardar', variant: 'destructive' })
      }
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <AdminGuard>
        <div className="flex min-h-screen bg-slate-100">
          <AdminSidebar />
          <main className="flex-1 flex items-center justify-center">
            <Loader2 size={28} className="animate-spin text-muted-foreground" />
          </main>
        </div>
      </AdminGuard>
    )
  }

  return (
    <AdminGuard>
      <div className="flex min-h-screen bg-slate-100">
        <AdminSidebar />
        <main className="flex-1 p-6 lg:p-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-semibold text-foreground">Configuración</h1>
            <Button
              onClick={saveSettings}
              disabled={saving}
              className="bg-gold hover:bg-gold/90 text-white"
            >
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              Guardar cambios
            </Button>
          </div>

          <div className="space-y-6 max-w-2xl">
            {/* Text/number settings */}
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h2 className="font-semibold text-foreground mb-5">Parámetros del negocio</h2>
              <div className="space-y-5">
                {EDITABLE_SETTINGS.map((s) => (
                  <div key={s.key}>
                    <Label className="mb-2 block text-sm">{s.label}</Label>
                    <Input
                      type={s.type}
                      value={settings[s.key] || ''}
                      onChange={(e) =>
                        setSettings((prev) => ({ ...prev, [s.key]: e.target.value }))
                      }
                      className="max-w-xs"
                    />
                    {s.hint && (
                      <p className="text-xs text-muted-foreground mt-1">{s.hint}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Select settings */}
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h2 className="font-semibold text-foreground mb-5">Comportamiento del vehículo</h2>
              <div className="space-y-5">
                {SELECT_SETTINGS.map((s) => (
                  <div key={s.key}>
                    <Label className="mb-2 block text-sm">{s.label}</Label>
                    <Select
                      value={settings[s.key] || ''}
                      onValueChange={(v) =>
                        setSettings((prev) => ({ ...prev, [s.key]: v }))
                      }
                    >
                      <SelectTrigger className="max-w-sm">
                        <SelectValue placeholder="Seleccionar..." />
                      </SelectTrigger>
                      <SelectContent>
                        {s.options.map((o) => (
                          <SelectItem key={o.value} value={o.value}>
                            {o.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {s.hint && (
                      <p className="text-xs text-muted-foreground mt-1">{s.hint}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end">
              <Button
                onClick={saveSettings}
                disabled={saving}
                size="lg"
                className="bg-gold hover:bg-gold/90 text-white"
              >
                {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                Guardar toda la configuración
              </Button>
            </div>
          </div>
        </main>
      </div>
    </AdminGuard>
  )
}

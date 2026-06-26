'use client'

import { useState, useEffect, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { formatCOP, minutesToHoursLabel } from '@/lib/utils'
import { format, addDays } from 'date-fns'
import { Clock, AlertCircle, Loader2, ArrowRight, Info } from 'lucide-react'
import { cn } from '@/lib/utils'

const LOCATIONS = [
  { id: '11111111-1111-1111-1111-111111111111', name: 'Cartagena' },
  { id: '22222222-2222-2222-2222-222222222222', name: 'Barranquilla' },
  { id: '33333333-3333-3333-3333-333333333333', name: 'Barú' },
]

const schema = z.object({
  origin_location_id: z.string().min(1, 'Selecciona el origen'),
  destination_location_id: z.string().min(1, 'Selecciona el destino'),
  pickup_date: z.string().min(1, 'Selecciona la fecha'),
  pickup_time: z.string().min(1, 'Selecciona la hora'),
  passengers_count: z.number().int().min(1).max(5),
  luggage_count: z.number().int().min(0).max(10),
  customer_name: z.string().min(2, 'Nombre mínimo 2 caracteres'),
  customer_email: z.string().email('Email inválido'),
  customer_phone: z.string().min(7, 'Teléfono inválido').max(20),
  pickup_address: z.string().min(5, 'Dirección de recogida requerida'),
  dropoff_address: z.string().min(5, 'Dirección de destino requerida'),
  notes: z.string().max(500).optional(),
  payment_type: z.enum(['deposit', 'full']),
})

type FormData = z.infer<typeof schema>

interface Slot {
  time: string
  datetime: string
  available: boolean
  reason?: string
}

interface RouteInfo {
  id: string
  estimated_duration_minutes: number
  buffer_minutes: number
  base_price_cop: number
}

export function BookingForm({
  initialOrigin,
  initialDestination,
}: {
  initialOrigin?: string
  initialDestination?: string
}) {
  const router = useRouter()
  const [slots, setSlots] = useState<Slot[]>([])
  const [routeInfo, setRouteInfo] = useState<RouteInfo | null>(null)
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [slotsError, setSlotsError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [depositPct, setDepositPct] = useState(50)

  const today = format(new Date(), 'yyyy-MM-dd')
  const maxDate = format(addDays(new Date(), 60), 'yyyy-MM-dd')

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      origin_location_id: LOCATIONS.find(l => l.name === initialOrigin)?.id || '',
      destination_location_id: LOCATIONS.find(l => l.name === initialDestination)?.id || '',
      passengers_count: 1,
      luggage_count: 1,
      payment_type: 'deposit',
      pickup_date: '',
      pickup_time: '',
    },
  })

  const originId = watch('origin_location_id')
  const destinationId = watch('destination_location_id')
  const pickupDate = watch('pickup_date')
  const pickupTime = watch('pickup_time')
  const paymentType = watch('payment_type')

  const fetchSlots = useCallback(async () => {
    if (!originId || !destinationId || !pickupDate) return
    if (originId === destinationId) {
      setSlotsError('El origen y destino no pueden ser iguales')
      setSlots([])
      return
    }

    setLoadingSlots(true)
    setSlotsError('')
    setSlots([])
    setValue('pickup_time', '')

    try {
      const res = await fetch('/api/bookings/check-availability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          origin_location_id: originId,
          destination_location_id: destinationId,
          date: pickupDate,
        }),
      })
      const data = await res.json()

      if (!res.ok) {
        setSlotsError(data.error || 'Error al consultar disponibilidad')
        return
      }

      setSlots(data.slots || [])
      setRouteInfo(data.route)
      setDepositPct(data.deposit_percentage || 50)
    } catch {
      setSlotsError('Error de conexión. Intenta de nuevo.')
    } finally {
      setLoadingSlots(false)
    }
  }, [originId, destinationId, pickupDate, setValue])

  useEffect(() => {
    fetchSlots()
  }, [fetchSlots])

  const totalPrice = routeInfo?.base_price_cop || 0
  const depositAmount = Math.round(totalPrice * (depositPct / 100))
  const balanceAmount = totalPrice - depositAmount
  const chargeAmount = paymentType === 'full' ? totalPrice : depositAmount

  const availableSlots = slots.filter((s) => s.available)

  const onSubmit = async (formData: FormData) => {
    if (!pickupTime) return

    const selectedSlot = slots.find((s) => s.datetime === pickupTime)
    if (!selectedSlot?.available) {
      alert('El horario seleccionado ya no está disponible. Por favor elige otro.')
      return
    }

    setSubmitting(true)
    try {
      // Step 1: Create booking
      const bookingRes = await fetch('/api/bookings/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          origin_location_id: formData.origin_location_id,
          destination_location_id: formData.destination_location_id,
          pickup_datetime: pickupTime,
          passengers_count: formData.passengers_count,
          luggage_count: formData.luggage_count,
          customer_name: formData.customer_name,
          customer_email: formData.customer_email,
          customer_phone: formData.customer_phone,
          pickup_address: formData.pickup_address,
          dropoff_address: formData.dropoff_address,
          notes: formData.notes,
          payment_type: formData.payment_type,
        }),
      })

      const bookingData = await bookingRes.json()

      if (!bookingRes.ok) {
        alert(bookingData.error || 'Error al crear la reserva')
        return
      }

      // Step 2: Create payment
      const paymentRes = await fetch('/api/payments/wompi/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          booking_id: bookingData.booking_id,
          payment_type: formData.payment_type,
        }),
      })

      const paymentData = await paymentRes.json()

      if (!paymentRes.ok) {
        alert(paymentData.error || 'Error al iniciar el pago')
        return
      }

      // Redirect to Wompi checkout
      window.location.href = paymentData.checkout_url
    } catch {
      alert('Error de conexión. Intenta de nuevo.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* Step 1: Route */}
      <div className="bg-white rounded-xl border border-border p-6 lg:p-8">
        <h2 className="font-semibold text-foreground mb-6 flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-gold/15 text-gold text-xs flex items-center justify-center font-bold">1</span>
          Elige tu ruta
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div>
            <Label className="mb-2 block text-sm">Origen</Label>
            <Select
              value={originId}
              onValueChange={(val) => {
                setValue('origin_location_id', val)
                setValue('pickup_time', '')
              }}
            >
              <SelectTrigger className={errors.origin_location_id ? 'border-red-400' : ''}>
                <SelectValue placeholder="Ciudad de salida" />
              </SelectTrigger>
              <SelectContent>
                {LOCATIONS.map((loc) => (
                  <SelectItem key={loc.id} value={loc.id}>
                    {loc.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.origin_location_id && (
              <p className="text-red-500 text-xs mt-1">{errors.origin_location_id.message}</p>
            )}
          </div>

          <div>
            <Label className="mb-2 block text-sm">Destino</Label>
            <Select
              value={destinationId}
              onValueChange={(val) => {
                setValue('destination_location_id', val)
                setValue('pickup_time', '')
              }}
            >
              <SelectTrigger className={errors.destination_location_id ? 'border-red-400' : ''}>
                <SelectValue placeholder="Ciudad de llegada" />
              </SelectTrigger>
              <SelectContent>
                {LOCATIONS.filter((l) => l.id !== originId).map((loc) => (
                  <SelectItem key={loc.id} value={loc.id}>
                    {loc.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.destination_location_id && (
              <p className="text-red-500 text-xs mt-1">{errors.destination_location_id.message}</p>
            )}
          </div>
        </div>

        {routeInfo && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground bg-secondary/50 rounded-lg px-4 py-2.5">
            <Clock size={14} className="text-gold" />
            Duración estimada: ~{minutesToHoursLabel(routeInfo.estimated_duration_minutes)} ·{' '}
            <span className="font-semibold text-foreground">{formatCOP(routeInfo.base_price_cop)}</span>{' '}
            por vehículo
          </div>
        )}
      </div>

      {/* Step 2: Date & Time */}
      <div className="bg-white rounded-xl border border-border p-6 lg:p-8">
        <h2 className="font-semibold text-foreground mb-6 flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-gold/15 text-gold text-xs flex items-center justify-center font-bold">2</span>
          Fecha y hora de recogida
        </h2>

        <div className="mb-5">
          <Label className="mb-2 block text-sm">Fecha del viaje</Label>
          <Input
            type="date"
            min={today}
            max={maxDate}
            {...register('pickup_date')}
            className={errors.pickup_date ? 'border-red-400' : ''}
          />
          {errors.pickup_date && (
            <p className="text-red-500 text-xs mt-1">{errors.pickup_date.message}</p>
          )}
        </div>

        {/* Time slots */}
        {pickupDate && originId && destinationId && (
          <div>
            <Label className="mb-3 block text-sm">Hora de recogida</Label>

            {loadingSlots && (
              <div className="flex items-center gap-2 text-muted-foreground text-sm py-4">
                <Loader2 size={16} className="animate-spin" />
                Consultando disponibilidad...
              </div>
            )}

            {slotsError && (
              <div className="flex items-start gap-2 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-3">
                <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
                {slotsError}
              </div>
            )}

            {!loadingSlots && !slotsError && slots.length > 0 && (
              <>
                {availableSlots.length === 0 ? (
                  <div className="text-sm text-muted-foreground bg-secondary/50 rounded-lg p-4 border border-border">
                    <p className="font-medium text-foreground mb-1">Sin disponibilidad</p>
                    <p>Para ese horario el vehículo no está disponible desde el origen seleccionado. Prueba otro horario o escríbenos para ayudarte.</p>
                  </div>
                ) : (
                  <>
                    {availableSlots.length <= 4 && (
                      <p className="text-xs text-amber-600 font-medium mb-2">
                        ⚡ Últimos horarios disponibles para esta fecha
                      </p>
                    )}
                    <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-2">
                      {slots.map((slot) => (
                        <button
                          key={slot.datetime}
                          type="button"
                          disabled={!slot.available}
                          onClick={() => {
                            if (slot.available) {
                              setValue('pickup_time', slot.datetime)
                            }
                          }}
                          title={!slot.available ? slot.reason : undefined}
                          className={cn(
                            'py-2.5 px-2 rounded-lg text-xs font-medium border transition-all',
                            slot.available
                              ? pickupTime === slot.datetime
                                ? 'bg-gold text-white border-gold shadow-sm shadow-gold/30'
                                : 'bg-white border-border hover:border-gold/50 hover:bg-gold/5 text-foreground cursor-pointer'
                              : 'bg-muted border-muted text-muted-foreground/50 cursor-not-allowed line-through'
                          )}
                        >
                          {slot.time}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </>
            )}

            {errors.pickup_time && (
              <p className="text-red-500 text-xs mt-2">Selecciona una hora disponible</p>
            )}
          </div>
        )}
      </div>

      {/* Step 3: Trip details */}
      <div className="bg-white rounded-xl border border-border p-6 lg:p-8">
        <h2 className="font-semibold text-foreground mb-6 flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-gold/15 text-gold text-xs flex items-center justify-center font-bold">3</span>
          Detalles del viaje
        </h2>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <Label className="mb-2 block text-sm">Pasajeros</Label>
            <Select
              defaultValue="1"
              onValueChange={(v) => setValue('passengers_count', Number(v))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[1, 2, 3, 4, 5].map((n) => (
                  <SelectItem key={n} value={String(n)}>
                    {n} {n === 1 ? 'pasajero' : 'pasajeros'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="mb-2 block text-sm">Maletas</Label>
            <Select
              defaultValue="1"
              onValueChange={(v) => setValue('luggage_count', Number(v))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[0, 1, 2, 3, 4, 5].map((n) => (
                  <SelectItem key={n} value={String(n)}>
                    {n} {n === 1 ? 'maleta' : 'maletas'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <Label className="mb-2 block text-sm">Dirección exacta de recogida</Label>
            <Input
              placeholder="Calle, barrio, referencia..."
              {...register('pickup_address')}
              className={errors.pickup_address ? 'border-red-400' : ''}
            />
            {errors.pickup_address && (
              <p className="text-red-500 text-xs mt-1">{errors.pickup_address.message}</p>
            )}
          </div>

          <div>
            <Label className="mb-2 block text-sm">Dirección exacta de destino</Label>
            <Input
              placeholder="Hotel, dirección, punto de referencia..."
              {...register('dropoff_address')}
              className={errors.dropoff_address ? 'border-red-400' : ''}
            />
            {errors.dropoff_address && (
              <p className="text-red-500 text-xs mt-1">{errors.dropoff_address.message}</p>
            )}
          </div>

          <div>
            <Label className="mb-2 block text-sm">Notas adicionales (opcional)</Label>
            <Textarea
              placeholder="Vuelo, número de habitación, instrucciones especiales..."
              {...register('notes')}
              rows={3}
            />
          </div>
        </div>
      </div>

      {/* Step 4: Contact */}
      <div className="bg-white rounded-xl border border-border p-6 lg:p-8">
        <h2 className="font-semibold text-foreground mb-6 flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-gold/15 text-gold text-xs flex items-center justify-center font-bold">4</span>
          Tus datos de contacto
        </h2>

        <div className="space-y-4">
          <div>
            <Label className="mb-2 block text-sm">Nombre completo</Label>
            <Input
              placeholder="Tu nombre"
              {...register('customer_name')}
              className={errors.customer_name ? 'border-red-400' : ''}
            />
            {errors.customer_name && (
              <p className="text-red-500 text-xs mt-1">{errors.customer_name.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label className="mb-2 block text-sm">Email</Label>
              <Input
                type="email"
                placeholder="tu@email.com"
                {...register('customer_email')}
                className={errors.customer_email ? 'border-red-400' : ''}
              />
              {errors.customer_email && (
                <p className="text-red-500 text-xs mt-1">{errors.customer_email.message}</p>
              )}
            </div>

            <div>
              <Label className="mb-2 block text-sm">WhatsApp / Teléfono</Label>
              <Input
                type="tel"
                placeholder="+57 300 0000000"
                {...register('customer_phone')}
                className={errors.customer_phone ? 'border-red-400' : ''}
              />
              {errors.customer_phone && (
                <p className="text-red-500 text-xs mt-1">{errors.customer_phone.message}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Step 5: Payment summary */}
      {routeInfo && (
        <div className="bg-white rounded-xl border border-border p-6 lg:p-8">
          <h2 className="font-semibold text-foreground mb-6 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-gold/15 text-gold text-xs flex items-center justify-center font-bold">5</span>
            Resumen y pago
          </h2>

          {/* Payment type selector */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
            <button
              type="button"
              onClick={() => setValue('payment_type', 'deposit')}
              className={cn(
                'rounded-lg border p-4 text-left transition-all',
                paymentType === 'deposit'
                  ? 'border-gold bg-gold/5 shadow-sm'
                  : 'border-border hover:border-gold/40'
              )}
            >
              <p className="font-semibold text-foreground text-sm mb-1">
                Pagar anticipo — {formatCOP(depositAmount)}
              </p>
              <p className="text-xs text-muted-foreground">
                Saldo de {formatCOP(balanceAmount)} antes del viaje
              </p>
            </button>

            <button
              type="button"
              onClick={() => setValue('payment_type', 'full')}
              className={cn(
                'rounded-lg border p-4 text-left transition-all',
                paymentType === 'full'
                  ? 'border-gold bg-gold/5 shadow-sm'
                  : 'border-border hover:border-gold/40'
              )}
            >
              <p className="font-semibold text-foreground text-sm mb-1">
                Pagar total — {formatCOP(totalPrice)}
              </p>
              <p className="text-xs text-muted-foreground">
                Sin pendientes. Tranquilidad total.
              </p>
            </button>
          </div>

          {/* Summary */}
          <div className="bg-secondary/40 rounded-lg p-4 mb-6 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tarifa del servicio</span>
              <span className="font-medium">{formatCOP(totalPrice)}</span>
            </div>
            {paymentType === 'deposit' && (
              <>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Saldo pendiente (antes del viaje)</span>
                  <span className="font-medium">{formatCOP(balanceAmount)}</span>
                </div>
              </>
            )}
            <div className="h-px bg-border" />
            <div className="flex justify-between font-semibold">
              <span>A pagar ahora</span>
              <span className="text-gold text-base">{formatCOP(chargeAmount)}</span>
            </div>
          </div>

          <div className="flex items-start gap-2 text-xs text-muted-foreground bg-secondary/30 rounded-lg p-3 mb-6">
            <Info size={14} className="flex-shrink-0 mt-0.5 text-gold" />
            <span>
              Al hacer clic en &quot;Reservar&quot; serás redirigido a Wompi para completar el pago.
              Tu reserva se confirma únicamente cuando el pago es aprobado.
            </span>
          </div>

          <Button
            type="submit"
            size="lg"
            disabled={submitting || !pickupTime}
            className="w-full bg-gold hover:bg-gold/90 text-white h-14 text-base tracking-wide disabled:opacity-50"
          >
            {submitting ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Procesando...
              </>
            ) : (
              <>
                Reservar y pagar {formatCOP(chargeAmount)}
                <ArrowRight size={18} />
              </>
            )}
          </Button>

          <p className="text-xs text-center text-muted-foreground mt-4">
            Pago seguro con Wompi · Sin cobros adicionales · Tu reserva queda confirmada al instante
          </p>
        </div>
      )}
    </form>
  )
}

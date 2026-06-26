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
import { getLocaleClient } from '@/lib/locale'
import { translations } from '@/lib/i18n'
import type { Locale } from '@/lib/i18n'

const LOCATIONS = [
  { id: '11111111-1111-1111-1111-111111111111', name: 'Cartagena' },
  { id: '22222222-2222-2222-2222-222222222222', name: 'Barranquilla' },
  { id: '33333333-3333-3333-3333-333333333333', name: 'Barú' },
]

const schema = z.object({
  origin_location_id: z.string().min(1),
  destination_location_id: z.string().min(1),
  pickup_date: z.string().min(1),
  pickup_time: z.string().min(1),
  passengers_count: z.number().int().min(1).max(5),
  luggage_count: z.number().int().min(0).max(10),
  customer_name: z.string().min(2),
  customer_email: z.string().email(),
  customer_phone: z.string().min(7).max(20),
  pickup_address: z.string().min(5),
  dropoff_address: z.string().min(5),
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
  const [locale, setLocale] = useState<Locale>('es')
  const [slots, setSlots] = useState<Slot[]>([])
  const [routeInfo, setRouteInfo] = useState<RouteInfo | null>(null)
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [slotsError, setSlotsError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [depositPct, setDepositPct] = useState(50)

  useEffect(() => {
    setLocale(getLocaleClient())
  }, [])

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

  const bk = translations[locale].booking

  const fetchSlots = useCallback(async () => {
    if (!originId || !destinationId || !pickupDate) return
    if (originId === destinationId) {
      setSlotsError(bk.sameOriginDest)
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
        setSlotsError(data.error || bk.connectionError)
        return
      }

      setSlots(data.slots || [])
      setRouteInfo(data.route)
      setDepositPct(data.deposit_percentage || 50)
    } catch {
      setSlotsError(bk.connectionError)
    } finally {
      setLoadingSlots(false)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
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
      alert(bk.slotUnavail)
      return
    }

    setSubmitting(true)
    try {
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
        alert(bookingData.error || bk.connectionError)
        return
      }

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
        alert(paymentData.error || bk.connectionError)
        return
      }

      window.location.href = paymentData.checkout_url
    } catch {
      alert(bk.connectionError)
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
          {bk.stepTitles[0]}
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div>
            <Label className="mb-2 block text-sm">{bk.origin}</Label>
            <Select
              value={originId}
              onValueChange={(val) => {
                setValue('origin_location_id', val)
                setValue('pickup_time', '')
              }}
            >
              <SelectTrigger className={errors.origin_location_id ? 'border-red-400' : ''}>
                <SelectValue placeholder={bk.originPlaceholder} />
              </SelectTrigger>
              <SelectContent>
                {LOCATIONS.map((loc) => (
                  <SelectItem key={loc.id} value={loc.id}>{loc.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.origin_location_id && (
              <p className="text-red-500 text-xs mt-1">{bk.selectOrigin}</p>
            )}
          </div>

          <div>
            <Label className="mb-2 block text-sm">{bk.destination}</Label>
            <Select
              value={destinationId}
              onValueChange={(val) => {
                setValue('destination_location_id', val)
                setValue('pickup_time', '')
              }}
            >
              <SelectTrigger className={errors.destination_location_id ? 'border-red-400' : ''}>
                <SelectValue placeholder={bk.destPlaceholder} />
              </SelectTrigger>
              <SelectContent>
                {LOCATIONS.filter((l) => l.id !== originId).map((loc) => (
                  <SelectItem key={loc.id} value={loc.id}>{loc.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.destination_location_id && (
              <p className="text-red-500 text-xs mt-1">{bk.selectDest}</p>
            )}
          </div>
        </div>

        {routeInfo && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground bg-secondary/50 rounded-lg px-4 py-2.5">
            <Clock size={14} className="text-gold" />
            {bk.estimatedDuration}: ~{minutesToHoursLabel(routeInfo.estimated_duration_minutes)} ·{' '}
            <span className="font-semibold text-foreground">{formatCOP(routeInfo.base_price_cop)}</span>{' '}
            {bk.perVehicleLabel}
          </div>
        )}
      </div>

      {/* Step 2: Date & Time */}
      <div className="bg-white rounded-xl border border-border p-6 lg:p-8">
        <h2 className="font-semibold text-foreground mb-6 flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-gold/15 text-gold text-xs flex items-center justify-center font-bold">2</span>
          {bk.stepTitles[1]}
        </h2>

        <div className="mb-5">
          <Label className="mb-2 block text-sm">{bk.date}</Label>
          <Input
            type="date"
            min={today}
            max={maxDate}
            {...register('pickup_date')}
            className={errors.pickup_date ? 'border-red-400' : ''}
          />
        </div>

        {pickupDate && originId && destinationId && (
          <div>
            <Label className="mb-3 block text-sm">{bk.time}</Label>

            {loadingSlots && (
              <div className="flex items-center gap-2 text-muted-foreground text-sm py-4">
                <Loader2 size={16} className="animate-spin" />
                {bk.consultingAvail}
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
                    <p className="font-medium text-foreground mb-1">{bk.noAvailability}</p>
                    <p>{bk.noAvailabilityText}</p>
                  </div>
                ) : (
                  <>
                    {availableSlots.length <= 4 && (
                      <p className="text-xs text-amber-600 font-medium mb-2">{bk.lastSlots}</p>
                    )}
                    <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-2">
                      {slots.map((slot) => (
                        <button
                          key={slot.datetime}
                          type="button"
                          disabled={!slot.available}
                          onClick={() => { if (slot.available) setValue('pickup_time', slot.datetime) }}
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
              <p className="text-red-500 text-xs mt-2">{bk.selectTimeError}</p>
            )}
          </div>
        )}
      </div>

      {/* Step 3: Trip details */}
      <div className="bg-white rounded-xl border border-border p-6 lg:p-8">
        <h2 className="font-semibold text-foreground mb-6 flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-gold/15 text-gold text-xs flex items-center justify-center font-bold">3</span>
          {bk.stepTitles[2]}
        </h2>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <Label className="mb-2 block text-sm">{bk.passengers}</Label>
            <Select defaultValue="1" onValueChange={(v) => setValue('passengers_count', Number(v))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {[1, 2, 3, 4, 5].map((n) => (
                  <SelectItem key={n} value={String(n)}>
                    {n} {n === 1 ? bk.passenger : bk.passengersPlural}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="mb-2 block text-sm">{bk.luggage}</Label>
            <Select defaultValue="1" onValueChange={(v) => setValue('luggage_count', Number(v))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {[0, 1, 2, 3, 4, 5].map((n) => (
                  <SelectItem key={n} value={String(n)}>
                    {n} {n === 1 ? bk.bag : bk.bagsPlural}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <Label className="mb-2 block text-sm">{bk.exactPickup}</Label>
            <Input
              placeholder={bk.pickupPlaceholder2}
              {...register('pickup_address')}
              className={errors.pickup_address ? 'border-red-400' : ''}
            />
            {errors.pickup_address && (
              <p className="text-red-500 text-xs mt-1">{bk.pickupAddress}</p>
            )}
          </div>

          <div>
            <Label className="mb-2 block text-sm">{bk.exactDropoff}</Label>
            <Input
              placeholder={bk.dropoffPlaceholder}
              {...register('dropoff_address')}
              className={errors.dropoff_address ? 'border-red-400' : ''}
            />
            {errors.dropoff_address && (
              <p className="text-red-500 text-xs mt-1">{bk.dropoffAddress}</p>
            )}
          </div>

          <div>
            <Label className="mb-2 block text-sm">{bk.notes}</Label>
            <Textarea placeholder={bk.notesPlaceholder2} {...register('notes')} rows={3} />
          </div>
        </div>
      </div>

      {/* Step 4: Contact */}
      <div className="bg-white rounded-xl border border-border p-6 lg:p-8">
        <h2 className="font-semibold text-foreground mb-6 flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-gold/15 text-gold text-xs flex items-center justify-center font-bold">4</span>
          {bk.stepTitles[3]}
        </h2>

        <div className="space-y-4">
          <div>
            <Label className="mb-2 block text-sm">{bk.name}</Label>
            <Input
              placeholder={bk.name}
              {...register('customer_name')}
              className={errors.customer_name ? 'border-red-400' : ''}
            />
            {errors.customer_name && (
              <p className="text-red-500 text-xs mt-1">{errors.customer_name.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label className="mb-2 block text-sm">{bk.email}</Label>
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
              <Label className="mb-2 block text-sm">{bk.phone}</Label>
              <Input
                type="tel"
                placeholder={bk.phonePlaceholder}
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
            {bk.stepTitles[4]}
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
            <button
              type="button"
              onClick={() => setValue('payment_type', 'deposit')}
              className={cn(
                'rounded-lg border p-4 text-left transition-all',
                paymentType === 'deposit' ? 'border-gold bg-gold/5 shadow-sm' : 'border-border hover:border-gold/40'
              )}
            >
              <p className="font-semibold text-foreground text-sm mb-1">
                {bk.payDepositLabel} — {formatCOP(depositAmount)}
              </p>
              <p className="text-xs text-muted-foreground">
                {bk.pendingBalance.replace('Saldo pendiente (antes del viaje)', '')} {formatCOP(balanceAmount)}
              </p>
            </button>

            <button
              type="button"
              onClick={() => setValue('payment_type', 'full')}
              className={cn(
                'rounded-lg border p-4 text-left transition-all',
                paymentType === 'full' ? 'border-gold bg-gold/5 shadow-sm' : 'border-border hover:border-gold/40'
              )}
            >
              <p className="font-semibold text-foreground text-sm mb-1">
                {bk.payFull} — {formatCOP(totalPrice)}
              </p>
              <p className="text-xs text-muted-foreground">{bk.noBalance}</p>
            </button>
          </div>

          <div className="bg-secondary/40 rounded-lg p-4 mb-6 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">{bk.serviceFee}</span>
              <span className="font-medium">{formatCOP(totalPrice)}</span>
            </div>
            {paymentType === 'deposit' && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">{bk.pendingBalance}</span>
                <span className="font-medium">{formatCOP(balanceAmount)}</span>
              </div>
            )}
            <div className="h-px bg-border" />
            <div className="flex justify-between font-semibold">
              <span>{bk.toPayNow}</span>
              <span className="text-gold text-base">{formatCOP(chargeAmount)}</span>
            </div>
          </div>

          <div className="flex items-start gap-2 text-xs text-muted-foreground bg-secondary/30 rounded-lg p-3 mb-6">
            <Info size={14} className="flex-shrink-0 mt-0.5 text-gold" />
            <span>{bk.wompiRedirect}</span>
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
                {bk.loading}
              </>
            ) : (
              <>
                {bk.bookAndPay} {formatCOP(chargeAmount)}
                <ArrowRight size={18} />
              </>
            )}
          </Button>

          <p className="text-xs text-center text-muted-foreground mt-4">
            {bk.footerNote}
          </p>
        </div>
      )}
    </form>
  )
}

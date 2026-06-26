import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, formatInTimeZone } from 'date-fns-tz'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const TIMEZONE = 'America/Bogota'

export function formatCOP(amount: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatDatetimeBogota(datetime: string | Date): string {
  const date = typeof datetime === 'string' ? new Date(datetime) : datetime
  return formatInTimeZone(date, TIMEZONE, "d 'de' MMMM 'de' yyyy 'a las' h:mm a")
}

export function formatTimeBogota(datetime: string | Date): string {
  const date = typeof datetime === 'string' ? new Date(datetime) : datetime
  return formatInTimeZone(date, TIMEZONE, 'h:mm a')
}

export function generateBookingCode(): string {
  const prefix = 'TPR'
  const timestamp = Date.now().toString(36).toUpperCase()
  const random = Math.random().toString(36).substring(2, 5).toUpperCase()
  return `${prefix}-${timestamp}-${random}`
}

export function buildWhatsAppLink(phone: string, bookingCode: string): string {
  const message = encodeURIComponent(
    `Hola, quiero confirmar mi reserva ${bookingCode} en Teramont Private Rides.`
  )
  const cleanPhone = phone.replace(/\D/g, '')
  return `https://wa.me/${cleanPhone}?text=${message}`
}

export function minutesToHoursLabel(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (h === 0) return `${m} min`
  if (m === 0) return `${h}h`
  return `${h}h ${m}min`
}

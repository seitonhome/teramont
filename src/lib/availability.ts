import { addMinutes, startOfDay, isAfter, isBefore, isEqual, parseISO } from 'date-fns'
import { toZonedTime, fromZonedTime } from 'date-fns-tz'
import type { Booking, VehicleBlock, Route, Location, VehicleState } from '@/types'

const TIMEZONE = 'America/Bogota'
const SLOT_INTERVAL_MINUTES = 30
const DAY_START_HOUR = 6
const DAY_END_HOUR = 20
const RESET_HOUR = 5

/**
 * Most recent occurrence of RESET_HOUR (Bogota time) at or before `moment`.
 * In reset_daily mode, bookings/blocks that ended before this point are
 * ignored — the vehicle is assumed to already be back at its base location.
 */
function getMostRecentReset(moment: Date): Date {
  const zoned = toZonedTime(moment, TIMEZONE)
  const resetToday = fromZonedTime(
    new Date(zoned.getFullYear(), zoned.getMonth(), zoned.getDate(), RESET_HOUR, 0, 0),
    TIMEZONE
  )
  if (isBefore(moment, resetToday)) {
    return fromZonedTime(
      new Date(zoned.getFullYear(), zoned.getMonth(), zoned.getDate() - 1, RESET_HOUR, 0, 0),
      TIMEZONE
    )
  }
  return resetToday
}

/**
 * Resolve which location_id a mode's "default" fallback should point to.
 * In reset_daily mode this is the configured default_start_location slug;
 * otherwise it's the vehicle's static default_location_id.
 */
export function resolveDefaultLocationId(
  locationMode: string,
  defaultStartLocationSlug: string | undefined,
  locations: Location[],
  vehicleDefaultLocationId: string
): string {
  if (locationMode === 'reset_daily' && defaultStartLocationSlug) {
    const match = locations.find((l) => l.slug === defaultStartLocationSlug)
    if (match) return match.id
  }
  return vehicleDefaultLocationId
}

export interface TimeSlot {
  time: string
  datetime: string
  available: boolean
  reason?: string
}

export interface AvailabilityContext {
  vehicle_id: string
  date: string
  origin_location_id: string
  destination_location_id: string
  route: Route
  confirmed_bookings: Booking[]
  vehicle_blocks: VehicleBlock[]
  locations: Location[]
  settings: Record<string, string>
}

function getZonedNow(): Date {
  return toZonedTime(new Date(), TIMEZONE)
}

function toUTC(zonedDate: Date): Date {
  return fromZonedTime(zonedDate, TIMEZONE)
}

/**
 * Calculate the vehicle's location and state at a specific moment.
 * Returns the location_id and whether it's available.
 */
export function getVehicleStateAt(
  moment: Date,
  confirmedBookings: Booking[],
  vehicleBlocks: VehicleBlock[],
  defaultLocationId: string,
  locationMode: string
): VehicleState {
  const now = new Date(moment)

  // Sort bookings by pickup datetime
  const sortedBookings = [...confirmedBookings]
    .filter(b =>
      b.status === 'CONFIRMED' ||
      b.status === 'PAID_FULL' ||
      b.status === 'PENDING_PAYMENT'
    )
    .sort((a, b) =>
      new Date(a.pickup_datetime).getTime() - new Date(b.pickup_datetime).getTime()
    )

  // Check if currently in a block
  for (const block of vehicleBlocks) {
    const blockStart = new Date(block.starts_at)
    const blockEnd = new Date(block.ends_at)
    if (isAfter(now, blockStart) || isEqual(now, blockStart)) {
      if (isBefore(now, blockEnd)) {
        return {
          location_id: block.origin_location_id || defaultLocationId,
          location_name: '',
          status: block.block_type === 'REPOSITIONING' ? 'repositioning' : 'blocked',
        }
      }
    }
  }

  // Check if currently in a booking or buffer
  for (const booking of sortedBookings) {
    const pickupTime = new Date(booking.pickup_datetime)
    const releaseTime = new Date(booking.vehicle_release_datetime)

    if (
      (isAfter(now, pickupTime) || isEqual(now, pickupTime)) &&
      isBefore(now, releaseTime)
    ) {
      const arrivalTime = new Date(booking.estimated_arrival_datetime)
      if (isBefore(now, arrivalTime)) {
        return {
          location_id: booking.origin_location_id,
          location_name: '',
          status: 'in_service',
          current_booking_id: booking.id,
        }
      } else {
        return {
          location_id: booking.destination_location_id,
          location_name: '',
          status: 'buffer',
          current_booking_id: booking.id,
          available_from: booking.vehicle_release_datetime,
        }
      }
    }
  }

  // Find last completed event before now
  let lastLocationId = defaultLocationId

  // In reset_daily mode, events that ended before the last reset point
  // don't count — the vehicle is assumed to already be back at base.
  const resetPoint = locationMode === 'reset_daily' ? getMostRecentReset(now) : null

  // Check bookings that ended before now
  let pastBookings = sortedBookings.filter(b =>
    isBefore(new Date(b.vehicle_release_datetime), now) ||
    isEqual(new Date(b.vehicle_release_datetime), now)
  )
  if (resetPoint) {
    pastBookings = pastBookings.filter(b => !isBefore(new Date(b.vehicle_release_datetime), resetPoint))
  }

  if (pastBookings.length > 0) {
    const lastBooking = pastBookings[pastBookings.length - 1]
    lastLocationId = lastBooking.destination_location_id
  }

  // Check blocks that ended before now
  let pastBlocks = vehicleBlocks.filter(b =>
    isBefore(new Date(b.ends_at), now) || isEqual(new Date(b.ends_at), now)
  )
  if (resetPoint) {
    pastBlocks = pastBlocks.filter(b => !isBefore(new Date(b.ends_at), resetPoint))
  }
  if (pastBlocks.length > 0) {
    const lastBlock = pastBlocks.sort((a, b) =>
      new Date(b.ends_at).getTime() - new Date(a.ends_at).getTime()
    )[0]
    // If the block ended after the last booking, use block destination
    if (
      pastBookings.length === 0 ||
      isAfter(
        new Date(lastBlock.ends_at),
        new Date(pastBookings[pastBookings.length - 1].vehicle_release_datetime)
      )
    ) {
      lastLocationId = lastBlock.destination_location_id || lastLocationId
    }
  }

  return {
    location_id: lastLocationId,
    location_name: '',
    status: 'available',
  }
}

/**
 * Check if a specific pickup slot is valid given vehicle state
 */
export function isSlotAvailable(
  pickupDatetime: Date,
  route: Route,
  confirmedBookings: Booking[],
  vehicleBlocks: VehicleBlock[],
  defaultLocationId: string,
  locationMode: string,
  minNoticeHours: number
): { available: boolean; reason?: string } {
  const now = getZonedNow()
  const nowUtc = toUTC(now)

  // Can't book in the past
  if (isBefore(pickupDatetime, nowUtc)) {
    return { available: false, reason: 'Fecha en el pasado' }
  }

  // Min notice check
  const minNoticeMs = minNoticeHours * 60 * 60 * 1000
  if (pickupDatetime.getTime() - nowUtc.getTime() < minNoticeMs) {
    return { available: false, reason: `Se requieren al menos ${minNoticeHours} horas de anticipación` }
  }

  // Get vehicle state at pickup time
  const vehicleState = getVehicleStateAt(
    pickupDatetime,
    confirmedBookings,
    vehicleBlocks,
    defaultLocationId,
    locationMode
  )

  if (vehicleState.status === 'in_service' || vehicleState.status === 'buffer') {
    return { available: false, reason: 'Vehículo en servicio' }
  }

  if (vehicleState.status === 'blocked') {
    return { available: false, reason: 'Vehículo bloqueado' }
  }

  if (vehicleState.status === 'repositioning') {
    return { available: false, reason: 'Vehículo en reposicionamiento' }
  }

  // Check vehicle location matches origin
  if (vehicleState.location_id !== route.origin_location_id) {
    return {
      available: false,
      reason: 'El vehículo no se encuentra en el origen seleccionado en ese momento'
    }
  }

  // Calculate end of this potential booking
  const estimatedArrival = addMinutes(pickupDatetime, route.estimated_duration_minutes)
  const vehicleRelease = addMinutes(estimatedArrival, route.buffer_minutes)

  // Check if the booking would overlap with any confirmed booking
  const activeBookings = confirmedBookings.filter(b =>
    b.status === 'CONFIRMED' ||
    b.status === 'PAID_FULL' ||
    b.status === 'PENDING_PAYMENT'
  )

  for (const booking of activeBookings) {
    const existingPickup = new Date(booking.pickup_datetime)
    const existingRelease = new Date(booking.vehicle_release_datetime)

    // Check for overlap: new booking starts before existing ends AND new booking ends after existing starts
    const newStart = pickupDatetime
    const newEnd = vehicleRelease

    if (
      isBefore(newStart, existingRelease) &&
      isAfter(newEnd, existingPickup)
    ) {
      return { available: false, reason: 'Conflicto con otra reserva' }
    }
  }

  // Check if the booking would overlap with any block
  for (const block of vehicleBlocks) {
    const blockStart = new Date(block.starts_at)
    const blockEnd = new Date(block.ends_at)

    if (
      isBefore(pickupDatetime, blockEnd) &&
      isAfter(vehicleRelease, blockStart)
    ) {
      return { available: false, reason: 'Bloqueo administrativo en ese horario' }
    }
  }

  return { available: true }
}

/**
 * Generate available time slots for a given date and route
 */
export function generateTimeSlots(
  dateStr: string,
  route: Route,
  confirmedBookings: Booking[],
  vehicleBlocks: VehicleBlock[],
  defaultLocationId: string,
  locationMode: string,
  minNoticeHours: number
): TimeSlot[] {
  const slots: TimeSlot[] = []

  // Create start and end of day in Bogota time
  const [year, month, day] = dateStr.split('-').map(Number)
  const dayStart = fromZonedTime(
    new Date(year, month - 1, day, DAY_START_HOUR, 0, 0),
    TIMEZONE
  )
  const dayEnd = fromZonedTime(
    new Date(year, month - 1, day, DAY_END_HOUR, 0, 0),
    TIMEZONE
  )

  let current = dayStart

  while (isBefore(current, dayEnd)) {
    const { available, reason } = isSlotAvailable(
      current,
      route,
      confirmedBookings,
      vehicleBlocks,
      defaultLocationId,
      locationMode,
      minNoticeHours
    )

    // Format time in Bogota timezone
    const zonedCurrent = toZonedTime(current, TIMEZONE)
    const hours = zonedCurrent.getHours()
    const minutes = zonedCurrent.getMinutes()
    const ampm = hours >= 12 ? 'p.m.' : 'a.m.'
    const displayHour = hours % 12 || 12
    const displayMinutes = minutes.toString().padStart(2, '0')
    const timeLabel = `${displayHour}:${displayMinutes} ${ampm}`

    slots.push({
      time: timeLabel,
      datetime: current.toISOString(),
      available,
      reason: available ? undefined : reason,
    })

    current = addMinutes(current, SLOT_INTERVAL_MINUTES)
  }

  return slots
}

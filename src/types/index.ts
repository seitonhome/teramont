export type LocationSlug = 'cartagena' | 'barranquilla' | 'baru' | 'santa-marta'

export type BookingStatus =
  | 'DRAFT'
  | 'PENDING_PAYMENT'
  | 'CONFIRMED'
  | 'PAID_FULL'
  | 'CANCELLED_BY_CLIENT'
  | 'CANCELLED_BY_ADMIN'
  | 'COMPLETED'
  | 'NO_SHOW'
  | 'PAYMENT_FAILED'
  | 'EXPIRED'

export type PaymentStatus =
  | 'PENDING'
  | 'APPROVED'
  | 'DECLINED'
  | 'VOIDED'
  | 'ERROR'
  | 'REFUNDED'
  | 'PARTIALLY_REFUNDED'

export type BlockType =
  | 'MANUAL_UNAVAILABLE'
  | 'MAINTENANCE'
  | 'REPOSITIONING'
  | 'PERSONAL_USE'
  | 'CLEANING'
  | 'OTHER'

export type VehicleLocationMode = 'persistent' | 'reset_daily'

export interface Location {
  id: string
  name: string
  slug: LocationSlug
  active: boolean
}

export interface Route {
  id: string
  origin_location_id: string
  destination_location_id: string
  estimated_duration_minutes: number
  buffer_minutes: number
  base_price_cop: number
  active: boolean
  origin?: Location
  destination?: Location
}

export interface Vehicle {
  id: string
  name: string
  plate_optional: string | null
  model: string
  capacity_passengers: number
  capacity_luggage: number
  default_location_id: string
  active: boolean
  default_location?: Location
}

export interface Booking {
  id: string
  booking_code: string
  customer_name: string
  customer_email: string
  customer_phone: string
  origin_location_id: string
  destination_location_id: string
  pickup_address: string
  dropoff_address: string
  pickup_datetime: string
  estimated_arrival_datetime: string
  vehicle_release_datetime: string
  passengers_count: number
  luggage_count: number
  notes: string | null
  route_id: string
  vehicle_id: string
  total_price_cop: number
  deposit_amount_cop: number
  balance_amount_cop: number
  status: BookingStatus
  payment_status: PaymentStatus
  created_at: string
  updated_at: string
  cancelled_at: string | null
  cancellation_reason: string | null
  origin?: Location
  destination?: Location
  route?: Route
  payments?: Payment[]
}

export interface Payment {
  id: string
  booking_id: string
  provider: string
  provider_transaction_id: string | null
  provider_reference: string | null
  amount_cop: number
  currency: string
  payment_type: 'deposit' | 'balance' | 'full'
  status: PaymentStatus
  checkout_url: string | null
  raw_response: Record<string, unknown> | null
  created_at: string
  updated_at: string
}

export interface VehicleBlock {
  id: string
  vehicle_id: string
  block_type: BlockType
  origin_location_id: string | null
  destination_location_id: string | null
  starts_at: string
  ends_at: string
  reason: string | null
  notes: string | null
  created_by: string | null
  created_at: string
  origin?: Location
  destination?: Location
}

export interface Setting {
  id: string
  key: string
  value: string
}

export interface Settings {
  deposit_percentage: number
  cancellation_refund_hours: number
  timezone: string
  vehicle_location_mode: VehicleLocationMode
  default_start_location: string
  min_booking_notice_hours: number
  max_booking_days_ahead: number
  allow_full_payment: boolean
  allow_deposit_payment: boolean
}

export interface AvailabilitySlot {
  time: string
  datetime: string
  available: boolean
  reason?: string
}

export interface BookingFormData {
  origin_location_id: string
  destination_location_id: string
  pickup_date: string
  pickup_time: string
  passengers_count: number
  luggage_count: number
  customer_name: string
  customer_email: string
  customer_phone: string
  pickup_address: string
  dropoff_address: string
  notes: string
}

export interface VehicleState {
  location_id: string
  location_name: string
  status:
    | 'available'
    | 'in_service'
    | 'buffer'
    | 'blocked'
    | 'repositioning'
  current_booking_id?: string
  available_from?: string
}

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Locations table
CREATE TABLE locations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(50) NOT NULL UNIQUE,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Routes table
CREATE TABLE routes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  origin_location_id UUID NOT NULL REFERENCES locations(id),
  destination_location_id UUID NOT NULL REFERENCES locations(id),
  estimated_duration_minutes INTEGER NOT NULL,
  buffer_minutes INTEGER NOT NULL DEFAULT 45,
  base_price_cop NUMERIC(12, 2) NOT NULL,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT routes_different_locations CHECK (origin_location_id != destination_location_id)
);

-- Vehicle table
CREATE TABLE vehicle (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  plate_optional VARCHAR(20),
  model VARCHAR(100) NOT NULL,
  capacity_passengers INTEGER NOT NULL DEFAULT 5,
  capacity_luggage INTEGER NOT NULL DEFAULT 5,
  default_location_id UUID NOT NULL REFERENCES locations(id),
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Bookings table
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_code VARCHAR(20) NOT NULL UNIQUE,
  customer_name VARCHAR(200) NOT NULL,
  customer_email VARCHAR(200) NOT NULL,
  customer_phone VARCHAR(50) NOT NULL,
  origin_location_id UUID NOT NULL REFERENCES locations(id),
  destination_location_id UUID NOT NULL REFERENCES locations(id),
  pickup_address TEXT NOT NULL,
  dropoff_address TEXT NOT NULL,
  pickup_datetime TIMESTAMPTZ NOT NULL,
  estimated_arrival_datetime TIMESTAMPTZ NOT NULL,
  vehicle_release_datetime TIMESTAMPTZ NOT NULL,
  passengers_count INTEGER NOT NULL DEFAULT 1,
  luggage_count INTEGER NOT NULL DEFAULT 1,
  notes TEXT,
  route_id UUID NOT NULL REFERENCES routes(id),
  vehicle_id UUID NOT NULL REFERENCES vehicle(id),
  total_price_cop NUMERIC(12, 2) NOT NULL,
  deposit_amount_cop NUMERIC(12, 2) NOT NULL,
  balance_amount_cop NUMERIC(12, 2) NOT NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'DRAFT',
  payment_status VARCHAR(30) NOT NULL DEFAULT 'PENDING',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  cancelled_at TIMESTAMPTZ,
  cancellation_reason TEXT,
  CONSTRAINT bookings_valid_status CHECK (status IN (
    'DRAFT', 'PENDING_PAYMENT', 'CONFIRMED', 'PAID_FULL',
    'CANCELLED_BY_CLIENT', 'CANCELLED_BY_ADMIN', 'COMPLETED',
    'NO_SHOW', 'PAYMENT_FAILED', 'EXPIRED'
  )),
  CONSTRAINT bookings_valid_payment_status CHECK (payment_status IN (
    'PENDING', 'APPROVED', 'DECLINED', 'VOIDED',
    'ERROR', 'REFUNDED', 'PARTIALLY_REFUNDED'
  ))
);

-- Payments table
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID NOT NULL REFERENCES bookings(id),
  provider VARCHAR(50) NOT NULL DEFAULT 'wompi',
  provider_transaction_id VARCHAR(200),
  provider_reference VARCHAR(200),
  amount_cop NUMERIC(12, 2) NOT NULL,
  currency VARCHAR(10) NOT NULL DEFAULT 'COP',
  payment_type VARCHAR(20) NOT NULL DEFAULT 'deposit',
  status VARCHAR(30) NOT NULL DEFAULT 'PENDING',
  checkout_url TEXT,
  raw_response JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT payments_valid_type CHECK (payment_type IN ('deposit', 'balance', 'full')),
  CONSTRAINT payments_valid_status CHECK (status IN (
    'PENDING', 'APPROVED', 'DECLINED', 'VOIDED',
    'ERROR', 'REFUNDED', 'PARTIALLY_REFUNDED'
  ))
);

-- Vehicle blocks table
CREATE TABLE vehicle_blocks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vehicle_id UUID NOT NULL REFERENCES vehicle(id),
  block_type VARCHAR(30) NOT NULL DEFAULT 'MANUAL_UNAVAILABLE',
  origin_location_id UUID REFERENCES locations(id),
  destination_location_id UUID REFERENCES locations(id),
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ NOT NULL,
  reason VARCHAR(200),
  notes TEXT,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT blocks_valid_type CHECK (block_type IN (
    'MANUAL_UNAVAILABLE', 'MAINTENANCE', 'REPOSITIONING',
    'PERSONAL_USE', 'CLEANING', 'OTHER'
  )),
  CONSTRAINT blocks_valid_times CHECK (ends_at > starts_at)
);

-- Settings table
CREATE TABLE settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key VARCHAR(100) NOT NULL UNIQUE,
  value TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_bookings_pickup_datetime ON bookings(pickup_datetime);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_vehicle_id ON bookings(vehicle_id);
CREATE INDEX idx_bookings_vehicle_datetime ON bookings(vehicle_id, pickup_datetime);
CREATE INDEX idx_payments_booking_id ON payments(booking_id);
CREATE INDEX idx_vehicle_blocks_vehicle_id ON vehicle_blocks(vehicle_id);
CREATE INDEX idx_vehicle_blocks_dates ON vehicle_blocks(vehicle_id, starts_at, ends_at);

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_routes_updated_at BEFORE UPDATE ON routes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON bookings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_settings_updated_at BEFORE UPDATE ON settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS Policies (Row Level Security)
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicle ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicle_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Public read access for locations, routes, vehicle (needed for booking form)
CREATE POLICY "Public read locations" ON locations FOR SELECT USING (true);
CREATE POLICY "Public read routes" ON routes FOR SELECT USING (true);
CREATE POLICY "Public read vehicle" ON vehicle FOR SELECT USING (true);
CREATE POLICY "Public read settings" ON settings FOR SELECT USING (true);

-- Service role has full access (used by API routes)
CREATE POLICY "Service full access locations" ON locations FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service full access routes" ON routes FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service full access vehicle" ON vehicle FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service full access bookings" ON bookings FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service full access payments" ON payments FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service full access blocks" ON vehicle_blocks FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service full access settings" ON settings FOR ALL USING (auth.role() = 'service_role');

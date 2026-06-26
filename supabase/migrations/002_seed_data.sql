-- Seed locations
INSERT INTO locations (id, name, slug, active) VALUES
  ('11111111-1111-1111-1111-111111111111', 'Cartagena', 'cartagena', true),
  ('22222222-2222-2222-2222-222222222222', 'Barranquilla', 'barranquilla', true),
  ('33333333-3333-3333-3333-333333333333', 'Barú', 'baru', true);

-- Seed routes (all durations in minutes, buffer 45 min, price 450000 COP)
INSERT INTO routes (origin_location_id, destination_location_id, estimated_duration_minutes, buffer_minutes, base_price_cop, active) VALUES
  -- Cartagena → Barranquilla (150 min = 2h30)
  ('11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', 150, 45, 450000, true),
  -- Barranquilla → Cartagena (150 min = 2h30)
  ('22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 150, 45, 450000, true),
  -- Cartagena → Barú (105 min = 1h45)
  ('11111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333333', 105, 45, 450000, true),
  -- Barú → Cartagena (105 min = 1h45)
  ('33333333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111', 105, 45, 450000, true),
  -- Barranquilla → Barú (225 min = 3h45)
  ('22222222-2222-2222-2222-222222222222', '33333333-3333-3333-3333-333333333333', 225, 45, 450000, true),
  -- Barú → Barranquilla (225 min = 3h45)
  ('33333333-3333-3333-3333-333333333333', '22222222-2222-2222-2222-222222222222', 225, 45, 450000, true);

-- Seed vehicle
INSERT INTO vehicle (id, name, plate_optional, model, capacity_passengers, capacity_luggage, default_location_id, active) VALUES
  (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'Volkswagen Teramont',
    NULL,
    'Volkswagen Teramont 2024',
    5,
    5,
    '11111111-1111-1111-1111-111111111111',
    true
  );

-- Seed settings
INSERT INTO settings (key, value) VALUES
  ('deposit_percentage', '50'),
  ('cancellation_refund_hours', '24'),
  ('timezone', 'America/Bogota'),
  ('vehicle_location_mode', 'persistent'),
  ('default_start_location', 'cartagena'),
  ('min_booking_notice_hours', '6'),
  ('max_booking_days_ahead', '60'),
  ('allow_full_payment', 'true'),
  ('allow_deposit_payment', 'true'),
  ('whatsapp_number', '573001234567'),
  ('contact_email', 'hola@teramontrides.com'),
  ('business_name', 'Teramont Private Rides');

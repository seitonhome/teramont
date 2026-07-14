-- Add Santa Marta as a new destination
INSERT INTO locations (id, name, slug, active) VALUES
  ('44444444-4444-4444-4444-444444444444', 'Santa Marta', 'santa-marta', true);

-- Seed routes to/from Santa Marta (240 min = 4h, buffer 45 min, same price both ways)
INSERT INTO routes (origin_location_id, destination_location_id, estimated_duration_minutes, buffer_minutes, base_price_cop, active) VALUES
  -- Cartagena → Santa Marta (240 min = 4h)
  ('11111111-1111-1111-1111-111111111111', '44444444-4444-4444-4444-444444444444', 240, 45, 620000, true),
  -- Santa Marta → Cartagena (240 min = 4h)
  ('44444444-4444-4444-4444-444444444444', '11111111-1111-1111-1111-111111111111', 240, 45, 620000, true);

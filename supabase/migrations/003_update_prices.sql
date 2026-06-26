-- Cartagena ↔ Barú: $150.000 COP
UPDATE routes SET base_price_cop = 150000
WHERE
  (origin_location_id = '11111111-1111-1111-1111-111111111111' AND destination_location_id = '33333333-3333-3333-3333-333333333333')
  OR
  (origin_location_id = '33333333-3333-3333-3333-333333333333' AND destination_location_id = '11111111-1111-1111-1111-111111111111');

-- Barranquilla ↔ Barú: $550.000 COP
UPDATE routes SET base_price_cop = 550000
WHERE
  (origin_location_id = '22222222-2222-2222-2222-222222222222' AND destination_location_id = '33333333-3333-3333-3333-333333333333')
  OR
  (origin_location_id = '33333333-3333-3333-3333-333333333333' AND destination_location_id = '22222222-2222-2222-2222-222222222222');

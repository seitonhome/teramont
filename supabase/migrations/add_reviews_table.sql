-- Tabla de reseñas gestionables desde el admin
create table if not exists public.reviews (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  location    text not null,
  date        text not null,        -- texto libre: "marzo 2025"
  rating      int  not null default 5 check (rating between 1 and 5),
  text_es     text not null,
  text_en     text,
  active      boolean not null default true,
  sort_order  int  not null default 0,
  created_at  timestamptz not null default now()
);

-- RLS: solo lectura pública para reviews activas
alter table public.reviews enable row level security;

create policy "Reviews activas visibles" on public.reviews
  for select using (active = true);

create policy "Admin full access reviews" on public.reviews
  for all using (auth.role() = 'service_role');

-- Datos iniciales (los actuales hardcodeados)
insert into public.reviews (name, location, date, rating, text_es, text_en, sort_order) values
  ('Valentina Ospina', 'Medellín', 'marzo 2025', 5,
   'Fuimos 4 personas de Cartagena a Barranquilla y el servicio fue excelente. El carro impecable, llegaron puntual y el conductor muy amable. Sin duda lo volvemos a usar.',
   'We were 4 people traveling from Cartagena to Barranquilla and the service was excellent. The car was spotless, they arrived on time and the driver was very friendly. We will definitely use them again.',
   1),
  ('Carlos M.', 'Bogotá', 'enero 2026', 5,
   'Todo perfecto. Reservé por la página sin problema y el pago fue rápido. Llegaron a la hora exacta 👌',
   'Everything perfect. Booked through the website without any issues and the payment was quick. They arrived right on time 👌',
   2),
  ('Daniela Ruiz', 'Cartagena', 'enero 2025', 5,
   'Viajé con mi mamá y mis dos hijos a Barú. Cómodos, sin estrés, sin paradas. Vale cada peso.',
   'I traveled with my mom and two kids to Barú. Comfortable, stress-free, no stops. Worth every penny.',
   3),
  ('Jorge Peña', 'Barranquilla', 'febrero 2025', 5,
   'Usé este servicio para ir a Cartagena por trabajo. Puntual, el carro en perfectas condiciones y el conductor muy profesional. Recomendado 100%.',
   'Used this service for a business trip to Cartagena. Punctual, car in perfect condition and very professional driver. Highly recommended.',
   4),
  ('Laura T.', 'Cali', 'marzo 2026', 5,
   'La verdad no esperaba que fuera tan fácil reservar. El proceso online rapidísimo y el viaje sin ningún contratiempo.',
   'Honestly didn''t expect booking to be this easy. Super fast online process and the trip went without a hitch.',
   5);

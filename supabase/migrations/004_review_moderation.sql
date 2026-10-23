-- Reseñas enviadas por clientes con aprobación del admin antes de publicarse.
-- status: pending (recién enviada) · approved (visible en el home) · rejected (oculta)

alter table public.reviews
  add column if not exists status       text not null default 'pending',
  add column if not exists email        text,
  add column if not exists booking_code text,
  add column if not exists verified     boolean not null default false,
  add column if not exists lang         text not null default 'es',
  add column if not exists reviewed_at  timestamptz;

alter table public.reviews drop constraint if exists reviews_status_check;
alter table public.reviews
  add constraint reviews_status_check check (status in ('pending', 'approved', 'rejected'));

-- Las reseñas que ya existían conservan su visibilidad actual
update public.reviews
set status = case when active then 'approved' else 'rejected' end,
    reviewed_at = now()
where reviewed_at is null;

create index if not exists reviews_status_idx on public.reviews (status, created_at desc);

-- La tabla ahora guarda correos: nada de lectura pública directa.
-- El sitio lee y escribe solo por la API del servidor (service role).
drop policy if exists "Reviews activas visibles" on public.reviews;

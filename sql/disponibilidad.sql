-- =========================================================
--  Amábilis & Espinosa — Disponibilidad de la propiedad
--  ---------------------------------------------------------
--  availability      : en cuánto se puede entregar. Valores que
--                      entiende el sitio (cualquier otro se ignora):
--                        inmediata        → Entrega inmediata
--                        preventa         → Preventa · en construcción
--                        acondicionamiento→ En acondicionamiento
--                        ocupada          → Ocupada, sujeta a desocupación
--                      Vacío = no se muestra nada.
--  availability_note : el plazo concreto, en texto libre.
--                      Ej. «Entrega estimada: marzo 2026», «Aprox. 2 meses».
--
--  Ejecutar en: Supabase → SQL Editor → New query → Run
--  Es idempotente: puedes volver a ejecutarlo sin romper nada.
-- =========================================================

alter table public.properties
  add column if not exists availability      text,
  add column if not exists availability_note text;

comment on column public.properties.availability is
  'Disponibilidad: inmediata | preventa | acondicionamiento | ocupada. Vacío = no se muestra.';
comment on column public.properties.availability_note is
  'Plazo concreto en texto libre, p. ej. «Entrega estimada: marzo 2026».';

-- Comprobación
select id, title, availability, availability_note
from public.properties
order by title;

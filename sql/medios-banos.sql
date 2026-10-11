-- =========================================================
--  Amábilis & Espinosa — Medios baños por propiedad
--  ---------------------------------------------------------
--  Hasta ahora el medio baño se guardaba como decimal en "baths"
--  (2.5 = dos baños y un medio). Ahora tiene su propia columna.
--
--  Ejecutar en: Supabase → SQL Editor → New query → Run
--  Es idempotente: puedes volver a ejecutarlo sin romper nada.
-- =========================================================

-- PASO 1 (obligatorio) — crear la columna
alter table public.properties
  add column if not exists half_baths integer;

comment on column public.properties.half_baths is
  'Medios baños (sin regadera). Vacío o 0 = no se muestra.';


-- PASO 2 (OPCIONAL) — pasar los decimales viejos a la columna nueva.
--
--  NO es necesario ejecutarlo: el sitio ya entiende el formato viejo, y
--  cada propiedad se corrige sola la primera vez que la guardes desde el
--  panel. Ejecútalo solo si prefieres dejar todo convertido de una vez.
--
--  Antes:  baths = 2.5, half_baths = NULL
--  Después: baths = 2,   half_baths = 1
--
--  Quita los guiones de las tres líneas siguientes para activarlo:
--
-- update public.properties
--    set half_baths = coalesce(half_baths, 0) + 1, baths = floor(baths)
--  where baths is not null and baths <> floor(baths);


-- Comprobación: cómo quedó cada propiedad
select id, title, baths, half_baths
from public.properties
order by title;

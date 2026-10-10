-- =========================================================
--  Amábilis & Espinosa — Recorrido 360° y video por propiedad
--  ---------------------------------------------------------
--  tour360: enlace al recorrido virtual (Kuula, Matterport…)
--  video  : enlace de YouTube o Vimeo, o archivo subido al almacén
--
--  Ejecutar en: Supabase → SQL Editor → New query → Run
--  Es idempotente: puedes volver a ejecutarlo sin romper nada.
-- =========================================================

alter table public.properties
  add column if not exists tour360 text,
  add column if not exists video   text;

comment on column public.properties.tour360 is
  'Enlace al recorrido virtual 360° (Kuula, Matterport, etc.). Vacío = no se muestra.';
comment on column public.properties.video is
  'Video de la propiedad: enlace de YouTube o Vimeo, o dirección de un archivo subido al almacén.';

-- Comprobación: deben aparecer las dos columnas
select column_name, data_type
from information_schema.columns
where table_schema = 'public' and table_name = 'properties'
  and column_name in ('tour360', 'video')
order by column_name;

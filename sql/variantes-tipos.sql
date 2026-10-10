-- =========================================================
--  Amábilis & Espinosa — Tipos o modelos dentro de una propiedad
--  ---------------------------------------------------------
--  Para desarrollos que ofrecen varios modelos (Tipo A, Tipo B…),
--  cada uno con sus medidas, su texto y sus propias fotos.
--
--  Ejecutar en: Supabase → SQL Editor → New query → Run
--  Es idempotente: puedes volver a ejecutarlo sin romper nada.
-- =========================================================

alter table public.properties
  add column if not exists variants jsonb not null default '[]'::jsonb;

comment on column public.properties.variants is
  'Modelos del desarrollo. Arreglo de objetos:
   [{ "name": "Tipo A", "built": 182, "beds": 3, "baths": 3.5, "parking": 2,
      "description": "…", "images": ["url", …], "alts": ["…", …],
      "en": { "name": "Type A", "description": "…" } }]';

-- Comprobación: debe listar la columna nueva
select column_name, data_type, column_default
from information_schema.columns
where table_schema = 'public' and table_name = 'properties' and column_name = 'variants';

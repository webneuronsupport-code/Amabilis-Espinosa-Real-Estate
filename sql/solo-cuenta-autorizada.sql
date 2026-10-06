-- =========================================================
--  Amábilis & Espinosa — Restringir la edición a una cuenta
--  ---------------------------------------------------------
--  Hasta ahora, cualquier usuario con sesión iniciada podía
--  editar el catálogo. Con esto, solo puede hacerlo la cuenta
--  del negocio, aunque alguien más consiga registrarse.
--
--  Ejecutar en: Supabase → SQL Editor → New query → Run
--  Para añadir o quitar cuentas, edita la lista de abajo y
--  vuelve a ejecutar el archivo completo.
-- =========================================================

-- 1. Quién tiene permiso ------------------------------------
create or replace function public.es_administrador()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(auth.jwt() ->> 'email', '') in (
    'amabilisespinosa@gmail.com'      -- cuenta del negocio
    -- ,'otro@correo.com'             -- añadir aquí futuras cuentas
  );
$$;

comment on function public.es_administrador() is
  'Cuentas autorizadas para editar el catálogo. Editar la lista y volver a ejecutar.';

-- 2. Propiedades: leer todos, escribir solo la cuenta --------
drop policy if exists "lectura completa autenticados" on public.properties;
create policy "lectura completa autenticados" on public.properties
  for select to authenticated using (true);

drop policy if exists "alta autenticados" on public.properties;
drop policy if exists "alta solo administrador" on public.properties;
create policy "alta solo administrador" on public.properties
  for insert to authenticated with check (public.es_administrador());

drop policy if exists "edicion autenticados" on public.properties;
drop policy if exists "edicion solo administrador" on public.properties;
create policy "edicion solo administrador" on public.properties
  for update to authenticated
  using (public.es_administrador()) with check (public.es_administrador());

drop policy if exists "borrado autenticados" on public.properties;
drop policy if exists "borrado solo administrador" on public.properties;
create policy "borrado solo administrador" on public.properties
  for delete to authenticated using (public.es_administrador());

-- 3. Fotografías: lo mismo en el almacén ---------------------
drop policy if exists "fotos alta autenticados" on storage.objects;
drop policy if exists "fotos alta solo administrador" on storage.objects;
create policy "fotos alta solo administrador" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'propiedades' and public.es_administrador());

drop policy if exists "fotos edicion autenticados" on storage.objects;
drop policy if exists "fotos edicion solo administrador" on storage.objects;
create policy "fotos edicion solo administrador" on storage.objects
  for update to authenticated
  using (bucket_id = 'propiedades' and public.es_administrador());

drop policy if exists "fotos borrado autenticados" on storage.objects;
drop policy if exists "fotos borrado solo administrador" on storage.objects;
create policy "fotos borrado solo administrador" on storage.objects
  for delete to authenticated
  using (bucket_id = 'propiedades' and public.es_administrador());

-- 4. Comprobación -------------------------------------------
-- Debe devolver 6 políticas "solo administrador" + las de lectura pública.
select schemaname, tablename, policyname, cmd
from pg_policies
where (schemaname = 'public' and tablename = 'properties')
   or (schemaname = 'storage' and tablename = 'objects' and policyname like 'fotos%')
order by tablename, cmd, policyname;

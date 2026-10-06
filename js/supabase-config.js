/* =========================================================
   Amábilis & Espinosa — Conexión con Supabase
   ---------------------------------------------------------
   Pega aquí los dos datos de tu proyecto:
   Supabase → Project Settings → API
     · Project URL          →  url
     · anon / public key    →  anonKey

   La "anon key" es pública por diseño: va dentro de la página.
   Lo que protege la información son las políticas de seguridad
   del archivo sql/supabase-propiedades.sql (solo quien inicia
   sesión puede crear, editar o borrar).

   Mientras estos campos estén vacíos, el sitio sigue funcionando
   con el catálogo de js/data.js, así que nada se rompe.
   ========================================================= */
window.SUPABASE_CONFIG = {
  url: "https://zzgxjovyanlipmvtwtve.supabase.co",
  anonKey: "sb_publishable_VurOkNeVNoyiOESFn3gfmw_fLrxvqzQ",
  bucket: "propiedades",
};

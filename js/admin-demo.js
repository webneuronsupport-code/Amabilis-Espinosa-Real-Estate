/* =========================================================
   Amábilis & Espinosa — Modo demostración del panel
   ---------------------------------------------------------
   Solo se activa si la dirección termina en ?demo=1
   Sustituye Supabase por una copia en memoria: puedes crear,
   editar, borrar y subir fotos sin tocar nada real. Al recargar,
   todo vuelve a empezar.

   Sirve para probar el panel en local antes de crear la cuenta
   de Supabase, y para enseñárselo al cliente sin riesgo.
   ========================================================= */
(() => {
  if (!new URLSearchParams(location.search).has("demo")) return;

  const filas = [
    {
      id: "residencial-grafito-i", title: "Residencial Grafito I", zone: "Metepec",
      location: "Metepec, Estado de México", type: "Casa", operation: "Venta", price: 4850000,
      beds: 3, baths: 3.5, parking: 2, built: 240, land: 180, featured: true, published: true,
      tag: "Nuevo", summary: "Arquitectura contemporánea en uno de los desarrollos más buscados de Metepec.",
      description: "Casa de tres niveles con dobles alturas, cocina integral con isla y roof garden privado.",
      amenities: ["Roof garden", "Vigilancia 24/7", "Cocina con isla"],
      images: ["img/propiedades/residencial-grafito-i/01.avif", "img/propiedades/residencial-grafito-i/02.avif"],
      alts: ["Fachada de la casa", ""], en: null, position: 1,
    },
    {
      id: "valle-de-zamarrero", title: "Refugio en la Laguna · Valle de Zamarrero", zone: "Toluca",
      location: "Zinacantepec, Estado de México", type: "Casa", operation: "Venta", price: 12900000,
      beds: 4, baths: 4.5, parking: 3, built: 420, land: 600, featured: true, published: true,
      tag: "Exclusiva", summary: "Residencia con jardín maduro dentro de un fraccionamiento privado.",
      description: "Casa de dos plantas con jardín, terraza y acabados de primera.",
      amenities: ["Jardín", "Terraza", "Caseta de vigilancia"],
      images: ["img/propiedades/valle-de-zamarrero/01.webp"], alts: ["Fachada con palmeras"],
      en: null, position: 2,
    },
    {
      id: "terreno-de-prueba", title: "Terreno en borrador", zone: "Lerma",
      location: "Lerma, Estado de México", type: "Terreno", operation: "Venta", price: 1850000,
      beds: null, baths: null, parking: null, built: null, land: 500, featured: false, published: false,
      tag: "", summary: "Ejemplo de propiedad que todavía no se publica.",
      description: "", amenities: [], images: [], alts: [], en: null, position: 3,
    },
  ];

  const copia = () => JSON.parse(JSON.stringify(filas));
  let datos = copia();

  const tabla = () => {
    const api = {
      select: () => api,
      order: () => api,
      then: (res) => Promise.resolve({ data: copiaOrdenada(), error: null }).then(res),
      upsert(fila) {
        const i = datos.findIndex((p) => p.id === fila.id);
        if (i >= 0) datos[i] = { ...datos[i], ...fila };
        else datos.push({ ...fila });
        return Promise.resolve({ error: null });
      },
      delete: () => api,
      eq(_campo, valor) {
        datos = datos.filter((p) => p.id !== valor);
        return Promise.resolve({ error: null });
      },
    };
    return api;
  };

  const copiaOrdenada = () =>
    JSON.parse(JSON.stringify(datos)).sort((a, b) => (a.position || 0) - (b.position || 0));

  const almacen = () => ({
    _urls: new Map(),
    upload(ruta, archivo) {
      this._urls.set(ruta, URL.createObjectURL(archivo));
      return Promise.resolve({ error: null });
    },
    getPublicUrl(ruta) {
      return { data: { publicUrl: this._urls.get(ruta) || "img/og-image.jpg" } };
    },
    remove: () => Promise.resolve({ error: null }),
  });
  const almacenUnico = almacen();

  window.SUPABASE_CONFIG = { url: "demo://local", anonKey: "demo", bucket: "propiedades" };
  window.supabase = {
    createClient: () => ({
      auth: {
        getSession: () => Promise.resolve({ data: { session: { user: { email: "demostración@local" } } } }),
        signInWithPassword: () => Promise.resolve({ data: { user: { email: "demostración@local" } }, error: null }),
        signOut: () => Promise.resolve({}),
      },
      from: tabla,
      storage: { from: () => almacenUnico },
    }),
  };

  // Aviso visible para que nadie confunda esto con el panel real
  addEventListener("DOMContentLoaded", () => {
    const cinta = document.createElement("div");
    cinta.textContent = "Modo demostración · los cambios no se guardan y se pierden al recargar";
    cinta.style.cssText =
      "position:sticky;top:0;z-index:50;background:#c5a35e;color:#0a1430;text-align:center;" +
      "padding:8px 16px;font:600 13px/1.4 Manrope,system-ui,sans-serif";
    document.body.prepend(cinta);
  });
})();

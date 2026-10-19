/* =========================================================
   Amábilis & Espinosa — Catálogo en vivo
   ---------------------------------------------------------
   Trae las propiedades desde Supabase y recién entonces arranca
   js/main.js, para que el sitio dibuje siempre los datos buenos.

   · Si Supabase no está configurado todavía  → usa js/data.js.
   · Si la red falla o tarda demasiado        → usa js/data.js.
   · Guarda una copia en el navegador para que la siguiente
     visita pinte al instante y la red se revise en segundo plano.
   ========================================================= */
(() => {
  const CFG = window.SUPABASE_CONFIG || {};
  const CACHE = "ae-propiedades";
  const CACHE_BLOG = "ae-blog";
  const VIGENCIA = 10 * 60 * 1000; // 10 minutos
  const ESPERA = 2200; // ms antes de rendirse y usar el catálogo local

  const versionJS = (document.currentScript?.src.match(/\?v=\d+/) || [""])[0];

  const arrancarSitio = () => {
    const s = document.createElement("script");
    s.src = "js/main.js" + versionJS;
    document.body.appendChild(s);
  };

  // Deja las filas de la base con la misma forma que usa el sitio
  const normalizar = (filas) => {
    const en = (window.I18N || {}).lang === "en";
    return filas.map((f) => {
      const texto = (v) => (v == null ? "" : String(v));
      const p = {
        id: f.id, title: texto(f.title), zone: texto(f.zone), location: texto(f.location),
        type: texto(f.type), operation: texto(f.operation),
        price: f.price == null ? null : Number(f.price),
        beds: f.beds == null ? null : Number(f.beds),
        baths: f.baths == null ? null : Number(f.baths),
        halfBaths: f.half_baths == null ? null : Number(f.half_baths),
        parking: f.parking == null ? null : Number(f.parking),
        built: f.built == null ? null : Number(f.built),
        land: f.land == null ? null : Number(f.land),
        featured: !!f.featured, tag: texto(f.tag),
        availability: texto(f.availability), availabilityNote: texto(f.availability_note),
        tour360: texto(f.tour360), video: texto(f.video),
        summary: texto(f.summary), description: texto(f.description),
        amenities: f.amenities || [], images: f.images || [], alts: f.alts || [],
        variants: (Array.isArray(f.variants) ? f.variants : []).map((m) => ({
          name: texto(m.name), description: texto(m.description),
          built: m.built == null ? null : Number(m.built),
          beds: m.beds == null ? null : Number(m.beds),
          baths: m.baths == null ? null : Number(m.baths),
          halfBaths: m.halfBaths == null ? null : Number(m.halfBaths),
          parking: m.parking == null ? null : Number(m.parking),
          images: Array.isArray(m.images) ? m.images : [],
          alts: Array.isArray(m.alts) ? m.alts : [],
          en: m.en || null,
        })),
      };
      if (en && f.en) Object.assign(p, f.en); // traducciones cargadas desde el panel
      if (en) p.variants = p.variants.map((m) => (m.en ? { ...m, ...m.en } : m));
      return p;
    });
  };

  // El blog usa la misma forma que js/data.js para que main.js no note la diferencia
  const normalizarBlog = (filas) => {
    const en = (window.I18N || {}).lang === "en";
    return filas.map((f) => {
      const texto = (v) => (v == null ? "" : String(v));
      const p = {
        id: f.id, title: texto(f.title), category: texto(f.category),
        date: texto(f.date), read: texto(f.read), cover: texto(f.cover),
        excerpt: texto(f.excerpt), video: texto(f.video),
        body: Array.isArray(f.body) ? f.body : [],
      };
      if (en && f.en) Object.assign(p, f.en);
      return p;
    });
  };

  const aplicarBlog = (filas) => {
    if (!Array.isArray(filas) || !filas.length) return false;
    if (typeof POSTS === "undefined") return false;
    const nuevas = normalizarBlog(filas);
    POSTS.length = 0;
    nuevas.forEach((p) => POSTS.push(p));
    return true;
  };

  const aplicar = (filas) => {
    if (!Array.isArray(filas) || !filas.length) return false;
    const nuevas = normalizar(filas);
    if (typeof PROPERTIES === "undefined") return false;
    PROPERTIES.length = 0;
    nuevas.forEach((p) => PROPERTIES.push(p));
    return true;
  };

  const leerCache = (clave = CACHE) => {
    try {
      const raw = localStorage.getItem(clave);
      if (!raw) return null;
      const { t, filas } = JSON.parse(raw);
      return { fresco: Date.now() - t < VIGENCIA, filas };
    } catch (e) { return null; }
  };

  const guardarCache = (filas, clave = CACHE) => {
    try { localStorage.setItem(clave, JSON.stringify({ t: Date.now(), filas })); } catch (e) {}
  };

  const pedirTabla = (tabla) => {
    const url = `${CFG.url}/rest/v1/${tabla}` +
      `?select=*&published=eq.true&order=position.asc,created_at.asc`;
    const ctrl = new AbortController();
    const corte = setTimeout(() => ctrl.abort(), ESPERA);
    return fetch(url, {
      headers: { apikey: CFG.anonKey, Authorization: `Bearer ${CFG.anonKey}` },
      signal: ctrl.signal,
    })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("HTTP " + r.status))))
      .finally(() => clearTimeout(corte));
  };

  const pedir = () => pedirTabla("properties");
  // Si la tabla del blog no existe todavia, el sitio sigue con js/data.js
  const pedirBlog = () => pedirTabla("posts").catch(() => null);

  if (!CFG.url || !CFG.anonKey) { arrancarSitio(); return; }

  const cache = leerCache();
  const cacheBlog = leerCache(CACHE_BLOG);

  // Con copia fresca de las dos, pinta al instante y revisa por detrás
  if (cache && cache.fresco && aplicar(cache.filas)) {
    if (cacheBlog && cacheBlog.fresco) aplicarBlog(cacheBlog.filas);
    arrancarSitio();
    pedir().then(guardarCache).catch(() => {});
    pedirBlog().then((f) => { if (f) guardarCache(f, CACHE_BLOG); }).catch(() => {});
    return;
  }

  Promise.all([
    pedir()
      .then((filas) => { aplicar(filas); guardarCache(filas); })
      .catch(() => { if (cache) aplicar(cache.filas); }),
    pedirBlog()
      .then((filas) => { if (filas) { aplicarBlog(filas); guardarCache(filas, CACHE_BLOG); } })
      .catch(() => { if (cacheBlog) aplicarBlog(cacheBlog.filas); }),
  ]).finally(arrancarSitio);
})();

/* Genera sitemap.xml: páginas fijas + propiedades publicadas + entradas del blog.
   Volver a ejecutarlo cuando el cliente añada o quite propiedades. */
const fs = require("fs");
const vm = require("vm");

const BASE = "https://www.amabilisespinosa.com";
const PROYECTO = "https://zzgxjovyanlipmvtwtve.supabase.co";
const KEY = "sb_publishable_VurOkNeVNoyiOESFn3gfmw_fLrxvqzQ";
const hoy = new Date().toISOString().slice(0, 10);

// --- Blog, desde js/data.js ---
const ctx = {
  window: {}, document: { documentElement: {}, body: { dataset: {} } },
  localStorage: { getItem: () => null, setItem: () => {} },
  location: { search: "", href: "http://x/", hostname: "x" }, console,
};
vm.createContext(ctx);
vm.runInContext(fs.readFileSync("js/data.js", "utf8"), ctx);
vm.runInContext("globalThis.__posts = JSON.stringify(POSTS.map(p => ({ id: p.id, date: p.date })))", ctx);
const posts = JSON.parse(ctx.__posts);

(async () => {
  const r = await fetch(`${PROYECTO}/rest/v1/properties?select=id,updated_at&published=eq.true&order=position`, {
    headers: { apikey: KEY, Authorization: "Bearer " + KEY },
  });
  const props = await r.json();

  const fijas = [
    ["/", "1.0", "weekly"],
    ["/propiedades.html", "0.9", "daily"],
    ["/nosotros.html", "0.7", "monthly"],
    ["/blog.html", "0.7", "weekly"],
    ["/contacto.html", "0.8", "monthly"],
    ["/aviso-de-privacidad.html", "0.2", "yearly"],
  ];

  // Cada dirección se declara en español y en inglés (?lang=en)
  // En XML el "&" debe escribirse &amp;
  const xmlSeguro = (u) => u.replace(/&/g, "&amp;");

  const entrada = (ruta, fecha, prioridad, frecuencia) => {
    const es = xmlSeguro(BASE + ruta);
    const en = xmlSeguro(BASE + ruta + (ruta.includes("?") ? "&" : "?") + "lang=en");
    return `  <url>
    <loc>${es}</loc>
    <lastmod>${fecha}</lastmod>
    <changefreq>${frecuencia}</changefreq>
    <priority>${prioridad}</priority>
    <xhtml:link rel="alternate" hreflang="es-MX" href="${es}"/>
    <xhtml:link rel="alternate" hreflang="en" href="${en}"/>
    <xhtml:link rel="alternate" hreflang="x-default" href="${es}"/>
  </url>`;
  };

  const urls = [
    ...fijas.map(([ruta, p, f]) => entrada(ruta, hoy, p, f)),
    ...props.map((x) => entrada(`/propiedad.html?id=${x.id}`, (x.updated_at || hoy).slice(0, 10), "0.8", "weekly")),
    ...posts.map((x) => entrada(`/post.html?id=${x.id}`, (x.date || hoy).slice(0, 10), "0.5", "monthly")),
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls.join("\n")}
</urlset>
`;
  fs.writeFileSync("sitemap.xml", xml, "utf8");
  console.log("sitemap.xml generado");
  console.log("  paginas fijas :", fijas.length);
  console.log("  propiedades   :", props.length);
  console.log("  entradas blog :", posts.length);
  console.log("  total de URLs :", urls.length);
})();

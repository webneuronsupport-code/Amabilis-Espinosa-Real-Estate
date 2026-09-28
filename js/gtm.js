/* =========================================================
   Google Tag Manager
   Reemplaza GTM_ID por el ID real del contenedor (Administrar → Instalar Google Tag Manager).
   Este archivo se carga en el <head> de todas las páginas.
   ========================================================= */
(function (w, d) {
  var GTM_ID = "GTM-XXXXXXX";

  w.dataLayer = w.dataLayer || [];
  // Datos de contexto disponibles para todas las etiquetas
  w.dataLayer.push({
    page_type: (d.currentScript && d.currentScript.dataset.page) || "otra",
    language: (w.I18N && w.I18N.lang) || "es",
  });

  if (!/^GTM-[A-Z0-9]{4,}$/.test(GTM_ID) || GTM_ID === "GTM-XXXXXXX") {
    if (/localhost|127\.0\.0\.1/.test(location.hostname)) {
      console.info("[GTM] Sin ID configurado: los eventos se registran en dataLayer pero no se envían.");
    }
    return;
  }

  w.dataLayer.push({ "gtm.start": new Date().getTime(), event: "gtm.js" });
  var s = d.createElement("script");
  s.async = true;
  s.src = "https://www.googletagmanager.com/gtm.js?id=" + GTM_ID;
  d.head.appendChild(s);
})(window, document);

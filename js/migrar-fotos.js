/* =========================================================
   Amábilis & Espinosa — Migración de fotos a Supabase
   ---------------------------------------------------------
   Sube al almacén las fotos que hoy son archivos del sitio
   (las rutas que empiezan por "img/") y deja las propiedades
   apuntando allí, para que el cliente pueda administrarlas
   desde el panel.

   · Se ejecuta con la sesión ya iniciada en admin.html
   · Es repetible: solo migra lo que quede pendiente
   · No toca las imágenes de Unsplash ni las ya migradas
   ========================================================= */
(() => {
  const CFG = window.SUPABASE_CONFIG || {};
  const $ = (s) => document.querySelector(s);
  const estado = $("#estado"), registro = $("#registro"), boton = $("#btnMigrar");
  const barra = $("#barra"), relleno = $("#barra i"), resumen = $("#resumen");

  const log = (texto) => { registro.textContent += texto + "\n"; registro.scrollTop = registro.scrollHeight; };

  if (!CFG.url || !CFG.anonKey) {
    estado.textContent = "Falta configurar js/supabase-config.js.";
    return;
  }

  const sb = window.supabase.createClient(CFG.url, CFG.anonKey);
  const BUCKET = CFG.bucket || "propiedades";
  let pendientes = [];

  const esLocal = (v) => typeof v === "string" && v.startsWith("img/");

  const fila = (etiqueta, valor) => `<div><span>${etiqueta}</span><b>${valor}</b></div>`;

  const revisar = async () => {
    const { data: sesion } = await sb.auth.getSession();
    if (!sesion.session) {
      estado.innerHTML = 'Primero inicia sesión en <a href="admin.html">el panel</a> y vuelve a esta página.';
      return;
    }

    const { data, error } = await sb.from("properties").select("id,title,images,alts").order("position");
    if (error) { estado.textContent = "No se pudo leer el catálogo: " + error.message; return; }

    pendientes = data.filter((p) => (p.images || []).some(esLocal));
    const total = pendientes.reduce((n, p) => n + p.images.filter(esLocal).length, 0);
    const yaEnAlmacen = data.reduce((n, p) => n + (p.images || []).filter((i) => String(i).includes("/" + BUCKET + "/")).length, 0);
    const unsplash = data.reduce((n, p) => n + (p.images || []).filter((i) => !esLocal(i) && !String(i).includes("/" + BUCKET + "/")).length, 0);

    estado.textContent = `Sesión activa: ${sesion.session.user.email}`;
    resumen.innerHTML =
      fila("Fotos por migrar", total) +
      fila("Propiedades afectadas", pendientes.length) +
      fila("Ya en el almacén", yaEnAlmacen) +
      fila("De Unsplash (no se tocan)", unsplash);

    if (!total) {
      boton.textContent = "No queda nada por migrar";
      log("Todo en orden: ninguna propiedad apunta ya a archivos del sitio.");
      return;
    }
    boton.disabled = false;
    pendientes.forEach((p) => log(`pendiente · ${p.title} → ${p.images.filter(esLocal).length} foto(s)`));
  };

  const migrar = async () => {
    boton.disabled = true;
    boton.textContent = "Migrando…";
    barra.hidden = false;

    const total = pendientes.reduce((n, p) => n + p.images.filter(esLocal).length, 0);
    let hechas = 0, fallos = 0, bytes = 0;

    for (const p of pendientes) {
      const nuevas = [];
      for (const img of p.images) {
        if (!esLocal(img)) { nuevas.push(img); continue; }

        try {
          const r = await fetch("/" + img.replace(/^\//, ""));
          if (!r.ok) throw new Error("HTTP " + r.status);
          const blob = await r.blob();
          const ext = (img.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "");
          const ruta = `${p.id}/${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}.${ext}`;

          const { error } = await sb.storage.from(BUCKET)
            .upload(ruta, blob, { cacheControl: "31536000", upsert: false, contentType: blob.type });
          if (error) throw error;

          const { data } = sb.storage.from(BUCKET).getPublicUrl(ruta);
          nuevas.push(data.publicUrl);
          bytes += blob.size;
          hechas++;
          log(`  ✓ ${img.split("/").pop()}  (${Math.round(blob.size / 1024)} KB)`);
        } catch (e) {
          nuevas.push(img); // se queda como estaba, para no perder la referencia
          fallos++;
          log(`  ✗ ${img} — ${e.message || e}`);
        }
        relleno.style.width = Math.round(((hechas + fallos) / total) * 100) + "%";
      }

      const { error } = await sb.from("properties").update({ images: nuevas }).eq("id", p.id);
      log(error ? `✗ No se pudo actualizar «${p.title}»: ${error.message}` : `✓ ${p.title} actualizada`);
    }

    log(`\nTerminado: ${hechas} fotos migradas (${(bytes / 1048576).toFixed(1)} MB), ${fallos} con error.`);
    if (!fallos) {
      log("Ya puedes borrar la carpeta img/propiedades del paquete que subes a Hostinger.");
    }
    boton.textContent = "Volver a revisar";
    boton.disabled = false;
    boton.onclick = () => location.reload();
  };

  boton.addEventListener("click", migrar, { once: true });
  revisar();
})();

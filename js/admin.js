/* =========================================================
   Amábilis & Espinosa — Panel de propiedades
   Alta, edición, borrado y fotografías. Todo contra Supabase.
   ========================================================= */
(() => {
  const CFG = window.SUPABASE_CONFIG || {};
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];

  const vistaAcceso = $("#vistaAcceso");
  const vistaPanel = $("#vistaPanel");
  const vistaConfig = $("#vistaConfig");
  const vistaLista = $("#vistaLista");
  const vistaEditor = $("#vistaEditor");

  if (!CFG.url || !CFG.anonKey) { vistaConfig.hidden = false; return; }

  const sb = window.supabase.createClient(CFG.url, CFG.anonKey);
  const BUCKET = CFG.bucket || "propiedades";

  let propiedades = [];   // catálogo completo (incluye borradores)
  let actual = null;      // propiedad abierta en el editor
  let esNueva = false;
  let amenidades = [];
  let fotos = [];         // [{ src, alt }]
  let sucio = false;      // hay cambios sin guardar

  /* ---------- Utilidades ---------- */
  const dinero = (n) => (n == null || n === "" ? "—" : "$" + Number(n).toLocaleString("es-MX"));

  const aSlug = (texto) => texto.toString().toLowerCase().trim()
    .normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60);

  // Las fotos viejas del sitio son identificadores de Unsplash; las nuevas, URL completas
  const verFoto = (v, w = 600) => (!v ? "" : v.includes("/")
    ? v : `https://images.unsplash.com/photo-${v}?auto=format&fit=crop&w=${w}&q=80`);

  const brindis = (texto, ms = 2600) => {
    const el = $("#brindis");
    el.textContent = texto; el.hidden = false;
    clearTimeout(brindis._t);
    brindis._t = setTimeout(() => (el.hidden = true), ms);
  };

  const avisar = (sel, texto, ok = false) => {
    const el = $(sel);
    if (!texto) { el.hidden = true; return; }
    el.textContent = texto; el.hidden = false;
    el.classList.toggle("aviso--ok", ok);
  };

  const confirmar = (titulo, texto) => new Promise((resolve) => {
    const m = $("#modal");
    $("#modalTitulo").textContent = titulo;
    $("#modalTexto").textContent = texto;
    m.hidden = false;
    const cerrar = (valor) => {
      m.hidden = true;
      $("#modalAceptar").removeEventListener("click", si);
      $("#modalCancelar").removeEventListener("click", no);
      resolve(valor);
    };
    const si = () => cerrar(true), no = () => cerrar(false);
    $("#modalAceptar").addEventListener("click", si);
    $("#modalCancelar").addEventListener("click", no);
  });

  /* ---------- Acceso ---------- */
  const mostrarPanel = (correo) => {
    vistaAcceso.hidden = true;
    vistaPanel.hidden = false;
    $("#sesionCorreo").textContent = correo;
    cargar();
  };

  const mostrarAcceso = () => {
    vistaPanel.hidden = true;
    vistaAcceso.hidden = false;
  };

  $("#formAcceso").addEventListener("submit", async (e) => {
    e.preventDefault();
    avisar("#avisoAcceso", "");
    const boton = $("#formAcceso .btn");
    boton.disabled = true; boton.textContent = "Entrando…";
    const { data, error } = await sb.auth.signInWithPassword({
      email: $("#correo").value.trim(), password: $("#clave").value,
    });
    boton.disabled = false; boton.textContent = "Entrar";
    if (error) {
      avisar("#avisoAcceso", /invalid/i.test(error.message)
        ? "Correo o contraseña incorrectos."
        : "No se pudo entrar: " + error.message);
      return;
    }
    mostrarPanel(data.user.email);
  });

  $("#btnSalir").addEventListener("click", async () => {
    if (sucio && !(await confirmar("¿Salir sin guardar?", "Hay cambios que todavía no se han guardado."))) return;
    await sb.auth.signOut();
    location.reload();
  });

  /* ---------- Listado ---------- */
  const cargar = async () => {
    const { data, error } = await sb.from("properties").select("*")
      .order("position", { ascending: true }).order("created_at", { ascending: true });
    if (error) { $("#resumen").textContent = "No se pudo cargar: " + error.message; return; }
    propiedades = data || [];
    $("#zonas").innerHTML = [...new Set(propiedades.map((p) => p.zone).filter(Boolean))]
      .map((z) => `<option value="${z}">`).join("");
    pintarLista();
  };

  const pintarLista = () => {
    const texto = $("#buscar").value.trim().toLowerCase();
    const estado = $(".segmento.es-activo").dataset.estado;
    const lista = propiedades.filter((p) => {
      if (estado === "publicadas" && !p.published) return false;
      if (estado === "borradores" && p.published) return false;
      if (!texto) return true;
      return [p.title, p.zone, p.type, p.location, p.operation].join(" ").toLowerCase().includes(texto);
    });

    const publicadas = propiedades.filter((p) => p.published).length;
    $("#resumen").textContent =
      `${propiedades.length} en total · ${publicadas} visibles en el sitio · ${propiedades.length - publicadas} en borrador`;

    $("#lista").innerHTML = lista.length ? lista.map((p) => `
      <article class="tarjeta">
        ${p.images?.[0]
          ? `<img class="tarjeta__foto" src="${verFoto(p.images[0], 300)}" alt="" loading="lazy">`
          : '<div class="tarjeta__foto tarjeta__foto--vacia">Sin fotos</div>'}
        <div class="tarjeta__datos">
          <h3 class="tarjeta__titulo">${p.title || "Sin nombre"}</h3>
          <div class="tarjeta__meta">
            ${[p.type, p.zone, p.operation].filter(Boolean).join(" · ")} ·
            <span class="tarjeta__precio">${dinero(p.price)}</span>
            ${p.operation === "Renta" ? " / mes" : ""}
          </div>
          <div class="tarjeta__meta" style="margin-top:6px">
            <span class="insignia ${p.published ? "insignia--publicada" : "insignia--borrador"}">
              ${p.published ? "Publicada" : "Borrador"}</span>
            ${p.featured ? '<span class="insignia insignia--destacada">Destacada</span>' : ""}
            <span style="margin-left:6px">${(p.images || []).length} foto${(p.images || []).length === 1 ? "" : "s"}</span>
          </div>
        </div>
        <div class="tarjeta__acciones">
          <button class="btn btn--plano" data-editar="${p.id}" type="button">Editar</button>
          <button class="btn btn--plano" data-duplicar="${p.id}" type="button">Duplicar</button>
        </div>
      </article>`).join("")
      : `<p class="vacio">No hay propiedades que coincidan con la búsqueda.</p>`;
  };

  $("#buscar").addEventListener("input", pintarLista);
  $$(".segmento").forEach((b) => b.addEventListener("click", () => {
    $$(".segmento").forEach((x) => x.classList.remove("es-activo"));
    b.classList.add("es-activo");
    pintarLista();
  }));

  $("#lista").addEventListener("click", (e) => {
    const editar = e.target.closest("[data-editar]");
    const duplicar = e.target.closest("[data-duplicar]");
    if (editar) abrirEditor(propiedades.find((p) => p.id === editar.dataset.editar));
    if (duplicar) {
      const base = propiedades.find((p) => p.id === duplicar.dataset.duplicar);
      const copia = { ...base, id: "", title: base.title + " (copia)", published: false };
      abrirEditor(copia, true);
      brindis("Copia lista. Revisa los datos y guarda.");
    }
  });

  $("#btnNueva").addEventListener("click", () => abrirEditor(null, true));

  /* ---------- Editor ---------- */
  const valor = (id, v) => { $(id).value = v == null ? "" : v; };

  function abrirEditor(prop, nueva = false) {
    esNueva = nueva || !prop;
    actual = prop ? { ...prop } : {
      id: "", title: "", zone: "", location: "", type: "Casa", operation: "Venta",
      price: null, featured: false, published: true, images: [], alts: [], amenities: [], en: null,
      position: (propiedades.at(-1)?.position || propiedades.length) + 1,
    };

    $("#tituloEditor").textContent = esNueva ? "Nueva propiedad" : "Editar propiedad";
    $("#btnEliminar").hidden = esNueva;

    valor("#f-title", actual.title); valor("#f-zone", actual.zone); valor("#f-location", actual.location);
    valor("#f-price", actual.price); valor("#f-tag", actual.tag);
    valor("#f-beds", actual.beds); valor("#f-baths", actual.baths); valor("#f-parking", actual.parking);
    valor("#f-built", actual.built); valor("#f-land", actual.land);
    valor("#f-summary", actual.summary); valor("#f-description", actual.description);
    valor("#f-position", actual.position);
    $("#f-type").value = actual.type || "Casa";
    $("#f-operation").value = actual.operation || "Venta";
    $("#f-published").checked = actual.published !== false;
    $("#f-featured").checked = !!actual.featured;
    const en = actual.en || {};
    valor("#f-en-title", en.title); valor("#f-en-summary", en.summary); valor("#f-en-description", en.description);

    amenidades = [...(actual.amenities || [])];
    fotos = (actual.images || []).map((src, i) => ({ src, alt: (actual.alts || [])[i] || "" }));
    pintarAmenidades(); pintarGaleria();
    avisar("#avisoForm", ""); avisar("#avisoFotos", "");
    sucio = false;

    vistaLista.hidden = true; vistaEditor.hidden = false;
    window.scrollTo(0, 0);
    $("#f-title").focus();
  }

  const volver = async () => {
    if (sucio && !(await confirmar("¿Descartar los cambios?", "Lo que escribiste no se guardará."))) return;
    vistaEditor.hidden = true; vistaLista.hidden = false;
    window.scrollTo(0, 0);
  };
  $("#btnVolver").addEventListener("click", volver);

  $("#formProp").addEventListener("input", () => { sucio = true; });

  /* ---------- Amenidades ---------- */
  const pintarAmenidades = () => {
    $("#amenidades").innerHTML = amenidades.map((a, i) =>
      `<span class="etiqueta">${a}<button type="button" data-quitar="${i}" aria-label="Quitar ${a}">×</button></span>`).join("");
  };
  $("#f-amenidad").addEventListener("keydown", (e) => {
    if (e.key !== "Enter") return;
    e.preventDefault();
    const v = e.target.value.trim();
    if (v && !amenidades.includes(v)) { amenidades.push(v); pintarAmenidades(); sucio = true; }
    e.target.value = "";
  });
  $("#amenidades").addEventListener("click", (e) => {
    const b = e.target.closest("[data-quitar]");
    if (!b) return;
    amenidades.splice(+b.dataset.quitar, 1); pintarAmenidades(); sucio = true;
  });

  /* ---------- Fotografías ---------- */
  const pintarGaleria = () => {
    $("#galeria").innerHTML = fotos.map((f, i) => `
      <figure class="foto" draggable="true" data-i="${i}">
        ${i === 0 ? '<span class="foto__portada">Portada</span>' : ""}
        <button class="foto__quitar" type="button" data-quitar-foto="${i}" aria-label="Quitar fotografía">×</button>
        <img src="${verFoto(f.src, 500)}" alt="">
        <input class="foto__alt" data-alt="${i}" value="${(f.alt || "").replace(/"/g, "&quot;")}"
               placeholder="Describe la foto (ayuda en Google)">
      </figure>`).join("");
  };

  // El id es también la dirección pública (propiedad.html?id=…), así que se busca
  // la versión limpia del nombre y solo se añade sufijo si ya está ocupada.
  const idLibre = (base) => {
    if (!propiedades.some((p) => p.id === base)) return base;
    let i = 2;
    while (propiedades.some((p) => p.id === `${base}-${i}`)) i++;
    return `${base}-${i}`;
  };

  const idParaFotos = () => {
    if (actual.id) return actual.id;
    actual.id = idLibre(aSlug($("#f-title").value) || `propiedad-${Date.now().toString(36)}`);
    return actual.id;
  };

  // Las fotos de celular llegan con 4000 px y varios MB: eso hace lenta la ficha.
  // Antes de subirlas se reducen a 2000 px de lado largo y se pasan a WebP.
  const LADO_MAXIMO = 2000;
  const LIGERA = 400 * 1024; // por debajo de esto no vale la pena tocarla

  const optimizar = async (archivo) => {
    if (archivo.size < LIGERA) return archivo;
    try {
      const mapa = await createImageBitmap(archivo);
      const escala = Math.min(1, LADO_MAXIMO / Math.max(mapa.width, mapa.height));
      const ancho = Math.round(mapa.width * escala);
      const alto = Math.round(mapa.height * escala);
      const lienzo = document.createElement("canvas");
      lienzo.width = ancho; lienzo.height = alto;
      lienzo.getContext("2d").drawImage(mapa, 0, 0, ancho, alto);
      mapa.close?.();
      const blob = await new Promise((r) => lienzo.toBlob(r, "image/webp", 0.82));
      if (!blob || blob.size >= archivo.size) return archivo; // no mejoró: se deja la original
      return new File([blob], archivo.name.replace(/\.[^.]+$/, "") + ".webp", { type: "image/webp" });
    } catch (e) {
      return archivo; // formato que el navegador no sabe abrir (HEIC de iPhone, por ejemplo)
    }
  };

  const subir = async (archivos) => {
    const validos = [...archivos].filter((a) => /^image\//.test(a.type));
    if (!validos.length) return;

    const carpeta = idParaFotos();
    const hueco = document.createElement("div");
    hueco.className = "subiendo";
    hueco.textContent = `Preparando ${validos.length} foto(s)…`;
    $("#galeria").prepend(hueco);

    let ahorro = 0, pesadas = 0, n = 0;
    for (const original of validos) {
      n++;
      hueco.textContent = `Subiendo ${n} de ${validos.length}…`;
      const archivo = await optimizar(original);
      ahorro += original.size - archivo.size;

      if (archivo.size > 8 * 1024 * 1024) { pesadas++; continue; }

      const ext = (archivo.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "");
      const ruta = `${carpeta}/${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}.${ext}`;
      const { error } = await sb.storage.from(BUCKET).upload(ruta, archivo, { cacheControl: "31536000", upsert: false });
      if (error) { avisar("#avisoFotos", "No se pudo subir " + original.name + ": " + error.message); continue; }
      const { data } = sb.storage.from(BUCKET).getPublicUrl(ruta);
      fotos.push({ src: data.publicUrl, alt: "" });
    }
    hueco.remove();
    pintarGaleria();
    sucio = true;

    if (pesadas) avisar("#avisoFotos", `${pesadas} imagen(es) seguían pesando más de 8 MB y no se subieron.`);
    const mb = (ahorro / 1048576).toFixed(1);
    brindis(ahorro > 512 * 1024
      ? `Fotos agregadas y optimizadas (${mb} MB menos). Recuerda guardar.`
      : "Fotos agregadas. Recuerda guardar los cambios.");
  };

  const zona = $("#zonaSoltar");
  zona.addEventListener("click", () => $("#archivos").click());
  zona.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); $("#archivos").click(); } });
  $("#archivos").addEventListener("change", (e) => { subir(e.target.files); e.target.value = ""; });
  ["dragenter", "dragover"].forEach((ev) => zona.addEventListener(ev, (e) => { e.preventDefault(); zona.classList.add("es-encima"); }));
  ["dragleave", "drop"].forEach((ev) => zona.addEventListener(ev, (e) => { e.preventDefault(); zona.classList.remove("es-encima"); }));
  zona.addEventListener("drop", (e) => subir(e.dataTransfer.files));

  // Quitar y describir
  $("#galeria").addEventListener("click", async (e) => {
    const b = e.target.closest("[data-quitar-foto]");
    if (!b) return;
    const i = +b.dataset.quitarFoto;
    const f = fotos[i];
    if (!(await confirmar("¿Quitar la fotografía?", "Se eliminará de esta propiedad al guardar."))) return;
    fotos.splice(i, 1);
    pintarGaleria();
    sucio = true;
    if (f && f.src.includes(`/${BUCKET}/`)) borrarDelAlmacen([f.src]);
  });
  $("#galeria").addEventListener("input", (e) => {
    const campo = e.target.closest("[data-alt]");
    if (campo) { fotos[+campo.dataset.alt].alt = campo.value; sucio = true; }
  });

  // Reordenar arrastrando
  let origen = null;
  $("#galeria").addEventListener("dragstart", (e) => {
    const f = e.target.closest(".foto"); if (!f) return;
    origen = +f.dataset.i; f.classList.add("es-arrastrando");
    e.dataTransfer.effectAllowed = "move";
  });
  $("#galeria").addEventListener("dragend", () => {
    origen = null;
    $$(".foto").forEach((f) => f.classList.remove("es-arrastrando", "es-destino"));
  });
  $("#galeria").addEventListener("dragover", (e) => {
    e.preventDefault();
    const f = e.target.closest(".foto"); if (!f) return;
    $$(".foto").forEach((x) => x.classList.toggle("es-destino", x === f));
  });
  $("#galeria").addEventListener("drop", (e) => {
    e.preventDefault();
    const f = e.target.closest(".foto");
    if (!f || origen === null) return;
    const destino = +f.dataset.i;
    const [movida] = fotos.splice(origen, 1);
    fotos.splice(destino, 0, movida);
    pintarGaleria(); sucio = true;
  });

  const borrarDelAlmacen = async (urls) => {
    const rutas = urls.map((u) => u.split(`/${BUCKET}/`)[1]).filter(Boolean).map((r) => decodeURIComponent(r.split("?")[0]));
    if (rutas.length) await sb.storage.from(BUCKET).remove(rutas);
  };

  /* ---------- Guardar ---------- */
  const numero = (id) => { const v = $(id).value.trim(); return v === "" ? null : Number(v); };

  $("#btnGuardar").addEventListener("click", async () => {
    const titulo = $("#f-title").value.trim();
    if (!titulo) { avisar("#avisoForm", "Ponle un nombre a la propiedad."); $("#f-title").focus(); return; }
    if ($("#f-price").value.trim() === "") { avisar("#avisoForm", "Falta el precio."); $("#f-price").focus(); return; }

    const en = {
      title: $("#f-en-title").value.trim(),
      summary: $("#f-en-summary").value.trim(),
      description: $("#f-en-description").value.trim(),
    };
    const hayEn = Object.values(en).some(Boolean);

    const fila = {
      id: actual.id || idLibre(aSlug(titulo) || `propiedad-${Date.now().toString(36)}`),
      title: titulo,
      zone: $("#f-zone").value.trim() || null,
      location: $("#f-location").value.trim() || null,
      type: $("#f-type").value,
      operation: $("#f-operation").value,
      price: numero("#f-price"),
      beds: numero("#f-beds"), baths: numero("#f-baths"), parking: numero("#f-parking"),
      built: numero("#f-built"), land: numero("#f-land"),
      featured: $("#f-featured").checked,
      published: $("#f-published").checked,
      tag: $("#f-tag").value.trim() || null,
      summary: $("#f-summary").value.trim(),
      description: $("#f-description").value.trim(),
      amenities: amenidades,
      images: fotos.map((f) => f.src),
      alts: fotos.map((f) => f.alt || ""),
      en: hayEn ? Object.fromEntries(Object.entries(en).filter(([, v]) => v)) : null,
      position: numero("#f-position") ?? 0,
    };

    const boton = $("#btnGuardar");
    boton.disabled = true; boton.textContent = "Guardando…";
    const { error } = await sb.from("properties").upsert(fila);
    boton.disabled = false; boton.textContent = "Guardar cambios";

    if (error) {
      avisar("#avisoForm", "No se pudo guardar: " + error.message);
      return;
    }
    sucio = false;
    avisar("#avisoForm", "Guardado. Los cambios ya están en el sitio.", true);
    brindis("Propiedad guardada");
    // El editor se queda con lo recién guardado (incluido el id de las nuevas)
    actual = { ...actual, ...fila };
    await cargar();
    esNueva = false;
    $("#btnEliminar").hidden = false;
    $("#tituloEditor").textContent = "Editar propiedad";
  });

  /* ---------- Eliminar ---------- */
  $("#btnEliminar").addEventListener("click", async () => {
    if (!actual?.id) return;
    const ok = await confirmar("¿Eliminar la propiedad?",
      `Se quitará «${actual.title}» del sitio junto con sus fotografías. Esta acción no se puede deshacer.`);
    if (!ok) return;

    const propias = (actual.images || []).filter((u) => typeof u === "string" && u.includes(`/${BUCKET}/`));
    if (propias.length) await borrarDelAlmacen(propias);

    const { error } = await sb.from("properties").delete().eq("id", actual.id);
    if (error) { avisar("#avisoForm", "No se pudo eliminar: " + error.message); return; }

    sucio = false;
    brindis("Propiedad eliminada");
    await cargar();
    vistaEditor.hidden = true; vistaLista.hidden = false;
    window.scrollTo(0, 0);
  });

  /* ---------- Avisar antes de cerrar con cambios ---------- */
  window.addEventListener("beforeunload", (e) => {
    if (!sucio) return;
    e.preventDefault(); e.returnValue = "";
  });

  /* ---------- Arranque ---------- */
  sb.auth.getSession().then(({ data }) => {
    if (data.session) mostrarPanel(data.session.user.email);
    else mostrarAcceso();
  });
})();

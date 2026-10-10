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
  let modelos = [];       // [{ name, built, beds, baths, parking, description, images[], alts[], en }]
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

  const confirmar = (titulo, texto, etiqueta = "Sí, continuar") => new Promise((resolve) => {
    const m = $("#modal");
    $("#modalTitulo").textContent = titulo;
    $("#modalTexto").textContent = texto;
    $("#modalAceptar").textContent = etiqueta;
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
    if (sucio && !(await confirmar("¿Salir sin guardar?", "Hay cambios que todavía no se han guardado.", "Salir sin guardar"))) return;
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
            ${p.published && !(p.en && (p.en.summary || p.en.description))
              ? '<span class="insignia insignia--sin-ingles" title="En el sitio en inglés se mostrará el texto en español">Sin inglés</span>' : ""}
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
    valor("#f-tour360", actual.tour360); valor("#f-video", actual.video);
    ["#avisoVideo", "#avisoTour", "#avisoVideoEnlace"].forEach((a) => { if ($(a)) $(a).textContent = ""; });
    valor("#f-position", actual.position);
    $("#f-type").value = actual.type || "Casa";
    $("#f-operation").value = actual.operation || "Venta";
    $("#f-published").checked = actual.published !== false;
    $("#f-featured").checked = !!actual.featured;
    const en = actual.en || {};
    valor("#f-en-title", en.title); valor("#f-en-tag", en.tag);
    valor("#f-en-summary", en.summary); valor("#f-en-description", en.description);

    amenidades = [...(actual.amenities || [])];
    modelos = JSON.parse(JSON.stringify(actual.variants || []));
    pintarModelos();
    fotos = (actual.images || []).map((src, i) => ({ src, alt: (actual.alts || [])[i] || "" }));
    pintarAmenidades(); pintarGaleria();
    avisar("#avisoForm", ""); avisar("#avisoFotos", "");
    sucio = false;

    vistaLista.hidden = true; vistaEditor.hidden = false;
    window.scrollTo(0, 0);
    $("#f-title").focus();
  }

  const volver = async () => {
    if (sucio && !(await confirmar("¿Descartar los cambios?", "Lo que escribiste no se guardará.", "Sí, descartarlos"))) return;
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

  /* ---------- Modelos del desarrollo ---------- */
  const letra = (i) => String.fromCharCode(65 + i);

  const pintarModelos = () => {
    const cont = $("#modelos");
    if (!cont) return;
    cont.innerHTML = modelos.map((m, k) => `
      <article class="modelo-edit" data-m="${k}">
        <header class="modelo-edit__head">
          <b>${m.name || "Tipo " + letra(k)}</b>
          <div class="modelo-edit__acciones">
            ${k > 0 ? `<button type="button" class="btn btn--plano" data-subir="${k}" aria-label="Subir">↑</button>` : ""}
            ${k < modelos.length - 1 ? `<button type="button" class="btn btn--plano" data-bajar="${k}" aria-label="Bajar">↓</button>` : ""}
            <button type="button" class="btn btn--peligro" data-quitar-modelo="${k}">Quitar</button>
          </div>
        </header>
        <div class="rejilla">
          <label class="campo"><span>Nombre del modelo</span><input data-c="name" value="${(m.name || "").replace(/"/g, "&quot;")}" placeholder="Tipo ${letra(k)}"></label>
          <label class="campo"><span>Construcción (m²)</span><input data-c="built" type="number" min="0" step="1" value="${m.built ?? ""}"></label>
          <label class="campo"><span>Recámaras</span><input data-c="beds" type="number" min="0" step="1" value="${m.beds ?? ""}"></label>
          <label class="campo"><span>Baños</span><input data-c="baths" type="number" min="0" step="0.5" value="${m.baths ?? ""}"></label>
          <label class="campo"><span>Estacionamientos</span><input data-c="parking" type="number" min="0" step="1" value="${m.parking ?? ""}"></label>
        </div>
        <label class="campo"><span>Descripción</span><textarea data-c="description" rows="4">${m.description || ""}</textarea></label>
        <label class="campo"><span>Descripción en inglés (opcional)</span><textarea data-en="description" rows="3">${(m.en && m.en.description) || ""}</textarea></label>

        <span class="campo__titulo">Fotos de este modelo</span>
        <div class="soltar soltar--modelo" data-soltar="${k}" tabindex="0" role="button">
          <b>Arrastra las fotos del ${m.name || "Tipo " + letra(k)}</b>
          <span>se optimizan solas al subirlas</span>
        </div>
        <div class="galeria galeria--modelo">
          ${(m.images || []).map((src, i) => `
            <figure class="foto">
              <button class="foto__quitar" type="button" data-qf="${k}:${i}" aria-label="Quitar">×</button>
              <img src="${verFoto(src, 400)}" alt="">
            </figure>`).join("")}
        </div>
      </article>`).join("");
  };

  $("#btnModelo")?.addEventListener("click", () => {
    modelos.push({ name: "Tipo " + letra(modelos.length), built: null, beds: null, baths: null, parking: null, description: "", images: [], alts: [], en: null });
    pintarModelos();
    sucio = true;
  });

  $("#modelos")?.addEventListener("input", (e) => {
    const art = e.target.closest("[data-m]");
    if (!art) return;
    const m = modelos[+art.dataset.m];
    const campo = e.target.dataset.c, ingles = e.target.dataset.en;
    if (campo) {
      const v = e.target.value;
      m[campo] = e.target.type === "number" ? (v === "" ? null : Number(v)) : v;
    } else if (ingles) {
      m.en = m.en || {};
      m.en[ingles] = e.target.value;
    }
    sucio = true;
  });

  $("#modelos")?.addEventListener("click", async (e) => {
    const quitar = e.target.closest("[data-quitar-modelo]");
    const subir = e.target.closest("[data-subir]");
    const bajar = e.target.closest("[data-bajar]");
    const quitarFoto = e.target.closest("[data-qf]");

    if (quitar) {
      const k = +quitar.dataset.quitarModelo;
      if (!(await confirmar("¿Quitar el modelo?", `Se eliminará «${modelos[k].name || "Tipo " + letra(k)}» con sus fotos al guardar.`, "Sí, quitarlo"))) return;
      const propias = (modelos[k].images || []).filter((u) => String(u).includes(`/${BUCKET}/`));
      modelos.splice(k, 1);
      pintarModelos(); sucio = true;
      if (propias.length) borrarDelAlmacen(propias);
    }
    if (subir)  { const k = +subir.dataset.subir;  [modelos[k - 1], modelos[k]] = [modelos[k], modelos[k - 1]]; pintarModelos(); sucio = true; }
    if (bajar)  { const k = +bajar.dataset.bajar;  [modelos[k + 1], modelos[k]] = [modelos[k], modelos[k + 1]]; pintarModelos(); sucio = true; }
    if (quitarFoto) {
      const [k, i] = quitarFoto.dataset.qf.split(":").map(Number);
      const url = modelos[k].images[i];
      modelos[k].images.splice(i, 1);
      (modelos[k].alts || []).splice(i, 1);
      pintarModelos(); sucio = true;
      if (url && String(url).includes(`/${BUCKET}/`)) borrarDelAlmacen([url]);
    }
    const zona = e.target.closest("[data-soltar]");
    if (zona) $(`#archivosModelo`).dataset.modelo = zona.dataset.soltar, $("#archivosModelo").click();
  });

  // Entrada de archivos compartida por todos los modelos
  const entradaModelo = document.createElement("input");
  entradaModelo.type = "file"; entradaModelo.accept = "image/*"; entradaModelo.multiple = true;
  entradaModelo.id = "archivosModelo"; entradaModelo.hidden = true;
  document.body.appendChild(entradaModelo);
  entradaModelo.addEventListener("change", async (e) => {
    const k = +entradaModelo.dataset.modelo;
    await subirAModelo(k, e.target.files);
    e.target.value = "";
  });

  $("#modelos")?.addEventListener("dragover", (e) => {
    const z = e.target.closest("[data-soltar]"); if (!z) return;
    e.preventDefault(); z.classList.add("es-encima");
  });
  $("#modelos")?.addEventListener("dragleave", (e) => e.target.closest("[data-soltar]")?.classList.remove("es-encima"));
  $("#modelos")?.addEventListener("drop", (e) => {
    const z = e.target.closest("[data-soltar]"); if (!z) return;
    e.preventDefault(); z.classList.remove("es-encima");
    subirAModelo(+z.dataset.soltar, e.dataTransfer.files);
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

  // Sube un grupo de archivos y devuelve las direcciones públicas.
  // Lo usan tanto la galería principal como la de cada modelo.
  const subirArchivos = async (archivos, carpeta, aviso) => {
    const validos = [...archivos].filter((a) => /^image\//.test(a.type));
    const urls = [];
    let ahorro = 0, pesadas = 0, n = 0;

    for (const original of validos) {
      n++;
      if (aviso) aviso(`Subiendo ${n} de ${validos.length}…`);
      const archivo = await optimizar(original);
      ahorro += original.size - archivo.size;
      if (archivo.size > 8 * 1024 * 1024) { pesadas++; continue; }

      const ext = (archivo.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "");
      const ruta = `${carpeta}/${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}.${ext}`;
      const { error } = await sb.storage.from(BUCKET).upload(ruta, archivo, { cacheControl: "31536000", upsert: false });
      if (error) { avisar("#avisoFotos", "No se pudo subir " + original.name + ": " + error.message); continue; }
      urls.push(sb.storage.from(BUCKET).getPublicUrl(ruta).data.publicUrl);
    }
    return { urls, ahorro, pesadas, total: validos.length };
  };

  const subirAModelo = async (k, archivos) => {
    const zona = $(`[data-soltar="${k}"]`);
    const original = zona ? zona.innerHTML : "";
    const carpeta = `${idParaFotos()}/modelo-${k + 1}`;
    const r = await subirArchivos(archivos, carpeta, (txt) => { if (zona) zona.innerHTML = `<b>${txt}</b>`; });
    if (zona) zona.innerHTML = original;
    if (!r.urls.length) return;
    modelos[k].images = (modelos[k].images || []).concat(r.urls);
    modelos[k].alts = (modelos[k].alts || []).concat(r.urls.map(() => ""));
    pintarModelos();
    sucio = true;
    brindis(`${r.urls.length} foto(s) agregadas al modelo. Recuerda guardar.`);
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
    if (!(await confirmar("¿Quitar la fotografía?", "Se eliminará de esta propiedad al guardar.", "Sí, quitarla"))) return;
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

  /* ---------- Enlaces de recorrido y video ---------- */
  // Si el enlace va sin "https://" el sitio no sabe a dónde apunta y termina
  // mostrando la propia página dentro del recuadro. Se corrige aquí mismo.
  const normalizarEnlace = (campo, aviso) => {
    const el = $(campo);
    el.addEventListener("blur", () => {
      const txt = el.value.trim();
      $(aviso).textContent = "";
      if (!txt) { el.value = ""; return; }
      const completo = /^https?:\/\//i.test(txt) ? txt : `https://${txt.replace(/^\/+/, "")}`;
      try {
        const u = new URL(completo);
        if (!u.hostname.includes(".")) throw new Error("sin dominio");
        if (u.origin === location.origin) throw new Error("es el propio sitio");
        if (el.value !== u.href) { el.value = u.href; sucio = true; }
      } catch (err) {
        $(aviso).textContent = "Eso no parece una dirección de internet. Copia el enlace completo, empezando por https://";
      }
    });
  };
  normalizarEnlace("#f-tour360", "#avisoTour");
  normalizarEnlace("#f-video", "#avisoVideoEnlace");

  /* ---------- Video subido al almacén ---------- */
  const entradaVideo = document.createElement("input");
  entradaVideo.type = "file"; entradaVideo.accept = "video/mp4,video/webm,video/quicktime"; entradaVideo.hidden = true;
  document.body.appendChild(entradaVideo);

  $("#btnVideo")?.addEventListener("click", () => entradaVideo.click());

  entradaVideo.addEventListener("change", async (e) => {
    const archivo = e.target.files[0];
    e.target.value = "";
    if (!archivo) return;
    const aviso = $("#avisoVideo");
    const MB = archivo.size / 1048576;

    if (MB > 45) {
      aviso.textContent = `Ese video pesa ${MB.toFixed(0)} MB y el límite por archivo es 45 MB. Súbelo a YouTube y pega el enlace: así no hay límite de peso.`;
      return;
    }
    if (MB > 20 && !(await confirmar("¿Subir un video de " + MB.toFixed(0) + " MB?",
        "Los videos pesados consumen rápido el plan gratuito de Supabase. Subirlo a YouTube y pegar el enlace es gratis y carga más rápido en celulares."))) return;

    aviso.textContent = "Subiendo video…";
    const ext = (archivo.name.split(".").pop() || "mp4").toLowerCase().replace(/[^a-z0-9]/g, "");
    const ruta = `${idParaFotos()}/video-${Date.now().toString(36)}.${ext}`;
    const { error } = await sb.storage.from(BUCKET).upload(ruta, archivo, { cacheControl: "31536000", upsert: false });
    if (error) { aviso.textContent = "No se pudo subir: " + error.message; return; }

    $("#f-video").value = sb.storage.from(BUCKET).getPublicUrl(ruta).data.publicUrl;
    aviso.textContent = `Video subido (${MB.toFixed(1)} MB). Recuerda guardar.`;
    sucio = true;
  });

  /* ---------- Guardar ---------- */
  const numero = (id) => { const v = $(id).value.trim(); return v === "" ? null : Number(v); };

  $("#btnGuardar").addEventListener("click", async () => {
    const titulo = $("#f-title").value.trim();
    if (!titulo) { avisar("#avisoForm", "Ponle un nombre a la propiedad."); $("#f-title").focus(); return; }
    if ($("#f-price").value.trim() === "") { avisar("#avisoForm", "Falta el precio."); $("#f-price").focus(); return; }
    if (!$("#f-zone").value.trim()) { avisar("#avisoForm", "Indica la zona: se muestra en las tarjetas y en los filtros."); $("#f-zone").focus(); return; }

    const en = {
      title: $("#f-en-title").value.trim(),
      tag: $("#f-en-tag").value.trim(),
      summary: $("#f-en-summary").value.trim(),
      description: $("#f-en-description").value.trim(),
    };
    const hayEn = Object.values(en).some(Boolean);

    const fila = {
      id: actual.id || idLibre(aSlug(titulo) || `propiedad-${Date.now().toString(36)}`),
      title: titulo,
      zone: $("#f-zone").value.trim(),
      location: $("#f-location").value.trim() || null,
      type: $("#f-type").value,
      operation: $("#f-operation").value,
      price: numero("#f-price"),
      beds: numero("#f-beds"), baths: numero("#f-baths"), parking: numero("#f-parking"),
      built: numero("#f-built"), land: numero("#f-land"),
      featured: $("#f-featured").checked,
      published: $("#f-published").checked,
      tag: $("#f-tag").value.trim() || null,
      tour360: $("#f-tour360").value.trim() || null,
      video: $("#f-video").value.trim() || null,
      summary: $("#f-summary").value.trim(),
      description: $("#f-description").value.trim(),
      amenities: amenidades,
      variants: modelos.map((m) => ({
        name: m.name || "",
        built: m.built ?? null, beds: m.beds ?? null, baths: m.baths ?? null, parking: m.parking ?? null,
        description: m.description || "",
        images: m.images || [], alts: m.alts || [],
        en: m.en && Object.values(m.en).some(Boolean) ? m.en : null,
      })),
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
      `Se quitará «${actual.title}» del sitio junto con sus fotografías. Esta acción no se puede deshacer.`,
      "Sí, eliminar");
    if (!ok) return;

    const delAlmacen = [...(actual.images || []), actual.video]
      .concat(...(actual.variants || []).map((m) => m.images || []));
    const propias = delAlmacen.filter((u) => typeof u === "string" && u.includes(`/${BUCKET}/`));
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

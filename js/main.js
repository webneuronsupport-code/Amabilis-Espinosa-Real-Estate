/* =========================================================
   Amábilis & Espinosa — Interacciones y animaciones
   ========================================================= */
(() => {
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const page = document.body.dataset.page;
  const T = window.I18N || { lang: "es", t: (es) => es, tr: (x) => x, apply() {}, setLang() {}, urlFor: (l) => location.pathname, localizeHref: (h) => h };
  const t = T.t;
  const en = T.lang === "en";
  T.apply();
  const params = new URLSearchParams(location.search);
  const hasGSAP = typeof window.gsap !== "undefined";
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  document.documentElement.classList.remove("no-js");
  if (!hasGSAP || reduced) document.documentElement.classList.add("reduced");
  if (hasGSAP) gsap.registerPlugin(ScrollTrigger);
  let cursor;

  /* ---------- Medición de conversiones (Google Ads / GA4 vía GTM) ---------- */
  window.dataLayer = window.dataLayer || [];
  // Contexto de la propiedad para atribuir conversiones en fichas
  const currentProperty = page === "propiedad" ? (PROPERTIES.find((x) => x.id === params.get("id")) || PROPERTIES[0]) : null;
  const propertyData = currentProperty
    ? { property_id: currentProperty.id, property_zone: currentProperty.zone, property_type: currentProperty.type, property_operation: currentProperty.operation }
    : {};
  const track = (event, data = {}) => {
    const payload = { event, page_type: page, language: T.lang, ...propertyData, ...data };
    window.dataLayer.push(payload);
    if (/localhost|127\.0\.0\.1/.test(location.hostname)) console.info("[dataLayer]", payload);
  };
  document.addEventListener("click", (e) => {
    const a = e.target.closest("a");
    if (!a) return;
    const href = a.getAttribute("href") || "";
    const loc = { link_location: a.dataset.loc || page };
    // Solo contactos al número del negocio (no los botones de "compartir")
    if (/wa\.me\/\d/.test(href)) track("click_whatsapp", loc);
    else if (href.startsWith("tel:")) track("click_phone", loc);
    else if (href.startsWith("mailto:")) track("click_email", loc);
  });

  /* ---------- Iconos ---------- */
  const I = {
    arrow: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
    bed: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 18V7M21 18v-5a3 3 0 0 0-3-3h-8v6M3 15h18M7 12a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"/></svg>',
    bath: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4 12h16v3a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5v-3ZM6 12V5a2 2 0 0 1 4 0M7 20l-1 2M17 20l1 2"/></svg>',
    car: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M5 17h14M3 13l2-6h14l2 6v5h-3v-2H6v2H3v-5ZM3 13h18M7 15h.01M17 15h.01"/></svg>',
    area: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 9V3h6M21 9V3h-6M3 15v6h6M21 15v6h-6"/></svg>',
    land: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 20h18M5 20l4-9 4 5 3-4 3 8M17 6a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"/></svg>',
    wa: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.1l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.2-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.1 5.1 0 0 0 1.1 2.7 11.7 11.7 0 0 0 4.5 4c1.7.7 2.3.8 3.2.6.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.2-1.2-.1-.1-.2-.2-.5-.3Z"/></svg>',
    phone: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2Z"/></svg>',
    mail: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></svg>',
    pin: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 21s-7-6.2-7-12a7 7 0 0 1 14 0c0 5.8-7 12-7 12Z"/><circle cx="12" cy="9" r="2.5"/></svg>',
    clock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
    check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="m5 12 5 5L20 7"/></svg>',
    play: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M7 4v16l13-8L7 4Z"/></svg>',
    close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M6 6l12 12M18 6 6 18"/></svg>',
    prev: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M19 12H5M11 6l-6 6 6 6"/></svg>',
    ig: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r=".8" fill="currentColor"/></svg>',
    fb: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M14 8h3V4h-3a4 4 0 0 0-4 4v2H8v4h2v8h4v-8h3l1-4h-4V8Z"/></svg>',
    tt: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M16.5 3a4.5 4.5 0 0 0 4.5 4.5v3.3a7.7 7.7 0 0 1-4.5-1.4v6.3A6.3 6.3 0 1 1 10.2 9.4v3.4a3 3 0 1 0 2.9 3V3h3.4Z"/></svg>',
    yt: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M21.6 7.2a2.5 2.5 0 0 0-1.8-1.8C18.2 5 12 5 12 5s-6.2 0-7.8.4A2.5 2.5 0 0 0 2.4 7.2 26 26 0 0 0 2 12a26 26 0 0 0 .4 4.8 2.5 2.5 0 0 0 1.8 1.8C5.8 19 12 19 12 19s6.2 0 7.8-.4a2.5 2.5 0 0 0 1.8-1.8A26 26 0 0 0 22 12a26 26 0 0 0-.4-4.8ZM10 15V9l5.2 3L10 15Z"/></svg>',
    x: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.5 3h3.1l-6.8 7.8L21.8 21h-6.2l-4.9-6.4L5.1 21H2l7.3-8.3L2.4 3h6.4l4.4 5.8L17.5 3Zm-1.1 16.1h1.7L7.7 4.8H5.9l10.5 14.3Z"/></svg>',
  };
  window.ICONS = I;

  const btn = (label, href, cls = "", extra = "") =>
    `<a href="${href}" class="btn ${cls}" data-magnetic ${extra}><span class="btn__label"><span>${label}</span><span>${label}</span></span>${I.arrow}</a>`;

  /* ---------- Selector de idioma ---------- */
  const langSwitch = (where) => `
    <div class="lang lang--${where} is-${T.lang}" role="group" aria-label="Idioma">
      <span class="lang__pill" aria-hidden="true"></span>
      <a href="${T.urlFor("es")}" class="lang__opt" data-lang="es" hreflang="es" lang="es" ${T.lang === "es" ? 'aria-current="true"' : ""}>ES</a>
      <a href="${T.urlFor("en")}" class="lang__opt" data-lang="en" hreflang="en" lang="en" ${T.lang === "en" ? 'aria-current="true"' : ""}>EN</a>
    </div>`;
  document.addEventListener("click", (e) => {
    const opt = e.target.closest(".lang__opt");
    if (!opt) return;
    e.preventDefault();
    const target = opt.dataset.lang;
    if (target === T.lang) return;
    track("language_change", { language_to: target });
    $$(".lang").forEach((l) => l.classList.replace(`is-${T.lang}`, `is-${target}`));
    const go = () => T.setLang(target);
    if (hasGSAP && !reduced) {
      const veil = document.createElement("div");
      veil.className = "lang-veil";
      veil.innerHTML = `<span>${target === "en" ? "English" : "Español"}</span>`;
      document.body.append(veil);
      gsap.timeline({ onComplete: go })
        .fromTo(veil, { clipPath: "inset(100% 0 0 0)" }, { clipPath: "inset(0% 0 0 0)", duration: 0.7, ease: "expo.inOut" }, 0.15)
        .from(veil.firstChild, { yPercent: 100, opacity: 0, duration: 0.5, ease: "expo.out" }, 0.5);
    } else go();
  });

  /* ---------- Layout compartido ---------- */

  // Redes sociales del negocio (un solo lugar para los tres bloques)
  const redes = (donde = "header") => [
    ["WhatsApp", "whatsapp", waLink(), I.wa],
    ["Facebook", "facebook", SITE.facebook, I.fb],
    ["Instagram", "instagram", SITE.instagram, I.ig],
    ["YouTube", "youtube", SITE.youtube, I.yt],
    ["TikTok", "tiktok", SITE.tiktok, I.tt],
    ["X", "x", SITE.x, I.x],
  ].filter(([, , url]) => url).map(([nombre, red, url, icono]) =>
    `<a href="${url}" target="_blank" rel="noopener" aria-label="${nombre}" data-red="${red}" data-loc="${donde}">${icono}</a>`).join("");

  const NAV = [
    ["Inicio", "index.html", "home"],
    ["Propiedades", "propiedades.html", "propiedades"],
    ["Nosotros", "nosotros.html", "nosotros"],
    ["Blog", "blog.html", "blog"],
    ["Contacto", "contacto.html", "contacto"],
  ];
  const activeKey = page === "propiedad" ? "propiedades" : page === "post" ? "blog" : page;
  // Logo oficial (piezas en img/logo-sprite.svg): escudo dorado + nombre que toma el color del contexto
  const logo = `<a href="index.html" class="logo" aria-label="Amábilis & Espinosa, inicio"><svg class="logo__crest" viewBox="0 0 298.7 333.2" aria-hidden="true"><use href="img/logo-sprite.svg?v=2#crest"/></svg><svg class="logo__word" viewBox="0 0 587.4 97.3" aria-hidden="true"><use href="img/logo-sprite.svg?v=2#wordmark"/></svg></a>`;

  const header = document.createElement("header");
  header.className = "header" + (document.body.dataset.header === "dark" ? " header--dark" : "");
  header.innerHTML = `
    <div class="container header__inner">
      ${logo}
      <nav class="nav" aria-label="Principal">
        ${NAV.filter(([, , k]) => k !== "contacto").map(([t, h, k]) => `<a href="${h}" class="${k === activeKey ? "is-active" : ""}">${t}</a>`).join("")}
      </nav>
      <div class="header__actions">
        <a href="aviso-de-privacidad.html" class="header__legal">Política de privacidad</a>
        <div class="header__social">${redes()}</div>
        ${langSwitch("header")}
        <button class="burger" aria-label="Abrir menú" aria-expanded="false"><span></span><span></span></button>
      </div>
    </div>`;
  document.body.prepend(header);

  const menu = document.createElement("div");
  menu.className = "menu";
  menu.setAttribute("aria-hidden", "true");
  menu.innerHTML = `
    <div class="menu__grid">
      <ul class="menu__links">${NAV.map(([t, h]) => `<li><a href="${h}">${t}</a></li>`).join("")}</ul>
      <div class="menu__side">
        <div class="menu__img"><img src="${U(IMG.living1, 900)}" alt="Interior de residencia de lujo" loading="lazy"></div>
        ${langSwitch("menu")}
        <div class="socials socials--menu">${redes("menu")}</div>
        <div class="menu__meta">
          <a href="aviso-de-privacidad.html">Política de privacidad</a>
          <a href="tel:${SITE.phone.replace(/\s/g, "")}" data-loc="menu">${SITE.phone}</a>
          <a href="mailto:${SITE.email}" data-loc="menu">${SITE.email}</a>
          <span>${SITE.address}</span>
        </div>
        ${btn("Escríbenos por WhatsApp", waLink(), "btn--gold", 'target="_blank" rel="noopener" data-loc="menu"')}
      </div>
    </div>`;
  header.after(menu);

  const footer = document.createElement("footer");
  footer.className = "footer";
  footer.innerHTML = `
    <div class="container">
      <div class="footer__top">
        <div class="footer__brand">
          ${logo}
          <p>Servicio inmobiliario personalizado para comprar, vender y rentar propiedades en el Estado de México y CDMX.</p>
          <div class="socials">${redes("footer")}</div>
        </div>
        <div><h4>Explora</h4><ul>${NAV.map(([t, h]) => `<li><a href="${h}">${t}</a></li>`).join("")}</ul></div>
        <div><h4>Zonas</h4><ul>${ZONES.map((z) => `<li><a href="propiedades.html?zona=${encodeURIComponent(z.name)}">${z.name}</a></li>`).join("")}</ul></div>
        <div><h4>Contacto</h4><ul>
          <li><a href="tel:${SITE.phone.replace(/\s/g, "")}" data-loc="footer">${SITE.phone}</a></li>
          <li><a href="mailto:${SITE.email}" data-loc="footer">${SITE.email}</a></li>
          <li><a href="${waLink()}" target="_blank" rel="noopener" data-loc="footer">WhatsApp</a></li>
          <li><p>${SITE.hours}</p></li>
        </ul></div>
      </div>
      <svg class="footer__logo" viewBox="48 50 596 506" role="img" aria-label="Amábilis & Espinosa Real Estate — Construyendo tu historia">
        <use class="footer__logo-crest" href="img/logo-sprite.svg?v=2#crest" x="189.7" y="54.2" width="298.7" height="333.2"/>
        <use class="footer__logo-word" href="img/logo-sprite.svg?v=2#wordmark" x="52.1" y="398.6" width="587.4" height="97.3"/>
        <use class="footer__logo-tag" href="img/logo-sprite.svg?v=2#tagline" x="142" y="489" width="417.8" height="63"/>
      </svg>
      <div class="footer__bottom">
        <span>© ${new Date().getFullYear()} Amábilis &amp; Espinosa Real Estate. ${t("Todos los derechos reservados.", "All rights reserved.")}</span>
        <span><a href="aviso-de-privacidad.html">Política de privacidad</a> · <a href="aviso-de-privacidad.html#nom-247">Carta de derechos NOM-247</a></span>
      </div>
    </div>`;
  document.body.append(footer);

  const wa = document.createElement("a");
  wa.className = "wa-float";
  wa.href = waLink();
  wa.target = "_blank";
  wa.rel = "noopener";
  wa.dataset.loc = "float";
  wa.setAttribute("aria-label", "Escríbenos por WhatsApp");
  wa.innerHTML = `${I.wa}<span>¿Hablamos?</span>`;
  document.body.append(wa);

  /* ---------- Componentes ---------- */
  const specsHTML = (p) => {
    const s = [];
    if (p.beds) s.push(`<span>${I.bed}${p.beds} ${t("rec.", "bd")}</span>`);
    if (p.baths) s.push(`<span>${I.bath}${p.baths} ${t("baños", "ba")}</span>`);
    if (p.built) s.push(`<span>${I.area}${p.built} m²</span>`);
    else if (p.land) s.push(`<span>${I.land}${p.land.toLocaleString("es-MX")} m²</span>`);
    return s.join("");
  };
  const propCard = (p) => `
    <a href="propiedad.html?id=${p.id}" class="prop-card" data-cursor="Ver">
      <div class="prop-card__media">
        <img src="${imgSrc(p.images[0], 900)}" alt="${p.alts ? p.alts[0] : `${p.title} ${t("en", "in")} ${p.location}`}" loading="lazy">
        <div class="prop-card__tags">
          <span class="pill ${p.operation === "Renta" ? "pill--dark" : ""}">${p.operation}</span>
          ${p.tag && p.tag !== p.operation ? `<span class="pill pill--gold">${p.tag}</span>` : ""}
        </div>
        <div class="prop-card__price">${fmtPrice(p)}</div>
      </div>
      <div class="prop-card__body">
        <div class="prop-card__loc">${T.tr(p.type)} · ${T.tr(p.zone)}</div>
        <div class="prop-card__title">${p.title}</div>
        <div class="prop-card__specs">${specsHTML(p)}</div>
        ${p.summary ? `<p class="prop-card__sum">${p.summary}</p>` : ""}
      </div>
    </a>`;
  const postCard = (p) => `
    <a href="post.html?id=${p.id}" class="post-card" data-cursor="${p.category === "Reels" ? "Play" : "Leer"}">
      <div class="post-card__media">
        <img src="${U(p.cover, 1000)}" alt="${p.title}" loading="lazy">
        <span class="pill">${p.category}</span>
        ${p.category === "Reels" ? `<span class="post-card__play">${I.play}</span>` : ""}
      </div>
      <div>
        <div class="post-card__meta">${fmtDate(p.date)} · ${p.read}</div>
        <div class="post-card__title">${p.title}</div>
        <p>${p.excerpt}</p>
      </div>
    </a>`;

  /* ---------- Formularios → WhatsApp + evento de conversión ---------- */
  const bindForms = () =>
    $$("form[data-lead]").forEach((f) => {
      // Campo invisible: los robots lo rellenan y así se descartan
      if (!f.querySelector('[name="web"]')) {
        const trampa = document.createElement("input");
        trampa.type = "text"; trampa.name = "web"; trampa.tabIndex = -1;
        trampa.autocomplete = "off"; trampa.setAttribute("aria-hidden", "true");
        trampa.style.cssText = "position:absolute;left:-9999px;width:1px;height:1px;opacity:0";
        f.appendChild(trampa);
      }

      f.addEventListener("submit", async (e) => {
        e.preventDefault();
        if (!f.reportValidity()) return;

        const d = Object.fromEntries(new FormData(f));
        const boton = $("button[type=submit]", f);
        const etiqueta = boton ? boton.innerHTML : "";

        const mensajeWA = [
          t(`Hola, soy ${d.nombre || ""}.`, `Hi, I'm ${d.nombre || ""}.`),
          d.propiedad ? t(`Me interesa: ${d.propiedad}.`, `I'm interested in: ${d.propiedad}.`) : "",
          d.interes ? t(`Busco: ${d.interes}.`, `Looking to: ${T.tr(d.interes)}.`) : "",
          d.mensaje || "",
          `${t("Tel", "Phone")}: ${d.telefono || ""}`,
          d.email ? `${t("Correo", "Email")}: ${d.email}` : "",
        ].filter(Boolean).join("\n");

        if (boton) { boton.disabled = true; boton.textContent = t("Enviando…", "Sending…"); }

        let entregado = false;
        try {
          const r = await fetch("enviar.php", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...d, origen: f.dataset.lead, pagina: location.href }),
          });
          entregado = r.ok && (await r.json().catch(() => ({}))).ok === true;
        } catch (err) {
          entregado = false; // sin PHP (desarrollo local) o sin red
        }

        if (boton) { boton.disabled = false; boton.innerHTML = etiqueta; }
        track("generate_lead", {
          form_location: f.dataset.lead,
          lead_interest: d.interes || (d.propiedad ? "Propiedad" : ""),
          delivery: entregado ? "email" : "whatsapp",
        });

        f.classList.add("is-sent");
        f.reset();

        if (entregado) {
          // Atajo opcional para quien prefiera seguir por WhatsApp
          const ok = $(".form__ok", f);
          if (ok && !$(".form__wa", ok)) {
            const a = document.createElement("a");
            a.className = "form__wa";
            a.href = waLink(mensajeWA);
            a.target = "_blank"; a.rel = "noopener";
            a.dataset.loc = "form-ok";
            a.textContent = t("¿Prefieres WhatsApp? Escríbenos ahora", "Prefer WhatsApp? Message us now");
            ok.appendChild(a);
          }
        } else {
          // Si el correo no salió, el contacto no se pierde: se abre WhatsApp
          window.open(waLink(mensajeWA), "_blank", "noopener");
        }
      });
    });

  /* ---------- Render por página ---------- */
  const renderers = {
    home() {
      const featured = PROPERTIES.filter((p) => p.featured);
      $("#featuredTrack").innerHTML = featured.map(propCard).join("");
      $("#zones").innerHTML = ZONES.map((z, i) => `
        <a href="propiedades.html?zona=${encodeURIComponent(z.name)}" class="zone" data-zone="${i}">
          <span class="zone__n">0${i + 1}</span>
          <span class="zone__name">${T.tr(z.name)}</span>
          <span class="zone__text">${z.text} <br><b style="color:var(--gold)">${((n) => `${n} ${n === 1 ? t("propiedad", "property") : t("propiedades", "properties")}`)(PROPERTIES.filter((p) => p.zone === z.name).length)}</b></span>
          <span class="zone__arrow">${I.arrow}</span>
        </a>`).join("");
      $("#zonePreview").innerHTML = ZONES.map((z) => `<img src="${U(z.img, 700)}" alt="">`).join("");
      $("#blogPreview").innerHTML = POSTS.slice(0, 3).map(postCard).join("");
      const zoneSel = $("#s-zona");
      zoneSel.innerHTML += ZONES.map((z) => `<option value="${z.name}">${z.name}</option>`).join("");
      $("#heroSearch").addEventListener("submit", (e) => {
        e.preventDefault();
        const q = new URLSearchParams();
        [["op", "#s-op"], ["tipo", "#s-tipo"], ["zona", "#s-zona"]].forEach(([k, s]) => $(s).value && q.set(k, $(s).value));
        track("search", { search_term: q.toString() });
        location.href = T.localizeHref(`propiedades.html?${q}`);
      });
      testimonials();
    },

    propiedades() {
      const grid = $("#propGrid");
      const state = { op: params.get("op") || "", tipo: params.get("tipo") || "", zona: params.get("zona") || "", orden: "" };
      const zSel = $("#f-zona"), tSel = $("#f-tipo"), oSel = $("#f-orden");
      zSel.innerHTML += ZONES.map((z) => `<option value="${z.name}">${z.name}</option>`).join("");
      tSel.innerHTML += [...new Set(PROPERTIES.map((p) => p.type))].map((type) => `<option value="${type}">${type}</option>`).join("");
      zSel.value = state.zona; tSel.value = state.tipo;
      const chips = $$("#f-op .chip");
      const apply = (animate = true) => {
        chips.forEach((c) => c.classList.toggle("is-active", c.dataset.value === state.op));
        let list = PROPERTIES.filter((p) =>
          (!state.op || p.operation === state.op) && (!state.tipo || p.type === state.tipo) && (!state.zona || p.zone === state.zona));
        if (state.orden === "asc") list.sort((a, b) => a.price - b.price);
        if (state.orden === "desc") list.sort((a, b) => b.price - a.price);
        const draw = () => {
          grid.innerHTML = list.map(propCard).join("");
          $("#resultsCount").textContent = `${list.length} ${list.length === 1 ? t("propiedad encontrada", "property found") : t("propiedades encontradas", "properties found")}`;
          $("#empty").classList.toggle("is-visible", !list.length);
          bindCursorTargets();
          if (hasGSAP && !reduced) {
            gsap.fromTo(grid.children, { y: 60, opacity: 0 }, { y: 0, opacity: 1, duration: 1, stagger: 0.08, ease: "expo.out" });
            ScrollTrigger.refresh();
          }
        };
        const q = new URLSearchParams();
        ["op", "tipo", "zona"].forEach((k) => state[k] && q.set(k, state[k]));
        if (en) q.set("lang", "en");
        history.replaceState(null, "", q.toString() ? `?${q}` : location.pathname);
        if (animate && hasGSAP && !reduced && grid.children.length)
          gsap.to(grid.children, { y: -20, opacity: 0, duration: 0.3, stagger: 0.02, ease: "power2.in", onComplete: draw });
        else draw();
      };
      chips.forEach((c) => c.addEventListener("click", () => { state.op = c.dataset.value; apply(); }));
      zSel.addEventListener("change", () => { state.zona = zSel.value; apply(); });
      tSel.addEventListener("change", () => { state.tipo = tSel.value; apply(); });
      oSel.addEventListener("change", () => { state.orden = oSel.value; apply(); });
      $("#resetFilters").addEventListener("click", () => {
        Object.assign(state, { op: "", tipo: "", zona: "" }); zSel.value = ""; tSel.value = ""; apply();
      });
      apply(false);
    },

    propiedad() {
      const p = PROPERTIES.find((x) => x.id === params.get("id")) || PROPERTIES[0];
      const opEn = p.operation === "Renta" ? "for rent" : "for sale";
      document.title = t(`${p.title} · ${p.type} en ${p.operation.toLowerCase()} en ${p.zone}`, `${p.title} · ${T.tr(p.type)} ${opEn} in ${T.tr(p.zone)}`) + " | Amábilis & Espinosa";
      $('meta[name="description"]').setAttribute("content", t(`${p.type} en ${p.operation.toLowerCase()} en ${p.location}. ${p.summary}`, `${T.tr(p.type)} ${opEn} in ${p.location}. ${p.summary}`));
      const imgs = p.images;
      $("#gallery").innerHTML = imgs.map((id, i) => `
        <button class="gallery__item" data-index="${i}" data-cursor="Ampliar" aria-label="${t("Ver foto", "View photo")} ${i + 1}">
          <img src="${imgSrc(id, i === 0 ? 1600 : 900)}" alt="${p.alts?.[i] || `${p.title} — ${t("foto", "photo")} ${i + 1}`}" ${i ? 'loading="lazy"' : ""}>
          ${i === Math.min(imgs.length, 5) - 1 ? `<span class="pill gallery__more">${t(`Ver ${imgs.length} fotos`, `View ${imgs.length} photos`)}</span>` : ""}
        </button>`).join("");
      const propertyMsg = t(`Hola, me interesa la propiedad "${p.title}" (${location.href}). ¿Me pueden dar más información?`, `Hi, I'm interested in the property "${p.title}" (${location.href}). Could you send me more information?`);
      const specs = [
        p.beds && [I.bed, p.beds, "Recámaras"],
        p.baths && [I.bath, p.baths, "Baños"],
        p.parking && [I.car, p.parking, "Estacionamientos"],
        p.built && [I.area, `${p.built.toLocaleString("es-MX")} m²`, "Construcción"],
        p.land && [I.land, `${p.land.toLocaleString("es-MX")} m²`, "Terreno"],
      ].filter(Boolean);
      $("#detail").innerHTML = `
        <div>
          <div class="detail__head">
            <nav class="breadcrumbs"><a href="index.html">Inicio</a>/<a href="propiedades.html">Propiedades</a>/<span>${p.zone}</span></nav>
            <h1 data-split>${p.title}</h1>
            <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:18px">
              <span class="pill pill--dark">${p.operation}</span><span class="pill" style="box-shadow:inset 0 0 0 1px var(--line)">${p.type}</span>
              ${p.tag && p.tag !== p.operation ? `<span class="pill pill--gold">${p.tag}</span>` : ""}
            </div>
            <div style="display:flex;align-items:center;gap:8px;color:var(--muted)">${I.pin.replace("<svg", '<svg width="18" height="18"')}${p.location}</div>
            ${p.summary ? `<p class="detail__lead" data-fade>${p.summary}</p>` : ""}
          </div>
          <div class="specs" data-fade>${specs.map(([ic, v, l]) => `<div class="spec">${ic}<b>${v}</b><span>${l}</span></div>`).join("")}</div>
          <div class="detail__price" data-fade>${fmtPrice(p)}</div>
          <h2 data-fade>Sobre la propiedad</h2>
          <p class="detail__desc" data-fade>${p.description}</p>
          <h2 data-fade>Características</h2>
          <ul class="amenities" data-fade>${p.amenities.map((a) => `<li>${I.check}${a}</li>`).join("")}</ul>
          <h2 data-fade>Ubicación</h2>
          <div class="map" data-fade><iframe loading="lazy" title="Mapa de ${p.location}" src="https://maps.google.com/maps?q=${encodeURIComponent(p.location)}&z=13&output=embed"></iframe></div>
        </div>
        <aside class="agent-card" data-fade>
          <span class="eyebrow">Agenda tu visita</span>
          <h3 style="margin-top:14px">¿Te interesa esta propiedad?</h3>
          <p>Un asesor te responde en minutos con información, precio final y horarios de visita.</p>
          <div class="agent-card__actions">
            ${btn("WhatsApp", waLink(propertyMsg), "btn--wa btn--block", 'target="_blank" rel="noopener" data-loc="property"')}
            ${btn("Llamar ahora", `tel:${SITE.phone.replace(/\s/g, "")}`, "btn--ghost btn--block", 'data-loc="property"')}
          </div>
          <form class="form" data-lead="property" novalidate>
            <input type="hidden" name="propiedad" value="${p.title}">
            <input type="hidden" name="propiedad_id" value="${p.id}">
            <div class="field"><input id="pn" name="nombre" placeholder=" " required><label for="pn">Nombre</label></div>
            <div class="field"><input id="pt" name="telefono" type="tel" placeholder=" " required><label for="pt">Teléfono</label></div>
            <div class="field"><input id="pe" name="email" type="email" placeholder=" " required autocomplete="email"><label for="pe">Correo electrónico*</label></div>
            <button class="btn btn--block" type="submit"><span class="btn__label"><span>Solicitar información</span><span>Solicitar información</span></span>${I.arrow}</button>
            <div class="form__ok">¡Gracias! Te contactaremos muy pronto.</div>
          </form>
        </aside>`;
      // Barra de contacto fija en celular
      const bar = document.createElement("div");
      bar.className = "mbar";
      bar.innerHTML = `
        <div class="mbar__price"><small>${p.operation}</small>${fmtPrice(p)}</div>
        <a class="mbar__icon" href="tel:${SITE.phone.replace(/\s/g, "")}" data-loc="property-bar" aria-label="Llamar">${I.phone}</a>
        <a class="mbar__wa" href="${waLink(propertyMsg)}" target="_blank" rel="noopener" data-loc="property-bar">${I.wa}<span>WhatsApp</span></a>`;
      document.body.append(bar);
      document.body.classList.add("has-mbar");

      const similar = PROPERTIES.filter((x) => x.id !== p.id && (x.zone === p.zone || x.type === p.type)).slice(0, 3);
      $("#similar").innerHTML = similar.map(propCard).join("");
      // Datos estructurados
      const ld = document.createElement("script");
      ld.type = "application/ld+json";
      ld.textContent = JSON.stringify({
        "@context": "https://schema.org", "@type": "RealEstateListing", name: p.title, description: p.description,
        image: imgs.map((i) => new URL(imgSrc(i), location.href).href), url: location.href,
        offers: { "@type": "Offer", price: p.price, priceCurrency: "MXN", businessFunction: p.operation === "Renta" ? "LeaseOut" : "Sell" },
        address: { "@type": "PostalAddress", addressLocality: p.zone, addressRegion: p.location },
      });
      document.head.append(ld);
      lightbox(imgs.map((i) => imgSrc(i, 2000)), p.title, p.alts);
    },

    blog() {
      const grid = $("#blogGrid");
      const chips = $$("#b-cat .chip");
      let cat = params.get("cat") || "";
      const draw = () => {
        chips.forEach((c) => c.classList.toggle("is-active", c.dataset.value === cat));
        const list = POSTS.filter((p) => !cat || p.category === cat);
        grid.classList.toggle("blog-grid--feature", !cat);
        grid.innerHTML = list.map(postCard).join("");
        bindCursorTargets();
        if (hasGSAP && !reduced) {
          gsap.fromTo(grid.children, { y: 60, opacity: 0 }, { y: 0, opacity: 1, duration: 1, stagger: 0.08, ease: "expo.out" });
          ScrollTrigger.refresh();
        }
      };
      chips.forEach((c) => c.addEventListener("click", () => { cat = c.dataset.value; draw(); }));
      draw();
    },

    post() {
      const p = POSTS.find((x) => x.id === params.get("id")) || POSTS[0];
      document.title = `${p.title} | Blog Amábilis & Espinosa`;
      $('meta[name="description"]').setAttribute("content", p.excerpt);
      $("#postHero").innerHTML = `
        <div class="page-hero__bg"><img src="${U(p.cover, 2000)}" alt=""></div>
        <div class="container">
          <nav class="breadcrumbs"><a href="index.html">Inicio</a>/<a href="blog.html">Blog</a>/<span>${p.category}</span></nav>
          <h1 data-split style="font-size:clamp(44px,7vw,110px);max-width:16ch">${p.title}</h1>
          <p class="lead">${fmtDate(p.date)} · ${p.read} ${t("de lectura", "read")}</p>
        </div>`;
      let embed = "";
      if (p.category === "Reels") {
        embed = p.video
          ? `<div class="video-embed"><iframe src="${p.video}" allowfullscreen loading="lazy" title="${p.title}"></iframe></div>`
          : `<div class="video-embed" data-fade><img src="${U(p.cover, 800)}" alt=""><div>${I.play.replace("<svg", '<svg width="48" height="48"')}<p style="color:var(--cream);font-size:15px;margin-top:12px">Mira el reel completo en nuestras redes</p>
             <a class="btn btn--gold btn--sm" href="${SITE.instagram}" target="_blank" rel="noopener"><span class="btn__label"><span>Ver en Instagram</span><span>Ver en Instagram</span></span>${I.arrow}</a></div></div>`;
      }
      $("#article").innerHTML = embed + p.body.map((b) => b.startsWith("## ") ? `<h2 data-fade>${b.slice(3)}</h2>` : `<p data-fade>${b}</p>`).join("") + `
        <div class="article__share">${t("Compartir:", "Share:")}
          <a class="chip" style="display:inline-flex;align-items:center" target="_blank" rel="noopener" href="https://wa.me/?text=${encodeURIComponent(p.title + " " + location.href)}">WhatsApp</a>
          <a class="chip" style="display:inline-flex;align-items:center" target="_blank" rel="noopener" href="https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(location.href)}">Facebook</a>
        </div>`;
      $("#related").innerHTML = POSTS.filter((x) => x.id !== p.id).slice(0, 3).map(postCard).join("");
    },

    contacto() {
      const wa = waLink(), tel = `tel:${SITE.phone.replace(/\s/g, "")}`;
      const mapa = `https://maps.google.com/?q=${encodeURIComponent(SITE.address)}`;
      const set = (id, href) => { const el = $(id); if (el) el.href = href; };
      set("#cWa", wa); set("#cTel", tel); set("#cMapa", mapa);

      $("#contactList").innerHTML = [
        [I.wa, "WhatsApp", t("Respuesta inmediata", "Instant reply"), wa, t("Escribir", "Message")],
        [I.phone, t("Teléfono", "Phone"), SITE.phone, tel, t("Llamar", "Call")],
        [I.mail, t("Correo", "Email"), SITE.email, `mailto:${SITE.email}`, t("Escribir", "Write")],
        [I.pin, t("Oficina", "Office"), SITE.address, mapa, t("Ver mapa", "View map")],
      ].map(([ic, l, v, h, cta]) => `<a href="${h}" ${h.startsWith("http") ? 'target="_blank" rel="noopener"' : ""} data-loc="contact-page" class="contact-item" data-fade>
          <span class="contact-item__icon">${ic}</span>
          <span class="contact-item__text"><small>${l}</small><b>${v}</b></span>
          <span class="contact-item__cta">${cta}<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M5 12h14M13 6l6 6-6 6"/></svg></span>
        </a>`).join("");

      const horas = $("#contactHours");
      if (horas) horas.innerHTML = `<span class="eyebrow">${t("Horario de atención", "Opening hours")}</span><b>${SITE.hours}</b>`;
    },
  };

  function testimonials() {
    const q = $("#tQuote"), a = $("#tAuthor"), dots = $("#tDots"), avatar = $("#tAvatar");
    if (!q) return;
    const iniciales = (nombre) => nombre.split(/\s+/).slice(0, 2).map((p) => p[0]).join("");
    let i = 0, timer;
    dots.innerHTML = TESTIMONIALS.map((_, k) => `<button aria-label="${t("Testimonio", "Testimonial")} ${k + 1}"></button>`).join("");
    const show = (n) => {
      i = (n + TESTIMONIALS.length) % TESTIMONIALS.length;
      const t = TESTIMONIALS[i];
      const set = () => {
        q.textContent = `“${t.text}”`;
        a.innerHTML = `${t.name}<span>${t.role}</span>`;
        if (avatar) {
          avatar.innerHTML = t.photo
            ? `<img src="${t.photo}" alt="${t.name}">`
            : `<span>${iniciales(t.name)}</span>`;
        }
        $$("button", dots).forEach((d, k) => d.classList.toggle("is-active", k === i));
      };
      if (hasGSAP && !reduced) {
        gsap.timeline()
          .to([avatar, q, a].filter(Boolean), { opacity: 0, y: -20, duration: 0.4, ease: "power2.in", onComplete: set })
          .fromTo([avatar, q, a].filter(Boolean), { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.9, stagger: 0.08, ease: "expo.out" });
      } else set();
      clearInterval(timer);
      timer = setInterval(() => show(i + 1), 7000);
    };
    $("#tPrev").addEventListener("click", () => show(i - 1));
    $("#tNext").addEventListener("click", () => show(i + 1));
    $$("button", dots).forEach((d, k) => d.addEventListener("click", () => show(k)));
    show(0);
  }

  function lightbox(srcs, title, alts) {
    const lb = document.createElement("div");
    lb.className = "lightbox";
    lb.setAttribute("role", "dialog");
    lb.setAttribute("aria-label", "Galería de fotos");
    lb.innerHTML = `<img alt=""><button class="lightbox__btn lightbox__close" aria-label="Cerrar">${I.close}</button>
      <button class="lightbox__btn lightbox__prev" aria-label="Anterior">${I.prev}</button>
      <button class="lightbox__btn lightbox__next" aria-label="Siguiente">${I.arrow}</button><div class="lightbox__count"></div>`;
    document.body.append(lb);
    const img = $("img", lb);
    let idx = 0;
    const go = (n) => {
      idx = (n + srcs.length) % srcs.length;
      img.src = srcs[idx];
      img.alt = alts?.[idx] || `${title} — ${t("foto", "photo")} ${idx + 1}`;
      $(".lightbox__count", lb).textContent = `${idx + 1} / ${srcs.length}`;
      if (hasGSAP && !reduced) gsap.fromTo(img, { opacity: 0, scale: 0.96 }, { opacity: 1, scale: 1, duration: 0.6, ease: "expo.out" });
    };
    const close = () => { lb.classList.remove("is-open"); document.body.classList.remove("is-locked"); };
    $$(".gallery__item").forEach((g) => g.addEventListener("click", () => {
      lb.classList.add("is-open"); document.body.classList.add("is-locked"); go(+g.dataset.index);
    }));
    $(".lightbox__close", lb).addEventListener("click", close);
    $(".lightbox__prev", lb).addEventListener("click", () => go(idx - 1));
    $(".lightbox__next", lb).addEventListener("click", () => go(idx + 1));
    lb.addEventListener("click", (e) => e.target === lb && close());
    // Deslizar para cambiar de foto en celular
    let x0 = null;
    lb.addEventListener("touchstart", (e) => { x0 = e.touches[0].clientX; }, { passive: true });
    lb.addEventListener("touchend", (e) => {
      if (x0 === null) return;
      const dx = e.changedTouches[0].clientX - x0;
      if (Math.abs(dx) > 50) go(idx + (dx < 0 ? 1 : -1));
      x0 = null;
    });
    document.addEventListener("keydown", (e) => {
      if (!lb.classList.contains("is-open")) return;
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") go(idx - 1);
      if (e.key === "ArrowRight") go(idx + 1);
    });
  }

  /* ---------- Menús desplegables personalizados ---------- */
  const chevron = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="m6 9 6 6 6-6"/></svg>';
  const valueDesc = Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, "value");
  let openDD = null;

  function enhanceSelect(select) {
    if (select.dataset.dd) return;
    select.dataset.dd = 1;
    const field = select.closest(".search__field, .select, .field");
    const dark = !!select.closest(".search");
    const uid = select.id || `dd-${Math.random().toString(36).slice(2, 8)}`;

    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "dd__btn";
    btn.id = `${uid}-dd`;
    btn.setAttribute("aria-haspopup", "listbox");
    btn.setAttribute("aria-expanded", "false");
    btn.innerHTML = `<span class="dd__value"></span><span class="dd__chev">${chevron}</span>`;

    const panel = document.createElement("div");
    panel.className = `dd__panel${dark ? " dd__panel--dark" : ""}`;
    panel.setAttribute("role", "listbox");
    panel.id = `${uid}-list`;
    btn.setAttribute("aria-controls", panel.id);

    select.classList.add("dd-native");
    select.tabIndex = -1;
    select.setAttribute("aria-hidden", "true");
    // El <label> ahora apunta al botón
    const lbl = select.id && document.querySelector(`label[for="${select.id}"]`);
    if (lbl) {
      lbl.htmlFor = btn.id;
      lbl.id = lbl.id || `${uid}-lbl`;
      btn.setAttribute("aria-labelledby", `${lbl.id} ${btn.id}`);
    }
    if (field?.classList.contains("field")) field.append(btn); else select.after(btn);
    field?.classList.add("has-dd");
    document.body.append(panel);

    const sync = () => {
      const o = select.options[select.selectedIndex];
      $(".dd__value", btn).textContent = o ? T.tr(o.textContent.trim()) : "";
      btn.classList.toggle("is-placeholder", !select.value && select.options[0]?.value === "");
    };
    // Mantener sincronizado cuando el código cambia el valor
    Object.defineProperty(select, "value", {
      get() { return valueDesc.get.call(this); },
      set(v) { valueDesc.set.call(this, v); sync(); },
    });
    select.form?.addEventListener("reset", () => setTimeout(sync));
    sync();

    const counts = /zona/i.test(select.id) ? (z) => PROPERTIES.filter((p) => p.zone === z).length : null;

    const build = () => {
      panel.innerHTML = [...select.options].map((o, i) => `
        <div class="dd__opt${o.selected ? " is-selected" : ""}" role="option" tabindex="-1" data-i="${i}" aria-selected="${o.selected}">
          <span>${T.tr(o.textContent.trim())}</span>
          ${counts && o.value ? `<small>${counts(o.value)}</small>` : ""}
          <i class="dd__check">${I.check}</i>
        </div>`).join("");
      $$(".dd__opt", panel).forEach((el) => {
        el.addEventListener("click", () => choose(+el.dataset.i));
        el.addEventListener("mousemove", () => el !== document.activeElement && el.focus({ preventScroll: true }));
      });
    };

    const place = () => {
      const anchor = (dark && field) || btn;
      const r = anchor.getBoundingClientRect();
      const w = Math.min(Math.max(r.width, 220), document.documentElement.clientWidth - 24);
      const h = panel.offsetHeight;
      const below = innerHeight - r.bottom;
      const up = below < h + 16 && r.top > below;
      panel.style.width = `${w}px`;
      const vw = document.documentElement.clientWidth;
      panel.style.left = `${Math.min(Math.max(12, r.left), vw - w - 12)}px`;
      panel.style.top = `${up ? r.top - h - 8 : r.bottom + 8}px`;
      panel.classList.toggle("is-up", up);
    };

    const open = () => {
      if (openDD) openDD.close(true);
      build();
      if (hasGSAP) gsap.set(panel, { opacity: 1, y: 0 });
      panel.classList.add("is-open");
      place();
      btn.setAttribute("aria-expanded", "true");
      field?.classList.add("is-open");
      openDD = { close, place, panel, btn };
      const opts = $$(".dd__opt", panel);
      (opts[select.selectedIndex] || opts[0])?.focus({ preventScroll: true });
      if (hasGSAP && !reduced) {
        const up = panel.classList.contains("is-up");
        gsap.fromTo(panel, { clipPath: up ? "inset(100% 0% 0% 0% round 18px)" : "inset(0% 0% 100% 0% round 18px)", y: up ? 8 : -8 },
          { clipPath: "inset(0% 0% 0% 0% round 18px)", y: 0, duration: 0.55, ease: "expo.out", overwrite: true });
        gsap.fromTo(opts, { y: up ? -10 : 10, opacity: 0 }, { y: 0, opacity: 1, duration: 0.45, stagger: 0.03, ease: "expo.out", delay: 0.05 });
      }
    };

    function close(silent) {
      if (btn.getAttribute("aria-expanded") !== "true") return;
      btn.setAttribute("aria-expanded", "false");
      field?.classList.remove("is-open");
      if (openDD?.panel === panel) openDD = null;
      const done = () => panel.classList.remove("is-open");
      if (hasGSAP && !reduced) gsap.to(panel, { opacity: 0, y: -6, duration: 0.2, ease: "power2.in", overwrite: true, onComplete: done });
      else done();
      if (!silent) btn.focus({ preventScroll: true });
    }

    const choose = (i) => {
      const changed = select.selectedIndex !== i;
      select.selectedIndex = i;
      sync();
      if (changed) select.dispatchEvent(new Event("change", { bubbles: true }));
      close();
    };

    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      btn.getAttribute("aria-expanded") === "true" ? close() : open();
    });
    btn.addEventListener("keydown", (e) => {
      if (["ArrowDown", "ArrowUp"].includes(e.key)) { e.preventDefault(); open(); }
    });
    panel.addEventListener("keydown", (e) => {
      const opts = $$(".dd__opt", panel);
      const k = opts.indexOf(document.activeElement);
      if (e.key === "ArrowDown") { e.preventDefault(); opts[Math.min(k + 1, opts.length - 1)].focus(); }
      else if (e.key === "ArrowUp") { e.preventDefault(); opts[Math.max(k - 1, 0)].focus(); }
      else if (e.key === "Home") { e.preventDefault(); opts[0].focus(); }
      else if (e.key === "End") { e.preventDefault(); opts[opts.length - 1].focus(); }
      else if (e.key === "Enter" || e.key === " ") { e.preventDefault(); if (k > -1) choose(k); }
      else if (e.key === "Escape") { e.preventDefault(); close(); }
      else if (e.key === "Tab") close(true);
      else if (e.key.length === 1) {
        const key = e.key.toLowerCase();
        const hit = opts.find((o, j) => j > k && o.textContent.trim().toLowerCase().startsWith(key))
          || opts.find((o) => o.textContent.trim().toLowerCase().startsWith(key));
        hit?.focus();
      }
    });
    // Toda el área del campo del buscador abre el menú
    if (dark && field) field.addEventListener("click", (e) => { if (!btn.contains(e.target) && e.target.tagName !== "LABEL") btn.click(); });
  }

  document.addEventListener("pointerdown", (e) => {
    if (openDD && !openDD.panel.contains(e.target) && !openDD.btn.contains(e.target)) openDD.close(true);
  });
  ["scroll", "resize"].forEach((ev) => window.addEventListener(ev, () => openDD?.place(), { passive: true }));

  renderers[page]?.();
  if (en) $$('a[data-loc="cta"][href*="wa.me"]').forEach((a) => (a.href = waLink("Hi, I'm looking for a property with these features:")));
  $$("select").forEach(enhanceSelect);
  bindForms();

  /* ---------- Imágenes: respaldo si alguna falla ---------- */
  document.addEventListener("error", (e) => {
    const t = e.target;
    if (t.tagName === "IMG" && !t.dataset.fallback) { t.dataset.fallback = 1; t.src = U(IMG.modern1, 1200); }
  }, true);

  /* ---------- Header ---------- */
  let lastY = 0;
  const onScroll = () => {
    const y = window.scrollY;
    header.classList.toggle("is-solid", y > 60);
    // Ignorar micro-desplazamientos (rebote táctil en iOS)
    if (Math.abs(y - lastY) < 6) return;
    const hide = y > 400 && y > lastY && !document.body.classList.contains("menu-open");
    header.classList.toggle("is-hidden", hide);
    document.body.classList.toggle("header-hidden", hide);
    wa.classList.toggle("is-visible", y > 500);
    lastY = y;
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Menú ---------- */
  const burger = $(".burger");
  let menuTl;
  if (hasGSAP) {
    menuTl = gsap.timeline({ paused: true, defaults: { ease: "expo.inOut" } })
      .set(menu, { visibility: "visible" })
      .to(menu, { clipPath: "inset(0 0 0% 0)", duration: 1 })
      .from(".menu__links a", { yPercent: 110, duration: 0.9, stagger: 0.06, ease: "expo.out" }, "-=0.45")
      .from(".menu__side > *", { y: 30, opacity: 0, duration: 0.8, stagger: 0.08, ease: "expo.out" }, "<0.1");
  }
  const toggleMenu = (open) => {
    document.body.classList.toggle("menu-open", open);
    document.body.classList.toggle("is-locked", open);
    burger.setAttribute("aria-expanded", open);
    burger.setAttribute("aria-label", open ? t("Cerrar menú", "Close menu") : t("Abrir menú", "Open menu"));
    menu.setAttribute("aria-hidden", !open);
    if (menuTl) open ? menuTl.timeScale(1).play() : menuTl.timeScale(1.6).reverse();
    else { menu.style.visibility = open ? "visible" : "hidden"; menu.style.clipPath = open ? "inset(0)" : ""; }
  };
  burger.addEventListener("click", () => toggleMenu(!document.body.classList.contains("menu-open")));
  document.addEventListener("keydown", (e) => e.key === "Escape" && document.body.classList.contains("menu-open") && toggleMenu(false));

  /* ---------- Cursor personalizado ---------- */
  const fine = window.matchMedia("(hover: hover) and (min-width: 1025px)").matches;
  function bindCursorTargets() {
    if (!cursor) return;
    $$("a, button, select, [data-cursor]").forEach((el) => {
      if (el.dataset.cursorBound) return;
      el.dataset.cursorBound = 1;
      el.addEventListener("mouseenter", () => {
        const label = el.dataset.cursor;
        cursor.classList.add(label ? "is-view" : "is-hover");
        $("span", cursor).textContent = label || "";
      });
      el.addEventListener("mouseleave", () => cursor.classList.remove("is-view", "is-hover"));
    });
  }
  if (fine && hasGSAP && !reduced) {
    cursor = document.createElement("div");
    cursor.className = "cursor";
    cursor.innerHTML = "<span></span>";
    const dot = document.createElement("div");
    dot.className = "cursor-dot";
    gsap.set([cursor, dot], { opacity: 0 });
    document.body.append(cursor, dot);
    const cx = gsap.quickTo(cursor, "x", { duration: 0.5, ease: "power3" });
    const cy = gsap.quickTo(cursor, "y", { duration: 0.5, ease: "power3" });
    const dx = gsap.quickTo(dot, "x", { duration: 0.1 });
    const dy = gsap.quickTo(dot, "y", { duration: 0.1 });
    window.addEventListener("mousemove", (e) => { if (!cursor.dataset.on) { cursor.dataset.on = 1; gsap.set([cursor, dot], { x: e.clientX, y: e.clientY }); gsap.to([cursor, dot], { opacity: 1, duration: 0.4 }); } cx(e.clientX); cy(e.clientY); dx(e.clientX); dy(e.clientY); });
    bindCursorTargets();

    // Botones magnéticos
    $$("[data-magnetic]").forEach((el) => {
      const mx = gsap.quickTo(el, "x", { duration: 0.6, ease: "elastic.out(1, 0.4)" });
      const my = gsap.quickTo(el, "y", { duration: 0.6, ease: "elastic.out(1, 0.4)" });
      el.addEventListener("mousemove", (e) => {
        const r = el.getBoundingClientRect();
        mx((e.clientX - r.left - r.width / 2) * 0.25);
        my((e.clientY - r.top - r.height / 2) * 0.35);
      });
      el.addEventListener("mouseleave", () => { mx(0); my(0); });
    });
  }

  /* ---------- Split text ---------- */
  const split = (el) => {
    if (el.dataset.splitDone) return [];
    el.dataset.splitDone = 1;
    const out = [];
    const wrap = (word, wrapper) => {
      const outer = document.createElement("span");
      outer.className = "split-line";
      const inner = document.createElement("span");
      if (wrapper) { const w = wrapper.cloneNode(false); w.textContent = word; inner.append(w); }
      else inner.textContent = word;
      outer.append(inner);
      out.push(inner);
      return outer;
    };
    const nodes = [...el.childNodes];
    el.innerHTML = "";
    nodes.forEach((n) => {
      if (n.nodeType === 3) {
        n.textContent.split(/(\s+)/).forEach((w) => {
          if (!w) return;
          el.append(/\s+/.test(w) ? document.createTextNode(" ") : wrap(w));
        });
      } else if (n.nodeName === "BR") el.append(n);
      else {
        n.textContent.split(/(\s+)/).forEach((w) => {
          if (!w) return;
          el.append(/\s+/.test(w) ? document.createTextNode(" ") : wrap(w, n));
        });
      }
    });
    return out;
  };

  /* ---------- Animaciones ---------- */
  const intro = () => {
    if (!hasGSAP || reduced) return;
    const mm = gsap.matchMedia();

    // Hero
    const heroWords = $$(".hero__title").flatMap(split);
    const heroTl = gsap.timeline({ defaults: { ease: "expo.out" } });
    if ($(".hero")) {
      heroTl
        .fromTo(".hero__media img", { scale: 1.35 }, { scale: 1.15, duration: 2.4, ease: "expo.out" }, 0)
        .from(heroWords, { yPercent: 115, rotate: 4, duration: 1.4, stagger: 0.06 }, 0.2)
        .from(".hero [data-hero]", { y: 40, opacity: 0, duration: 1.2, stagger: 0.1 }, 0.7)
        .from(".hero__badge .star", { opacity: 0, scale: 0.3, duration: 0.7, stagger: 0.08, ease: "back.out(2.2)" }, 0.9);
      gsap.to(".hero__media img", { yPercent: 12, ease: "none", scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true } });
      // En celular el buscador no se desvanece al hacer scroll
      mm.add("(min-width: 801px)", () => {
        gsap.to(".hero__content", { yPercent: -18, opacity: 0.2, ease: "none", scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true } });
      });
    }
    gsap.from(".header__inner > *", { y: -30, opacity: 0, duration: 1.2, stagger: 0.1, ease: "expo.out", delay: 0.3 });

    // Títulos con split
    $$("[data-split]").forEach((el) => {
      if (el.classList.contains("hero__title")) return;
      const words = split(el);
      const inFirstView = el.getBoundingClientRect().top < window.innerHeight;
      gsap.from(words, {
        yPercent: 115, duration: 1.2, stagger: 0.04, ease: "expo.out", delay: inFirstView ? 0.35 : 0,
        scrollTrigger: inFirstView ? null : { trigger: el, start: "top 88%" },
      });
    });

    // Fade up
    $$("[data-fade]").forEach((el) => {
      gsap.fromTo(el, { y: 50, opacity: 0 }, {
        y: 0, opacity: 1, duration: 1.2, ease: "expo.out",
        scrollTrigger: { trigger: el, start: "top 90%" },
      });
    });
    // Grupos escalonados
    $$("[data-stagger]").forEach((wrap) => {
      gsap.fromTo(wrap.children, { y: 60, opacity: 0 }, {
        y: 0, opacity: 1, duration: 1.1, stagger: 0.1, ease: "expo.out",
        scrollTrigger: { trigger: wrap, start: "top 85%" },
      });
    });
    // Revelado de imágenes
    $$("[data-reveal]").forEach((el) => {
      const img = $("img", el);
      gsap.timeline({ scrollTrigger: { trigger: el, start: "top 85%" } })
        .fromTo(el, { clipPath: "inset(100% 0 0 0)" }, { clipPath: "inset(0% 0 0 0)", duration: 1.4, ease: "expo.inOut" })
        .fromTo(img || {}, { scale: 1.4 }, { scale: 1, duration: 1.8, ease: "expo.out" }, 0.2);
    });
    // Parallax
    $$("[data-parallax]").forEach((el) => {
      const amt = parseFloat(el.dataset.parallax) || 12;
      gsap.fromTo(el, { yPercent: -amt }, { yPercent: amt, ease: "none", scrollTrigger: { trigger: el.parentElement, start: "top bottom", end: "bottom top", scrub: true } });
    });
    // Contadores
    $$("[data-count]").forEach((el) => {
      const obj = { v: 0 };
      el.firstChild.textContent = "0";
      gsap.to(obj, {
        v: +el.dataset.count, duration: 2.2, ease: "expo.out",
        scrollTrigger: { trigger: el, start: "top 90%" },
        onUpdate: () => (el.firstChild.textContent = Math.round(obj.v)),
      });
    });

    // Marquee infinito que responde a la velocidad del scroll
    $$(".marquee__track").forEach((track) => {
      track.innerHTML += track.innerHTML;
      const loop = gsap.to(track, { xPercent: -50, duration: 30, ease: "none", repeat: -1 });
      ScrollTrigger.create({
        onUpdate: (self) => {
          const v = self.getVelocity() / 300;
          gsap.to(loop, { timeScale: gsap.utils.clamp(1, 6, Math.abs(v)) * self.direction, duration: 0.2, overwrite: true });
          gsap.to(loop, { timeScale: 1, duration: 1.2, delay: 0.25, overwrite: false });
        },
      });
    });

    // Scroll horizontal de propiedades destacadas
    mm.add("(min-width: 901px) and (min-height: 760px)", () => {
      const wrap = $(".hscroll"), track = $(".hscroll__track");
      if (!wrap || !track) return;
      const dist = () => Math.max(0, track.scrollWidth - wrap.clientWidth);
      // Pausa breve al inicio para que la primera propiedad se vea completa antes de deslizar
      gsap.timeline({
        scrollTrigger: {
          trigger: "#destacadas", start: "top top", end: () => `+=${dist() * 1.15}`, pin: true, scrub: 1, invalidateOnRefresh: true,
          onUpdate: (s) => gsap.set(".hscroll__progress i", { scaleX: s.progress }),
        },
      })
        .to({}, { duration: 0.15 })
        .to(track, { x: () => -dist(), ease: "none", duration: 1 });
    });

    // Línea de proceso
    const steps = $$(".step");
    if (steps.length) {
      gsap.to(".steps__line i", { scaleY: 1, ease: "none", scrollTrigger: { trigger: ".steps", start: "top 60%", end: "bottom 60%", scrub: true } });
      steps.forEach((s) => ScrollTrigger.create({ trigger: s, start: "top 60%", onToggle: (st) => s.classList.toggle("is-active", st.isActive || st.progress > 0), onLeaveBack: () => s.classList.remove("is-active") }));
    }

    // Vista previa flotante de zonas
    mm.add("(hover: hover) and (min-width: 801px)", () => {
      const prev = $("#zonePreview");
      if (!prev) return;
      const px = gsap.quickTo(prev, "x", { duration: 0.6, ease: "power3" });
      const py = gsap.quickTo(prev, "y", { duration: 0.6, ease: "power3" });
      const imgs = $$("img", prev);
      let activa = null;
      const mostrar = (zona) => {
        if (activa !== zona) {
          activa = zona;
          imgs.forEach((im, k) => im.classList.toggle("is-on", k === zona));
        }
        gsap.to(prev, { opacity: 1, scale: 1, rotate: -3, duration: 0.6, ease: "expo.out", overwrite: "auto" });
      };
      const ocultar = () => {
        if (activa === null) return;
        activa = null;
        gsap.to(prev, { opacity: 0, scale: 0.8, rotate: 0, duration: 0.4, overwrite: "auto" });
      };
      // La visibilidad depende de dónde está el cursor ahora, no de eventos de entrada/salida
      // (así no se queda pegada al mover el mouse rápido).
      const seguir = (e) => {
        const z = e.target.closest?.(".zone");
        if (!z) return ocultar();
        px(e.clientX + 30);
        py(e.clientY - 200);
        mostrar(+z.dataset.zone);
      };
      document.addEventListener("mousemove", seguir);
      document.addEventListener("mouseleave", ocultar);
      window.addEventListener("blur", ocultar);
      window.addEventListener("scroll", ocultar, { passive: true });
      return () => {
        document.removeEventListener("mousemove", seguir);
        document.removeEventListener("mouseleave", ocultar);
        window.removeEventListener("blur", ocultar);
        window.removeEventListener("scroll", ocultar);
        gsap.set(prev, { opacity: 0 });
      };
    });

    // Sección de contacto y certificaciones: logos escalonados y foto pequeña flotando
    if ($(".trust")) {
      // Solo desplazamiento: si la animación se interrumpe, los logos nunca quedan translúcidos
      gsap.from(".trust__logos img", {
        y: 22, duration: 0.9, stagger: 0.12, ease: "expo.out", clearProps: "transform",
        scrollTrigger: { trigger: ".trust__badges", start: "top 92%" },
      });
      gsap.from(".trust__seal", {
        scale: 0.6, opacity: 0, rotate: -40, duration: 1.2, ease: "expo.out",
        scrollTrigger: { trigger: ".trust__visual", start: "top 80%" },
      });
      gsap.to(".trust__media--small", { y: -14, duration: 3.2, ease: "sine.inOut", yoyo: true, repeat: -1 });
    }

    // Texto gigante del footer
    // Logo completo del footer: escudo, nombre y lema aparecen en secuencia
    gsap.timeline({ scrollTrigger: { trigger: ".footer__logo", start: "top 90%" } })
      .from(".footer__logo-crest", { opacity: 0, y: 30, scale: 0.9, transformOrigin: "50% 50%", duration: 1.2, ease: "expo.out" })
      .from(".footer__logo-word", { opacity: 0, y: 20, duration: 1, ease: "expo.out" }, 0.25)
      .from(".footer__logo-tag", { opacity: 0, y: 12, duration: 0.9, ease: "expo.out" }, 0.5);
  };

  /* ---------- Video del hero (reel) ---------- */
  const reelCard = $("#heroReel");
  if (reelCard) {
    $(".hero__scroll")?.remove(); // el video ocupa ese lugar
    const video = $(".hero-reel__video", reelCard);
    const modal = document.createElement("div");
    modal.className = "reel";
    modal.setAttribute("aria-hidden", "true");
    modal.innerHTML = `
      <div class="reel__backdrop"></div>
      <div class="reel__window" role="dialog" aria-modal="true" aria-label="${t("Video de Amábilis & Espinosa", "Amábilis & Espinosa video")}">
        <div class="reel__media"></div>
        <div class="reel__actions">
          ${btn(t("Ver el blog", "Go to the blog"), T.localizeHref("blog.html"), "btn--gold", 'data-loc="hero-reel"')}
          <button class="reel__close" type="button" aria-label="${t("Cerrar video", "Close video")}">${I.close}</button>
        </div>
      </div>`;
    document.body.append(modal);
    const media = $(".reel__media", modal);
    let open = false;

    const play = () => video.play().catch(() => {});
    // Reproduce en bucle solo cuando el hero está a la vista (ahorra batería y datos)
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(([e]) => (e.isIntersecting && !open ? play() : video.pause()), { threshold: 0.1 })
        .observe(reelCard);
    } else play();

    const openReel = () => {
      if (open) return;
      open = true;
      track("play_video", { video_location: "hero" });
      const first = video.getBoundingClientRect();
      modal.classList.add("is-open");
      modal.setAttribute("aria-hidden", "false");
      document.body.classList.add("is-locked");
      media.append(video);
      video.controls = true;
      video.muted = false;
      play();
      const last = video.getBoundingClientRect();
      if (hasGSAP && !reduced) {
        gsap.fromTo(video,
          { x: first.left - last.left, y: first.top - last.top, scaleX: first.width / last.width, scaleY: first.height / last.height, transformOrigin: "0 0" },
          { x: 0, y: 0, scaleX: 1, scaleY: 1, duration: 0.8, ease: "expo.out", clearProps: "transform" });
        gsap.fromTo(".reel__backdrop", { opacity: 0 }, { opacity: 1, duration: 0.5 });
        gsap.fromTo(".reel__actions", { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6, delay: 0.25, ease: "expo.out" });
      }
      $(".reel__close", modal).focus({ preventScroll: true });
    };

    const closeReel = () => {
      if (!open) return;
      open = false;
      const first = video.getBoundingClientRect();
      modal.classList.remove("is-open");
      modal.setAttribute("aria-hidden", "true");
      document.body.classList.remove("is-locked");
      reelCard.prepend(video);
      video.controls = false;
      video.muted = true;
      play();
      const last = video.getBoundingClientRect();
      if (hasGSAP && !reduced) {
        gsap.fromTo(video,
          { x: first.left - last.left, y: first.top - last.top, scaleX: first.width / last.width, scaleY: first.height / last.height, transformOrigin: "0 0" },
          { x: 0, y: 0, scaleX: 1, scaleY: 1, duration: 0.7, ease: "expo.out", clearProps: "transform" });
      }
      reelCard.focus({ preventScroll: true });
    };

    reelCard.addEventListener("click", openReel);
    $(".reel__backdrop", modal).addEventListener("click", closeReel);
    $(".reel__close", modal).addEventListener("click", closeReel);
    document.addEventListener("keydown", (e) => e.key === "Escape" && closeReel());
  }

  /* ---------- Preloader ---------- */
  const pre = $(".preloader");
  // Se muestra al abrir o recargar el inicio; se omite al llegar desde otra página del sitio
  const navType = performance.getEntriesByType("navigation")[0]?.type;
  const internal = document.referrer.startsWith(location.origin) && navType !== "reload";
  if (pre && hasGSAP && !reduced && !internal) {
    document.body.classList.add("is-locked");
    const count = $(".preloader__count"), obj = { v: 0 };
    gsap.timeline({ onComplete: () => { pre.remove(); document.body.classList.remove("is-locked"); } })
      .from(".preloader__crest", { opacity: 0, scale: 0.8, y: 24, duration: 1.2, ease: "expo.out" })
      .fromTo(".preloader__word", { clipPath: "inset(0 50% 0 50%)", opacity: 0 }, { clipPath: "inset(0 0% 0 0%)", opacity: 1, duration: 1.1, ease: "expo.inOut" }, 0.35)
      .from(".preloader__tag", { opacity: 0, y: 12, duration: 0.9, ease: "expo.out" }, 0.9)
      .to(".preloader__bar i", { scaleX: 1, duration: 1.4, ease: "power2.inOut" }, 0.2)
      .to(obj, { v: 100, duration: 1.4, ease: "power2.inOut", onUpdate: () => (count.textContent = Math.round(obj.v) + "%") }, 0.2)
      .to(".preloader__inner", { yPercent: -40, opacity: 0, duration: 0.8, ease: "expo.in" })
      .to(pre, { clipPath: "inset(0 0 100% 0)", duration: 1.1, ease: "expo.inOut", onStart: intro }, "-=0.3");
  } else {
    pre?.remove();
    intro();
  }

  window.addEventListener("load", () => hasGSAP && ScrollTrigger.refresh());
})();

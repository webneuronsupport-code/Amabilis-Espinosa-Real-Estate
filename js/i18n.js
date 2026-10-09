/* =========================================================
   Amábilis & Espinosa — Idiomas (ES / EN)
   - Idioma por URL (?lang=en), recordado en el navegador.
   - Los textos fijos se traducen con el diccionario EN (clave = texto en español).
   - El contenido de propiedades, blog, zonas y testimonios se traduce en js/data.js (campo "en").
   Para agregar una traducción: añade "Texto en español": "English text" al diccionario.
   ========================================================= */
(function () {
  var SUPPORTED = ["es", "en"];
  var STORE = "ae-lang";
  var url = new URL(location.href);
  var fromUrl = url.searchParams.get("lang");
  var stored = null;
  try { stored = localStorage.getItem(STORE); } catch (e) {}
  var lang = SUPPORTED.indexOf(fromUrl) > -1 ? fromUrl : SUPPORTED.indexOf(stored) > -1 ? stored : "es";
  try { localStorage.setItem(STORE, lang); } catch (e) {}

  var root = document.documentElement;
  root.lang = lang === "en" ? "en" : "es-MX";
  if (lang === "en") {
    // Oculta la página hasta traducirla para evitar ver el español un instante
    root.classList.add("i18n-pending");
    setTimeout(function () { root.classList.remove("i18n-pending"); }, 2500);
  }

  var EN = {
    /* ---- Metadatos ---- */
    "Inmobiliaria en Metepec y Toluca | Casas y departamentos en venta y renta | Amábilis & Espinosa": "Real Estate in Metepec & Toluca | Homes and Apartments for Sale and Rent | Amábilis & Espinosa",
    "Compra, vende o renta casas, departamentos y terrenos en Metepec, Toluca, Lerma y CDMX con asesoría personalizada. Más de 10 años de experiencia y +150 clientes satisfechos.": "Buy, sell or rent homes, apartments and land in Metepec, Toluca, Lerma and Mexico City with personalized guidance. Over 10 years of experience and 150+ satisfied clients.",
    "Casas, departamentos y terrenos en venta y renta en Metepec, Toluca y CDMX | Amábilis & Espinosa": "Homes, Apartments and Land for Sale and Rent in Metepec, Toluca and Mexico City | Amábilis & Espinosa",
    "Catálogo de propiedades en venta y renta: casas en Metepec, departamentos en CDMX, terrenos en Ixtlahuaca y naves en Lerma. Filtra por zona, tipo y precio.": "Property listings for sale and rent: homes in Metepec, apartments in Mexico City, land in Ixtlahuaca and warehouses in Lerma. Filter by area, type and price.",
    "Blog inmobiliario y reels | Noticias, guías y recorridos | Amábilis & Espinosa": "Real Estate Blog & Reels | News, Guides and Tours | Amábilis & Espinosa",
    "Noticias del mercado inmobiliario, guías para comprar y vender, y reels con recorridos por nuestras propiedades en Metepec, Toluca y CDMX.": "Real estate market news, buying and selling guides, and reels touring our properties in Metepec, Toluca and Mexico City.",
    "Nosotros | Asesores inmobiliarios en Metepec y Toluca | Amábilis & Espinosa": "About Us | Real Estate Advisors in Metepec & Toluca | Amábilis & Espinosa",
    "Conoce al equipo de Amábilis & Espinosa Real Estate: más de 10 años de experiencia y un servicio inmobiliario basado en confianza, integridad y excelencia.": "Meet the Amábilis & Espinosa Real Estate team: over 10 years of experience and a real estate service built on trust, integrity and excellence.",
    "Contacto | Agenda una asesoría inmobiliaria gratuita | Amábilis & Espinosa": "Contact | Book a Free Real Estate Consultation | Amábilis & Espinosa",
    "Contáctanos por WhatsApp, teléfono o correo. Agenda una visita o una valuación gratuita de tu propiedad en Metepec, Toluca o CDMX.": "Reach us by WhatsApp, phone or email. Book a viewing or a free valuation of your property in Metepec, Toluca or Mexico City.",

    /* ---- Navegación y generales ---- */
    "Amábilis & Espinosa, inicio": "Amábilis & Espinosa, home",
    "Principal": "Main",
    "Inicio": "Home",
    "Propiedades": "Properties",
    "Nosotros": "About",
    "Te abrimos WhatsApp con tu solicitud lista: solo pulsa enviar.": "We opened WhatsApp with your request ready: just hit send.",
    "Correo electrónico*": "Email address*",
    "Ya sea que quieras comprar, vender, rentar o invertir, un asesor te atenderá personalmente.": "Whether you want to buy, sell, rent or invest, an advisor will assist you personally.",
    "Escríbenos por WhatsApp": "Message us on WhatsApp",
    "Llamar ahora": "Call now",
    "Canales directos": "Direct channels",
    "Estamos a un mensaje <em>de distancia</em>": "We are one message <em>away</em>",
    "Formulario": "Form",
    "Cuéntanos qué buscas y te respondemos con opciones concretas.": "Tell us what you are looking for and we will reply with concrete options.",
    "Dónde estamos": "Where we are",
    "Metepec, Estado de México": "Metepec, State of Mexico",
    "Atendemos Metepec, Toluca, Zinacantepec y Ciudad de México.": "We serve Metepec, Toluca, Zinacantepec and Mexico City.",
    "Cómo llegar": "Get directions",
    "Ubicación de la oficina": "Office location",
    "Colaboraciones": "Partnerships",
    "Filosofía": "Philosophy",
    "Misión, visión y <em>valores</em>": "Mission, vision and <em>values</em>",
    "Estos conceptos tienen un significado muy concreto, ya que definen la esencia y la forma de operar de Amábilis & Espinosa Real Estate. Construyendo tu historia.": "These concepts have a very concrete meaning: they define the essence and the way Amábilis & Espinosa Real Estate operates. Building your story.",
    "Misión": "Mission",
    "Visión": "Vision",
    "Nuestra misión es ser el socio inmobiliario de confianza para quienes buscan las mejores propiedades en México. Ofrecemos un servicio excepcional, guiando a cada cliente con conocimiento experto, discreción y dedicación para asegurar que cada transacción sea un éxito. Nos apasiona superar las expectativas y construir relaciones que perduren.": "Our mission is to be the trusted real estate partner for those seeking the finest properties in Mexico. We deliver exceptional service, guiding every client with expert knowledge, discretion and dedication to make each transaction a success. We are passionate about exceeding expectations and building lasting relationships.",
    "Ser la inmobiliaria líder y más respetada en México, reconocida por nuestra excelencia, integridad y conocimiento experto. Nos consolidaremos como el socio de confianza que transforma la experiencia inmobiliaria, construyendo relaciones duraderas y ofreciendo soluciones que superan las expectativas para cada cliente.": "To be the leading and most respected real estate firm in Mexico, recognized for our excellence, integrity and expert knowledge. We will establish ourselves as the trusted partner that transforms the real estate experience, building lasting relationships and delivering solutions that exceed every client's expectations.",
    "Valores": "Values",
    "Los seis principios que sostienen cada acompañamiento.": "The six principles behind every engagement.",
    "Integridad absoluta": "Absolute integrity",
    "Actuamos con total honestidad y transparencia en todas nuestras operaciones. Nuestra reputación se basa en la confianza, y nos comprometemos a ser un socio en el que nuestros clientes pueden confiar plenamente.": "We act with complete honesty and transparency in all our operations. Our reputation is built on trust, and we are committed to being a partner our clients can fully rely on.",
    "Responsabilidad": "Accountability",
    "Asumimos la total responsabilidad por nuestras acciones y resultados. Cumplimos nuestras promesas y protegemos los intereses de nuestros clientes, garantizando un proceso seguro y claro en todo momento.": "We take full responsibility for our actions and results. We keep our promises and protect our clients' interests, ensuring a safe and clear process at all times.",
    "Conocimiento experto": "Expert knowledge",
    "Nos mantenemos a la vanguardia del mercado inmobiliario. Invertimos en nuestra formación continua y en el análisis del mercado para ofrecer a nuestros clientes el mejor asesoramiento estratégico y las soluciones más efectivas.": "We stay at the forefront of the real estate market. We invest in continuous training and market analysis to offer our clients the best strategic advice and the most effective solutions.",
    "Excelencia en el servicio": "Service excellence",
    "Nos esforzamos por superar las expectativas en cada interacción. Desde el primer contacto hasta el cierre de la transacción, nuestro compromiso es ofrecer un servicio de primera clase, atento a los detalles y centrado en las necesidades del cliente.": "We strive to exceed expectations in every interaction. From first contact to closing, our commitment is first-class service, attentive to detail and focused on the client's needs.",
    "Pasión y compromiso": "Passion and commitment",
    "Amamos lo que hacemos. Nuestra pasión por conectar a las personas con sus sueños se refleja en nuestra dedicación y energía en cada proyecto. Nos comprometemos a fondo con los objetivos de nuestros clientes.": "We love what we do. Our passion for connecting people with their dreams shows in the dedication and energy we bring to every project. We commit fully to our clients' goals.",
    "Relaciones duraderas": "Lasting relationships",
    "No solo buscamos una transacción, sino construir una relación de confianza a largo plazo. Valoramos a cada cliente como un socio y nos esforzamos por ser su asesor inmobiliario de por vida.": "We do not just look for a transaction, but for a long-term relationship of trust. We value every client as a partner and strive to be their real estate advisor for life.",
    "Residencia en Valle de Zamarrero, Zinacantepec": "Residence in Valle de Zamarrero, Zinacantepec",
    "Arquitectura contemporánea en Refugio Santa Fe": "Contemporary architecture at Refugio Santa Fe",
    "Alianzas <em>Comerciales</em>": "Business <em>Partnerships</em>",
    "Trabajamos de la mano con especialistas de confianza para que tu propiedad esté lista para vivirse: del diseño de los espacios al último detalle decorativo.": "We work hand in hand with trusted specialists so your property is ready to be lived in: from space planning to the final decorative detail.",
    "Interiorismo": "Interior Design",
    "Diseño y fabricación de cocinas a la medida, optimización de espacios, closets y mobiliario especial.": "Design and manufacture of custom kitchens, space optimization, closets and bespoke furniture.",
    "Cocinas a la medida": "Custom kitchens",
    "Closets": "Closets",
    "Mobiliario especial": "Bespoke furniture",
    "Línea Decorativa": "Decorative Line",
    "Plasmamos tu visión en cada rincón con productos de alta calidad, belleza y presupuestos transparentes.": "We bring your vision to every corner with high-quality products, beauty and transparent quotes.",
    "Textiles": "Textiles",
    "Iluminación": "Lighting",
    "Accesorios": "Accessories",
    "Trae tus ideas a la vida real": "Bring your ideas to life",
    "Coordinamos la propuesta junto con tu asesor.": "We coordinate the proposal together with your advisor.",
    "Espacios integrales": "Integrated spaces",
    "Línea decorativa": "Decorative line",
    "Sala integrada con mobiliario a la medida": "Living room with bespoke furniture",
    "Cocina con carpintería a la medida": "Kitchen with custom cabinetry",
    "Recámara con línea decorativa": "Bedroom styled with the decorative line",
    "Contacto": "Contact",
    "Agenda una visita": "Book a viewing",
    "Abrir menú": "Open menu",
    "Cerrar menú": "Close menu",
    "Escríbenos por WhatsApp": "Message us on WhatsApp",
    "Interior de residencia de lujo": "Luxury home interior",
    "Idioma": "Language",
    "¿Hablamos?": "Let's talk",
    "Ver": "View",
    "Leer": "Read",
    "Ampliar": "Zoom",
    "Anterior": "Previous",
    "Siguiente": "Next",
    "Cerrar": "Close",
    "Galería de fotos": "Photo gallery",
    "Llamar": "Call",
    "Metepec, Estado de México": "Metepec, State of Mexico",
    "Lun – Sáb · 9:00 a 19:00": "Mon – Sat · 9:00 am to 7:00 pm",

    /* ---- Hero y buscador ---- */
    "Residencia contemporánea con alberca al atardecer": "Contemporary home with pool at sunset",
    "Clientes satisfechos, resultados excepcionales.": "Satisfied clients, exceptional results.",
    "Servicio inmobiliario de alta calidad y personalizado para ti.": "High-quality, personalized real estate service, made for you.",
    "Encuentra el hogar <br>que <em>mereces</em>": "Find the home <br>you <em>deserve</em>",
    "<i></i>Descubre": "<i></i>Discover",
    "Buscar propiedades": "Search properties",
    "Operación": "Transaction",
    "Comprar o rentar": "Buy or rent",
    "Comprar": "Buy",
    "Rentar": "Rent",
    "Tipo": "Type",
    "Todos": "All",
    "Zona": "Area",
    "Todas las zonas": "All areas",
    "Buscar": "Search",
    "Ciudad de México": "Mexico City",
    "CDMX": "Mexico City",

    /* ---- Tipos, operaciones y etiquetas ---- */
    "Casa": "House",
    "Departamento": "Apartment",
    "Terreno": "Land",
    "Comercial": "Commercial",
    "Venta": "Sale",
    "Renta": "Rent",
    "Nuevo": "New",
    "Exclusiva": "Exclusive",
    "Destacado": "Featured",
    "Preventa": "Pre-sale",
    "Inversión": "Investment",
    "MXN / mes": "MXN / month",

    /* ---- Intro ---- */
    "Conoce Amábilis & Espinosa": "Meet Amábilis & Espinosa",
    "Un servicio inmobiliario <em>hecho a tu medida</em>": "A real estate service <em>tailored to you</em>",
    "Ofrecemos un servicio exclusivo y personalizado en la adquisición, venta y alquiler de propiedades en México. Nos destacamos por nuestro profundo conocimiento del mercado inmobiliario residencial, un equipo de ventas altamente capacitado y una red de contactos de alto nivel.": "We offer an exclusive, personalized service for the purchase, sale and rental of properties in Mexico. We stand out for our deep knowledge of the residential real estate market, a highly trained sales team and a high-level network of contacts.",
    "Ofrecemos un servicio exclusivo y personalizado en la adquisición, venta y alquiler de propiedades en México.": "We offer an exclusive, personalized service for the purchase, sale and rental of properties in Mexico.",
    "Nos destacamos por nuestro profundo conocimiento del mercado inmobiliario residencial, un equipo de ventas altamente capacitado y una red de contactos de alto nivel.": "We stand out for our deep knowledge of the residential real estate market, a highly trained sales team and a high-level network of contacts.",
    "Años de experiencia": "Years of experience",
    "Clientes satisfechos": "Satisfied clients",
    "Propiedades activas": "Active listings",
    "Conoce al equipo": "Meet the team",
    "Sala de estar luminosa con acabados de lujo": "Bright living room with luxury finishes",
    "Cocina moderna con isla central": "Modern kitchen with central island",
    "Confianza · Integridad · Excelencia ·": "Trust · Integrity · Excellence ·",

    /* ---- Destacadas ---- */
    "Selección exclusiva": "Exclusive selection",
    "Propiedades <em>destacadas</em>": "Featured <em>properties</em>",
    "Ver todas": "View all",
    "Ver reel": "Watch reel",
    "Ver el blog": "Go to the blog",
    "Video de Amábilis &amp; Espinosa Real Estate": "Amábilis &amp; Espinosa Real Estate video",

    /* ---- Servicios ---- */
    "Servicios": "Services",
    "Todo lo que necesitas, <br><em>en un solo lugar</em>": "Everything you need, <br><em>in one place</em>",
    "Te acompañamos de principio a fin, con un proceso transparente y orientado a resultados.": "We guide you from start to finish with a transparent, results-driven process.",
    "Compra": "Buying",
    "Te acompañamos a encontrar la propiedad que se ajusta a lo que buscas, con asesoría en cada paso del proceso.": "We help you find the property that fits what you're looking for, with guidance at every step of the process.",
    "Damos a conocer tu propiedad entre nuestra red de contactos y te acompañamos hasta el cierre de la operación.": "We showcase your property to our network of contacts and accompany you through to closing.",
    "Te ayudamos a rentar tu propiedad o a encontrar la que necesitas, con acompañamiento durante el proceso.": "We help you rent out your property or find the one you need, with support throughout the process.",
    "Opciones de mercado y propiedades con potencial para quienes buscan invertir su patrimonio.": "Market options and properties with potential for those looking to invest.",

    /* ---- Zonas ---- */
    "Dónde trabajamos": "Where we work",
    "Explora por <em>zona</em>": "Explore by <em>area</em>",
    "Propiedades por zona": "Properties by area",

    /* ---- Proceso ---- */
    "Cómo trabajamos": "How we work",
    "Cuatro pasos hacia <em>tu nueva historia</em>": "Four steps toward <em>your new story</em>",
    "Asesora inmobiliaria revisando opciones de propiedades con una clienta": "Real estate advisor reviewing property options with a client",
    "PASO 01": "STEP 01",
    "PASO 02": "STEP 02",
    "PASO 03": "STEP 03",
    "PASO 04": "STEP 04",
    "Conversación inicial": "Initial conversation",
    "Escuchamos lo que buscas: zona, presupuesto, tiempos y estilo de vida. Sin compromiso y sin letras chiquitas.": "We listen to what you're looking for: area, budget, timing and lifestyle. No commitment and no fine print.",
    "Selección curada": "Curated selection",
    "Filtramos el mercado y te presentamos solo las opciones que realmente cumplen tus criterios.": "We filter the market and only show you the options that truly meet your criteria.",
    "Visitas y negociación": "Viewings and negotiation",
    "Te acompañamos a cada visita, revisamos documentación y negociamos las mejores condiciones.": "We join you at every viewing, review the paperwork and negotiate the best terms.",
    "Cierre y entrega": "Closing and handover",
    "Coordinamos notaría, crédito y firma hasta la entrega de llaves. Cumplimos con la NOM-247 en cada operación.": "We coordinate the notary, financing and signing through to key handover. Every transaction complies with NOM-247.",

    /* ---- Testimonios y blog ---- */
    "Testimonios": "Testimonials",
    "En memoria": "In memoriam",
    "Con respeto <em>y admiración</em>": "With respect <em>and admiration</em>",
    "Honramos la vida de quienes fueron ejemplo de ética y compromiso, tanto en su vida profesional como en su amor por los suyos.": "We honor the lives of those who were an example of ethics and commitment, both in their professional lives and in their love for their family.",
    "Gracias por el impacto y el legado que dejan en nuestras vidas.": "Thank you for the impact and the legacy you leave in our lives.",
    "Yadira y Marcos Caamal": "Yadira and Marcos Caamal",
    "Certificaciones": "Certifications",
    "Contáctanos, el hogar que deseas <em>está a un paso</em>": "Get in touch — the home you want <em>is one step away</em>",
    "Estamos aquí para ayudarte a encontrar tu inversión ideal.": "We're here to help you find your ideal investment.",
    "Contáctanos": "Contact us",
    "Certificados por": "Certified by",
    "Entidad de Certificación y Evaluación reconocida por la SEP y la Red CONOCER.": "Certification and Evaluation Body recognized by Mexico's Ministry of Public Education (SEP) and the CONOCER network.",
    "Secretaría de Educación Pública": "Mexican Ministry of Public Education",
    "Red CONOCER, entidad de certificación y evaluación": "Red CONOCER, certification and evaluation body",
    "Sala amueblada con ventanal en una de nuestras propiedades": "Furnished living room with a large window in one of our properties",
    "Fachada de una residencia en Valle de Zamarrero": "Facade of a residence in Valle de Zamarrero",
    "5 estrellas": "5 stars",
    "Blog & Reels": "Blog & Reels",
    "Lo último <em>del mercado</em>": "The latest <em>from the market</em>",
    "Ver todas las publicaciones": "View all posts",
    "Noticias": "News",
    "Guías": "Guides",
    "Reels": "Reels",
    "Todo": "All",
    "Categoría": "Category",

    /* ---- CTA y formularios ---- */
    "Hablemos": "Let's talk",
    "Tu próxima propiedad <em>empieza aquí</em>": "Your next property <em>starts here</em>",
    "Déjanos tus datos y un asesor te contactará en menos de 30 minutos en horario hábil.": "Leave your details and an advisor will contact you within 30 minutes during business hours.",
    "Solicita asesoría gratuita": "Request a free consultation",
    "Nombre*": "Name*",
    "Teléfono*": "Phone*",
    "Nombre": "Name",
    "Teléfono": "Phone",
    "Correo electrónico": "Email",
    "Vender": "Sell",
    "Invertir": "Invest",
    "Me interesa": "I'm interested in",
    "Mensaje": "Message",
    "Enviar solicitud": "Send request",
    "Al enviar aceptas nuestro <a href=\"#\">aviso de privacidad</a>.": "By submitting you accept our <a href=\"#\">privacy notice</a>.",
    "¡Gracias! Te abrimos WhatsApp para darte atención inmediata.": "Thank you! We're opening WhatsApp so we can help you right away.",
    "¡Gracias! Te contactaremos muy pronto.": "Thank you! We'll be in touch very soon.",

    /* ---- Footer ---- */
    "Servicio inmobiliario personalizado para comprar, vender y rentar propiedades en el Estado de México y CDMX.": "Personalized real estate service to buy, sell and rent properties in the State of Mexico and Mexico City.",
    "Explora": "Explore",
    "Zonas": "Areas",
    "Aviso de privacidad": "Privacy notice",
    "Política de privacidad": "Privacy policy",
    "Política de privacidad | Amábilis &amp; Espinosa Real Estate": "Privacy Policy | Amábilis &amp; Espinosa Real Estate",
    "Conoce cómo Amábilis &amp; Espinosa Real Estate recaba, usa y protege tus datos personales conforme a la LFPDPPP.": "Learn how Amábilis &amp; Espinosa Real Estate collects, uses and protects your personal data under Mexican data protection law (LFPDPPP).",
    "Carta de derechos NOM-247": "NOM-247 consumer rights",

    /* ---- Catálogo ---- */
    "Propiedades <em>en venta</em> <br>y renta": "Properties <em>for sale</em> <br>and rent",
    "Casas, departamentos, terrenos y espacios comerciales seleccionados en las mejores zonas del Estado de México y CDMX.": "Hand-picked homes, apartments, land and commercial spaces in the best areas of the State of Mexico and Mexico City.",
    "Todas": "All",
    "Tipo de propiedad": "Property type",
    "Ordenar": "Sort",
    "Ordenar por": "Sort by",
    "Precio: menor a mayor": "Price: low to high",
    "Precio: mayor a menor": "Price: high to low",
    "No hay propiedades con estos filtros": "No properties match these filters",
    "Prueba con otra zona o tipo, o pídenos una búsqueda personalizada.": "Try another area or type, or ask us for a personalized search.",
    "Limpiar filtros": "Clear filters",
    "¿No encuentras lo que buscas?": "Can't find what you're looking for?",
    "Te lo <em>buscamos</em> nosotros": "We'll <em>find it</em> for you",
    "Cuéntanos qué necesitas y te enviamos opciones fuera de catálogo en menos de 24 horas.": "Tell us what you need and we'll send you off-market options within 24 hours.",

    /* ---- Ficha ---- */
    "Recámaras": "Bedrooms",
    "Baños": "Bathrooms",
    "Estacionamientos": "Parking spaces",
    "Construcción": "Built area",
    "Sobre la propiedad": "About the property",
    "Características": "Features",
    "Ubicación": "Location",
    "Agenda tu visita": "Book your viewing",
    "¿Te interesa esta propiedad?": "Interested in this property?",
    "Un asesor te responde en minutos con información, precio final y horarios de visita.": "An advisor will reply within minutes with details, final price and viewing times.",
    "Llamar ahora": "Call now",
    "Solicitar información": "Request information",
    "También te puede interesar": "You may also like",
    "Propiedades <em>similares</em>": "Similar <em>properties</em>",
    "Ver catálogo completo": "View full catalog",

    /* ---- Blog ---- */
    "Noticias del mercado, guías prácticas y recorridos en video por nuestras propiedades. Todo lo que necesitas para decidir mejor.": "Market news, practical guides and video tours of our properties. Everything you need to make better decisions.",
    "Mira el reel completo en nuestras redes": "Watch the full reel on our social media",
    "Ver en Instagram": "View on Instagram",
    "Sigue leyendo": "Keep reading",
    "Más <em>publicaciones</em>": "More <em>articles</em>",
    "Ir al blog": "Go to blog",

    /* ---- Nosotros ---- */
    "Construyendo <br><em>tu historia</em>": "Building <br><em>your story</em>",
    "Somos una firma inmobiliaria boutique que cree que cada propiedad guarda una historia, y que la tuya merece empezar con el pie derecho.": "We are a boutique real estate firm that believes every property holds a story — and yours deserves to start off on the right foot.",
    "Conoce Amábilis &amp; <em>Espinosa Real Estate</em>": "Meet Amábilis &amp; <em>Espinosa Real Estate</em>",
    "Certificación EC0110.01 «Asesoría en comercialización de bienes inmuebles», que nos respalda en el estándar de competencia.": "EC0110.01 certification in real estate marketing advisory, which backs us in the official competency standard.",
    "Residencia contemporánea representativa de nuestro portafolio": "Contemporary residence representative of our portfolio",
    "Contamos con la certificación EC0110.01 «Asesoría en comercialización de bienes inmuebles», que nos respalda y certifica en el estándar de competencia.": "We hold the EC0110.01 certification in real estate marketing advisory, which backs and certifies us in the official competency standard.",
    "Años de confianza y dedicación": "Years of trust and dedication",
    "Agentes inmobiliarios certificados": "Certified real estate agents",
    "Contamos con la certificación EC0110.01 «Asesoría en comercialización de bienes inmuebles», que nos respalda en el estándar de competencia.": "We hold the EC0110.01 certification in real estate marketing advisory, which backs us in the official competency standard.",
    "Estancia principal con ventanales en una de nuestras propiedades": "Main living area with large windows in one of our properties",
    "Nuestra historia": "Our story",
    "Más de una década <em>abriendo puertas</em>": "Over a decade <em>opening doors</em>",
    "Amábilis & Espinosa nació con una idea simple: ofrecer un servicio inmobiliario tan personal como la decisión de elegir un hogar. Hoy acompañamos a familias, profesionistas e inversionistas en Metepec, Toluca, Lerma y la Ciudad de México.": "Amábilis & Espinosa was born from a simple idea: to offer a real estate service as personal as the decision to choose a home. Today we guide families, professionals and investors in Metepec, Toluca, Lerma and Mexico City.",
    "Nuestro equipo combina conocimiento local, experiencia legal y marketing digital para que cada operación sea ágil, segura y transparente.": "Our team combines local knowledge, legal expertise and digital marketing so that every transaction is fast, secure and transparent.",
    "Años": "Years",
    "Clientes": "Clients",
    "Equipo de asesores en reunión": "Team of advisors in a meeting",
    "Entrega de llaves": "Key handover",
    "Nuestros valores": "Our values",
    "Lo que nos <em>distingue</em>": "What sets us <em>apart</em>",
    "Integridad": "Integrity",
    "Información clara, precios reales y cumplimiento de la NOM-247 en cada operación.": "Clear information, real prices and NOM-247 compliance in every transaction.",
    "Excelencia": "Excellence",
    "Fotografía profesional, marketing digital y seguimiento puntual para lograr resultados excepcionales.": "Professional photography, digital marketing and timely follow-up to achieve exceptional results.",
    "Confianza": "Trust",
    "Relaciones a largo plazo: muchos de nuestros clientes vuelven con nosotros o nos recomiendan.": "Long-term relationships: many of our clients come back to us or refer us.",
    "Equipo": "Team",
    "Las personas <em>detrás</em>": "The people <em>behind it</em>",
    "Un equipo multidisciplinario enfocado en que cada operación sea un éxito.": "A multidisciplinary team focused on making every transaction a success.",
    "Director General": "General Director",
    "Director Comercial": "Commercial Director",
    "Genny Amábilis, Director General de Amábilis &amp; Espinosa Real Estate": "Genny Amábilis, General Director of Amábilis &amp; Espinosa Real Estate",
    "Iván Espinosa, Director Comercial de Amábilis &amp; Espinosa Real Estate": "Iván Espinosa, Commercial Director of Amábilis &amp; Espinosa Real Estate",

    /* ---- Contacto ---- */
    "Hablemos de <br><em>tu propiedad</em>": "Let's talk about <br><em>your property</em>",
    "Hablemos de <em>tu propiedad</em>": "Let's talk about <em>your property</em>",
    "Ya sea que quieras comprar, vender, rentar o invertir, un asesor te atenderá personalmente. Respondemos en menos de 30 minutos en horario hábil.": "Whether you want to buy, sell, rent or invest, an advisor will assist you personally. We reply within 30 minutes during business hours.",
    "Respuesta inmediata": "Instant reply",
    "Correo": "Email",
    "Oficina": "Office",
    "Horario": "Hours",
    "Envíanos un mensaje": "Send us a message",
    "Valuación gratuita": "Free valuation",
    "¿Qué estás buscando?": "What are you looking for?",
    "Enviar mensaje": "Send message",
    "Ubicación de la oficina": "Office location",
    "Amábilis & Espinosa Real Estate — Construyendo tu historia": "Amábilis & Espinosa Real Estate — Building your story",
  };

  var INLINE = { EM: 1, BR: 1, STRONG: 1, B: 1, I: 1, A: 1, SUP: 1 };
  var SKIP = { SCRIPT: 1, STYLE: 1, SVG: 1, svg: 1, TEXTAREA: 1, IFRAME: 1, NOSCRIPT: 1 };
  var ATTRS = ["alt", "aria-label", "title", "data-cursor"];

  function norm(s) {
    // Un campo vacío en la base (zona o tipo sin llenar) no debe romper la página
    if (s == null) return "";
    return String(s).replace(/ data-cursor-bound="1"/g, "").replace(/\s+/g, " ").trim();
  }
  function lookup(s) {
    var k = norm(s);
    return Object.prototype.hasOwnProperty.call(EN, k) ? EN[k] : null;
  }
  function translateText(node) {
    var raw = node.nodeValue;
    if (!raw || !raw.trim()) return;
    var en = lookup(raw);
    if (en === null) return;
    var next = raw.match(/^\s*/)[0] + en + raw.match(/\s*$/)[0];
    if (next !== raw) node.nodeValue = next;
  }
  function translateAttrs(el) {
    for (var i = 0; i < ATTRS.length; i++) {
      var v = el.getAttribute(ATTRS[i]);
      if (v) { var en = lookup(v); if (en !== null && en !== v) el.setAttribute(ATTRS[i], en); }
    }
    // Enlaces internos conservan el idioma (útil para buscadores y enlaces compartidos)
    if (el.tagName === "A") {
      var href = el.getAttribute("href");
      if (href && /^[\w-]+\.html(\?|#|$)/.test(href) && href.indexOf("lang=") === -1) {
        el.setAttribute("href", localizeHref(href));
      }
    }
  }
  function translateTree(el) {
    if (lang !== "en" || !el || SKIP[el.tagName]) return;
    if (el.nodeType === 3) return translateText(el);
    if (el.nodeType !== 1) return;
    translateAttrs(el);
    var kids = el.children, allInline = kids.length > 0, direct = false, i;
    for (i = 0; i < kids.length; i++) if (!INLINE[kids[i].tagName]) { allInline = false; break; }
    for (i = 0; i < el.childNodes.length; i++) {
      var n = el.childNodes[i];
      if (n.nodeType === 3 && n.nodeValue.trim()) { direct = true; break; }
    }
    if (allInline && direct) {
      var html = lookup(el.innerHTML);
      if (html !== null) { if (norm(html) !== norm(el.innerHTML)) el.innerHTML = html; return; }
    }
    var nodes = Array.prototype.slice.call(el.childNodes);
    for (i = 0; i < nodes.length; i++) translateTree(nodes[i]);
  }

  function localizeHref(href) {
    if (lang !== "en") return href;
    var hash = "", i = href.indexOf("#");
    if (i > -1) { hash = href.slice(i); href = href.slice(0, i); }
    return href + (href.indexOf("?") > -1 ? "&" : "?") + "lang=en" + hash;
  }
  function urlFor(target) {
    var u = new URL(location.href);
    if (target === "es") u.searchParams.delete("lang"); else u.searchParams.set("lang", target);
    return u.pathname + u.search + u.hash;
  }

  // URL absoluta y limpia (sin #, sin "index.html") para canonical y hreflang
  function absolute(target) {
    var canon = document.querySelector('link[rel="canonical"]');
    var origin = canon ? new URL(canon.href).origin : location.origin;
    return origin + urlFor(target).split("#")[0].replace(/\/index\.html/, "/");
  }

  function apply() {
    var alt = function (hl, href) {
      var l = document.createElement("link");
      l.rel = "alternate"; l.hreflang = hl; l.href = href;
      document.head.appendChild(l);
    };
    alt("es-MX", absolute("es")); alt("en", absolute("en")); alt("x-default", absolute("es"));
    var canon = document.querySelector('link[rel="canonical"]');
    if (canon) canon.href = absolute(lang);
    if (lang !== "en") return;
    document.title = lookup(document.title) || document.title;
    var md = document.querySelector('meta[name="description"]');
    if (md) { var d = lookup(md.content); if (d) md.content = d; }
    translateTree(document.body);
    // Traduce todo lo que el JavaScript agregue después (tarjetas, filtros, menús…)
    new MutationObserver(function (list) {
      for (var i = 0; i < list.length; i++) {
        var m = list[i];
        if (m.type === "characterData") translateText(m.target);
        else for (var j = 0; j < m.addedNodes.length; j++) translateTree(m.addedNodes[j]);
      }
    }).observe(document.body, { childList: true, subtree: true, characterData: true });
    root.classList.remove("i18n-pending");
  }

  function setLang(target) {
    try { localStorage.setItem(STORE, target); } catch (e) {}
    location.href = urlFor(target);
  }

  window.I18N = {
    lang: lang,
    t: function (es, en) { return lang === "en" ? en : es; },
    tr: function (s) { if (s == null) return ""; return lang === "en" ? (lookup(s) || s) : s; },
    apply: apply,
    setLang: setLang,
    urlFor: urlFor,
    localizeHref: localizeHref,
  };
})();

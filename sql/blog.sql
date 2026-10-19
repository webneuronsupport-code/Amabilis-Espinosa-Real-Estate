-- =========================================================
--  Amábilis & Espinosa — Blog y Reels en Supabase
--  ---------------------------------------------------------
--  Crea la tabla del blog para que el negocio publique noticias,
--  guías y reels desde el panel, igual que hace con las propiedades.
--
--  Ejecutar en: Supabase → SQL Editor → New query → Run
--  Es idempotente: puedes volver a ejecutarlo sin romper nada.
-- =========================================================

-- 1. Tabla -------------------------------------------------
create table if not exists public.posts (
  id          text primary key,
  title       text not null,
  category    text not null default 'Noticias',
  date        date,
  read        text,
  cover       text,
  excerpt     text,
  video       text,
  body        jsonb not null default '[]'::jsonb,
  en          jsonb,
  published   boolean not null default true,
  position    integer not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

comment on column public.posts.category is 'Noticias | Guías | Reels';
comment on column public.posts.body is 'Párrafos del artículo. Una línea que empieza con ## es un subtítulo.';
comment on column public.posts.video is 'Solo para Reels: enlace de YouTube, Vimeo o archivo subido.';
comment on column public.posts.en is 'Traducciones al inglés: {title, excerpt, body[]}';
comment on column public.posts.position is 'Orden de aparición (menor primero)';

drop trigger if exists posts_updated_at on public.posts;
create trigger posts_updated_at before update on public.posts
  for each row execute function public.tocar_updated_at();

create index if not exists posts_orden_idx on public.posts (published, position);

-- 2. Seguridad a nivel de fila -----------------------------
alter table public.posts enable row level security;

drop policy if exists "posts lectura publica" on public.posts;
create policy "posts lectura publica" on public.posts
  for select to anon using (published = true);

drop policy if exists "posts lectura autenticados" on public.posts;
create policy "posts lectura autenticados" on public.posts
  for select to authenticated using (true);

drop policy if exists "posts alta autenticados" on public.posts;
create policy "posts alta autenticados" on public.posts
  for insert to authenticated with check (true);

drop policy if exists "posts edicion autenticados" on public.posts;
create policy "posts edicion autenticados" on public.posts
  for update to authenticated using (true) with check (true);

drop policy if exists "posts borrado autenticados" on public.posts;
create policy "posts borrado autenticados" on public.posts
  for delete to authenticated using (true);

-- 3. Contenido actual del sitio ----------------------------
--  Son las 6 entradas que hoy viven en js/data.js. Se insertan
--  para que el panel arranque con el blog que ya está publicado.
--  Si vuelves a ejecutar el archivo, las existentes no se tocan.
insert into public.posts
  (id, title, category, date, read, cover, excerpt, video, body, en, published, position)
values
  ('plusvalia-metepec-2026', '¿Por qué Metepec sigue siendo la zona con mayor plusvalía del Valle de Toluca?', 'Noticias', '2026-09-02', '5 min', '1600585154340-be6161a56a0c', 'Analizamos los factores que mantienen a Metepec como el destino favorito para comprar casa: infraestructura, seguridad y nuevos desarrollos.', null, '["Metepec se ha consolidado como uno de los municipios más atractivos del Estado de México para vivir e invertir. En los últimos años, la llegada de nuevos centros comerciales, hospitales y la cercanía con el Tren Interurbano han impulsado la demanda de vivienda.","## Infraestructura que impulsa el valor","La conexión con la Ciudad de México a través del Tren Interurbano reduce los tiempos de traslado y abre la puerta a quienes trabajan en la capital pero buscan una mejor calidad de vida.","## Oferta residencial en crecimiento","Los desarrollos en privada con amenidades como casa club, alberca y seguridad 24/7 son los más buscados. Esto mantiene una demanda constante y precios al alza.","## Nuestra recomendación","Si estás pensando en comprar, el momento de preventa ofrece las mejores condiciones. Escríbenos y te mostramos las opciones que mejor se ajustan a tu presupuesto."]'::jsonb, '{"title":"Why is Metepec still the highest-appreciation area in the Toluca Valley?","excerpt":"We analyze the factors that keep Metepec the favorite place to buy a home: infrastructure, safety and new developments.","body":["Metepec has become one of the most attractive municipalities in the State of Mexico to live and invest. In recent years, new shopping centers, hospitals and proximity to the Interurban Train have driven housing demand.","## Infrastructure that drives value","The connection to Mexico City via the Interurban Train shortens commute times and opens the door to people who work in the capital but want a better quality of life.","## Growing residential supply","Gated developments with amenities such as a clubhouse, pool and 24/7 security are the most in demand. This keeps demand steady and prices rising.","## Our recommendation","If you are thinking about buying, the pre-sale stage offers the best terms. Message us and we''ll show you the options that best fit your budget."]}'::jsonb, true, 10),
  ('reel-recorrido-grafito', 'Reel: recorrido por Residencial Grafito I', 'Reels', '2026-08-24', '1 min', '1600210492486-724fe5c67fb0', 'Te llevamos dentro de una de nuestras casas más solicitadas en Metepec. Dobles alturas, roof garden y acabados impecables.', null, '["Recorre con nosotros Residencial Grafito I, una casa contemporánea de tres niveles en Metepec.","Síguenos en redes sociales para ver nuevos recorridos cada semana."]'::jsonb, '{"title":"Reel: a tour of Residencial Grafito I","excerpt":"Step inside one of our most requested homes in Metepec. Double-height ceilings, a roof garden and flawless finishes.","body":["Tour Residencial Grafito I with us, a contemporary three-story home in Metepec.","Follow us on social media for new tours every week."]}'::jsonb, true, 20),
  ('guia-credito-hipotecario', 'Guía rápida: cómo elegir el crédito hipotecario ideal en 2026', 'Guías', '2026-08-12', '7 min', '1450101499163-c8848c66ca85', 'Tasa fija, cofinanciamiento, Infonavit o banco: te explicamos en lenguaje claro qué conviene según tu perfil.', null, '["Elegir un crédito hipotecario es una de las decisiones financieras más importantes. Estos son los puntos que siempre revisamos con nuestros clientes.","## 1. Compara el CAT, no solo la tasa","El Costo Anual Total incluye comisiones y seguros. Es el mejor indicador para comparar entre bancos.","## 2. Revisa tu capacidad de pago","Lo recomendable es que la mensualidad no supere el 30% de tus ingresos comprobables.","## 3. Aprovecha los esquemas de cofinanciamiento","Combinar tu crédito Infonavit o Fovissste con un banco puede aumentar tu monto de compra.","## Te acompañamos","En Amábilis & Espinosa te conectamos con asesores hipotecarios y te ayudamos a integrar tu expediente sin costo adicional."]'::jsonb, '{"title":"Quick guide: how to choose the right mortgage in 2026","excerpt":"Fixed rate, co-financing, Infonavit or bank: we explain in plain language what works best for your profile.","body":["Choosing a mortgage is one of the most important financial decisions you will make. These are the points we always review with our clients.","## 1. Compare the CAT, not just the rate","The Total Annual Cost (CAT) includes fees and insurance. It is the best indicator for comparing banks.","## 2. Check your repayment capacity","Ideally, your monthly payment should not exceed 30% of your verifiable income.","## 3. Take advantage of co-financing","Combining your Infonavit or Fovissste credit with a bank loan can increase your purchase amount.","## We''re here to help","At Amábilis & Espinosa we connect you with mortgage advisors and help you put together your application at no extra cost."]}'::jsonb, true, 30),
  ('reel-tips-home-staging', 'Reel: 3 tips para vender tu casa más rápido', 'Reels', '2026-07-30', '1 min', '1600566753190-17f0baa2a6c3', 'Pequeños cambios que hacen una gran diferencia en fotos y visitas: iluminación, orden y neutralidad.', null, '["Preparar tu propiedad antes de publicarla puede reducir semanas el tiempo de venta.","## Iluminación natural","Abre cortinas y cambia focos por luz cálida. Las fotos se verán más amplias.","## Menos es más","Retira objetos personales para que el comprador se imagine viviendo ahí."]'::jsonb, '{"title":"Reel: 3 tips to sell your home faster","excerpt":"Small changes that make a big difference in photos and viewings: lighting, tidiness and neutral spaces.","body":["Preparing your property before listing it can cut weeks off the time it takes to sell.","## Natural light","Open the curtains and switch to warm light bulbs. Your photos will look more spacious.","## Less is more","Remove personal items so buyers can picture themselves living there."]}'::jsonb, true, 40),
  ('invertir-terrenos-campestres', 'Invertir en terrenos campestres: ventajas y lo que debes revisar', 'Guías', '2026-07-15', '6 min', '1500382017468-9049fed747ef', 'Los terrenos en Ixtlahuaca y Temoaya ganan valor año con año. Esto es lo que debes verificar antes de comprar.', null, '["Los terrenos campestres son una alternativa de inversión patrimonial con bajo costo de mantenimiento y alto potencial de plusvalía.","## Documentación en regla","Verifica escrituras, uso de suelo y que el predio esté libre de gravámenes.","## Acceso y servicios","Un acceso pavimentado y servicios a pie de predio pueden duplicar el valor del terreno en pocos años."]'::jsonb, '{"title":"Investing in countryside land: benefits and what to check","excerpt":"Land in Ixtlahuaca and Temoaya gains value every year. Here''s what you should verify before buying.","body":["Countryside land is a long-term investment alternative with low maintenance costs and high appreciation potential.","## Paperwork in order","Verify the title deed, land use and that the lot is free of liens.","## Access and utilities","Paved access and utilities at the lot line can double the value of the land within a few years."]}'::jsonb, true, 50),
  ('nom-247-derechos-consumidor', 'NOM-247: conoce tus derechos al comprar una vivienda', 'Noticias', '2026-06-28', '4 min', '1560518883-ce09059eeffa', 'La norma que protege a los compradores de inmuebles en México. Te explicamos qué información deben darte siempre.', null, '["La NOM-247-SE-2021 establece la información y documentación que todo proveedor inmobiliario debe entregar al consumidor.","## Información clara desde el inicio","Precio total, formas de pago, características del inmueble y la carta de derechos del consumidor deben estar disponibles antes de firmar.","## Nuestro compromiso","En Amábilis & Espinosa cumplimos con la NOM-247 en cada operación para que compres con total tranquilidad."]'::jsonb, '{"title":"NOM-247: know your rights when buying a home","excerpt":"The standard that protects property buyers in Mexico. We explain what information you must always receive.","body":["NOM-247-SE-2021 establishes the information and documentation every real estate provider must give the consumer.","## Clear information from the start","Total price, payment methods, property details and the consumer rights charter must be available before signing.","## Our commitment","At Amábilis & Espinosa we comply with NOM-247 in every transaction so you can buy with complete peace of mind."]}'::jsonb, true, 60)
on conflict (id) do nothing;

-- Comprobación
select id, category, date, published, position
from public.posts
order by position;

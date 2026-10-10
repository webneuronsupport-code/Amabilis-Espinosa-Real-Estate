# Panel de propiedades — guía de puesta en marcha

Con este panel, el equipo de Amábilis & Espinosa puede subir propiedades nuevas, cambiar textos y precios,
agregar o quitar fotos y despublicar lo que ya se vendió, sin tocar código.

- **Dirección del panel:** `https://…/admin.html`
- **Entrada:** `amabilisespinosa@gmail.com` con la contraseña que definas en el paso 4

La puesta en marcha se hace **una sola vez** y toma unos 15 minutos.

---

## 1. Crear el proyecto en Supabase (gratis)

1. Entra a <https://supabase.com> → **Start your project** → crea la cuenta.
2. **New project**:
   - *Name:* `amabilis-espinosa`
   - *Database Password:* genera una y **guárdala** (no se usa en el sitio, pero sirve para soporte).
   - *Region:* `East US (North Virginia)` o la más cercana a México.
3. Espera 1–2 minutos a que termine de crearse.

El plan gratuito incluye 500 MB de base de datos y 1 GB de fotos: de sobra para este catálogo.

---

## 2. Crear las tablas y permisos

1. En el menú lateral: **SQL Editor** → **New query**.
2. Abre el archivo `sql/supabase-propiedades.sql` de este proyecto, copia **todo** su contenido y pégalo.
3. Pulsa **Run**.

Eso crea la tabla de propiedades, las reglas de seguridad, el almacén de fotos y además
**carga las 16 propiedades que hoy están publicadas**, para no empezar de cero.

> Puedes volver a ejecutarlo cuando quieras: no duplica ni borra nada.

4. Repite el mismo procedimiento —**New query**, pegar, **Run**— con estos dos archivos,
   que agregan funciones que llegaron después:

   | Archivo | Para qué sirve |
   |---|---|
   | `sql/variantes-tipos.sql` | Modelos dentro de una propiedad (Tipo A, Tipo B…) |
   | `sql/recorrido-y-video.sql` | Recorrido 360° y video por propiedad |

   Los tres son seguros de repetir: si ya los corriste, no pasa nada.

---

## 3. Conectar el sitio

1. En Supabase: **Project Settings** (engrane) → **API**.
2. Copia estos dos valores:
   - **Project URL** (algo como `https://abcdefgh.supabase.co`)
   - **anon public** (una clave larga)
3. Pégalos en el archivo `js/supabase-config.js`:

```js
window.SUPABASE_CONFIG = {
  url: "https://abcdefgh.supabase.co",
  anonKey: "eyJhbGciOi…",
  bucket: "propiedades",
};
```

4. Sube el cambio al repositorio. En 1–2 minutos el sitio ya lee de la base de datos.

> La clave *anon* es pública a propósito: va dentro de la página web. Lo que impide que
> un extraño modifique algo son las reglas de seguridad del paso 2, que exigen sesión iniciada.

---

## 4. Crear los usuarios y cerrar el registro

1. **Authentication** → **Users** → **Add user** → *Create new user*:
   - Correo: `amabilisespinosa@gmail.com`
   - Contraseña: la que elija el cliente (mínimo 8 caracteres)
   - Marca **Auto Confirm User** → **Create user**
2. Ejecuta `sql/solo-cuenta-autorizada.sql` en el **SQL Editor**. Deja la edición del
   catálogo reservada a esa cuenta: aunque otra persona consiga una sesión en el
   proyecto, no podrá modificar nada.

Es una sola cuenta compartida por el negocio. Para añadir más adelante a otras personas,
agrega su correo a la lista de ese mismo archivo y vuelve a ejecutarlo.

> **Importante si el proyecto de Supabase aloja más de una aplicación.**
> La autenticación es del proyecto completo: los usuarios de cualquier otra app
> pueden iniciar sesión también aquí. Por eso la protección real es el archivo
> `solo-cuenta-autorizada.sql`, no el interruptor de registro público —que además
> no conviene apagar si la otra aplicación necesita que la gente se registre sola.

Este segundo paso es importante: evita que cualquiera con la dirección del panel
pueda crearse una cuenta.

---

## 5. Entrar

Abre `https://…/admin.html`, escribe el correo y la contraseña, y listo.

---

# Cómo se usa

## Subir una propiedad nueva
1. **+ Nueva propiedad**.
2. Escribe el **nombre** y el **precio** (son los dos únicos datos obligatorios).
3. Arrastra las fotos al recuadro. La **primera foto es la portada**; puedes reordenarlas
   arrastrándolas entre sí.
4. Completa zona, tipo, recámaras, baños, metros y la descripción.
5. **Guardar cambios**.

## Cambiar algo de una propiedad
Pulsa **Editar** en la lista, modifica lo que quieras y guarda. El sitio se actualiza solo.

## Quitar una propiedad del sitio sin perderla
En el editor, desmarca **«Visible en el sitio»** y guarda: queda como *borrador*.
Nadie la ve, pero sigue ahí para republicarla cuando quieras.

## Eliminar de verdad
Botón **Eliminar** dentro del editor. Pide confirmación y borra también sus fotos.
**No se puede deshacer**: si tienes dudas, mejor déjala como borrador.

## Duplicar
Útil para propiedades parecidas (por ejemplo, dos modelos del mismo desarrollo):
botón **Duplicar**, cambia lo que sea distinto y guarda.

## Orden y destacadas
- **Orden:** número más bajo, aparece antes.
- **Destacada en la portada:** la incluye en el carrusel del inicio.

## Modelos del desarrollo (Tipo A, Tipo B…)
Cuando una misma propiedad ofrece varios modelos, no hagas una ficha por modelo:
abre la propiedad, baja a **Modelos del desarrollo** y pulsa *+ Agregar modelo*.
Cada modelo lleva su nombre, sus medidas, su texto y **sus propias fotos**.
En la ficha pública aparecen como pestañas, y en el listado la tarjeta muestra
cuántos modelos hay.

Si la propiedad tiene un solo modelo, deja esa parte vacía.

## Recorrido 360° y video
En el bloque **Recorrido virtual y video** del editor:

- **Recorrido 360°:** pega el enlace que te dé Kuula, Matterport o el servicio que uses.
- **Video:** lo mejor es subirlo a **YouTube** —puede ser *oculto / no listado*, así no
  sale en las búsquedas de YouTube— y pegar aquí el enlace. Es gratis, no consume tu
  almacenamiento y se ve fluido hasta en celulares con poca señal. También funcionan
  los enlaces de Vimeo.
- Si prefieres subir el archivo, usa *o subir un archivo de video*: acepta hasta 45 MB.
  Ten en cuenta que los videos propios sí consumen el plan gratuito de Supabase
  (1 GB de almacenamiento y 5 GB de descargas al mes), así que úsalo con moderación.

Lo que dejes vacío sencillamente no se muestra: la ficha no queda con huecos.

## Textos en inglés
Al final del editor, en *Versión en inglés*. Lo que dejes vacío se mostrará en español.

---

# Recomendaciones

- **Fotos:** súbelas tal cual salen del celular o de la cámara, sin prepararlas.
  El panel las reduce solo a 2000 px de lado largo y las convierte a WebP antes de
  guardarlas: una foto de 7 MB acaba pesando unos 200 KB, sin pérdida visible.
  Avisa de cuánto espacio ahorró al terminar.
- **Descripción de cada foto:** el campo bajo cada imagen sirve para que Google entienda
  lo que muestra. Vale la pena llenarlo en la portada y en las dos o tres principales.
- **Los cambios tardan hasta 10 minutos** en verse para quien ya visitó el sitio, porque
  el navegador guarda una copia. Para verlos al instante, recarga con Ctrl+F5.
- **Si Supabase estuviera caído**, el sitio sigue mostrando el catálogo que viene en
  `js/data.js`, así que nunca se queda vacío.

---

# Preguntas frecuentes

**¿Puede alguien entrar al panel?**
La pantalla de acceso la ve cualquiera que conozca la dirección, pero solo
`amabilisespinosa@gmail.com` puede guardar cambios: las reglas de la base rechazan
cualquier edición que venga de otra cuenta.

**¿Y si olvidan la contraseña?**
En Supabase → Authentication → Users → los tres puntos junto a `amabilisespinosa@gmail.com` →
*Send password recovery* (le llega un correo) o *Update password* (la cambias tú).

**¿Cuánto cuesta?**
El plan gratuito de Supabase cubre este volumen. Si algún día se superara, el salto es
a 25 USD al mes, pero con ~100 propiedades y sus fotos no se llega ni cerca.

**¿Las fotos viejas se pierden?**
No. Las propiedades que ya existían siguen usando las fotos del repositorio; solo las
nuevas se guardan en Supabase. Ambas conviven sin problema.

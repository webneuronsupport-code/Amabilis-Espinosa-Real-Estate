# Subida a Hostinger

El sitio es estático (HTML, CSS, JS e imágenes) y no necesita Node ni base de datos en
el servidor: las propiedades viven en Supabase. Lo único que sí corre en Hostinger es
`enviar.php`, que manda los correos de los formularios.

**Paquete listo:** `C:\Users\javie\Desktop\amabilis-produccion.zip` (19.8 MB)

Para volver a armarlo después de cualquier cambio: `python herramientas/empaquetar.py`

---

## 1. Antes de subir — pendientes que bloquean la entrega

| # | Pendiente | Por qué importa |
|---|---|---|
| 1 | **Ejecutar `sql/solo-cuenta-autorizada.sql`** en el SQL Editor | El proyecto de Supabase es compartido con otra app: sin esto, cualquier usuario de esa app puede editar el catálogo del cliente |
| 1b | **Ejecutar `sql/variantes-tipos.sql` y `sql/recorrido-y-video.sql`** | Agregan los modelos (Tipo A/B), el recorrido 360° y el video. Sin ellos el panel no puede guardar esos campos |
| 2 | **Crear la cuenta `amabilisespinosa@gmail.com`** y borrar `prueba@amabilisespinosa.com` | Es la única forma de entrar al panel |
| 3 | **Quitar la palabra «prueba»** del resumen de Residencial Grafito I | Quedó de la prueba de conexión y hoy se ve en la ficha y en Google |
| 4 | **ID de Google Tag Manager** en `js/gtm.js` (hoy `GTM-XXXXXXX`) | Sin él no se mide ninguna conversión de las campañas |
| 5 | **Datos del aviso de privacidad**: domicilio fiscal, correo del responsable, teléfono y fecha | Obligatorio por la LFPDPPP |
| 6 | **Enlaces reales de redes sociales** en `js/data.js` | Hoy apuntan a las portadas de Instagram, Facebook, TikTok, YouTube y X |

Los puntos 1 y 2 son de seguridad: hazlos antes de publicar.

> No desactives el registro público del proyecto: lo necesita la otra aplicación
> que comparte este Supabase. La protección del catálogo es el punto 1.

---

## 2. Subir los archivos

1. Entra a **hPanel** → tu dominio → **Administrador de archivos**.
2. Abre la carpeta **`public_html`** y vacíala si trae la página de bienvenida de Hostinger
   (`default.php`, `index.html` de muestra…).
3. Botón **Subir archivos** → elige `amabilis-produccion.zip`.
4. Cuando termine, clic derecho sobre el ZIP → **Extraer** → dentro de `public_html`.
5. Borra el ZIP del servidor.

Debe quedar así:

```
public_html/
  index.html
  propiedades.html
  propiedad.html
  nosotros.html
  blog.html
  post.html
  contacto.html
  aviso-de-privacidad.html
  admin.html
  404.html
  .htaccess
  robots.txt
  css/
  js/
  img/
```

> Si el Administrador de archivos oculta `.htaccess`, actívalo en **Configuración →
> Mostrar archivos ocultos**. Ese archivo es el que fuerza HTTPS, activa la compresión
> y la caché: sin él el sitio funciona, pero más lento.

**Alternativa por FTP:** sube el contenido de la carpeta
`C:\Users\javie\Desktop\amabilis-produccion` a `public_html` con FileZilla
(los datos de acceso están en hPanel → Archivos → Cuentas FTP).

---

## 3. Certificado SSL

hPanel → **Seguridad → SSL** → instala el certificado gratuito y activa
**Forzar HTTPS**. El `.htaccess` ya redirige, pero conviene tenerlo también
a nivel de panel.

---

## 4. Ajuste en Supabase (una vez tengas el dominio)

**Authentication → URL Configuration → Site URL:** pon `https://tudominio.com`.
Solo se usa para los correos de recuperación de contraseña; el acceso normal con
correo y contraseña funciona sin tocar nada.

No hace falta configurar CORS ni dominios permitidos: la API de Supabase acepta
peticiones desde cualquier origen y lo que protege los datos son las reglas RLS.

---

## 5. Comprobaciones después de subir

1. `https://tudominio.com` → carga el inicio y se ven las propiedades.
2. `https://tudominio.com/propiedades.html` → 16 propiedades.
3. `https://tudominio.com/admin.html` → pantalla de acceso; entra y edita algo.
4. Recarga el sitio y confirma que el cambio aparece.
5. `https://tudominio.com/pagina-inventada` → debe salir la página 404 de la marca.
6. Abre el sitio en el móvil con datos (no wifi) y mira cuánto tarda el inicio.

---

## 6. Cuando haya que actualizar algo

- **Propiedades, fotos, precios y textos:** los cambia el cliente en `/admin.html`.
  No hay que volver a subir nada.
- **Diseño, páginas nuevas o textos fijos:** se cambian aquí y se vuelven a subir
  solo los archivos modificados (normalmente `css/`, `js/` y el HTML afectado).
  Recuerda subir el número de versión `?v=NN` en los HTML para que los navegadores
  no sirvan la versión vieja.

---

## 7. Un aviso de rendimiento

El vídeo de fondo del inicio (`img/hero/hero-main.mp4`) pesa **16.2 MB** de los 29 MB
del sitio. Se descarga en cada visita, también en móvil con datos, y es lo primero
que carga la página de destino de los anuncios.

Recomendación: comprimirlo a 1080p y ~2–3 MB (con HandBrake, CloudConvert o similar),
o cargarlo solo en escritorio y dejar una imagen fija en móvil. Cualquiera de las dos
mejora la velocidad de la página en la que caen las campañas, que es justo lo que
Google Ads penaliza.

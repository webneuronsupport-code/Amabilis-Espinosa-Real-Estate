# Medición con Google Tag Manager — Amábilis & Espinosa

## 1. Conectar el sitio con GTM
1. En [tagmanager.google.com](https://tagmanager.google.com) crea un contenedor **Web** para `amabilisespinosa.com`.
2. Copia el ID (formato `GTM-XXXXXXX`).
3. Pégalo en `js/gtm.js`, en la línea `var GTM_ID = "GTM-XXXXXXX";`.
   Todas las páginas cargan ese archivo, no hay que tocar nada más.

## 2. Importar las etiquetas listas
1. En GTM: **Administrar → Importar contenedor**.
2. Archivo: `tracking/gtm-contenedor-amabilis.json`.
3. Espacio de trabajo: **Existente**. Opción: **Combinar → Cambiar el nombre de las etiquetas en conflicto**.

## 3. Reemplazar los valores de ejemplo (en GTM → Variables)
| Variable | Dónde se obtiene |
|---|---|
| `CONST - GA4 Measurement ID` | GA4 → Administrar → Flujos de datos → `G-...` |
| `CONST - Google Ads Conversion ID` | Google Ads → Objetivos → Conversiones → acción → Configuración de etiqueta → *ID de conversión* (solo números) |
| `CONST - Ads Label Formulario` | *Etiqueta de conversión* de la acción "Formulario" |
| `CONST - Ads Label WhatsApp` | *Etiqueta de conversión* de la acción "WhatsApp" |
| `CONST - Ads Label Llamada` | *Etiqueta de conversión* de la acción "Llamada" |

En Google Ads crea 3 acciones de conversión de tipo **Sitio web → Configurar manualmente**:
- **Formulario** → categoría *Enviar formulario de clientes potenciales* → **Principal**
- **WhatsApp** → categoría *Contacto* → **Principal**
- **Llamada** → categoría *Llamada telefónica* → **Secundaria**

## 4. Probar y publicar
1. En GTM pulsa **Vista previa** y abre el sitio.
2. Haz clic en WhatsApp, en llamar y envía un formulario: deben dispararse las etiquetas correspondientes.
3. Pulsa **Enviar → Publicar**.

## Eventos que envía el sitio
| Evento | Cuándo | Datos incluidos |
|---|---|---|
| `generate_lead` | Se envía un formulario | `form_location`, `lead_interest` |
| `click_whatsapp` | Clic en WhatsApp del negocio (no cuenta "compartir") | `link_location` |
| `click_phone` | Clic en un teléfono | `link_location` |
| `click_email` | Clic en el correo | `link_location` |
| `search` | Búsqueda desde el inicio | `search_term` |

Todos incluyen `page_type`. En las fichas también: `property_id`, `property_zone`, `property_type`, `property_operation`.
En `localhost` cada evento se muestra en la consola del navegador como `[dataLayer]`.

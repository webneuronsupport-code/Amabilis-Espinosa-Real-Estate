<?php
/* =========================================================
   Amábilis & Espinosa — Recepción de solicitudes
   ---------------------------------------------------------
   1. Avisa al negocio con una ficha completa (HTML + foto)
   2. Deja copia en un registro local, por si el correo falla
   3. Manda acuse de recibo a quien escribió, con la propiedad

   Solo funciona en Hostinger (o cualquier hosting con PHP).
   En local no se ejecuta: el sitio lo detecta y abre WhatsApp.
   ========================================================= */

// ---------- Configuración ----------
$DESTINO    = 'amabilisespinosa@gmail.com';            // a dónde llegan los avisos
$REMITENTE  = 'no-responder@amabilisespinosa.com';     // buzón del dominio (debe existir en Hostinger)
$SITIO      = 'Amábilis & Espinosa Real Estate';
$BASE       = 'https://www.amabilisespinosa.com';
$WHATSAPP   = '527294985689';                          // solo dígitos
$TELEFONO   = '+52 729 498 5689';
$LADA       = '52';                                    // para armar el WhatsApp del interesado
$REGISTRO   = __DIR__ . '/solicitudes.csv';
$LIMITE_MIN = 3;                                       // envíos por minuto desde una misma IP
$SUPABASE   = 'https://zzgxjovyanlipmvtwtve.supabase.co';
$SUPAKEY    = 'sb_publishable_VurOkNeVNoyiOESFn3gfmw_fLrxvqzQ';

// Colores de la marca, para los correos
$AZUL = '#0a1430';
$ORO  = '#c5a35e';
$GRIS = '#5b6274';
$LINEA = '#e4ded3';
$CREMA = '#fbf9f5';

header('Content-Type: application/json; charset=utf-8');

function responder($ok, $mensaje = '') {
  echo json_encode(array('ok' => $ok, 'mensaje' => $mensaje), JSON_UNESCAPED_UNICODE);
  exit;
}

/** Envía un correo con versión HTML y versión en texto. */
function enviarCorreo($para, $asunto, $html, $texto, $de, $responderA, $extra = array()) {
  $frontera = 'ae' . md5(uniqid('', true));
  $cuerpo = "--$frontera\r\n"
    . "Content-Type: text/plain; charset=UTF-8\r\n\r\n" . $texto . "\r\n"
    . "--$frontera\r\n"
    . "Content-Type: text/html; charset=UTF-8\r\n\r\n" . $html . "\r\n"
    . "--$frontera--";
  $cabeceras = array_merge(array(
    "From: $de",
    "Reply-To: $responderA",
    'MIME-Version: 1.0',
    'Content-Type: multipart/alternative; boundary="' . $frontera . '"',
  ), $extra);
  return @mail($para, '=?UTF-8?B?' . base64_encode($asunto) . '?=', $cuerpo, implode("\r\n", $cabeceras));
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
  http_response_code(405);
  responder(false, 'Método no permitido.');
}

// ---------- Datos ----------
$crudo = file_get_contents('php://input');
$datos = json_decode($crudo, true);
if (!is_array($datos)) { $datos = $_POST; }

$limpiar = function ($v, $max = 500) {
  $v = is_string($v) ? $v : '';
  $v = str_replace(array("\r", "\n", '%0a', '%0d'), ' ', strip_tags(trim($v)));
  return function_exists('mb_substr') ? mb_substr($v, 0, $max) : substr($v, 0, $max);
};

$nombre    = $limpiar(isset($datos['nombre'])       ? $datos['nombre']       : '', 120);
$telefono  = $limpiar(isset($datos['telefono'])     ? $datos['telefono']     : '', 40);
$correo    = $limpiar(isset($datos['email'])        ? $datos['email']        : '', 160);
$interes   = $limpiar(isset($datos['interes'])      ? $datos['interes']      : '', 80);
$propiedad = $limpiar(isset($datos['propiedad'])    ? $datos['propiedad']    : '', 160);
$propId    = $limpiar(isset($datos['propiedad_id']) ? $datos['propiedad_id'] : '', 70);
$mensaje   = $limpiar(isset($datos['mensaje'])      ? $datos['mensaje']      : '', 2000);
$origen    = $limpiar(isset($datos['origen'])       ? $datos['origen']       : '', 120);
$pagina    = $limpiar(isset($datos['pagina'])       ? $datos['pagina']       : '', 300);
$trampa    = $limpiar(isset($datos['web'])          ? $datos['web']          : '', 50);

if ($trampa !== '') { responder(true); } // robot: se finge éxito y se descarta

if ($nombre === '' || $telefono === '') {
  http_response_code(422);
  responder(false, 'Faltan el nombre o el teléfono.');
}
if ($correo !== '' && !filter_var($correo, FILTER_VALIDATE_EMAIL)) {
  http_response_code(422);
  responder(false, 'El correo no parece válido.');
}

// ---------- Freno para envíos repetidos ----------
$ip = isset($_SERVER['REMOTE_ADDR']) ? $_SERVER['REMOTE_ADDR'] : '0.0.0.0';
$marca = sys_get_temp_dir() . '/ae_' . md5($ip);
$ahora = time();
$previos = file_exists($marca) ? json_decode(file_get_contents($marca), true) : array();
if (!is_array($previos)) { $previos = array(); }
$previos = array_values(array_filter($previos, function ($t) use ($ahora) { return $ahora - $t < 60; }));
if (count($previos) >= $LIMITE_MIN) {
  http_response_code(429);
  responder(false, 'Demasiados envíos seguidos. Inténtalo en un minuto.');
}
$previos[] = $ahora;
@file_put_contents($marca, json_encode($previos));

date_default_timezone_set('America/Mexico_City');
$fecha = date('d/m/Y H:i');
$esc = function ($t) { return htmlspecialchars($t, ENT_QUOTES, 'UTF-8'); };

// ---------- Ficha de la propiedad (desde la base, nunca del formulario) ----------
$ficha = null;
if (preg_match('/^[a-z0-9-]{2,70}$/', $propId)) {
  $url = $SUPABASE . '/rest/v1/properties?select=id,title,price,operation,zone,type,beds,baths,built,images'
       . '&id=eq.' . rawurlencode($propId) . '&published=eq.true&limit=1';
  $ctx = stream_context_create(array('http' => array(
    'method' => 'GET', 'timeout' => 4,
    'header' => "apikey: $SUPAKEY\r\nAuthorization: Bearer $SUPAKEY\r\n",
  )));
  $json = @file_get_contents($url, false, $ctx);
  $filas = $json ? json_decode($json, true) : null;
  if (is_array($filas) && count($filas)) { $ficha = $filas[0]; }
}

$tarjetaHtml = '';
$tarjetaTexto = '';
if ($ficha) {
  $precio = '$' . number_format((float)$ficha['price'], 0, '.', ',') . ' MXN'
          . ($ficha['operation'] === 'Renta' ? ' / mes' : '');
  $foto = (isset($ficha['images']) && is_array($ficha['images']) && count($ficha['images'])) ? $ficha['images'][0] : '';
  $enlace = $BASE . '/propiedad.html?id=' . rawurlencode($ficha['id']);
  $tituloProp = $esc($ficha['title']);
  $ubicacion = $esc(trim($ficha['type'] . ' · ' . $ficha['zone']));

  $detalles = array();
  if (!empty($ficha['beds']))  { $detalles[] = $ficha['beds'] . ' rec.'; }
  if (!empty($ficha['baths'])) { $detalles[] = $ficha['baths'] . ' baños'; }
  if (!empty($ficha['built'])) { $detalles[] = $ficha['built'] . ' m²'; }
  $detallesTxt = $esc(implode('  ·  ', $detalles));

  $tarjetaHtml =
    '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0;border:1px solid ' . $LINEA . ';border-radius:14px;overflow:hidden">'
    . '<tr><td>' . ($foto !== '' ? '<img src="' . $esc($foto) . '" alt="' . $tituloProp . '" width="600" style="display:block;width:100%;max-width:600px;height:auto;border:0">' : '') . '</td></tr>'
    . '<tr><td style="padding:18px 22px">'
    . '<div style="font:700 11px/1.4 Arial,sans-serif;letter-spacing:.12em;text-transform:uppercase;color:#8a8375">' . $ubicacion . '</div>'
    . '<div style="font:400 22px/1.3 Georgia,serif;color:' . $AZUL . ';margin:6px 0 4px">' . $tituloProp . '</div>'
    . '<div style="font:700 17px/1.4 Arial,sans-serif;color:' . $AZUL . '">' . $precio . '</div>'
    . ($detallesTxt !== '' ? '<div style="font:400 13px/1.6 Arial,sans-serif;color:#8a8375;margin-top:6px">' . $detallesTxt . '</div>' : '')
    . '<a href="' . $enlace . '" style="display:inline-block;margin-top:14px;background:' . $ORO . ';color:' . $AZUL . ';text-decoration:none;font:700 13px/1 Arial,sans-serif;padding:13px 22px;border-radius:999px">Ver la propiedad</a>'
    . '</td></tr></table>';

  $tarjetaTexto = "\n" . $ficha['title'] . "\n" . $ficha['type'] . ' - ' . $ficha['zone'] . ' - ' . $precio . "\n" . $enlace . "\n";
}

// Cabecera común de los correos
$encabezado = function ($titulo, $subtitulo) use ($AZUL, $ORO, $esc) {
  return '<tr><td style="background:' . $AZUL . ';padding:26px 30px;text-align:center">'
    . '<div style="font:400 21px/1.2 Georgia,serif;color:#f7f2ea;letter-spacing:.04em">Amábilis &amp; Espinosa</div>'
    . '<div style="font:700 10px/1.4 Arial,sans-serif;color:' . $ORO . ';letter-spacing:.26em;text-transform:uppercase;margin-top:6px">' . $esc($subtitulo) . '</div>'
    . '</td></tr>';
};
$envoltura = function ($interior) use ($CREMA) {
  return '<!DOCTYPE html><html lang="es"><head><meta charset="utf-8">'
    . '<meta name="viewport" content="width=device-width,initial-scale=1"></head>'
    . '<body style="margin:0;background:' . $CREMA . '">'
    . '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:' . $CREMA . ';padding:28px 14px">'
    . '<tr><td align="center">'
    . '<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border-radius:18px;overflow:hidden">'
    . $interior
    . '</table></td></tr></table></body></html>';
};

// =========================================================
//  1. Aviso al negocio — con ficha y botones de acción
// =========================================================
$telDigitos = preg_replace('/\D/', '', $telefono);
if (strlen($telDigitos) === 10) { $telDigitos = $LADA . $telDigitos; }
$waCliente = 'https://wa.me/' . $telDigitos . '?text='
  . rawurlencode('Hola ' . explode(' ', trim($nombre))[0] . ', le escribimos de Amábilis & Espinosa Real Estate por la solicitud que nos envió desde el sitio web.');

$dato = function ($etiqueta, $valor, $enlace = '') use ($GRIS, $AZUL, $LINEA, $esc) {
  if ($valor === '') { return ''; }
  $contenido = $enlace !== ''
    ? '<a href="' . $enlace . '" style="color:' . $AZUL . ';text-decoration:none;font-weight:700">' . $esc($valor) . '</a>'
    : '<span style="color:' . $AZUL . ';font-weight:700">' . $esc($valor) . '</span>';
  return '<tr>'
    . '<td style="padding:11px 0;border-bottom:1px solid ' . $LINEA . ';font:400 13px/1.5 Arial,sans-serif;color:' . $GRIS . ';width:38%">' . $esc($etiqueta) . '</td>'
    . '<td style="padding:11px 0;border-bottom:1px solid ' . $LINEA . ';font:400 15px/1.5 Arial,sans-serif;text-align:right">' . $contenido . '</td>'
    . '</tr>';
};

$formularios = array(
  'contact-page' => 'Página de contacto',
  'property'     => 'Ficha de propiedad',
  'home-cta'     => 'Llamada a la acción del inicio',
);
$nombreForm = isset($formularios[$origen]) ? $formularios[$origen] : ($origen !== '' ? $origen : 'Sitio web');

$interiorNegocio = $encabezado('', 'Nueva solicitud')
  . '<tr><td style="padding:32px 30px 8px">'
  . '<div style="font:400 26px/1.25 Georgia,serif;color:' . $AZUL . '">' . $esc($nombre) . '</div>'
  . '<div style="font:400 13px/1.6 Arial,sans-serif;color:#8a8375;margin-top:4px">' . $esc($nombreForm) . ' · ' . $esc($fecha) . '</div>'
  . '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:20px">'
  . $dato('Teléfono', $telefono, 'tel:' . $telDigitos)
  . $dato('Correo', $correo, $correo !== '' ? 'mailto:' . $correo : '')
  . $dato('Interés', $interes)
  . $dato('Propiedad', $propiedad)
  . '</table>';

if ($mensaje !== '') {
  $interiorNegocio .= '<div style="margin-top:22px;background:' . $CREMA . ';border-left:3px solid ' . $ORO . ';padding:16px 18px;'
    . 'font:400 15px/1.7 Arial,sans-serif;color:' . $AZUL . '">' . nl2br($esc($mensaje)) . '</div>';
}

$interiorNegocio .= $tarjetaHtml
  . '<p style="margin:24px 0 0">'
  . '<a href="' . $waCliente . '" style="display:inline-block;background:#25d366;color:#ffffff;text-decoration:none;font:700 14px/1 Arial,sans-serif;padding:14px 26px;border-radius:999px">Responder por WhatsApp</a>'
  . '<a href="tel:' . $telDigitos . '" style="display:inline-block;margin-left:8px;color:' . $AZUL . ';text-decoration:none;font:700 14px/1 Arial,sans-serif;padding:14px 22px;border:1px solid ' . $LINEA . ';border-radius:999px">Llamar</a>'
  . '</p></td></tr>'
  . '<tr><td style="padding:26px 30px 32px">'
  . '<div style="border-top:1px solid ' . $LINEA . ';padding-top:16px;font:400 12px/1.7 Arial,sans-serif;color:#8a8375">'
  . 'Página desde la que escribió:<br><a href="' . $esc($pagina) . '" style="color:#8a8375">' . $esc($pagina) . '</a>'
  . '</div></td></tr>';

$textoNegocio = "Nueva solicitud desde el sitio web\n"
  . str_repeat('-', 42) . "\n"
  . "Nombre   : $nombre\n"
  . "Telefono : $telefono\n"
  . ($correo !== ''    ? "Correo   : $correo\n"    : '')
  . ($interes !== ''   ? "Interes  : $interes\n"   : '')
  . ($propiedad !== '' ? "Propiedad: $propiedad\n" : '')
  . ($mensaje !== ''   ? "\nMensaje:\n$mensaje\n"  : '')
  . $tarjetaTexto
  . str_repeat('-', 42) . "\n"
  . "Formulario: $nombreForm\nPagina    : $pagina\nFecha     : $fecha\n";

$asunto = 'Solicitud web: ' . $nombre . ($propiedad !== '' ? ' · ' . $propiedad : '');
$enviado = enviarCorreo(
  $DESTINO, $asunto, $envoltura($interiorNegocio), $textoNegocio,
  "$SITIO <$REMITENTE>",
  $correo !== '' ? "$nombre <$correo>" : $REMITENTE
);

// =========================================================
//  2. Copia de seguridad
// =========================================================
$nuevo = !file_exists($REGISTRO);
$f = @fopen($REGISTRO, 'a');
if ($f) {
  if ($nuevo) {
    fwrite($f, "\xEF\xBB\xBF"); // para que Excel respete los acentos
    fputcsv($f, array('Fecha', 'Nombre', 'Teléfono', 'Correo', 'Interés', 'Propiedad', 'Mensaje', 'Formulario', 'Página', 'Correo enviado'));
  }
  fputcsv($f, array($fecha, $nombre, $telefono, $correo, $interes, $propiedad, $mensaje, $nombreForm, $pagina, $enviado ? 'sí' : 'NO'));
  fclose($f);
}

// =========================================================
//  3. Acuse de recibo para quien escribió
// =========================================================
if ($correo !== '') {
  $nombreCorto = $esc(explode(' ', trim($nombre))[0]);
  $wa = 'https://wa.me/' . $WHATSAPP . '?text=' . rawurlencode('Hola, acabo de enviar una solicitud desde el sitio web.');
  $tel = str_replace(' ', '', $TELEFONO);

  $interiorAcuse = $encabezado('', 'Real Estate')
    . '<tr><td style="padding:34px 30px 10px">'
    . '<div style="font:400 26px/1.25 Georgia,serif;color:' . $AZUL . '">Gracias, ' . $nombreCorto . '</div>'
    . '<p style="font:400 15px/1.7 Arial,sans-serif;color:' . $GRIS . ';margin:16px 0 0">'
    . 'Recibimos tu solicitud y ya tenemos tus datos. Un asesor te contactará personalmente; '
    . 'si escribiste en horario de oficina, normalmente respondemos en menos de 30 minutos.'
    . '</p>'
    . $tarjetaHtml
    . '<p style="font:400 15px/1.7 Arial,sans-serif;color:' . $GRIS . ';margin:0">¿Prefieres que hablemos ya?</p>'
    . '<p style="margin:18px 0 0">'
    . '<a href="' . $wa . '" style="display:inline-block;background:#25d366;color:#ffffff;text-decoration:none;font:700 14px/1 Arial,sans-serif;padding:14px 26px;border-radius:999px">WhatsApp</a>'
    . '<a href="tel:' . $tel . '" style="display:inline-block;margin-left:8px;color:' . $AZUL . ';text-decoration:none;font:700 14px/1 Arial,sans-serif;padding:14px 22px;border:1px solid ' . $LINEA . ';border-radius:999px">' . $TELEFONO . '</a>'
    . '</p></td></tr>'
    . '<tr><td style="padding:26px 30px 32px">'
    . '<div style="border-top:1px solid ' . $LINEA . ';padding-top:18px;font:400 12px/1.7 Arial,sans-serif;color:#8a8375">'
    . 'Amábilis &amp; Espinosa Real Estate · Metepec, Estado de México<br>'
    . 'Lun – Sáb · 9:00 a 19:00 · <a href="' . $BASE . '" style="color:#8a8375">' . str_replace('https://', '', $BASE) . '</a><br>'
    . 'Recibes este correo porque enviaste una solicitud desde nuestro sitio.'
    . '</div></td></tr>';

  $textoAcuse = "Gracias, " . explode(' ', trim($nombre))[0] . "\n\n"
    . "Recibimos tu solicitud y ya tenemos tus datos. Un asesor te contactara personalmente.\n"
    . $tarjetaTexto
    . "\nWhatsApp: $wa\nTelefono: $TELEFONO\n\n"
    . "Amabilis & Espinosa Real Estate - Metepec, Estado de Mexico\n$BASE\n";

  enviarCorreo(
    $correo, 'Recibimos tu solicitud · Amábilis & Espinosa',
    $envoltura($interiorAcuse), $textoAcuse,
    "$SITIO <$REMITENTE>", $DESTINO,
    array('X-Auto-Response-Suppress: All', 'Auto-Submitted: auto-replied')
  );
}

responder(true);

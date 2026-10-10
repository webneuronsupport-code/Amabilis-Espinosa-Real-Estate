# -*- coding: utf-8 -*-
"""Arma el ZIP que se sube a Hostinger.

Solo entra lo que el sitio publicado necesita: quedan fuera las herramientas
internas (migrar-fotos), los SQL, las guías, los respaldos .bak y las fotos
originales que ya viven en Supabase.

    python herramientas/empaquetar.py
"""
import os
import zipfile

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DESTINO = os.path.join(os.path.expanduser("~"), "Desktop", "amabilis-produccion.zip")

PAGINAS = [
    "index.html", "propiedades.html", "propiedad.html", "nosotros.html",
    "blog.html", "post.html", "contacto.html", "aviso-de-privacidad.html",
    "404.html", "admin.html",
]
SUELTOS = ["enviar.php", ".htaccess", "robots.txt", "sitemap.xml"]
CODIGO = [
    "css/styles.css", "css/mobile.css", "css/admin.css",
    "js/main.js", "js/store.js", "js/data.js", "js/i18n.js", "js/gtm.js",
    "js/admin.js", "js/admin-demo.js", "js/supabase-config.js",
]
IMAGENES = [
    "img/favicon.svg", "img/favicon-32.png", "img/apple-touch-icon.png",
    "img/logo.png", "img/logo-sprite.svg", "img/og-image.jpg",
    "img/certificaciones/conocer.png", "img/certificaciones/sep.png",
    "img/equipo/genny-amabilis.avif", "img/equipo/ivan-espinosa.avif",
    "img/hero/hero-main.mp4", "img/hero/hero.mp4",
    "img/memoria/yadira-marcos-caamal.jpg",
    "img/propiedades/refugio-santa-fe/05.webp",
    "img/propiedades/residencial-grafito-i/01.avif",
    "img/propiedades/residencial-grafito-i/02.avif",
    "img/propiedades/valle-de-zamarrero/01.webp",
    "img/testimonios/ejemplo/ejemplo-1.jpg",
    "img/testimonios/ejemplo/ejemplo-2.jpg",
    "img/testimonios/ejemplo/ejemplo-3.jpg",
]

lista = PAGINAS + SUELTOS + CODIGO + IMAGENES
faltan = [r for r in lista if not os.path.exists(os.path.join(RAIZ, r))]
if faltan:
    raise SystemExit("No se encontraron estos archivos:\n  " + "\n  ".join(faltan))

with zipfile.ZipFile(DESTINO, "w", zipfile.ZIP_DEFLATED, compresslevel=9) as z:
    for ruta in lista:
        z.write(os.path.join(RAIZ, ruta), ruta)

peso = os.path.getsize(DESTINO) / 1048576
print(f"{DESTINO}\n{len(lista)} archivos · {peso:.1f} MB")

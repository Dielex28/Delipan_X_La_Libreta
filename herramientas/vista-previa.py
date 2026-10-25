#!/usr/bin/env python3
"""Genera el sitio completo en un solo archivo HTML para mandarlo por WhatsApp o correo.

Uso, desde la carpeta del proyecto:
    python3 herramientas/vista-previa.py

Crea dist/delipan-vista-previa.html con el CSS, el JavaScript y las fotos dentro
(en su versión de 800 px, para que pese menos). Las tipografías y el mapa siguen
cargando de internet. La carpeta dist/ no se guarda en el repositorio.
"""
import base64
import re
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
SALIDA = RAIZ / 'dist' / 'delipan-vista-previa.html'
TIPOS = {'.webp': 'image/webp', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.svg': 'image/svg+xml'}


def leer(ruta):
    return (RAIZ / ruta).read_text(encoding='utf-8')


_cache = {}


def como_datos(ruta):
    """Convierte una imagen del proyecto en data: URI (una sola vez por archivo)."""
    if ruta not in _cache:
        archivo = RAIZ / ruta
        tipo = TIPOS.get(archivo.suffix.lower(), 'application/octet-stream')
        _cache[ruta] = f'data:{tipo};base64,' + base64.b64encode(archivo.read_bytes()).decode()
    return _cache[ruta]


def main():
    html = leer('index.html')
    css = leer('css/sitio.css')
    js = leer('js/sitio.js')

    # Comentarios con direcciones de ejemplo que no aplican a un archivo suelto
    html = re.sub(r'<!-- Imagen al compartir:.*?-->\n', '', html, flags=re.S)
    # Estilos y script dentro de la página
    html = re.sub(r'<link rel="stylesheet" href="css/sitio\.css[^"]*">', lambda _: f'<style>\n{css}\n</style>', html)
    html = re.sub(r'<script src="js/sitio\.js[^"]*" defer></script>', lambda _: f'<script>\n{js}\n</script>', html)
    # Una sola versión por foto: sin precarga, sin <source> y sin srcset
    html = re.sub(r'<link rel="preload" as="image"[^>]*>\n', '', html)
    html = re.sub(r'\s*<source type="image/webp"[^>]*>', '', html)
    html = re.sub(r'\s(srcset|sizes)="[^"]*"', '', html)
    html = re.sub(r'img/productos/([a-z0-9-]+)-1600\.webp', r'img/productos/\1-800.webp', html)
    html = re.sub(
        r'(src|href|data-grande)="(img/[^"]+)"',
        lambda m: f'{m.group(1)}="{como_datos(m.group(2).replace("img/taller.jpg", "img/taller-800.webp"))}"',
        html,
    )

    pendientes = re.findall(r'(?:src|href|data-grande)="((?:img|css|js)/[^"]+)"', html)
    if pendientes:
        raise SystemExit(f'Quedaron rutas sin incluir: {pendientes[:5]}')

    SALIDA.parent.mkdir(exist_ok=True)
    SALIDA.write_text(html, encoding='utf-8')
    print(f'Listo: {SALIDA.relative_to(RAIZ)} ({SALIDA.stat().st_size // 1024} KB)')


if __name__ == '__main__':
    main()

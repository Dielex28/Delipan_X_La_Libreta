# Delipan × La Libreta

Sitio público de **Delipan**, panadería en Lomas del Camichín, Tonalá, Jalisco, con la sección puente hacia **La Libreta — Edición Delipan, por Axiom**.

Es una sola página estática: HTML, CSS y JavaScript sin dependencias ni paso de compilación. Hecho por **Axiom Digital Studio**.

## Cómo abrirlo en tu PC

1. Descarga o clona el repositorio.
2. Abre `index.html` con doble clic (Chrome, Edge o Firefox).

No hace falta instalar nada. Necesita internet solo para las tipografías y el mapa de Google.

**Para editarlo cómodo:** abre la carpeta en Visual Studio Code, instala la extensión **Live Server** y da clic en **Go Live**. Cada cambio que guardes se ve al instante en el navegador.

**Con Python:** desde la carpeta del proyecto,

```bash
python3 -m http.server 8080
# y abre http://localhost:8080
```

## Estructura

```
index.html                  contenido de todas las secciones
css/sitio.css               diseño y animaciones
js/sitio.js                 comportamiento: menú, vitrina, temporada, galería, cotizador,
                            botón de WhatsApp, horario en vivo, panel de La Libreta…
img/                        foto del taller, favicon e imagen para compartir
img/productos/              fotos de producto en 800 y 1600 px (WebP)
herramientas/vista-previa.py  genera el sitio en un solo archivo (ver abajo)
```

## Secciones

1. **Telón de entrada:** el nombre se acomoda letra por letra y se levanta (solo la primera visita de la sesión).
2. **Cabecera:** logotipo centrado y menú. Al bajar aparece una barra compacta que se esconde al seguir bajando, vuelve al subir, marca la sección activa y se oscurece sobre La Libreta.
3. **Portada:** título palabra por palabra, foto de bollos de sabores en arco que sube desde abajo con paralaje y horario en vivo.
4. **Cinta de productos:** se mueve sola, acelera con el scroll y casi se detiene al pasar el cursor.
5. **La casa:** la frase se ilumina palabra por palabra al bajar; tres pilares con línea que se traza.
6. **La vitrina:** cuatro líneas con sus productos, dibujos que se trazan solos y enlace a WhatsApp con el mensaje ya escrito. En escritorio el arco muestra la foto de la línea que señalas (y rota sola); en celular cada línea trae su foto. Cierra con el calendario **De temporada** (pan de muerto, conchas de calabaza y rosca de Reyes): elige solo el que toca según la fecha en Tonalá, marca «Disponible ahora» o «Desde el…», y al cambiar la foto sube como cortina.
7. **Recién horneado:** galería de 14 fotos que aparecen tras una cortina. Al tocar una, crece desde su lugar hasta pantalla completa; se navega con flechas, teclado o deslizando el dedo, y al cerrar regresa a su lugar.
8. **Lo que dicen en Google:** calificación 4.4 que rueda como odómetro, estrellas que se llenan, barras por estrellas y las dos reseñas con texto, con botones para dejar reseña y ver todas.
9. **El taller:** foto a todo lo ancho con paralaje y acercamiento; «Del horno a tu mesa» con una línea que avanza con el scroll y enciende cada paso.
10. **Comedores:** cómo surten, en tres pasos, con fotos del pan por paquete.
11. **Cotizador:** tipo de pedido (comedor, negocio o evento), cantidad, pan, días, fecha, nombre y nota. A un lado se ve en vivo cómo llegará el mensaje; al enviar se abre WhatsApp con todo escrito. Para un evento los días se pliegan y cambian las etiquetas.
12. **La Libreta:** panel de ejemplo que se endereza al aparecer, cifras que ruedan como odómetro y una demostración que se mueve sola (pedido nuevo, confirmaciones, horno). Dos accesos y solicitud de acceso.
13. **Visítanos:** horario con el día de hoy, estado abierto o cerrado y mapa dentro de un arco.

**Botón flotante de WhatsApp:** aparece al bajar, se aparta donde ya hay botones de contacto (cotizador, Visítanos y pie), cambia a oro sobre La Libreta y, una vez por visita, saluda con «¿Te ayudamos con tu pedido?».

**Para Google:** datos estructurados de panadería (dirección, horario, teléfono, WhatsApp y catálogo de pan por línea). La calificación no va en esos datos porque Google no acepta reseñas mostradas por el propio negocio.

**Detalles en todo el sitio:** botones con tinta que sube y texto que rueda, onda al pulsar y atracción magnética; subrayados que se van y regresan; barra de progreso de lectura; menú de pantalla completa en celular; aviso de La Libreta con entrada y salida animadas.

**Accesibilidad:** con «reducir movimiento» activado no hay telón, paralaje ni animaciones. Sin JavaScript, o si `js/sitio.js` no carga, el contenido se ve completo.

## Dónde se cambian los datos

| Qué | Dónde |
|---|---|
| Teléfono y dirección | `index.html`: sección `#visitanos` y el bloque `application/ld+json` del `<head>` (el que lee Google) |
| Horario | `index.html`: línea superior, datos de la portada, sección `#visitanos`, `<meta name="description">` y bloque `application/ld+json`. Además `CONFIG.horario` en `js/sitio.js` (aviso «abierto/cerrado») |
| Número de WhatsApp del cotizador | `CONFIG.whatsapp` en `js/sitio.js`; los demás botones usan el enlace `wa.me` en `index.html` |
| Fechas de temporada | `CONFIG.temporadas` en `js/sitio.js` (inicio, fin y si la foto lleva «Imagen ilustrativa») |
| Reseñas de Google | `index.html`, sección `#resenas` (se copian a mano cuando llegan nuevas) |
| Accesos a La Libreta | `CONFIG.libreta` en `js/sitio.js`: la dirección de La Libreta (por ejemplo `https://libreta.delipan.mx`). Vacía, los botones muestran un aviso con teléfono y WhatsApp; con dirección, «Entrar como cliente» abre la entrada de clientes (teléfono y PIN) y «Acceso personal» la del equipo |

## Vista previa en un solo archivo

Para mandar el sitio por WhatsApp o correo y que alguien lo vea sin descomprimir nada:

```bash
python3 herramientas/vista-previa.py
```

Crea `dist/delipan-vista-previa.html` (unos 4 MB) con todo adentro. La carpeta `dist/` no se guarda en el repositorio porque se vuelve a generar en cada cambio.

## Publicarlo

- **GitHub Pages:** en el repositorio, **Settings › Pages › Build and deployment** → *Deploy from a branch* → rama `main`, carpeta `/ (root)`. En un repositorio privado, Pages pide un plan de pago de GitHub.
- **Netlify o Cloudflare Pages:** publican gratis desde un repositorio privado. Se conecta el repositorio, sin comando de compilación y con la raíz como carpeta de publicación.

Cuando Delipan tenga dominio propio, se configura en el mismo servicio. Después hay que descomentar en el `<head>` de `index.html` las etiquetas `og:image` y `canonical` con la dirección completa; la imagen para compartir ya está en `img/compartir.jpg`.

## Paleta propuesta (provisional, Delipan aún no tiene colores oficiales)

| Uso | Color |
|---|---|
| Marfil (fondo) | `#f7f3ec` |
| Lino (bandas) | `#efe8dc` |
| Espresso (texto) | `#1e1712` |
| Bronce (acento) | `#85592a` |
| Grafito (La Libreta) | `#121110` |
| Oro champaña (La Libreta) | `#c9a45c` |

Tipografías: Cormorant Garamond (títulos), Jost (texto y etiquetas) y JetBrains Mono (horarios del panel de La Libreta).

## Pendiente de Delipan

- [ ] Logotipo (por ahora hay una marca tipográfica provisional con espiga).
- [ ] Colores oficiales, si los definen.
- [x] Fotos de producto (16 fotos de Delipan en `img/productos/`).
- [x] El 33 1534 1316 recibe WhatsApp.
- [ ] Nombres exactos del pan dulce y la pastelería (la vitrina usa los que se ven en las fotos).
- [ ] Foto de buñuelos: confirmar que es de Delipan antes de usarla.
- [ ] Fotos propias de **pan de muerto** y **rosca de Reyes**: las actuales son de internet y llevan «Imagen ilustrativa». Al tener las de Delipan, reemplazar `img/productos/pan-muerto-*`, `pan-muerto-masa-*` y `rosca-reyes-*`, y poner `ilustrativa: false` en `CONFIG.temporadas`.
- [ ] Confirmar las fechas de cada temporada (hoy: pan de muerto del 15 de octubre al 2 de noviembre, rosca del 15 de diciembre al 6 de enero, calabaza en octubre).
- [ ] Preguntas frecuentes y la historia de Delipan, con fotos del equipo.
- [ ] Correo para cotizaciones, redes sociales y año de fundación (opcionales).
- [ ] Dominio, y con él las etiquetas para compartir (ver «Publicarlo»).
- [ ] Dominio para La Libreta (por ejemplo `libreta.delipan.mx`) y escribirlo en `CONFIG.libreta`.

## Relación con La Libreta

La Libreta es el sistema de pedidos, producción, reparto y cobranza de la panadería; vive en su propio repositorio. Este sitio solo la presenta: el panel de la sección «La Libreta» es una demostración con datos ficticios, y los botones «Entrar como cliente» y «Acceso personal» llevarán a la Edición Delipan cuando esté en línea (`CONFIG.libreta`).

---

Datos de contacto, horario, descripción y reseñas tomados de la ficha de Google Maps de Delipan.

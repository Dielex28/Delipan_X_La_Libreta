# Delipan × La Libreta

Sitio público de **Delipan** (panadería en Lomas del Camichín, Tonalá, Jalisco) con la sección puente hacia **La Libreta — Edición Delipan, por Axiom**.

Es una sola página estática: HTML, CSS y JavaScript sin dependencias ni paso de compilación.

## Verlo en tu computadora

Abre `index.html` en el navegador, o sirve la carpeta:

```bash
python3 -m http.server 8080
# http://localhost:8080
```

## Publicarlo gratis con GitHub Pages

En el repositorio: **Settings › Pages › Build and deployment** → *Deploy from a branch* → la rama del sitio (hoy `ccr-60e4972f-db6du4`; conviene renombrarla a `main`), carpeta `/ (root)`. Cuando Delipan tenga dominio propio, se configura en la misma pantalla.

## Estructura

```
index.html        contenido y secciones (los datos de contacto viven aquí)
css/sitio.css     diseño y movimiento: marfil, espresso y bronce; grafito y oro champaña para La Libreta
js/sitio.js       entrada, revelados, scroll, menú, cinta, proceso, panel en vivo y accesos a La Libreta
img/              foto del taller, favicon y img/productos/ (fotos de producto en 800 y 1600 px)
```

## Secciones

1. **Telón de entrada:** el nombre se acomoda letra por letra y se levanta (solo la primera visita de la sesión).
2. **Cabecera:** logotipo centrado y menú; al bajar aparece una barra compacta que se esconde al seguir bajando, vuelve al subir, marca la sección activa y se oscurece sobre La Libreta.
3. **Portada:** título palabra por palabra, foto de bollos de sabores en arco que sube desde abajo con paralaje, horario en vivo.
4. **Cinta de productos:** se mueve sola, acelera con el scroll y casi se detiene al pasar el cursor.
5. **La casa:** la frase se ilumina palabra por palabra al bajar; tres pilares con línea que se traza.
6. **La vitrina:** cuatro líneas con sus productos reales, dibujos que se trazan solos y enlace a WhatsApp con el mensaje ya escrito. En escritorio el arco muestra la foto de la línea que señalas (y rota sola); en celular cada línea trae su foto. Cierra con el calendario **De temporada** (pan de muerto, conchas de calabaza y rosca de Reyes): elige solo el que toca según la fecha en Tonalá, marca «Disponible ahora» o «Desde el…», y al cambiar la foto sube como cortina.
7. **Recién horneado:** galería de 14 fotos que aparecen tras una cortina. Al tocar una, crece desde su lugar hasta pantalla completa; se navega con flechas, teclado o deslizando el dedo, y al cerrar regresa a su lugar.
8. **Lo que dicen en Google:** calificación 4.4 que rueda como odómetro, estrellas que se llenan, barras por estrellas y las dos reseñas con texto. Botones para dejar reseña y ver todas. Se actualizan a mano en `index.html` (sección `#resenas`).
9. **El taller (apartado visual):** foto a todo lo ancho con paralaje y acercamiento; "Del horno a tu mesa" con una línea que avanza con el scroll y enciende cada paso.
10. **Comedores:** cómo surten, en tres pasos, con fotos del pan por paquete.
11. **Cotizador:** tipo de pedido (comedor, negocio o evento), cantidad, pan, días, fecha, nombre y nota. A un lado se ve en vivo cómo llegará el mensaje; al enviar se abre WhatsApp con todo escrito. Para un evento los días se pliegan y cambian las etiquetas.
12. **La Libreta:** panel de ejemplo que se endereza al aparecer, cifras que ruedan como odómetro y una demostración que se mueve sola (pedido nuevo, confirmaciones, horno). Dos accesos y solicitud de acceso.
13. **Visítanos:** horario con el día de hoy, estado abierto/cerrado y mapa dentro de un arco.

**Botón flotante de WhatsApp:** aparece al bajar, se aparta donde ya hay botones de contacto (cotizador, visítanos y pie), cambia a oro sobre La Libreta y, una vez por visita, saluda con «¿Te ayudamos con tu pedido?».

**Para Google:** datos estructurados de panadería (dirección, horario, teléfono, WhatsApp y catálogo de pan por línea). La calificación no va en esos datos porque Google no acepta reseñas mostradas por el propio negocio.

Detalles en todo el sitio: botones con tinta que sube y texto que rueda, onda al pulsar y atracción magnética; subrayados que se van y regresan; barra de progreso de lectura; menú de pantalla completa en celular; aviso de La Libreta con entrada y salida animadas.

**Accesibilidad:** con "reducir movimiento" activado no hay telón, paralaje ni animaciones. Sin JavaScript, o si `sitio.js` no carga, el contenido se ve completo.

## Dónde se cambian los datos

- **Teléfono, dirección y horario:** en `index.html` (sección `#contacto` y el bloque `application/ld+json` del `<head>`, que usa Google). El horario del aviso «abierto/cerrado» está en `CONFIG.horario` de `js/sitio.js`.
- **Pan de temporada:** `CONFIG.temporadas` en `js/sitio.js` (fechas de inicio y fin, y si la foto lleva «Imagen ilustrativa»).
- **Accesos a La Libreta:** `CONFIG.libreta` en `js/sitio.js`. Mientras estén vacíos, los botones muestran un aviso con teléfono y WhatsApp; al poner una dirección, llevan directo a La Libreta.

## Paleta propuesta (provisional, Delipan aún no tiene colores oficiales)

| Uso | Color |
|---|---|
| Marfil (fondo) | `#f7f3ec` |
| Lino (bandas) | `#efe8dc` |
| Espresso (texto) | `#1e1712` |
| Bronce (acento) | `#85592a` |
| Grafito (La Libreta) | `#121110` |
| Oro champaña (La Libreta) | `#c9a45c` |

Tipografías: Cormorant Garamond (títulos), Jost (texto y etiquetas), JetBrains Mono (horarios del panel de La Libreta).

## Pendiente de Delipan

- [ ] Logotipo (por ahora hay una marca tipográfica provisional con espiga).
- [ ] Colores oficiales, si los definen.
- [x] Fotos de producto (16 fotos de Delipan en `img/productos/`).
- [x] El 33 1534 1316 recibe WhatsApp.
- [ ] Nombres exactos del pan dulce y la pastelería (la vitrina usa los que se ven en las fotos).
- [ ] Foto de buñuelos: confirmar que es de Delipan antes de usarla.
- [ ] Fotos propias de **pan de muerto** y **rosca de Reyes**: las actuales son de internet y llevan «Imagen ilustrativa». Al tener las de Delipan, reemplazar `img/productos/pan-muerto-*`, `pan-muerto-masa-*` y `rosca-reyes-*`, y poner `ilustrativa: false`.
- [ ] Confirmar las fechas de cada temporada (hoy: pan de muerto 15 oct–2 nov, rosca 15 dic–6 ene, calabaza octubre).
- [ ] Correo para cotizaciones, redes sociales y año de fundación (opcionales).
- [ ] Dominio. La imagen para compartir ya está en `img/compartir.jpg`; al tener dominio, descomentar las etiquetas `og:image` y `canonical` del `<head>`.
- [ ] Direcciones de La Libreta, Edición Delipan, cuando esté en línea.

Datos de contacto, horario y descripción tomados de la ficha de Google Maps de Delipan.

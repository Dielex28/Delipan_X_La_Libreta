// Delipan · sitio público: entrada, revelados, scroll, menú, cinta, proceso, panel en vivo y accesos a La Libreta.
// Todo el movimiento respeta "reducir movimiento" y el contenido se ve completo aunque este archivo no cargue.
(() => {
  'use strict';
  window.DELIPAN = true;

  const CONFIG = {
    // Cuando La Libreta, Edición Delipan, esté en línea, pon aquí su dirección (por ejemplo 'https://libreta.delipan.mx').
    // «Entrar como cliente» abre su pestaña de clientes y «Acceso personal» la del equipo.
    // Mientras esté vacía, los botones muestran un aviso con teléfono y WhatsApp.
    libreta: '',
    zona: 'America/Mexico_City',
    whatsapp: '523315341316',
    // Día de la semana (0 = domingo) → [abre, cierra] en horas; sin entrada = cerrado
    horario: {1: [9, 21], 2: [9, 21], 3: [9, 21], 4: [9, 21], 5: [9, 21], 6: [9, 21]},
    // Pan de temporada: [mes, día] de inicio y fin. Si dos coinciden, gana el primero de la lista.
    // `ilustrativa: true` muestra la leyenda «Imagen ilustrativa» (fotos que no son de Delipan).
    temporadas: [
      {id: 'muerto', desde: [10, 15], hasta: [11, 2], ilustrativa: true},
      {id: 'rosca', desde: [12, 15], hasta: [1, 6], ilustrativa: true},
      {id: 'calabaza', desde: [10, 1], hasta: [10, 31], ilustrativa: false}
    ]
  };

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const raiz = document.documentElement;
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const rmQuery = matchMedia('(prefers-reduced-motion: reduce)');
  let RM = rmQuery.matches;
  rmQuery.addEventListener?.('change', e => { RM = e.matches; });
  const finoQuery = matchMedia('(hover: hover) and (pointer: fine)');
  const EASE = 'cubic-bezier(0.16, 1, 0.3, 1)';

  // ---------- Preparar textos para animarlos ----------

  // Etiquetas que se escriben letra por letra
  $$('[data-revelar="typed"]').forEach(el => {
    const texto = el.textContent;
    const sr = Object.assign(document.createElement('span'), {className: 'sr', textContent: texto});
    const tw = Object.assign(document.createElement('span'), {className: 'tw'});
    tw.setAttribute('aria-hidden', 'true');
    [...texto].forEach((c, i) => {
      const k = document.createElement('i');
      k.style.setProperty('--c', i);
      k.textContent = c;
      tw.append(k);
    });
    el.replaceChildren(sr, tw);
  });

  // Títulos palabra por palabra (conserva las cursivas)
  $$('[data-revelar="palabras"]').forEach(el => {
    let w = 0;
    const recorrer = nodo => [...nodo.childNodes].forEach(n => {
      if (n.nodeType === 1) return recorrer(n);
      if (n.nodeType !== 3) return;
      const frag = document.createDocumentFragment();
      n.textContent.split(/(\s+)/).forEach(parte => {
        if (!parte) return;
        if (/^\s+$/.test(parte)) return frag.append(' ');
        const caja = Object.assign(document.createElement('span'), {className: 'pal'});
        const dentro = Object.assign(document.createElement('span'), {className: 'pal__in', textContent: parte});
        dentro.style.setProperty('--w', w++);
        caja.append(dentro);
        frag.append(caja);
      });
      n.replaceWith(frag);
    });
    recorrer(el);
  });

  // Logotipo letra por letra
  $$('[data-revelar="letras"]').forEach(el => {
    const texto = el.textContent.trim();
    const sr = Object.assign(document.createElement('span'), {className: 'sr', textContent: texto});
    const vis = document.createElement('span');
    vis.setAttribute('aria-hidden', 'true');
    [...texto].forEach((c, i) => {
      const l = Object.assign(document.createElement('span'), {className: 'letra', textContent: c});
      l.style.setProperty('--l', i);
      vis.append(l);
    });
    el.replaceChildren(sr, vis);
  });

  // Frase de "La casa": se ilumina palabra por palabra al bajar
  const frase = $('[data-iluminar]');
  let luces = [];
  if (frase) {
    const palabras = frase.textContent.trim().split(/\s+/);
    frase.replaceChildren(...palabras.flatMap((p, i) => {
      const s = Object.assign(document.createElement('span'), {className: 'luz', textContent: p});
      return i < palabras.length - 1 ? [s, ' '] : [s];
    }));
    luces = $$('.luz', frase);
  }

  // ---------- Odómetro: cada dígito rueda en su tira, como en La Libreta ----------
  const ODO_H = 1.1;
  function odo(el, texto, {desde} = {}) {
    if (!el) return;
    const previo = desde ?? el.dataset.valor ?? texto;
    el.dataset.valor = texto;
    if (RM) { el.textContent = texto; return; }
    let sr = $(':scope > .sr', el), caja = $(':scope > .odo', el);
    if (!caja) {
      sr = Object.assign(document.createElement('span'), {className: 'sr'});
      caja = Object.assign(document.createElement('span'), {className: 'odo'});
      caja.setAttribute('aria-hidden', 'true');
      el.replaceChildren(sr, caja);
    }
    sr.textContent = texto;
    const forma = texto.replace(/\d/g, '0');
    if (caja.dataset.forma !== forma) {
      caja.dataset.forma = forma;
      caja.replaceChildren(...[...texto].map(c => {
        if (!/\d/.test(c)) return Object.assign(document.createElement('span'), {className: 'odo__c', textContent: c});
        const d = Object.assign(document.createElement('span'), {className: 'odo__d'});
        const tira = Object.assign(document.createElement('span'), {className: 'odo__s'});
        for (let n = 0; n < 10; n++) tira.append(Object.assign(document.createElement('span'), {textContent: n}));
        d.append(tira);
        return d;
      }));
      // Las tiras nuevas parten de los dígitos anteriores, alineados a la derecha
      const viejos = [...previo].filter(c => /\d/.test(c)).reverse();
      $$('.odo__s', caja).reverse().forEach((s, i) => { s._d = +(viejos[i] ?? 0); s.style.transform = `translateY(${-s._d * ODO_H}em)`; });
    }
    const digitos = [...texto].filter(c => /\d/.test(c)).map(Number);
    $$('.odo__s', caja).forEach((s, i) => {
      const a = digitos[i], de = s._d ?? 0;
      if (a === de) return;
      s._d = a;
      s.style.transform = `translateY(${-a * ODO_H}em)`;
      s.getAnimations().forEach(x => x.cancel());
      const blur = Math.min(2.4, Math.abs(a - de) * 0.32).toFixed(2);
      s.animate([
        {transform: `translateY(${-de * ODO_H}em)`, filter: 'blur(0px)'},
        {filter: `blur(${blur}px)`, offset: 0.45},
        {transform: `translateY(${-a * ODO_H}em)`, filter: 'blur(0px)'}
      ], {duration: 900 + i * 110, delay: i * 60, easing: 'cubic-bezier(0.2, 0.9, 0.25, 1)', fill: 'backwards'});
    });
  }

  // ---------- Revelado al entrar en pantalla ----------
  const limpiar = el => {
    const fin = e => {
      if (e.target !== el || e.pseudoElement || e.propertyName !== 'transform') return;
      el.removeEventListener('transitionend', fin);
      el.removeAttribute('data-revelar');
      el.style.removeProperty('--d');
    };
    el.addEventListener('transitionend', fin);
  };
  const alRevelar = new Map();
  const revelar = (el, d = 0) => {
    el.style.setProperty('--d', `${d}ms`);
    el.classList.add('visto');
    if (!el.dataset.revelar) limpiar(el);
    // Tras la cortina, la foto recupera su propio zoom al pasar el cursor
    else if (el.dataset.revelar === 'foto') setTimeout(() => el.removeAttribute('data-revelar'), d + 2100);
    alRevelar.get(el)?.(d);
  };

  const elementos = $$('[data-revelar]');
  if (RM || !('IntersectionObserver' in window)) {
    elementos.forEach(el => el.classList.add('visto'));
  } else {
    // Un arco empieza recortado por completo y el observador no lo "ve": se vigila su contenedor
    const porObjetivo = new Map();
    elementos.forEach(el => {
      const objetivo = el.dataset.revelar === 'arco' ? el.parentElement : el;
      porObjetivo.set(objetivo, [...(porObjetivo.get(objetivo) || []), el]);
    });
    const io = new IntersectionObserver(entradas => {
      let k = 0;
      entradas.filter(e => e.isIntersecting).forEach(({target}) => {
        io.unobserve(target);
        porObjetivo.get(target).forEach(el => {
          const padre = el.parentElement?.hasAttribute('data-escalonar') ? el.parentElement : null;
          const d = padre ? [...padre.children].filter(c => c.hasAttribute('data-revelar') || c.classList.contains('visto')).indexOf(el) * 120 : Math.min(k++, 6) * 90;
          revelar(el, Math.max(0, d));
        });
      });
    }, {rootMargin: '0px 0px -8% 0px', threshold: 0.12});
    // Con telón de entrada, lo de arriba espera a que se levante
    const conIntro = raiz.classList.contains('intro');
    setTimeout(() => {
      // Lo que ya está en la primera pantalla entra en secuencia; el resto espera al scroll
      let k = 0;
      porObjetivo.forEach((lista, objetivo) => {
        const r = objetivo.getBoundingClientRect();
        if (r.bottom > 0 && r.top < innerHeight && (r.width || r.height)) lista.forEach(el => revelar(el, Math.min(k++, 8) * 90));
        else io.observe(objetivo);
      });
    }, conIntro ? 1500 : 60);
    if (conIntro) {
      try { sessionStorage.setItem('delipan:intro', '1'); } catch (_) { }
      setTimeout(() => raiz.classList.remove('intro'), 2800);
    }
  }

  // ---------- Botones: onda al pulsar y atracción magnética ----------
  document.addEventListener('pointerdown', e => {
    if (RM || e.button !== 0) return;
    const b = e.target.closest?.('.boton');
    if (!b) return;
    const r = b.getBoundingClientRect(), t = Math.hypot(r.width, r.height) * 2;
    const o = Object.assign(document.createElement('span'), {className: 'onda'});
    o.style.cssText = `width:${t}px;height:${t}px;left:${e.clientX - r.left - t / 2}px;top:${e.clientY - r.top - t / 2}px`;
    b.append(o);
    const a = o.animate([{transform: 'scale(0)', opacity: 0.2}, {transform: 'scale(1)', opacity: 0}], {duration: 750, easing: 'cubic-bezier(0.2, 0.6, 0.3, 1)'});
    a.onfinish = () => o.remove();
    setTimeout(() => o.remove(), 1000);
  }, {passive: true});

  let mgFrame = 0, mgEvento = null;
  document.addEventListener('pointermove', e => {
    if (RM || e.pointerType !== 'mouse' || !finoQuery.matches) return;
    mgEvento = e;
    if (mgFrame) return;
    mgFrame = requestAnimationFrame(() => {
      mgFrame = 0;
      const mg = mgEvento.target.closest?.('.magnetico');
      if (!mg) return;
      const r = mg.getBoundingClientRect();
      mg.style.setProperty('--mgx', `${(((mgEvento.clientX - r.left) / r.width) - 0.5) * 12}px`);
      mg.style.setProperty('--mgy', `${(((mgEvento.clientY - r.top) / r.height) - 0.5) * 9}px`);
    });
  }, {passive: true});
  document.addEventListener('pointerout', e => {
    const mg = e.target.closest?.('.magnetico');
    if (mg && !mg.contains(e.relatedTarget)) { mg.style.removeProperty('--mgx'); mg.style.removeProperty('--mgy'); }
  }, {passive: true});

  // ---------- Menú de pantalla completa ----------
  const menu = $('[data-menu]');
  const abridores = $$('[data-menu-abrir]');
  let menuAbierto = false, menuFoco = null, menuTimer = 0;
  const abrirMenu = boton => {
    if (menuAbierto) return;
    menuAbierto = true; menuFoco = boton;
    clearTimeout(menuTimer);
    menu.hidden = false;
    raiz.classList.add('menu-abierto');
    abridores.forEach(b => b.setAttribute('aria-expanded', 'true'));
    requestAnimationFrame(() => requestAnimationFrame(() => menu.classList.add('abierto')));
    setTimeout(() => $('.menu__nav a', menu)?.focus({preventScroll: true}), RM ? 0 : 500);
  };
  const cerrarMenu = (porEnlace = false) => {
    if (!menuAbierto) return;
    menuAbierto = false;
    menu.classList.remove('abierto');
    raiz.classList.remove('menu-abierto');
    abridores.forEach(b => b.setAttribute('aria-expanded', 'false'));
    menuTimer = setTimeout(() => { menu.hidden = true; }, RM ? 0 : 820);
    if (!porEnlace) menuFoco?.focus({preventScroll: true});
  };
  abridores.forEach(b => b.addEventListener('click', () => abrirMenu(b)));
  $('[data-menu-cerrar]')?.addEventListener('click', () => cerrarMenu());
  $$('.menu__nav a', menu).forEach(a => a.addEventListener('click', () => cerrarMenu(true)));
  document.addEventListener('keydown', e => {
    if (!menuAbierto) return;
    if (e.key === 'Escape') return cerrarMenu();
    if (e.key !== 'Tab') return;
    // El foco no sale del menú mientras está abierto
    const focos = $$('a, button', menu);
    const primero = focos[0], ultimo = focos[focos.length - 1];
    if (e.shiftKey && document.activeElement === primero) { e.preventDefault(); ultimo.focus(); }
    else if (!e.shiftKey && document.activeElement === ultimo) { e.preventDefault(); primero.focus(); }
  });

  // ---------- Cinta de productos ----------
  const cinta = $('[data-cinta]'), pista = $('[data-cinta-pista]');
  let cintaAnim = null, cintaRitmo = 1, cintaMeta = 1, cintaEncima = false, cintaVisible = false, cintaFrame = 0, velocidad = 0;
  const prepararCinta = () => {
    if (!pista) return;
    const grupo = pista.firstElementChild;
    $$('.cinta__grupo[aria-hidden]', pista).forEach(g => g.remove());
    const ancho = grupo.getBoundingClientRect().width;
    if (!ancho) return;
    // Copias hasta cubrir dos veces la pantalla, para que el bucle no tenga costura
    const copias = Math.max(1, Math.ceil((innerWidth * 2) / ancho));
    for (let i = 0; i < copias; i++) {
      const c = grupo.cloneNode(true);
      c.setAttribute('aria-hidden', 'true');
      c.removeAttribute('aria-label');
      pista.append(c);
    }
    // Conserva el punto del recorrido al recalcular (cambio de tamaño o de tipografía)
    const t = cintaAnim?.effect?.getComputedTiming();
    const avance = t && t.duration ? (cintaAnim.currentTime % t.duration) / t.duration : 0;
    cintaAnim?.cancel();
    cintaAnim = null;
    if (RM) return;
    const duracion = ancho * 30;
    cintaAnim = pista.animate([{transform: 'translateX(0)'}, {transform: `translateX(${-ancho}px)`}], {duration: duracion, iterations: Infinity});
    cintaAnim.currentTime = avance * duracion;
    cintaAnim.playbackRate = cintaRitmo;
  };
  // El ritmo se acelera con el scroll y casi se detiene al pasar el cursor
  const moverCinta = () => {
    cintaFrame = 0;
    if (!cintaAnim || !cintaVisible) return;
    velocidad *= 0.9;
    cintaMeta = cintaEncima ? 0.18 : 1 + Math.min(Math.abs(velocidad) * 0.08, 3.5);
    cintaRitmo += (cintaMeta - cintaRitmo) * 0.07;
    cintaAnim.playbackRate = cintaRitmo;
    cintaFrame = requestAnimationFrame(moverCinta);
  };
  if (cinta) {
    cinta.addEventListener('pointerenter', e => { if (e.pointerType === 'mouse') cintaEncima = true; });
    cinta.addEventListener('pointerleave', () => { cintaEncima = false; });
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(([e]) => {
        cintaVisible = e.isIntersecting;
        if (cintaVisible && !cintaFrame) cintaFrame = requestAnimationFrame(moverCinta);
      }).observe(cinta);
    }
  }

  // ---------- Panel de La Libreta: datos de ejemplo que se mueven solos ----------
  const panel = $('[data-panel]');
  const kpi = k => $(`[data-k="${k}"]`, panel || document);
  const INICIAL = {pedidos: '18', piezas: '1,240', charolas: '62', harina: '3', horno: '72%'};
  $$('[data-odo]').forEach(el => { el.dataset.valor = el.textContent.trim(); });

  const demo = (() => {
    if (!panel) return null;
    const filas = $('[data-filas]', panel);
    let paso = 0, timer = 0, activo = false;
    const chip = (fila, clase, texto) => {
      const c = $(`[data-fila="${fila}"] [data-chip]`, panel);
      if (!c) return;
      c.className = 'chip' + (clase ? ` chip--${clase}` : '');
      c.textContent = texto;
      void c.offsetWidth;
      c.classList.add('cambia');
    };
    const tanda = i => $$('[data-tanda]', panel).forEach((li, j) => li.classList.toggle('ahora', j === i));
    const barra = v => $('[data-horno-barra]', panel)?.style.setProperty('--v', v);
    const pasos = [
      () => chip('b', 'ok', 'Confirmado'),
      () => {
        const tr = document.createElement('tr');
        tr.dataset.fila = 'n';
        tr.className = 'nueva';
        tr.innerHTML = '<td>Cafetería · Norte</td><td>40 bollos integrales</td><td><span class="chip chip--nuevo" data-chip>Nuevo pedido</span></td>';
        filas.prepend(tr);
        odo(kpi('pedidos'), '19'); odo(kpi('piezas'), '1,280'); odo(kpi('charolas'), '64');
      },
      () => { chip('c', 'ok', 'Listo'); tanda(1); barra(0.84); odo(kpi('horno'), '84%'); },
      () => {
        const tr = $('[data-fila="n"]', panel);
        if (tr) { tr.classList.add('sale'); setTimeout(() => tr.remove(), 620); }
        chip('b', 'pend', 'Por confirmar'); chip('c', 'horno', 'En horno');
        tanda(0); barra(0.72);
        Object.entries(INICIAL).forEach(([k, v]) => { if (kpi(k)?.dataset.valor !== v) odo(kpi(k), v); });
      }
    ];
    const siguiente = () => {
      if (!activo) return;
      pasos[paso]();
      paso = (paso + 1) % pasos.length;
      timer = setTimeout(siguiente, paso === 0 ? 4400 : 3200);
    };
    return {
      iniciar() { if (activo || RM) return; activo = true; timer = setTimeout(siguiente, 2800); },
      pausar() { activo = false; clearTimeout(timer); }
    };
  })();

  if (panel) {
    // Al aparecer, las cifras ruedan desde cero
    alRevelar.set(panel, d => setTimeout(() => {
      $$('[data-odo]', panel).forEach(el => odo(el, el.dataset.valor, {desde: el.dataset.valor.replace(/\d/g, '0')}));
    }, d + 500));
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(([e]) => {
        if (e.isIntersecting && !document.hidden) demo.iniciar(); else demo.pausar();
      }, {threshold: 0.25}).observe(panel);
    }
    document.addEventListener('visibilitychange', () => { if (document.hidden) demo.pausar(); });
    // El panel se inclina con el cursor
    const marco = $('[data-tilt]', panel);
    marco?.addEventListener('pointermove', e => {
      if (RM || e.pointerType !== 'mouse') return;
      const r = marco.getBoundingClientRect();
      marco.style.setProperty('--rx', `${(-(((e.clientY - r.top) / r.height) - 0.5) * 4).toFixed(2)}deg`);
      marco.style.setProperty('--ry', `${((((e.clientX - r.left) / r.width) - 0.5) * 6).toFixed(2)}deg`);
    });
    marco?.addEventListener('pointerleave', () => { marco.style.removeProperty('--rx'); marco.style.removeProperty('--ry'); });
  }

  const libreta = $('#la-libreta');
  if (libreta && 'IntersectionObserver' in window) {
    new IntersectionObserver(([e], o) => { if (e.isIntersecting) { libreta.classList.add('vista'); o.disconnect(); } }, {threshold: 0.05}).observe(libreta);
  } else libreta?.classList.add('vista');

  // ---------- Vitrina: el arco muestra la foto de la línea que miras ----------
  const vitrinaFotos = $$('[data-vitrina-foto]');
  const vitrinaPie = $('[data-vitrina-pie]');
  const vitrinaPuntos = $$('.vitrina__puntos i');
  const lineasFoto = $$('.linea[data-foto]');
  let vitrinaActiva = 0, vitrinaEncima = false, vitrinaVisible = false, vitrinaTimer = 0;
  const activarVitrina = i => {
    if (i === vitrinaActiva || !vitrinaFotos[i]) return;
    vitrinaActiva = i;
    vitrinaFotos.forEach((f, j) => f.classList.toggle('activa', j === i));
    vitrinaPuntos.forEach((p, j) => p.classList.toggle('on', j === i));
    lineasFoto.forEach((l, j) => l.classList.toggle('enfocada', j === i));
    if (vitrinaPie) {
      vitrinaPie.textContent = vitrinaFotos[i].dataset.pie;
      vitrinaPie.classList.remove('cambia');
      void vitrinaPie.offsetWidth;
      vitrinaPie.classList.add('cambia');
    }
  };
  // Mientras nadie elige, la vitrina rota sola cada pocos segundos
  const rotarVitrina = () => {
    clearTimeout(vitrinaTimer);
    if (RM || !vitrinaVisible || vitrinaEncima || vitrinaFotos.length < 2) return;
    vitrinaTimer = setTimeout(() => { activarVitrina((vitrinaActiva + 1) % vitrinaFotos.length); rotarVitrina(); }, 4200);
  };
  lineasFoto.forEach(l => {
    const i = +l.dataset.foto;
    l.addEventListener('pointerenter', e => { if (e.pointerType !== 'mouse') return; vitrinaEncima = true; activarVitrina(i); rotarVitrina(); });
    l.addEventListener('pointerleave', () => { vitrinaEncima = false; rotarVitrina(); });
    l.addEventListener('focusin', () => activarVitrina(i));
  });
  const vitrinaCuerpo = $('.vitrina__cuerpo');
  if (vitrinaCuerpo && 'IntersectionObserver' in window) {
    new IntersectionObserver(([e]) => { vitrinaVisible = e.isIntersecting && innerWidth >= 1080; rotarVitrina(); }, {threshold: 0.2}).observe(vitrinaCuerpo);
  }

  // ---------- De temporada: el pan que toca según la fecha en Tonalá ----------
  const temporada = $('[data-temporada]');
  if (temporada) {
    const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
    const tabs = $$('[role="tab"]', temporada);
    const ind = $('[data-temp-ind]', temporada);
    const nota = $('[data-temp-nota]', temporada);
    const porId = Object.fromEntries(CONFIG.temporadas.map(t => [t.id, t]));
    let actual = null, salida = 0;

    const hoy = (() => {
      try {
        const p = Object.fromEntries(new Intl.DateTimeFormat('en-US', {timeZone: CONFIG.zona, month: 'numeric', day: 'numeric'}).formatToParts(new Date()).map(x => [x.type, +x.value]));
        return p.month * 100 + p.day;
      } catch (_) { const d = new Date(); return (d.getMonth() + 1) * 100 + d.getDate(); }
    })();
    const num = ([m, d]) => m * 100 + d;
    const enTemporada = t => num(t.desde) <= num(t.hasta) ? hoy >= num(t.desde) && hoy <= num(t.hasta) : hoy >= num(t.desde) || hoy <= num(t.hasta);
    // Días que faltan para que empiece (para elegir la más próxima si ninguna está en curso)
    const faltan = t => { const d = num(t.desde); return d >= hoy ? d - hoy : d + 1200 - hoy; };

    // Estado de cada pestaña
    tabs.forEach(tab => {
      const t = porId[tab.dataset.temp], el = $('[data-temp-estado]', tab);
      if (!t || !el) return;
      const ya = enTemporada(t);
      el.classList.toggle('ahora', ya);
      el.textContent = ya ? 'Disponible ahora' : `Desde el ${t.desde[1]} de ${MESES[t.desde[0] - 1]}`;
    });

    const ponerIndicador = tab => {
      if (!ind || !tab) return;
      ind.style.setProperty('--x', `${tab.offsetLeft}px`);
      ind.style.setProperty('--y', `${tab.offsetTop + tab.offsetHeight - 2}px`);
      ind.style.setProperty('--w', `${tab.offsetWidth - 18}px`);
    };

    const elegir = (id, {animar = true, enfocar = false} = {}) => {
      if (id === actual) return;
      const anterior = actual;
      actual = id;
      const mover = animar && !RM;
      tabs.forEach(t => {
        const on = t.dataset.temp === id;
        t.setAttribute('aria-selected', String(on));
        t.tabIndex = on ? 0 : -1;
        if (on && enfocar) t.focus();
      });
      ponerIndicador(tabs.find(t => t.dataset.temp === id));
      // La foto nueva sube como cortina sobre la anterior
      clearTimeout(salida);
      $$('[data-temp-foto]', temporada).forEach(f => {
        const es = f.dataset.tempFoto;
        f.classList.remove('sale');
        if (!mover) f.style.transition = 'none';
        if (es === anterior && mover) f.classList.add('sale');
        f.classList.toggle('activa', es === id);
        if (!mover) { void f.offsetWidth; f.style.transition = ''; }
      });
      if (mover) salida = setTimeout(() => $$('.sale', temporada).forEach(f => f.classList.remove('sale')), 1150);
      $$('[data-temp-mini]', temporada).forEach(m => m.classList.toggle('activa', m.dataset.tempMini === id));
      nota?.classList.toggle('oculta', !porId[id]?.ilustrativa);
      // El texto entra escalonado
      $$('[data-temp-panel]', temporada).forEach(p => {
        const on = p.dataset.tempPanel === id;
        p.hidden = !on;
        p.classList.remove('entra');
        if (on && mover) { void p.offsetWidth; p.classList.add('entra'); }
      });
    };

    tabs.forEach((tab, i) => {
      tab.addEventListener('click', () => elegir(tab.dataset.temp));
      tab.addEventListener('keydown', e => {
        const k = {ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: tabs.length - 1}[e.key];
        if (k === undefined) return;
        e.preventDefault();
        elegir(tabs[(k + tabs.length) % tabs.length].dataset.temp, {enfocar: true});
      });
    });

    const enCurso = CONFIG.temporadas.find(enTemporada);
    const inicial = enCurso || [...CONFIG.temporadas].sort((a, b) => faltan(a) - faltan(b))[0];
    elegir(inicial.id, {animar: false});
    (document.fonts?.ready || Promise.resolve()).then(() => ponerIndicador(tabs.find(t => t.dataset.temp === actual)));
    addEventListener('resize', () => ponerIndicador(tabs.find(t => t.dataset.temp === actual)), {passive: true});
  }

  // ---------- Reseñas: la calificación rueda como odómetro al aparecer ----------
  const resenas = $('[data-resenas]');
  if (resenas) {
    alRevelar.set(resenas, d => setTimeout(() => {
      const el = $('[data-odo]', resenas);
      if (el) odo(el, el.dataset.valor, {desde: el.dataset.valor.replace(/\d/g, '0')});
    }, d + 300));
  }

  // ---------- Cotizador: arma el mensaje en vivo y lo abre en WhatsApp ----------
  const cot = $('[data-cotizador]');
  if (cot) {
    const TIPOS = {
      comedor: {nombre: 'Comedor industrial', cantidad: 'Comensales por día', fecha: '¿Desde cuándo?', ayuda: 'Es solo para darnos idea; el pan lo calculamos contigo.', inicial: 80, dias: [0, 1, 2, 3, 4]},
      negocio: {nombre: 'Cafetería o negocio', cantidad: 'Piezas por día, aproximadamente', fecha: '¿Desde cuándo?', ayuda: 'Un aproximado basta; lo afinamos contigo.', inicial: 40, dias: [0, 1, 2, 3, 4, 5]},
      evento: {nombre: 'Evento o reunión', cantidad: 'Número de invitados', fecha: 'Fecha del evento', ayuda: 'Con esto calculamos cuántas piezas necesitas.', inicial: 50, dias: null}
    };
    const DIAS = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
    const cantidadEl = $('[data-cot-cantidad]', cot);
    const fechaEl = $('[data-cot-fecha]', cot);
    const plegable = $('[data-cot-plegable]', cot);
    const errorEl = $('[data-cot-error]', cot);
    const panesEl = $('[data-cot-panes]', cot);
    const mensajeEl = $('[data-cot-mensaje]');
    const horaEl = $('[data-cot-hora]');
    const burbuja = mensajeEl?.closest('.mensaje__burbuja');
    let cantidadTocada = false, diasTocados = false, anteriores = [];

    const tipo = () => cot.elements.tipo.value || 'comedor';
    const marcados = n => $$(`input[name="${n}"]:checked`, cot).map(i => i.value);
    const unir = a => a.length < 2 ? a.join('') : `${a.slice(0, -1).join(', ')} y ${a[a.length - 1]}`;
    const listaDias = idx => {
      if (!idx.length) return '';
      const seguidos = idx.length > 2 && idx.every((d, i) => i === 0 || d === idx[i - 1] + 1);
      return seguidos ? `${DIAS[idx[0]]} a ${DIAS[idx[idx.length - 1]]}` : unir(idx.map(i => DIAS[i]));
    };
    const fechaTxt = v => {
      if (!v) return '';
      const [a, m, d] = v.split('-').map(Number);
      try { return new Intl.DateTimeFormat('es-MX', {weekday: 'long', day: 'numeric', month: 'long'}).format(new Date(a, m - 1, d)); } catch (_) { return v; }
    };
    // La fecha más cercana que se puede pedir es mañana
    const manana = new Date(); manana.setDate(manana.getDate() + 1);
    fechaEl.min = `${manana.getFullYear()}-${String(manana.getMonth() + 1).padStart(2, '0')}-${String(manana.getDate()).padStart(2, '0')}`;

    const lineas = () => {
      const t = TIPOS[tipo()], panes = marcados('pan');
      const nombre = cot.elements.nombre.value.trim(), nota = cot.elements.nota.value.trim();
      const out = ['Hola Delipan, quiero cotizar un pedido.', '', `• Para: ${t.nombre}`, `• ${t.cantidad}: ${Math.max(1, +cantidadEl.value || 1)}`];
      out.push(`• Pan: ${panes.length ? unir(panes) : '(por elegir)'}`);
      if (t.dias) out.push(`• Días: ${listaDias(marcados('dia').map(Number)) || 'por definir'}`);
      if (fechaEl.value) out.push(`• ${t.dias ? 'Desde' : 'Fecha del evento'}: ${fechaTxt(fechaEl.value)}`);
      if (nombre) out.push(`• Nombre: ${nombre}`);
      if (nota) out.push(`• Nota: ${nota.replace(/\s+/g, ' ')}`);
      return out;
    };

    // Pinta la burbuja; las líneas nuevas o cambiadas se iluminan un momento
    const pintar = (escribiendo = false) => {
      if (!mensajeEl) return;
      const nuevas = lineas();
      const clave = l => l.split(':')[0];
      const antes = new Map(anteriores.map(l => [clave(l), l]));
      mensajeEl.replaceChildren(...nuevas.map(l => {
        const span = document.createElement('span');
        span.textContent = l || '\u00a0';
        const previa = antes.get(clave(l));
        const nueva = previa === undefined || (!escribiendo && previa !== l);
        if (anteriores.length && nueva && l && !RM) span.className = 'nueva';
        return span;
      }));
      if (anteriores.length && !escribiendo && !RM && burbuja) { burbuja.classList.remove('late'); void burbuja.offsetWidth; burbuja.classList.add('late'); }
      anteriores = nuevas;
      if (horaEl) {
        try { horaEl.textContent = new Intl.DateTimeFormat('es-MX', {timeZone: CONFIG.zona, hour: 'numeric', minute: '2-digit', hourCycle: 'h23'}).format(new Date()); } catch (_) { }
      }
    };

    const cambiarTexto = (el, texto) => {
      if (!el || el.textContent === texto) return;
      el.textContent = texto;
      el.classList.remove('cambia'); void el.offsetWidth; el.classList.add('cambia');
    };

    const aplicarTipo = () => {
      const t = TIPOS[tipo()];
      cambiarTexto($('[data-cot-etiqueta="cantidad"]', cot), t.cantidad);
      cambiarTexto($('[data-cot-etiqueta="fecha"]', cot), t.fecha);
      cambiarTexto($('[data-cot-ayuda]', cot), t.ayuda);
      if (!cantidadTocada) cantidadEl.value = t.inicial;
      // Los días se pliegan para un evento
      const conDias = !!t.dias;
      plegable.classList.toggle('cerrado', !conDias);
      if (conDias) plegable.removeAttribute('inert'); else plegable.setAttribute('inert', '');
      if (conDias && !diasTocados) $$('input[name="dia"]', cot).forEach(i => { i.checked = t.dias.includes(+i.value); });
    };

    const mostrarError = on => {
      errorEl.hidden = !on;
      panesEl.classList.toggle('error', on);
    };

    cot.addEventListener('change', e => {
      const n = e.target.name;
      if (n === 'tipo') aplicarTipo();
      if (n === 'dia') diasTocados = true;
      if (n === 'pan' && marcados('pan').length) mostrarError(false);
      pintar();
    });
    cot.addEventListener('input', e => {
      if (e.target === cantidadEl) cantidadTocada = true;
      if (e.target.matches('input[type="text"], textarea, input[type="number"]')) pintar(true);
    });
    cantidadEl.addEventListener('blur', () => { if (!(+cantidadEl.value >= 1)) { cantidadEl.value = 1; pintar(); } });

    $$('[data-cot-paso]', cot).forEach(b => b.addEventListener('click', () => {
      const paso = +b.dataset.cotPaso, antes = Math.max(1, +cantidadEl.value || 1);
      const ahora = clamp(antes + paso, 1, 5000);
      if (ahora === antes) return;
      cantidadTocada = true;
      cantidadEl.value = ahora;
      if (!RM) { cantidadEl.classList.remove('sube', 'baja'); void cantidadEl.offsetWidth; cantidadEl.classList.add(paso > 0 ? 'sube' : 'baja'); }
      pintar();
    }));

    const enviarBtn = $('[data-cot-enviar]', cot);
    const textoBoton = t => {
      const caja = $('.boton__texto', enviarBtn);
      caja.dataset.texto = t;
      $('span', caja).textContent = t;
    };
    cot.addEventListener('submit', e => {
      e.preventDefault();
      if (!marcados('pan').length) {
        mostrarError(true);
        if (!RM) { cot.classList.remove('sacude'); void cot.offsetWidth; cot.classList.add('sacude'); }
        $('input[name="pan"]', cot)?.focus({preventScroll: true});
        panesEl.scrollIntoView({block: 'center', behavior: RM ? 'auto' : 'smooth'});
        return;
      }
      const url = `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(lineas().join('\n'))}`;
      const w = window.open(url, '_blank');
      if (w) w.opener = null; else location.href = url;
      enviarBtn.classList.add('listo');
      textoBoton('Abriendo WhatsApp…');
      setTimeout(() => { enviarBtn.classList.remove('listo'); textoBoton('Enviar por WhatsApp'); }, 2600);
    });

    aplicarTipo();
    pintar();
  }

  // ---------- Visor de fotos: la miniatura crece hasta llenar la pantalla ----------
  const visor = $('#visor');
  const fotos = $$('[data-foto-index]').map(b => ({boton: b, src: b.dataset.grande, pie: b.dataset.pie, alt: $('img', b)?.alt || ''}));
  const vImg = $('[data-visor-img]'), vPie = $('[data-visor-pie]'), vCuenta = $('[data-visor-cuenta]');
  let fotoActual = 0, navegando = false;
  const precargar = i => { const f = fotos[(i + fotos.length) % fotos.length]; if (f) new Image().src = f.src; };
  const pintarFoto = i => {
    const f = fotos[i];
    vImg.src = f.src; vImg.alt = f.alt;
    vPie.textContent = f.pie;
    vCuenta.textContent = `${String(i + 1).padStart(2, '0')} / ${String(fotos.length).padStart(2, '0')}`;
    precargar(i + 1); precargar(i - 1);
  };
  const listo = () => vImg.decode ? vImg.decode().catch(() => {}) : Promise.resolve();
  // Recorrido entre la miniatura (recortada) y la foto completa, sin deformarla
  const desdeMiniatura = (boton, alReves) => {
    const de = boton.getBoundingClientRect(), a = vImg.getBoundingClientRect();
    if (!a.width || !de.width || de.bottom < 0 || de.top > innerHeight) return null;
    const esc = Math.max(de.width / a.width, de.height / a.height);
    const iw = (a.width - de.width / esc) / 2, ih = (a.height - de.height / esc) / 2;
    const dx = (de.left + de.width / 2) - (a.left + a.width / 2), dy = (de.top + de.height / 2) - (a.top + a.height / 2);
    const lejos = {transform: `translate(${dx}px, ${dy}px) scale(${esc})`, clipPath: `inset(${ih}px ${iw}px round 2px)`};
    const cerca = {transform: 'none', clipPath: 'inset(0px 0px round 2px)'};
    return vImg.animate(alReves ? [cerca, lejos] : [lejos, cerca], {duration: alReves ? 560 : 760, easing: alReves ? 'cubic-bezier(0.65, 0, 0.35, 1)' : EASE, fill: alReves ? 'forwards' : 'none'});
  };
  const abrirVisor = async i => {
    fotoActual = i;
    pintarFoto(i);
    visor.classList.remove('cerrando');
    raiz.classList.add('menu-abierto');
    if (typeof visor.showModal === 'function') visor.showModal(); else visor.setAttribute('open', '');
    if (RM) return;
    vImg.style.opacity = '0';
    await listo();
    vImg.style.opacity = '';
    desdeMiniatura(fotos[i].boton, false) || vImg.animate([{opacity: 0, transform: 'scale(0.96)'}, {opacity: 1, transform: 'none'}], {duration: 500, easing: EASE});
  };
  const cerrarVisor = () => {
    if (!visor.open || visor.classList.contains('cerrando')) return;
    const fin = () => {
      visor.classList.remove('cerrando');
      vImg.getAnimations().forEach(a => a.cancel());
      raiz.classList.remove('menu-abierto');
      if (visor.open) visor.close();
      fotos[fotoActual]?.boton.focus({preventScroll: true});
    };
    if (RM) return fin();
    visor.classList.add('cerrando');
    const a = desdeMiniatura(fotos[fotoActual].boton, true) || vImg.animate([{opacity: 1}, {opacity: 0, transform: 'scale(0.96)'}], {duration: 380, easing: 'ease-in', fill: 'forwards'});
    a.finished.then(fin, fin);
    setTimeout(() => { if (visor.classList.contains('cerrando')) fin(); }, 900);
  };
  const irFoto = async paso => {
    if (navegando || !fotos.length) return;
    const n = fotos.length, sig = (fotoActual + paso + n) % n;
    if (RM) { fotoActual = sig; pintarFoto(sig); return; }
    navegando = true;
    const sale = vImg.animate([{opacity: 1, transform: 'none'}, {opacity: 0, transform: `translateX(${-paso * 48}px) scale(0.98)`}], {duration: 240, easing: 'cubic-bezier(0.4, 0, 1, 1)', fill: 'forwards'});
    await sale.finished.catch(() => {});
    fotoActual = sig;
    pintarFoto(sig);
    await listo();
    sale.cancel();
    vImg.animate([{opacity: 0, transform: `translateX(${paso * 48}px) scale(0.98)`}, {opacity: 1, transform: 'none'}], {duration: 560, easing: EASE});
    navegando = false;
  };
  if (visor && vImg) {
    fotos.forEach((f, i) => f.boton.addEventListener('click', () => abrirVisor(i)));
    $('[data-visor-cerrar]', visor)?.addEventListener('click', cerrarVisor);
    $('[data-visor-prev]', visor)?.addEventListener('click', () => irFoto(-1));
    $('[data-visor-sig]', visor)?.addEventListener('click', () => irFoto(1));
    visor.addEventListener('cancel', e => { e.preventDefault(); cerrarVisor(); });
    // Tocar el fondo cierra
    let recienDeslizo = false;
    visor.addEventListener('click', e => { if (!recienDeslizo && (e.target === visor || e.target.hasAttribute?.('data-visor-fondo'))) cerrarVisor(); });
    visor.addEventListener('keydown', e => {
      if (e.key === 'ArrowRight') { e.preventDefault(); irFoto(1); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); irFoto(-1); }
    });
    // Deslizar con el dedo
    let toqueX = null;
    const marco = $('.visor__marco', visor);
    marco.addEventListener('pointerdown', e => { toqueX = e.clientX; }, {passive: true});
    marco.addEventListener('pointerup', e => {
      if (toqueX == null) return;
      const dx = e.clientX - toqueX;
      toqueX = null;
      if (Math.abs(dx) > 50) {
        // Un deslizamiento no debe contar como toque en el fondo
        recienDeslizo = true;
        setTimeout(() => { recienDeslizo = false; }, 80);
        irFoto(dx < 0 ? 1 : -1);
      }
    }, {passive: true});
    vImg.addEventListener('click', e => e.stopPropagation());
  }

  // ---------- Aviso de La Libreta, con salida animada ----------
  const aviso = $('#aviso-libreta');
  const TEXTOS = {
    cliente: ['Estamos preparando tu acceso', 'El portal de clientes de La Libreta abrirá muy pronto. Mientras tanto, haz tu pedido por teléfono o WhatsApp.'],
    personal: ['Acceso del equipo en preparación', 'El panel de producción se habilitará cuando La Libreta, Edición Delipan, quede instalada en la panadería.']
  };
  const cerrarAviso = () => {
    if (!aviso.open || aviso.classList.contains('cerrando')) return;
    if (RM) return aviso.close();
    aviso.classList.add('cerrando');
    const fin = () => { aviso.classList.remove('cerrando'); if (aviso.open) aviso.close(); };
    const alTerminar = e => { if (e.target !== aviso) return; aviso.removeEventListener('animationend', alTerminar); fin(); };
    aviso.addEventListener('animationend', alTerminar);
    setTimeout(fin, 520);
  };
  $$('[data-libreta]').forEach(b => b.addEventListener('click', () => {
    const tipo = b.dataset.libreta, base = String(CONFIG.libreta || '').trim().replace(/\/+$/, '');
    if (base) { location.href = `${base}/?entrar=${tipo === 'cliente' ? 'clientes' : 'equipo'}`; return; }
    const [titulo, texto] = TEXTOS[tipo];
    $('[data-aviso-titulo]', aviso).textContent = titulo;
    $('[data-aviso-texto]', aviso).textContent = texto;
    aviso.classList.remove('cerrando');
    if (typeof aviso.showModal === 'function') aviso.showModal(); else aviso.setAttribute('open', '');
  }));
  aviso.addEventListener('cancel', e => { e.preventDefault(); cerrarAviso(); });
  aviso.addEventListener('click', e => { if (e.target === aviso) cerrarAviso(); });
  $('[data-aviso-cerrar]', aviso)?.addEventListener('click', cerrarAviso);

  // ---------- Horario en vivo: abierto o cerrado según la hora de Tonalá ----------
  const DIAS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
  const ahoraEnTonala = () => {
    const p = Object.fromEntries(new Intl.DateTimeFormat('en-US', {
      timeZone: CONFIG.zona, weekday: 'short', hour: 'numeric', minute: 'numeric', hourCycle: 'h23'
    }).formatToParts(new Date()).map(x => [x.type, x.value]));
    return {dia: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(p.weekday), min: (+p.hour % 24) * 60 + +p.minute};
  };
  const pintarHorario = () => {
    let ahora;
    try { ahora = ahoraEnTonala(); } catch (_) { return; }
    if (ahora.dia < 0) return;
    $$('[data-horario] li').forEach(li => li.classList.toggle('hoy', +li.dataset.dia === ahora.dia));
    const hoy = CONFIG.horario[ahora.dia];
    let texto, abierto = false;
    if (hoy && ahora.min >= hoy[0] * 60 && ahora.min < hoy[1] * 60) {
      abierto = true;
      texto = `Abierto ahora · cierra a las ${hoy[1]}:00`;
    } else if (hoy && ahora.min < hoy[0] * 60) {
      texto = `Cerrado · abre hoy a las ${hoy[0]}:00`;
    } else {
      for (let n = 1; n <= 7; n++) {
        const d = (ahora.dia + n) % 7, h = CONFIG.horario[d];
        if (h) { texto = `Cerrado · abre ${n === 1 ? 'mañana' : 'el ' + DIAS[d]} a las ${h[0]}:00`; break; }
      }
    }
    $$('[data-estado]').forEach(el => {
      el.classList.toggle('abierto', abierto);
      const t = $('[data-estado-texto]', el);
      if (t && texto) t.textContent = texto;
    });
  };
  pintarHorario();
  setInterval(pintarHorario, 60 * 1000);

  // ---------- Todo lo que depende del scroll, en un solo cuadro ----------
  const barra = $('[data-barra]'), cabecera = $('[data-cabecera]'), progreso = $('[data-progreso]');
  const spyNav = $('[data-spy]'), spyInd = $('[data-spy-ind]');
  const spyLinks = $$('a', spyNav || document.createElement('nav'));
  const secciones = spyLinks.map(a => $(a.getAttribute('href')));
  const paralajes = $$('[data-parallax]').map(el => ({el, caja: el.parentElement, v: +el.dataset.parallax || 0, zoom: el.hasAttribute('data-zoom')}));
  const proceso = $('[data-proceso]'), procesoCuerpo = $('.proceso__cuerpo'), pasosProceso = $$('[data-paso]');
  let ultimoY = scrollY, pendiente = false, spyActivo = -1, barraVisible = false, opacidades = [];

  const ponerIndicador = a => {
    if (!spyInd) return;
    if (!a || !a.offsetWidth) { spyInd.classList.remove('on'); return; }
    spyInd.style.setProperty('--x', `${a.offsetLeft}px`);
    spyInd.style.setProperty('--w', `${a.offsetWidth}px`);
    spyInd.classList.add('on');
  };
  spyLinks.forEach(a => a.addEventListener('mouseenter', () => ponerIndicador(a)));
  spyNav?.addEventListener('mouseleave', () => ponerIndicador(spyLinks[spyActivo]));

  // Botón flotante de WhatsApp: aparece al bajar y se aparta donde ya hay un botón de contacto
  const wa = $('[data-wa]'), waSaludo = $('[data-wa-saludo]');
  const zonasSinWa = ['#cotizar', '#visitanos'].map(s => $(s)).filter(Boolean), pie = $('.pie');
  let waVisible = false, waSaludoTimer = 0;
  const cerrarSaludo = () => {
    clearTimeout(waSaludoTimer);
    if (!waSaludo || waSaludo.hidden) return;
    if (RM) { waSaludo.hidden = true; return; }
    waSaludo.classList.add('sale');
    setTimeout(() => { waSaludo.hidden = true; waSaludo.classList.remove('sale'); }, 380);
  };
  const programarSaludo = () => {
    let visto = false;
    try { visto = !!sessionStorage.getItem('delipan:saludo'); } catch (_) { }
    if (visto || !waSaludo) return;
    clearTimeout(waSaludoTimer);
    waSaludoTimer = setTimeout(() => {
      if (!waVisible) return;
      try { sessionStorage.setItem('delipan:saludo', '1'); } catch (_) { }
      waSaludo.hidden = false;
      waSaludoTimer = setTimeout(cerrarSaludo, 7000);
    }, 9000);
  };
  $('[data-wa-cerrar]')?.addEventListener('click', cerrarSaludo);

  function cuadro() {
    pendiente = false;
    const y = scrollY, vh = innerHeight, dy = y - ultimoY;
    ultimoY = y;
    velocidad += dy;

    // Lecturas
    const total = raiz.scrollHeight - vh;
    const finCabecera = cabecera ? cabecera.getBoundingClientRect().bottom : 0;
    const rLibreta = libreta?.getBoundingClientRect();
    let activo = -1;
    secciones.forEach((s, i) => { if (s && s.getBoundingClientRect().top <= vh * 0.38) activo = i; });
    const cajas = paralajes.map(p => p.caja.getBoundingClientRect());
    const rFrase = frase?.getBoundingClientRect();
    const rProceso = procesoCuerpo?.getBoundingClientRect();
    const enZonaSinWa = zonasSinWa.some(z => { const r = z.getBoundingClientRect(); return r.top < vh * 0.6 && r.bottom > vh * 0.4; });
    const pieVisible = pie ? pie.getBoundingClientRect().top < vh : false;

    // Escrituras
    progreso?.style.setProperty('--p', total > 0 ? (y / total).toFixed(4) : '0');

    // La barra aparece al pasar la cabecera, se esconde al bajar y vuelve al subir
    let visible = barraVisible;
    if (finCabecera > 0) visible = false;
    else if (dy > 4) visible = false;
    else if (dy < -4 || dy === 0) visible = true;
    if (visible !== barraVisible) { barraVisible = visible; barra?.classList.toggle('visible', visible); }
    if (rLibreta) {
      barra?.classList.toggle('oscura', rLibreta.top <= 64 && rLibreta.bottom > 32);
      raiz.classList.toggle('sobre-oscuro', rLibreta.top <= 2 && rLibreta.bottom > 2);
    }

    if (wa) {
      const mostrar = y > vh * 0.7 && !enZonaSinWa && !pieVisible;
      if (mostrar !== waVisible) {
        waVisible = mostrar;
        wa.classList.toggle('visible', mostrar);
        if (mostrar && !wa.dataset.salio) { wa.dataset.salio = '1'; wa.classList.add('recien'); setTimeout(() => wa.classList.remove('recien'), 4200); }
        // El saludo sale una vez por visita, tras 9 s seguidos con el botón a la vista
        if (mostrar) programarSaludo();
        if (!mostrar) cerrarSaludo();
      }
      // Sobre La Libreta cambia a oro para no perderse en el grafito
      if (rLibreta) wa.classList.toggle('claro', rLibreta.top < vh - 45 && rLibreta.bottom > vh - 45);
    }

    if (activo !== spyActivo) {
      spyActivo = activo;
      spyLinks.forEach((a, i) => a.classList.toggle('activo', i === activo));
      ponerIndicador(spyLinks[activo]);
    }

    if (!RM) {
      paralajes.forEach((p, i) => {
        const c = cajas[i];
        if (c.bottom < -200 || c.top > vh + 200) return;
        const tope = c.height * (p.zoom ? 0.12 : 0.06);
        const desp = clamp(-(c.top + c.height / 2 - vh / 2) * p.v, -tope, tope);
        const escala = p.zoom ? 1 + 0.12 * clamp(c.top / vh, 0, 1) : 1;
        p.el.style.transform = `translate3d(0, ${desp.toFixed(1)}px, 0)${p.zoom ? ` scale(${escala.toFixed(4)})` : ''}`;
      });
    }

    if (rFrase && luces.length) {
      const avance = RM ? 1 : clamp((vh * 0.88 - rFrase.top) / (vh * 0.56), 0, 1);
      const n = luces.length;
      luces.forEach((l, i) => {
        const o = +(0.16 + 0.84 * clamp(avance * n - i, 0, 1)).toFixed(2);
        if (opacidades[i] !== o) { opacidades[i] = o; l.style.setProperty('--o', o); }
      });
    }

    if (rProceso && proceso) {
      const avance = RM ? 1 : clamp((vh * 0.8 - rProceso.top) / (vh * 0.45 + rProceso.height * 0.5), 0, 1);
      proceso.style.setProperty('--p', avance.toFixed(4));
      pasosProceso.forEach((paso, i) => paso.classList.toggle('activo', avance >= (i + 0.15) / pasosProceso.length));
    }
  }
  const pedirCuadro = () => { if (!pendiente) { pendiente = true; requestAnimationFrame(cuadro); } };
  addEventListener('scroll', pedirCuadro, {passive: true});

  let redimTimer = 0;
  addEventListener('resize', () => {
    pedirCuadro();
    clearTimeout(redimTimer);
    redimTimer = setTimeout(() => { prepararCinta(); ponerIndicador(spyLinks[spyActivo]); }, 200);
  }, {passive: true});

  // Las medidas de la cinta dependen de las tipografías
  (document.fonts?.ready || Promise.resolve()).then(() => { prepararCinta(); pedirCuadro(); });
  prepararCinta();
  cuadro();

  // ---------- Año en el pie ----------
  const anio = $('[data-anio]');
  if (anio) anio.textContent = new Date().getFullYear();
})();

// 3D kitchen colour explorer (sample designs). Uses the self-hosted <model-viewer> in /3d/vendor/.
// Kept in step with the desktop Kitchen Design Viewer in the cabinet-design repo (viewer/app.js).
// Each GLB has materials "Finish Upper", "Finish Base", "Handle", a granite material, "Hood Body" / "Hood Accent",
// "Downlight Lens" and, on two-tone framed designs, "Frame".
(function () {
  const mv = document.getElementById('k3d-viewer');
  if (!mv) return;
  const root = mv.dataset.root || '';
  const ModelViewer = customElements.get('model-viewer');
  if (ModelViewer) ModelViewer.meshoptDecoderLocation = root + '3d/vendor/meshopt_decoder.js';
  else customElements.whenDefined('model-viewer').then(() => {
    customElements.get('model-viewer').meshoptDecoderLocation = root + '3d/vendor/meshopt_decoder.js';
  });

  const FRAME_BLACK = '209-TOY';           // Black Mica (Sunny card): the background (frame) of two-tone designs
  const DESIGNS = [   // the first one is what the page opens with (its GLB is also the src in build.mjs)
    {id: 'framed', name: 'Two-tone framed', glb: '3d/two-tone-framed.glb',
      defaults: {upper: 'FN4-NIS', base: 'FN4-NIS', frame: FRAME_BLACK}},   // teal doors (KIT-015) in Black Mica 209
    {id: 'modern', name: 'Modern slab', glb: '3d/modern-kitchen.glb', defaults: {}},
  ];
  let FINISHES = [];                       // 3d/palette.json (our shade cards only)
  const DEF = 'FN4-NIS';                   // Teal (Blue Green P.M FN4) for all cupboards, like KIT-015
  const HANDLES = [
    {name: 'Matt black', hex: '#141414', metal: 0.6, rough: 0.45},
    {name: 'Stainless steel', hex: '#c8c8c8', metal: 1.0, rough: 0.30},
  ];
  const HOODS = [   // Euro 60 cm cooker hood, sold in black and silver. accent = buttons + logo
    {name: 'Black', hex: '#0c0c0d', metal: 0.2, rough: 0.35, accent: {hex: '#cfcfcf', metal: 0.9, rough: 0.35}},
    {name: 'Silver', hex: '#a7abb0', metal: 1.0, rough: 0.38, accent: {hex: '#141414', metal: 0, rough: 0.35}},
  ];
  const LIGHTS = [  // downlights in the top cap: warm white (our usual fitting) or white
    {name: 'Warm white', hex: '#ffd39b', lens: [1.0, 0.82, 0.58], env: '3d/room-warm.hdr'},
    {name: 'White', hex: '#f2f6ff', lens: [0.95, 0.97, 1.0], env: '3d/room-white.hdr'},
  ];
  const WORKTOPS = [  // real stone textures; the black one is matched to photos of our slab
    {name: 'Black Galaxy granite', hex: '#141716', metal: 0, rough: 0.18, tex: '3d/textures/granite-black-galaxy.jpg'},
    {name: 'Steel grey granite', hex: '#4e5054', metal: 0, rough: 0.22, tex: '3d/textures/granite-steel-grey.jpg'},
    {name: 'Tan Brown granite', hex: '#5a3a2a', metal: 0, rough: 0.22, tex: '3d/textures/granite-tan-brown.jpg'},
    {name: 'White quartz', hex: '#e7e5e0', metal: 0, rough: 0.25, tex: '3d/textures/granite-white-quartz.jpg'},
  ];
  const PRESETS = [   // suggested colours; on the two-tone design each comes in the black frame
    {name: 'Silver', colour: '199-TOY'},          // 199 TOY Silver Met.
    {name: 'Teal', colour: 'FN4-NIS'},            // FN4 NIS Blue Green P.M (like KIT-015)
    {name: 'Maroon', colour: '3Q3-TOY'},          // 3Q3 TOY Dark Red Mica Met
    {name: 'Emerald green', colour: 'G84-MIT'},   // G84 MIT Emerald Green Pearl
  ];
  const VIEWS = [
    {name: 'Perspective', orbit: '-28deg 85deg 5.6m', target: '1.83m 1.25m 0.25m'},
    {name: 'Front', orbit: '0deg 90deg 5.6m', target: '1.83m 1.3m 0.25m'},
    {name: 'Left', orbit: '-72deg 87deg 4.6m', target: '1.83m 1.2m 0.25m'},
    {name: 'Right', orbit: '72deg 87deg 4.6m', target: '1.83m 1.2m 0.25m'},
    {name: 'Hob', orbit: '8deg 52deg 1.4m', target: '2.44m 0.82m 0.30m'},
    {name: 'Sink', orbit: '-10deg 55deg 1.5m', target: '1.68m 0.80m 0.30m'},
  ];
  // pin the 3D view right under the sticky site header on narrow screens (see .k3d-stage in styles.css)
  const header = document.querySelector('.site-header');
  const pinTop = () => { if (header) document.documentElement.style.setProperty('--k3d-top', header.offsetHeight + 'px'); };
  pinTop(); window.addEventListener('resize', pinTop);
  if (window.matchMedia('(max-width: 700px)').matches) {     // narrow phones: pull the camera back
    for (const v of VIEWS) v.orbit = v.orbit.replace(/([\d.]+)m$/, (_, r) => (parseFloat(r) * 1.5).toFixed(1) + 'm');
    mv.cameraOrbit = VIEWS[0].orbit;
  }
  const BASE = {upper: DEF, base: DEF, frame: FRAME_BLACK, handle: 'Matt black', top: 'Black Galaxy granite',
    hood: 'Black', light: 'Warm white'};
  let design = DESIGNS[0];
  const state = {...BASE, ...design.defaults};
  let target = 'front', hasFrame = false;
  const lin = c => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  const rgba = hex => [1, 3, 5].map(i => lin(parseInt(hex.slice(i, i + 2), 16) / 255)).concat(1);
  const find = (list, key) => list.find(x => x.id === key || x.name === key) || list[0];
  const label = c => (c.code ? `${c.name} ${c.code}` : c.name);
  const $ = id => document.getElementById(id);
  const mats = match => (mv.model ? mv.model.materials : []).filter(m => (match instanceof RegExp ? match.test(m.name) : m.name === match));

  function paint(match, spec) {   // lacquered finishes: metallic flake base under the GLB's sharp clear coat
    for (const m of mats(match)) {
      m.pbrMetallicRoughness.setBaseColorFactor(rgba(spec.hex));
      m.pbrMetallicRoughness.setMetallicFactor(Math.min(spec.metal, 0.7));
      m.pbrMetallicRoughness.setRoughnessFactor(Math.min(Math.max(spec.rough, 0.3), 0.5));
    }
  }
  function paintExact(match, spec) {   // no clamping: stainless needs full metallic
    for (const m of mats(match)) {
      m.pbrMetallicRoughness.setBaseColorFactor(rgba(spec.hex));
      m.pbrMetallicRoughness.setMetallicFactor(spec.metal);
      m.pbrMetallicRoughness.setRoughnessFactor(spec.rough);
    }
  }
  let texCache = {};   // worktop textures for the current model (cleared on load)
  async function worktop(spec) {
    for (const m of mats(/Granite/i)) {
      const slot = m.pbrMetallicRoughness.baseColorTexture;
      if (spec.tex && slot) {
        texCache[spec.tex] = texCache[spec.tex] || mv.createTexture(root + spec.tex);
        const tex = await texCache[spec.tex];
        if (state.top !== spec.name) return;   // a newer choice arrived while loading
        slot.setTexture(tex);
        m.pbrMetallicRoughness.setBaseColorFactor([1, 1, 1, 1]);
      } else {
        m.pbrMetallicRoughness.setBaseColorFactor(rgba(spec.hex));
      }
      m.pbrMetallicRoughness.setMetallicFactor(spec.metal);
      m.pbrMetallicRoughness.setRoughnessFactor(spec.rough);
    }
  }

  function apply() {
    paint('Finish Upper', find(FINISHES, state.upper));
    paint('Finish Base', find(FINISHES, state.base));
    paint('Frame', find(FINISHES, state.frame));
    paint('Handle', find(HANDLES, state.handle));
    worktop(find(WORKTOPS, state.top));
    const hood = find(HOODS, state.hood);
    paintExact('Hood Body', hood); paintExact('Hood Accent', hood.accent);
    const light = find(LIGHTS, state.light);
    for (const m of mats('Downlight Lens')) m.setEmissiveFactor(light.lens);
    if (mv.environmentImage !== root + light.env) mv.environmentImage = root + light.env;
    const up = find(FINISHES, state.upper), bs = find(FINISHES, state.base), fr = find(FINISHES, state.frame);
    $('k3d-name-1').textContent = up ? label(up) : '';
    $('k3d-name-2').textContent = (hasFrame ? fr : bs) ? label(hasFrame ? fr : bs) : '';
    for (const [id, key] of [['k3d-handle-name', 'handle'], ['k3d-top-name', 'top'], ['k3d-hood-name', 'hood'], ['k3d-light-name', 'light']])
      $(id).textContent = state[key];
    document.querySelectorAll('.k3d-pal-sw').forEach(b => {
      b.classList.toggle('is-top', b.dataset.id === state.upper);
      b.classList.toggle('is-base', b.dataset.id === (hasFrame ? state.frame : state.base));
    });
    document.querySelectorAll('.k3d-swatch').forEach(
        b => b.setAttribute('aria-pressed', String(state[b.dataset.key] === b.dataset.name)));
    const wa = $('k3d-whatsapp');
    if (wa) {
      const colours = hasFrame
          ? `${label(up)} doors in a ${label(fr)} frame`
          : `cupboards in ${label(up)}`;
      const msg = `Hello Inpalakan Timbers, I tried the 3D kitchen (${design.name}): ${colours}, ${state.handle} handles, ${
          state.top} worktop, ${state.hood.toLowerCase()} cooker hood, ${state.light.toLowerCase()} lights. Can you make a kitchen like this for my home?`;
      wa.href = `https://wa.me/${wa.dataset.number}?text=${encodeURIComponent(msg)}`;
    }
  }

  function swatches(id, key, list) {
    const box = $(id);
    for (const s of list) {
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'k3d-swatch';
      b.style.background = s.tex ? `${s.hex} url(${root + s.tex}) center / 400%` : s.hex;
      b.title = s.name; b.setAttribute('aria-label', s.name);
      b.dataset.key = key; b.dataset.name = s.name;
      b.addEventListener('click', () => { state[key] = s.name; apply(); });
      box.appendChild(b);
    }
  }

  function buttons(boxId, list, onPick, pressed = 0, cls = '') {
    const box = $(boxId); box.innerHTML = '';
    list.forEach((item, i) => {
      const b = document.createElement('button');
      b.type = 'button'; b.textContent = item.name; if (cls) b.className = cls;
      b.setAttribute('aria-pressed', String(i === pressed));
      b.addEventListener('click', () => {
        onPick(item);
        box.querySelectorAll('button').forEach(x => x.setAttribute('aria-pressed', String(x === b)));
      });
      box.appendChild(b);
    });
  }

  // one colour for all cupboards; two-tone framed designs add Front / Background buttons for the palette
  function targets() {
    target = 'front';
    buttons('k3d-target', hasFrame ? [{t: 'front', name: 'Front'}, {t: 'background', name: 'Background'}] : [],
        x => { target = x.t; }, 0);
    $('k3d-target').hidden = !hasFrame;
    $('k3d-label-1').textContent = hasFrame ? 'Front' : 'Colour';
    $('k3d-label-2').textContent = 'Background';
    $('k3d-label-2').parentNode.querySelectorAll('#k3d-label-2, #k3d-name-2, br').forEach(e => { e.hidden = !hasFrame; });
    presets();
  }
  function presets() {   // suggested colours; on two-tone designs they show and apply the black background
    const box = $('k3d-presets'); box.innerHTML = '';
    if (!FINISHES.length) return;
    for (const p of PRESETS) {
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'k3d-preset';
      b.innerHTML = `<i style="--u:${find(FINISHES, p.colour).hex};--b:${find(FINISHES, hasFrame ? FRAME_BLACK : p.colour).hex}"></i><span>${
          p.name}${hasFrame ? ' in black frame' : ''}</span>`;
      b.addEventListener('click', () => {
        Object.assign(state, {upper: p.colour, base: p.colour}, hasFrame ? {frame: FRAME_BLACK} : {}); apply();
      });
      box.appendChild(b);
    }
  }

  buttons('k3d-views', VIEWS, v => { mv.cameraTarget = v.target; mv.cameraOrbit = v.orbit; }, 0, 'k3d-view');
  buttons('k3d-design', DESIGNS, d => {
    if (d === design) return;
    design = d;
    Object.assign(state, BASE, d.defaults);
    $('k3d-loading').hidden = false;
    mv.src = root + d.glb;
  });
  swatches('k3d-light', 'light', LIGHTS);
  swatches('k3d-hood', 'hood', HOODS);
  swatches('k3d-handle', 'handle', HANDLES);
  swatches('k3d-top', 'top', WORKTOPS);

  // a failed load (e.g. a dropped connection) must not leave "Loading…" forever: retry once, then offer a tap to retry
  let retried = false;
  const reload = () => { $('k3d-loading').textContent = 'Loading 3D kitchen…'; const s = mv.src; mv.src = ''; mv.src = s; };
  mv.addEventListener('error', () => {
    if (!retried) { retried = true; setTimeout(reload, 800); return; }
    const box = $('k3d-loading');
    box.innerHTML = '<button type="button" class="k3d-view">Could not load the 3D kitchen. Tap to try again</button>';
    box.querySelector('button').addEventListener('click', reload);
  });
  mv.addEventListener('load', () => {
    retried = false;
    texCache = {};
    hasFrame = mats('Frame').length > 0;
    targets();
    $('k3d-loading').hidden = true;
    apply();
  });
  $('k3d-save').addEventListener('click', async () => {
    const blob = await mv.toBlob({mimeType: 'image/png'});
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    const second = hasFrame ? `frame-${state.frame}` : state.base;
    a.download = `inpalakan-kitchen-${state.upper}-${second}.png`.replace(/[^\w.-]+/g, '_');
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  });
  function palette(filter = '') {
    const box = $('k3d-palette'); box.innerHTML = '';
    const f = filter.trim().toLowerCase();
    for (const card of [...new Set(FINISHES.map(c => c.card))]) {
      const items = FINISHES.filter(c => c.card === card && (!f || (c.name + ' ' + c.code).toLowerCase().includes(f)));
      if (!items.length) continue;
      const h = document.createElement('p'); h.className = 'k3d-card'; h.textContent = card; box.appendChild(h);
      const grid = document.createElement('div'); grid.className = 'k3d-pal'; box.appendChild(grid);
      for (const c of items) {
        const b = document.createElement('button');
        b.type = 'button'; b.className = 'k3d-pal-sw'; b.style.background = c.hex; b.dataset.id = c.id;
        b.title = `${c.name} · ${c.code} · ${c.card}` + (c.confidence === 'card' ? ' (colour from our shade card)'
            : ' (colour from OEM paint reference)');
        b.setAttribute('aria-label', label(c));
        b.innerHTML = `<span>${c.code.split(' ')[0]}</span>`;
        b.addEventListener('click', () => {
          if (target === 'background') state.frame = c.id;
          else state.upper = state.base = c.id;   // one colour for all cupboards
          apply();
        });
        grid.appendChild(b);
      }
    }
    apply();
  }
  $('k3d-search').addEventListener('input', e => palette(e.target.value));
  fetch(root + '3d/palette.json').then(r => r.json()).then(p => {
    FINISHES = p;
    presets();
    palette();
  });
})();

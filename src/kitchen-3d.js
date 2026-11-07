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

  const DESIGNS = [
    {id: 'modern', name: 'Modern slab', glb: '3d/modern-kitchen.glb', defaults: {}},
    {id: 'framed', name: 'Two-tone framed', glb: '3d/two-tone-framed.glb',
      defaults: {upper: 'Z2S-SUZ', base: 'Z2S-SUZ', frame: 'SOLID-BLACK'}},
  ];
  let FINISHES = [];                       // solids + 3d/palette.json (our shade cards)
  const DEF = 'FN4-NIS';                   // Teal (Blue Green P.M FN4) for top and bottom, like KIT-015
  // plain (non-metallic) gloss colours; gloss black is the usual background of two-tone framed designs
  const SOLIDS = [
    {id: 'SOLID-BLACK', name: 'Gloss black', code: 'Black', hex: '#0d0d0e', metal: 0, rough: 0.15},
    {id: 'SOLID-CHARCOAL', name: 'Gloss charcoal', code: 'Charcoal', hex: '#2e3033', metal: 0, rough: 0.20},
    {id: 'SOLID-WHITE', name: 'Gloss white', code: 'White', hex: '#eeede8', metal: 0, rough: 0.15},
    {id: 'SOLID-WALNUT', name: 'Dark walnut', code: 'Walnut', hex: '#3a281c', metal: 0, rough: 0.35},
  ].map(c => ({...c, card: 'Solid gloss', confidence: 'solid'}));
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
  const PRESETS = [
    {name: 'Teal (like KIT-015)', upper: 'FN4-NIS', base: 'FN4-NIS', handle: 'Matt black', top: 'Black Galaxy granite'},
    {name: 'Silver (like KIT-002)', upper: '199-TOY', base: '199-TOY', handle: 'Matt black', top: 'Black Galaxy granite'},
    {name: 'Copper (like KIT-003)', upper: '1816817', base: '1816817', handle: 'Matt black', top: 'Steel grey granite'},
    {name: 'Cream (like KIT-010)', upper: 'CM1-NIS', base: 'CM1-NIS', handle: 'Matt black', top: 'Black Galaxy granite'},
    {name: 'Blue + silver (like KIT-016)', upper: '1E7-TOY', base: 'EGR-PEU', handle: 'Matt black', top: 'Black Galaxy granite'},
    // two-tone framed design only: grey gloss doors in a gloss-black frame, like a completed L-shaped kitchen
    {name: 'Silver in black frame', upper: 'Z2S-SUZ', base: 'Z2S-SUZ', handle: 'Matt black', top: 'Black Galaxy granite',
      frame: 'SOLID-BLACK', framed: true},
  ];
  const VIEWS = [
    {name: 'Perspective', orbit: '-28deg 85deg 5.6m', target: '1.83m 1.25m 0.25m'},
    {name: 'Front', orbit: '0deg 90deg 5.6m', target: '1.83m 1.3m 0.25m'},
    {name: 'Left', orbit: '-72deg 87deg 4.6m', target: '1.83m 1.2m 0.25m'},
    {name: 'Right', orbit: '72deg 87deg 4.6m', target: '1.83m 1.2m 0.25m'},
    {name: 'Hob', orbit: '8deg 52deg 1.4m', target: '2.44m 0.82m 0.30m'},
    {name: 'Sink', orbit: '-10deg 55deg 1.5m', target: '1.68m 0.80m 0.30m'},
  ];
  if (window.matchMedia('(max-width: 700px)').matches) {     // narrow phones: pull the camera back
    for (const v of VIEWS) v.orbit = v.orbit.replace(/([\d.]+)m$/, (_, r) => (parseFloat(r) * 1.5).toFixed(1) + 'm');
    mv.cameraOrbit = VIEWS[0].orbit;
  }
  const BASE = {upper: DEF, base: DEF, frame: 'SOLID-BLACK', handle: 'Matt black', top: 'Black Galaxy granite',
    hood: 'Black', light: 'Warm white'};
  let design = DESIGNS[0];
  const state = {...BASE};
  let target = 'both', hasFrame = false;
  const lin = c => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  const rgba = hex => [1, 3, 5].map(i => lin(parseInt(hex.slice(i, i + 2), 16) / 255)).concat(1);
  const find = (list, key) => list.find(x => x.id === key || x.name === key) || list[0];
  const label = c => (c.code && c.confidence !== 'solid' ? `${c.name} ${c.code}` : c.name);
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
          : `top cabinets ${label(up)}, bottom cabinets ${label(bs)}`;
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

  // what a palette click colours: Top / Bottom / Both, or Front / Background on two-tone framed designs
  function targets() {
    const list = hasFrame ? [{t: 'front', name: 'Front'}, {t: 'background', name: 'Background'}]
                          : [{t: 'upper', name: 'Top'}, {t: 'base', name: 'Bottom'}, {t: 'both', name: 'Both'}];
    target = hasFrame ? 'front' : 'both';
    buttons('k3d-target', list, x => { target = x.t; }, hasFrame ? 0 : 2);
    $('k3d-label-1').textContent = hasFrame ? 'Front' : 'Top';
    $('k3d-label-2').textContent = hasFrame ? 'Background' : 'Bottom';
    document.querySelectorAll('.k3d-preset[data-framed]').forEach(b => { b.hidden = !hasFrame; });
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

  mv.addEventListener('load', () => {
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
            : c.confidence === 'solid' ? ' (plain gloss paint)' : ' (colour from OEM paint reference)');
        b.setAttribute('aria-label', label(c));
        b.innerHTML = `<span>${c.code.split(' ')[0]}</span>`;
        b.addEventListener('click', () => {
          if (target === 'background') state.frame = c.id;
          else if (target === 'front') state.upper = state.base = c.id;
          else {
            if (target !== 'base') state.upper = c.id;
            if (target !== 'upper') state.base = c.id;
          }
          apply();
        });
        grid.appendChild(b);
      }
    }
    apply();
  }
  $('k3d-search').addEventListener('input', e => palette(e.target.value));
  fetch(root + '3d/palette.json').then(r => r.json()).then(p => {
    FINISHES = [...SOLIDS, ...p];
    const presetBox = $('k3d-presets');
    for (const p of PRESETS) {
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'k3d-preset';
      b.innerHTML = `<i style="--u:${find(FINISHES, p.upper).hex};--b:${find(FINISHES, p.frame || p.base).hex}"></i><span>${p.name}</span>`;
      if (p.framed) { b.dataset.framed = '1'; b.hidden = !hasFrame; }
      b.addEventListener('click', () => {
        const {name, framed, ...look} = p;
        Object.assign(state, look); apply();
      });
      presetBox.appendChild(b);
    }
    palette();
  });
})();

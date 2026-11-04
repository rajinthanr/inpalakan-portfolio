// 3D kitchen colour explorer (sample design). Uses the self-hosted <model-viewer> in /3d/vendor/.
// The GLB has materials "Finish Upper", "Finish Base", "Handle" and a granite material.
(function () {
  const mv = document.getElementById('k3d-viewer');
  if (!mv) return;
  const root = mv.dataset.root || '';
  const ModelViewer = customElements.get('model-viewer');
  if (ModelViewer) ModelViewer.meshoptDecoderLocation = root + '3d/vendor/meshopt_decoder.js';
  else customElements.whenDefined('model-viewer').then(() => {
    customElements.get('model-viewer').meshoptDecoderLocation = root + '3d/vendor/meshopt_decoder.js';
  });

  let FINISHES = [];                       // loaded from 3d/palette.json (our shade cards)
  const DEF = 'BN6-NIS';                   // Dark Blue Pearl for top and bottom
  const HANDLES = [
    {name: 'Matt black', hex: '#141414', metal: 0.6, rough: 0.45},
    {name: 'Stainless steel', hex: '#c8c8c8', metal: 1.0, rough: 0.30},
  ];
  const WORKTOPS = [
    {name: 'Black Galaxy granite', hex: '#0b0b0c', metal: 0, rough: 0.55},
    {name: 'Steel grey granite', hex: '#4e5054', metal: 0, rough: 0.30},
    {name: 'Tan Brown granite', hex: '#5a3a2a', metal: 0, rough: 0.30},
    {name: 'White quartz', hex: '#e7e5e0', metal: 0, rough: 0.32},
  ];
  const PRESETS = [
    {name: 'Dark blue', upper: 'BN6-NIS', base: 'BN6-NIS', handle: 'Stainless steel', top: 'Black Galaxy granite'},
    {name: 'Silver (like KIT-002)', upper: '199-TOY', base: '199-TOY', handle: 'Matt black', top: 'Black Galaxy granite'},
    {name: 'Copper (like KIT-003)', upper: '1816817', base: '1816817', handle: 'Matt black', top: 'Steel grey granite'},
    {name: 'Cream (like KIT-010)', upper: 'CM1-NIS', base: 'CM1-NIS', handle: 'Matt black', top: 'Black Galaxy granite'},
    {name: 'Teal (like KIT-015)', upper: 'FN4-NIS', base: 'FN4-NIS', handle: 'Matt black', top: 'Black Galaxy granite'},
    {name: 'Blue + silver (like KIT-016)', upper: '1E7-TOY', base: 'EGR-PEU', handle: 'Matt black', top: 'Black Galaxy granite'},
  ];
  const VIEWS = [
    {name: 'Perspective', orbit: '-28deg 85deg 5.6m', target: '1.83m 1.25m 0.25m'},
    {name: 'Front', orbit: '0deg 90deg 5.6m', target: '1.83m 1.3m 0.25m'},
    {name: 'Left', orbit: '-72deg 87deg 4.6m', target: '1.83m 1.2m 0.25m'},
    {name: 'Right', orbit: '72deg 87deg 4.6m', target: '1.83m 1.2m 0.25m'},
    {name: 'Top', orbit: '0deg 0.5deg 6.2m', target: '1.83m 1.0m 0.25m'},
    {name: 'Hob', orbit: '8deg 52deg 1.4m', target: '2.44m 0.82m 0.30m'},
  ];
  if (window.matchMedia('(max-width: 700px)').matches) {     // narrow phones: pull the camera back
    for (const v of VIEWS) v.orbit = v.orbit.replace(/([\d.]+)m$/, (_, r) => (parseFloat(r) * 1.5).toFixed(1) + 'm');
    mv.cameraOrbit = VIEWS[0].orbit;
  }
  const state = {upper: DEF, base: DEF, handle: 'Stainless steel', top: 'Black Galaxy granite'};
  let target = 'both';
  const lin = c => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  const rgba = hex => [1, 3, 5].map(i => lin(parseInt(hex.slice(i, i + 2), 16) / 255)).concat(1);
  const find = (list, key) => list.find(x => x.id === key || x.name === key) || list[0];
  const label = c => (c.code ? `${c.name} ${c.code}` : c.name);
  const $ = id => document.getElementById(id);

  function paint(match, spec) {
    if (!mv.model) return;
    for (const m of mv.model.materials) {
      if (match instanceof RegExp ? match.test(m.name) : m.name === match) {
        m.pbrMetallicRoughness.setBaseColorFactor(rgba(spec.hex));
        m.pbrMetallicRoughness.setMetallicFactor(Math.min(spec.metal, 0.3));
        m.pbrMetallicRoughness.setRoughnessFactor(Math.max(spec.rough, 0.32));
      }
    }
  }

  function apply() {
    paint('Finish Upper', find(FINISHES, state.upper));
    paint('Finish Base', find(FINISHES, state.base));
    paint('Handle', find(HANDLES, state.handle));
    paint(/Granite/i, find(WORKTOPS, state.top));
    const up = find(FINISHES, state.upper), bs = find(FINISHES, state.base);
    $('k3d-upper-name').textContent = up ? label(up) : '';
    $('k3d-base-name').textContent = bs ? label(bs) : '';
    $('k3d-handle-name').textContent = state.handle; $('k3d-top-name').textContent = state.top;
    document.querySelectorAll('.k3d-pal-sw').forEach(b => {
      b.classList.toggle('is-top', b.dataset.id === state.upper); b.classList.toggle('is-base', b.dataset.id === state.base);
    });
    document.querySelectorAll('.k3d-swatch').forEach(
        b => b.setAttribute('aria-pressed', String(state[b.dataset.key] === b.dataset.name)));
    const wa = $('k3d-whatsapp');
    if (wa) {
      const msg = `Hello Inpalakan Timbers, I tried the 3D kitchen: top cabinets ${label(find(FINISHES, state.upper))}, bottom cabinets ${
          label(find(FINISHES, state.base))}, ${state.handle} handles, ${state.top} worktop. Can you make a kitchen like this for my home?`;
      wa.href = `https://wa.me/${wa.dataset.number}?text=${encodeURIComponent(msg)}`;
    }
  }

  function swatches(id, key, list) {
    const box = $(id);
    for (const s of list) {
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'k3d-swatch'; b.style.background = s.hex;
      b.title = s.name; b.setAttribute('aria-label', s.name);
      b.dataset.key = key; b.dataset.name = s.name;
      b.addEventListener('click', () => { state[key] = s.name; apply(); });
      box.appendChild(b);
    }
  }

  const viewBox = $('k3d-views');
  VIEWS.forEach((v, i) => {
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'k3d-view'; b.textContent = v.name;
    b.setAttribute('aria-pressed', String(i === 0));
    b.addEventListener('click', () => {
      mv.cameraTarget = v.target; mv.cameraOrbit = v.orbit;
      viewBox.querySelectorAll('button').forEach(x => x.setAttribute('aria-pressed', String(x === b)));
    });
    viewBox.appendChild(b);
  });
  swatches('k3d-handle', 'handle', HANDLES);
  swatches('k3d-top', 'top', WORKTOPS);

  function glowWashes(viewer) {   // warm downlight scallops: make the wash texture self-lit so it glows on any colour
  if (!viewer.model) return;
  for (const m of viewer.model.materials) {
    if (!/Downlight Wash/.test(m.name)) continue;
    const t = m.pbrMetallicRoughness.baseColorTexture && m.pbrMetallicRoughness.baseColorTexture.texture;
    if (t && m.emissiveTexture) m.emissiveTexture.setTexture(t);
    m.setEmissiveFactor([0.45, 0.38, 0.28]);   // soft warm wash (kept minimal)
    m.pbrMetallicRoughness.setBaseColorFactor([0, 0, 0, 1]);
  }
}
  mv.addEventListener('load', () => { glowWashes(mv); $('k3d-loading').hidden = true; apply(); });
  $('k3d-save').addEventListener('click', async () => {
    const blob = await mv.toBlob({mimeType: 'image/png'});
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `inpalakan-kitchen-${state.upper}-${state.base}.png`.replace(/[^\w.-]+/g, '_');
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
        b.title = `${c.name} · ${c.code} · ${c.card}` + (c.confidence === 'card' ? ' (colour from our shade card)' : ' (colour from OEM paint reference)'); b.setAttribute('aria-label', `${c.name} ${c.code}`);
        b.innerHTML = `<span>${c.code.split(' ')[0]}</span>`;
        b.addEventListener('click', () => {
          if (target !== 'base') state.upper = c.id;
          if (target !== 'upper') state.base = c.id;
          apply();
        });
        grid.appendChild(b);
      }
    }
    apply();
  }
  $('k3d-search').addEventListener('input', e => palette(e.target.value));
  document.querySelectorAll('#k3d-target button').forEach(b => b.addEventListener('click', () => {
    target = b.dataset.t;
    document.querySelectorAll('#k3d-target button').forEach(x => x.setAttribute('aria-pressed', String(x === b)));
  }));
  fetch(root + '3d/palette.json').then(r => r.json()).then(p => {
    FINISHES = p;
  const presetBox = $('k3d-presets');
    for (const p of PRESETS) {
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'k3d-preset';
      b.innerHTML = `<i style="--u:${find(FINISHES, p.upper).hex};--b:${find(FINISHES, p.base).hex}"></i><span>${p.name}</span>`;
      b.addEventListener('click', () => { Object.assign(state, p); delete state.name; apply(); });
      presetBox.appendChild(b);
    }
    palette();
  });
})();

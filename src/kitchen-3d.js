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

  const FINISHES = [
    {name: 'Pearl silver-grey', hex: '#b9bcc0', metal: 0.55, rough: 0.30},
    {name: 'Pearl white', hex: '#e9e7e2', metal: 0.40, rough: 0.28},
    {name: 'Champagne', hex: '#d6c19c', metal: 0.60, rough: 0.30},
    {name: 'Copper / bronze', hex: '#b06e3c', metal: 0.65, rough: 0.30},
    {name: 'Cream gloss', hex: '#ede3c8', metal: 0.00, rough: 0.12},
    {name: 'Rose gold', hex: '#c9937e', metal: 0.60, rough: 0.30},
    {name: 'Teal metallic', hex: '#3e7c80', metal: 0.55, rough: 0.30},
    {name: 'Sage green', hex: '#9aae92', metal: 0.45, rough: 0.32},
    {name: 'Steel blue', hex: '#6f8fb0', metal: 0.55, rough: 0.30},
    {name: 'Midnight blue', hex: '#24324f', metal: 0.55, rough: 0.30},
    {name: 'Graphite', hex: '#4a4d52', metal: 0.55, rough: 0.32},
    {name: 'Gunmetal', hex: '#5b5f63', metal: 0.70, rough: 0.28},
  ];
  const HANDLES = [
    {name: 'Matt black', hex: '#141414', metal: 0.6, rough: 0.45},
    {name: 'Stainless steel', hex: '#c8c8c8', metal: 1.0, rough: 0.30},
  ];
  const WORKTOPS = [
    {name: 'Black Galaxy granite', hex: '#0b0b0c', metal: 0, rough: 0.28},
    {name: 'Steel grey granite', hex: '#4e5054', metal: 0, rough: 0.30},
    {name: 'Tan Brown granite', hex: '#5a3a2a', metal: 0, rough: 0.30},
    {name: 'White quartz', hex: '#e7e5e0', metal: 0, rough: 0.32},
  ];
  const PRESETS = [
    {name: 'Silver (like KIT-002)', upper: 'Pearl silver-grey', base: 'Pearl silver-grey', handle: 'Matt black', top: 'Black Galaxy granite'},
    {name: 'Copper (like KIT-003)', upper: 'Copper / bronze', base: 'Copper / bronze', handle: 'Matt black', top: 'Steel grey granite'},
    {name: 'Cream gloss (like KIT-010)', upper: 'Cream gloss', base: 'Cream gloss', handle: 'Matt black', top: 'Black Galaxy granite'},
    {name: 'Teal (like KIT-015)', upper: 'Teal metallic', base: 'Teal metallic', handle: 'Matt black', top: 'Black Galaxy granite'},
    {name: 'Blue + white (like KIT-016)', upper: 'Pearl white', base: 'Steel blue', handle: 'Matt black', top: 'Black Galaxy granite'},
    {name: 'Champagne + graphite', upper: 'Champagne', base: 'Graphite', handle: 'Matt black', top: 'Black Galaxy granite'},
  ];
  const VIEWS = [
    {name: 'Perspective', orbit: '-28deg 72deg 5.4m', target: '1.83m 1.2m 0.25m'},
    {name: 'Front', orbit: '0deg 90deg 5.6m', target: '1.83m 1.3m 0.25m'},
    {name: 'Left', orbit: '-72deg 84deg 4.6m', target: '1.83m 1.2m 0.25m'},
    {name: 'Right', orbit: '72deg 84deg 4.6m', target: '1.83m 1.2m 0.25m'},
    {name: 'Top', orbit: '0deg 0.5deg 6.2m', target: '1.83m 1.0m 0.25m'},
    {name: 'Hob', orbit: '8deg 52deg 1.4m', target: '2.44m 0.82m 0.30m'},
  ];
  if (window.matchMedia('(max-width: 700px)').matches) {     // narrow phones: pull the camera back
    for (const v of VIEWS) v.orbit = v.orbit.replace(/([\d.]+)m$/, (_, r) => (parseFloat(r) * 1.5).toFixed(1) + 'm');
    mv.cameraOrbit = VIEWS[0].orbit;
  }
  const state = {upper: 'Pearl white', base: 'Pearl silver-grey', handle: 'Matt black', top: 'Black Galaxy granite'};
  const lin = c => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  const rgba = hex => [1, 3, 5].map(i => lin(parseInt(hex.slice(i, i + 2), 16) / 255)).concat(1);
  const find = (list, name) => list.find(x => x.name === name) || list[0];
  const $ = id => document.getElementById(id);

  function paint(match, spec) {
    if (!mv.model) return;
    for (const m of mv.model.materials) {
      if (match instanceof RegExp ? match.test(m.name) : m.name === match) {
        m.pbrMetallicRoughness.setBaseColorFactor(rgba(spec.hex));
        m.pbrMetallicRoughness.setMetallicFactor(spec.metal);
        m.pbrMetallicRoughness.setRoughnessFactor(spec.rough);
      }
    }
  }

  function apply() {
    paint('Finish Upper', find(FINISHES, state.upper));
    paint('Finish Base', find(FINISHES, state.base));
    paint('Handle', find(HANDLES, state.handle));
    paint(/Granite/i, find(WORKTOPS, state.top));
    for (const k of ['upper', 'base', 'handle', 'top']) $('k3d-' + k + '-name').textContent = state[k];
    document.querySelectorAll('.k3d-swatch').forEach(
        b => b.setAttribute('aria-pressed', String(state[b.dataset.key] === b.dataset.name)));
    const wa = $('k3d-whatsapp');
    if (wa) {
      const msg = `Hello Inpalakan Timbers, I tried the 3D kitchen: top cabinets ${state.upper}, bottom cabinets ${
          state.base}, ${state.handle} handles, ${state.top} worktop. Can you make a kitchen like this for my home?`;
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

  const presetBox = $('k3d-presets');
  for (const p of PRESETS) {
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'k3d-preset';
    b.innerHTML = `<i style="--u:${find(FINISHES, p.upper).hex};--b:${find(FINISHES, p.base).hex}"></i><span>${p.name}</span>`;
    b.addEventListener('click', () => { Object.assign(state, p); delete state.name; apply(); });
    presetBox.appendChild(b);
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
  swatches('k3d-upper', 'upper', FINISHES);
  swatches('k3d-base', 'base', FINISHES);
  swatches('k3d-handle', 'handle', HANDLES);
  swatches('k3d-top', 'top', WORKTOPS);
  mv.addEventListener('load', () => { $('k3d-loading').hidden = true; apply(); });
  $('k3d-save').addEventListener('click', async () => {
    const blob = await mv.toBlob({mimeType: 'image/png'});
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `inpalakan-kitchen-${state.upper}-${state.base}.png`.replace(/[^\w.-]+/g, '_');
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  });
  apply();
})();

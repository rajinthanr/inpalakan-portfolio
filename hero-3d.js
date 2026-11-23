// Home-page hero: live 3D sample kitchen (two-tone framed: the doors take the look's colours, the frame stays Black Mica 209)
// with quick colour looks.
(function () {
  const mv = document.getElementById('hero-3d');
  if (!mv) return;
  const setDecoder = () => { customElements.get('model-viewer').meshoptDecoderLocation = '3d/vendor/meshopt_decoder.js'; };
  if (customElements.get('model-viewer')) setDecoder(); else customElements.whenDefined('model-viewer').then(setDecoder);

  const lin = c => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  const rgba = hex => [1, 3, 5].map(i => lin(parseInt(hex.slice(i, i + 2), 16) / 255)).concat(1);
  const F = {   // from our paint shade cards (palette.json ids: 199-TOY, FN4-NIS, 3Q3-TOY, G84-MIT, 209-TOY)
    silver: ['#d8d1c6', 0.6, 0.3],
    teal: ['#1f5c56', 0.35, 0.22],
    maroon: ['#59282b', 0.45, 0.26],
    emerald: ['#1f4140', 0.35, 0.22],
  };
  const FRAME = ['#15181f', 0.45, 0.26];   // Black Mica 209 TOY (Sunny card)
  const LOOKS = [   // the suggested colours, as on the 3D kitchen page
    {name: 'Teal FN4', upper: 'teal', base: 'teal'},
    {name: 'Silver 199', upper: 'silver', base: 'silver'},
    {name: 'Maroon 3Q3', upper: 'maroon', base: 'maroon'},
    {name: 'Emerald green G84', upper: 'emerald', base: 'emerald'},
  ];
  function set(name, hex, metal, rough) {
    for (const m of (mv.model ? mv.model.materials : [])) {
      if (name instanceof RegExp ? name.test(m.name) : m.name === name) {
        m.pbrMetallicRoughness.setBaseColorFactor(rgba(hex));
        m.pbrMetallicRoughness.setMetallicFactor(Math.min(metal, 0.7));   // metallic flake under the GLB's clear coat
        m.pbrMetallicRoughness.setRoughnessFactor(Math.min(Math.max(rough, 0.3), 0.5));
      }
    }
  }
  // granite worktop: the GLB carries the Black Galaxy texture; other stones are swapped in from 3d/textures/
  let blackTex = null; const texCache = {};
  async function worktop(stone) {
    for (const m of (mv.model ? mv.model.materials : []).filter(m => /Granite/i.test(m.name))) {
      const slot = m.pbrMetallicRoughness.baseColorTexture;
      if (!slot) continue;
      if (!blackTex) blackTex = slot.texture;
      const tex = stone ? await (texCache[stone] = texCache[stone] || mv.createTexture(`3d/textures/granite-${stone}.jpg`)) : blackTex;
      if ((current.top || null) !== stone) return;   // a newer look was picked while loading
      slot.setTexture(tex);
    }
  }
  let current = LOOKS[0];
  function apply(look) {
    current = look;
    set('Finish Upper', ...F[look.upper]);
    set('Finish Base', ...F[look.base]);
    set('Handle', ...(look.handle || ['#141414', 0.6, 0.45]));
    set('Frame', ...FRAME);   // black frame (same as the 3D page's background)
    worktop(look.top || null);
    document.querySelectorAll('.hero-3d-chip').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.look === look.name)));
  }
  const box = document.getElementById('hero-3d-chips');
  for (const look of LOOKS) {
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'hero-3d-chip'; b.dataset.look = look.name;
    b.title = look.name; b.setAttribute('aria-label', 'Show ' + look.name + ' cupboards');
    b.style.setProperty('--u', F[look.upper][0]); b.style.setProperty('--b', F[look.base][0]);
    b.addEventListener('click', () => apply(look));
    box.appendChild(b);
  }

  let retried = false;   // a failed load must not leave "Loading…" forever: retry once
  mv.addEventListener('error', () => { if (!retried) { retried = true; const s = mv.src; setTimeout(() => { mv.src = ''; mv.src = s; }, 800); } });
  mv.addEventListener('load', () => { blackTex = null; document.getElementById('hero-3d-loading').hidden = true; apply(current); sway(); });

  // gentle side-to-side sway (front ± 35°) instead of a full turn, so the back is never shown;
  // pauses while the visitor drags and resumes 4 s after they let go
  let idleSince = performance.now(), dragging = false, t0 = performance.now();
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  mv.addEventListener('camera-change', e => { if (e.detail.source === 'user-interaction') { dragging = true; idleSince = performance.now(); } });
  mv.addEventListener('pointerup', () => { dragging = false; idleSince = performance.now(); });
  function sway() {
    if (reduced) return;
    const step = now => {
      if (!dragging && now - idleSince > 4000 && !document.hidden) {
        const theta = -25 + 35 * Math.sin((now - t0) / 9000 * 2 * Math.PI);
        const orbit = mv.getCameraOrbit();
        mv.cameraOrbit = `${theta.toFixed(2)}deg ${(orbit.phi * 180 / Math.PI).toFixed(2)}deg ${orbit.radius.toFixed(3)}m`;
      } else if (dragging === false && now - idleSince <= 4000) {
        t0 = now - 9000 * Math.asin(Math.max(-1, Math.min(1, ((mv.getCameraOrbit().theta * 180 / Math.PI) + 25) / 35))) / (2 * Math.PI);
      }
      requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }
})();

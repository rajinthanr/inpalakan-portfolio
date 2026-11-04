// Home-page hero: live 3D sample kitchen with quick colour looks.
(function () {
  const mv = document.getElementById('hero-3d');
  if (!mv) return;
  const setDecoder = () => { customElements.get('model-viewer').meshoptDecoderLocation = '3d/vendor/meshopt_decoder.js'; };
  if (customElements.get('model-viewer')) setDecoder(); else customElements.whenDefined('model-viewer').then(setDecoder);

  const lin = c => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  const rgba = hex => [1, 3, 5].map(i => lin(parseInt(hex.slice(i, i + 2), 16) / 255)).concat(1);
  const F = {   // from our paint shade cards (palette.json ids: BN6-NIS, 199-TOY, 1816817, CM1-NIS, FN4-NIS, 1E7-TOY, EGR-PEU)
    darkblue: ['#1a1c29', 0.35, 0.22],
    silver: ['#7b7a6d', 0.6, 0.3],
    copper: ['#713d1c', 0.6, 0.3],
    cream: ['#948a76', 0.35, 0.22],
    teal: ['#19333f', 0.35, 0.22],
    crystal: ['#c8d0d1', 0.6, 0.3],
    starblue: ['#546588', 0.6, 0.3],
  };
  const LOOKS = [
    {name: 'Dark Blue Pearl BN6', upper: 'darkblue', base: 'darkblue', top: ['#0b0b0c', 0.55], handle: ['#c8c8c8', 1.0, 0.30]},
    {name: 'Silver Met 199', upper: 'silver', base: 'silver', top: ['#0b0b0c', 0.55]},
    {name: 'Tasman Gold (copper look)', upper: 'copper', base: 'copper', top: ['#4e5054', 0.30]},
    {name: 'Light Beige Pearl CM1', upper: 'cream', base: 'cream', top: ['#0b0b0c', 0.55]},
    {name: 'Blue Green P.M FN4', upper: 'teal', base: 'teal', top: ['#0b0b0c', 0.55]},
    {name: 'Crystal Silver 1E7 + Star Blue EGR', upper: 'crystal', base: 'starblue', top: ['#0b0b0c', 0.55]},
  ];
  function set(name, hex, metal, rough) {
    for (const m of (mv.model ? mv.model.materials : [])) {
      if (name instanceof RegExp ? name.test(m.name) : m.name === name) {
        m.pbrMetallicRoughness.setBaseColorFactor(rgba(hex));
        m.pbrMetallicRoughness.setMetallicFactor(metal);
        m.pbrMetallicRoughness.setRoughnessFactor(rough);
      }
    }
  }
  let current = LOOKS[0];
  function apply(look) {
    current = look;
    set('Finish Upper', ...F[look.upper]);
    set('Finish Base', ...F[look.base]);
    set('Handle', ...(look.handle || ['#141414', 0.6, 0.45]));
    set(/Granite/i, look.top[0], 0, look.top[1]);
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
  mv.addEventListener('load', () => { document.getElementById('hero-3d-loading').hidden = true; apply(current); });
})();

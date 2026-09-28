import {cp, mkdir, readdir, readFile, rm, writeFile} from 'node:fs/promises';
import {existsSync} from 'node:fs';
import {join} from 'node:path';
import {fileURLToPath} from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const dist = join(root, 'dist');
const site = JSON.parse(await readFile(join(root, 'data/site.json'), 'utf8'));
const projects =
    JSON.parse(await readFile(join(root, 'data/projects.json'), 'utf8'));
const baseUrl = (process.env.PUBLIC_BASE_URL || '').replace(/\/$/, '');

const doorPatterns = [
  ['SP-001', 'Floral vine carving', '01-floral-vine.png'],
  ['SP-002', 'Vertical slat grid', '01-vertical-slat-grid.png'],
  ['SP-003', 'Circular geometry', '02-circular-geometry.png'],
  ['SP-004', 'Horizontal slat bands', '02-horizontal-slat-bands.png'],
  ['SP-005', 'Peacock heritage entrance', '02-peacock-heritage-double-door.jpg'],
  ['SP-006', 'Circular medallion entrance', '03-circular-medallion-double-door.jpg'],
  ['SP-007', 'Mixed slat rails', '03-mixed-slat-rails.png'],
  ['SP-008', 'Peacock heritage carving', '03-peacock-heritage.png'],
  ['SP-009', 'Modular slat single door', '04-modular-slat-single.png'],
  ['SP-010', 'Arched classic entrance', '05-arched-classic.png'],
  ['SP-011', 'Diamond slat bays', '05-diamond-slat-bays.png'],
  ['SP-012', 'Arched classic double door', '06-arched-classic-double-door.jpg'],
  ['SP-013', 'Brick-bond slats', '06-brick-bond-slats.png'],
  ['SP-014', 'Framed vertical slats', '06-framed-vertical-slats.png'],
  ['SP-015', 'Medallion tiered slats', '07-medallion-tiered-slats.png'],
  ['SP-016', 'Woven centre slats', '07-woven-center-slats.png'],
  ['SP-017', 'Arched stepped slats', '08-arched-stepped-slats.png'],
  ['SP-018', 'Framed chevron slats', '08-framed-chevron-slats.png'],
  ['SP-019', 'Lotus vertical slats', '09-lotus-vertical-slats.png'],
  ['SP-020', 'T-rail slat panels', '09-t-rail-slat-panels.png'],
  ['SP-021', 'Horizontal slats with vine detail', '10-horizontal-slats-vine.png'],
  ['SP-022', 'Mixed module single door', '10-mixed-module-single.png'],
  ['SP-023', 'Teak multi-panel divider rails', '18-teak-multi-panel-divider-rails.jpg']
].map(([code, title, image]) => ({
  code, title, image, category: 'doors',
  alt: `Sample door pattern: ${title}`
}));

const kitchenPatterns = [
  ['KS-001', 'Champagne metallic L-shape', '01-champagne-metallic-l-shape.png'],
  ['KS-002', 'Graphite metallic U-shape', '02-graphite-metallic-u-shape.png'],
  ['KS-003', 'Sage metallic galley', '03-sage-metallic-galley.png'],
  ['KS-004', 'Pearl silver metallic L-shape', '04-pearl-silver-metallic-l-shape.png'],
  ['KS-005', 'Bronze metallic peninsula', '05-bronze-metallic-peninsula.png'],
  ['KS-006', 'Midnight blue metallic kitchen', '06-midnight-blue-metallic.png'],
  ['KS-007', 'Rose-gold and charcoal metallic', '07-rose-gold-charcoal-metallic.png'],
  ['KS-008', 'Pearl white metallic galley', '08-pearl-white-metallic-galley.png'],
  ['KS-009', 'Teal metallic corner kitchen', '09-teal-metallic-corner.png'],
  ['KS-010', 'Gunmetal and champagne island', '10-gunmetal-champagne-island.png']
].map(([code, title, image]) => ({
  code, title, image, category: 'kitchens',
  alt: `Sample kitchen cupboard pattern: ${title}`
}));

const tvUnitPatterns = [
  ['TVS-001', 'Metallic teal display wall', '01-metallic-teal-display-wall.png'],
  ['TVS-002', 'Graphite and champagne wall', '02-graphite-champagne-wall.png'],
  ['TVS-003', 'Pearl-grey corner unit', '03-pearl-grey-corner-unit.png'],
  ['TVS-005', 'Champagne and charcoal media wall', '05-champagne-charcoal-media-wall.png'],
  ['TVS-006', 'Graphite asymmetric unit', '06-graphite-asymmetric-unit.png'],
  ['TVS-008', 'Bronze and gunmetal wall', '08-bronze-gunmetal-wall.png'],
  ['TVS-009', 'Layered rectangle wall', '09-layered-rectangle-wall.png'],
  ['TVS-010', 'Media wall with desk', '10-media-wall-desk.png'],
  ['TVS-011', 'Graphite and bronze hall unit', '11-graphite-bronze-sri-lankan-hall.png'],
  ['TVS-012', 'Open-plan divider unit', '12-open-plan-divider-unit.png'],
  ['TVS-013', 'Under-stair sage unit', '13-under-stair-sage-unit.png'],
  ['TVS-014', 'Pearl-grey open-hall unit', '14-pearl-grey-open-hall.png'],
  ['TVS-015', 'Column-integrated blue unit', '15-column-integrated-blue-unit.png']
].map(([code, title, image]) => ({
  code, title, image, category: 'tv-units',
  alt: `Sample TV-unit pattern: ${title}`
}));

const gypsumPatterns = [
  ['GYS-001', 'Double-step rectangle ceiling', '01-double-step-rectangle.png'],
  ['GYS-002', 'Octagon and circle tray ceiling', '02-octagon-circle-tray.png'],
  ['GYS-003', 'Green star centre ceiling', '03-green-star-centre.png'],
  ['GYS-004', 'S-curve hall ceiling', '04-s-curve-hall.png'],
  ['GYS-005', 'Concentric ring halo ceiling', '05-concentric-ring-halo.png'],
  ['GYS-006', 'Connected rectangle islands', '06-connected-rectangle-islands.png'],
  ['GYS-007', 'Scalloped corner tray ceiling', '07-scalloped-corner-tray.png'],
  ['GYS-008', 'Rounded rectangle tray ceiling', '08-rounded-rectangle-tray.png'],
  ['GYS-009', 'Simple cross feature ceiling', '09-simple-cross-feature.png'],
  ['GYS-010', 'Symmetrical square tray ceiling', '10-symmetrical-square-tray.png']
].map(([code, title, image]) => ({
  code, title, image, category: 'gypsum',
  alt: `Sample gypsum ceiling pattern: ${title}`
}));

const samplePatterns = [
  ...doorPatterns, ...kitchenPatterns, ...tvUnitPatterns, ...gypsumPatterns
];

const categories = {
  doors: {
    title: 'Carved Doors & Woodwork',
    english: 'Carved Doors & Woodwork',
    singular: 'Carved Door',
    icon: '🔨',
    intro:
        'Hand-carved temple and entrance double doors, pooja room reliefs, and decorative timber craftsmanship.'
  },
  windows: {
    title: 'Windows',
    english: 'Timber Windows',
    singular: 'Window',
    icon: '🪟',
    intro:
        'Timber window frames, decorative wave mullions, and textured privacy glass.'
  },
  kitchens: {
    title: 'Kitchen Cupboards & Granite',
    english: 'Kitchen Cupboards & Granite',
    singular: 'Kitchen Design',
    icon: '🍽️',
    intro:
        'Custom modular kitchen cupboards, solid timber cabinetry, and precision-cut kitchen granite countertops with undermount sink fittings.'
  },
  bedrooms: {
    title: 'Bedroom Cupboards',
    english: 'Bedroom Cupboards',
    singular: 'Bedroom Wardrobe',
    icon: '🛏️',
    intro:
        'Fitted floor-to-ceiling wardrobes, dressing mirrors, integrated closet suites, and under-bed storage drawers.'
  },
  gypsum: {
    title: 'Gypsum Ceilings',
    english: 'Gypsum Ceilings',
    singular: 'Gypsum Ceiling',
    icon: '🔲',
    intro:
        'Architectural false ceilings, modern stepped trays, decorative perimeter coves, and warm LED ambient lighting.'
  },
  furniture: {
    title: 'Custom Furniture',
    english: 'Custom Furniture',
    singular: 'Custom Furniture',
    icon: '🪑',
    intro:
        'Handcrafted solid timber beds, carved pooja shrines, display cabinets, and custom woodwork built to last.'
  },
  'tv-units': {
    title: 'TV Stands & Feature Walls',
    english: 'TV Stand & Feature Walls',
    singular: 'TV Unit',
    icon: '🖥',
    intro:
        'Modern TV consoles, timber fluted wall panel backdrops, floating display shelves, and ambient feature walls.'
  }
};

function esc(value) {
  return String(value).replace(/[&<>"']/g, character => ({
                                             '&': '&amp;',
                                             '<': '&lt;',
                                             '>': '&gt;',
                                             '"': '&quot;',
                                             '\'': '&#39;'
                                           })[character]);
}

function assertContent() {
  const codes = new Set();
  const slugs = new Set();
  for (const project of projects) {
    for (const key
             of ['code', 'slug', 'category', 'title', 'summary', 'image',
                 'alt']) {
      if (!project[key])
        throw new Error(`Missing ${key} on ${JSON.stringify(project)}`);
    }
    if (!categories[project.category])
      throw new Error(
          `Unknown category: ${project.category} on ${project.code}`);
    if (codes.has(project.code) || slugs.has(project.slug))
      throw new Error(`Duplicate code or slug: ${project.code}`);
    codes.add(project.code);
    slugs.add(project.slug);
  }
}

function projectUrl(project, prefix = '') {
  return `${prefix}projects/${project.slug}.html`;
}

function projectImagePath(project, filename = project.image) {
  return `images/projects/${project.category}/${filename}`;
}

function imageUrl(project, prefix = '') {
  return `${prefix}${projectImagePath(project)}`;
}

function whatsappHref(code = '') {
  const message = code ?
      `Hello Inpalakan Timbers, I like design ${
          code}. Could we discuss something similar for my space?` :
      'Hello Inpalakan Timbers, I would like to discuss a project.';
  return `https://wa.me/${site.whatsappNumber}?text=${
      encodeURIComponent(message)}`;
}

function icon(name) {
  if (name === 'arrow')
    return '<svg aria-hidden="true" viewBox="0 0 24 24" fill="none"><path d="M4 12h15m-6-6 6 6-6 6" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  if (name === 'share')
    return '<svg aria-hidden="true" viewBox="0 0 24 24" fill="none"><path d="M12 15V3m0 0L7.5 7.5M12 3l4.5 4.5M5 13.5v5A2.5 2.5 0 0 0 7.5 21h9a2.5 2.5 0 0 0 2.5-2.5v-5" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  if (name === 'whatsapp')
    return '<svg class="button-icon" aria-hidden="true" viewBox="0 0 24 24" fill="none"><path d="M20 11.6a8 8 0 0 1-11.8 7L4 20l1.4-4.1A8 8 0 1 1 20 11.6Z" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/><path d="M9 8.1c.2-.4.4-.4.7-.4h.4c.2 0 .3 0 .4.4l.7 1.7c.1.3.1.4-.1.6l-.6.8c-.2.2-.1.4 0 .6.7 1.2 1.6 2.1 2.9 2.7.2.1.4.1.6-.1l.8-1c.2-.2.4-.2.6-.1l1.8.9c.3.1.3.3.3.5-.1.8-.5 1.5-1.2 1.9-.6.4-1.5.6-2.4.3-1-.3-2.3-.8-3.8-2.1-1.2-1.1-2.1-2.4-2.5-3.4-.5-1.1 0-2.6.4-3.3Z" fill="currentColor"/></svg>';
  if (name === 'map')
    return '<svg class="button-icon" aria-hidden="true" viewBox="0 0 24 24" fill="none"><path d="M20 10c0 5.2-8 11-8 11S4 15.2 4 10a8 8 0 1 1 16 0Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><circle cx="12" cy="10" r="2.5" stroke="currentColor" stroke-width="1.8"/></svg>';
  if (name === 'facebook')
    return '<svg class="button-icon" aria-hidden="true" viewBox="0 0 24 24" fill="currentColor"><path d="M13.7 21v-8h2.7l.4-3h-3.1V8.1c0-.9.3-1.5 1.6-1.5H17V3.9c-.3 0-1.3-.1-2.5-.1-2.5 0-4.2 1.5-4.2 4.3V10H7.5v3h2.8v8h3.4Z"/></svg>';
  if (name === 'phone')
    return '<svg class="button-icon" aria-hidden="true" viewBox="0 0 24 24" fill="none"><path d="M8.2 3.8 10 7.9c.2.5.1 1-.3 1.4l-1.4 1.4a15 15 0 0 0 5 5l1.4-1.4c.4-.4.9-.5 1.4-.3l4.1 1.8c.5.2.8.7.7 1.3l-.4 2.4c-.1.7-.7 1.2-1.4 1.2C10.4 20.7 3.3 13.6 3.3 4.9c0-.7.5-1.3 1.2-1.4l2.4-.4c.6-.1 1.1.2 1.3.7Z" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  return '';
}

function logoUrl(prefix = '') {
  return `${prefix}${site.logo || 'images/Others/logo.png'}`;
}

function header(prefix = '', active = '') {
  return `<header class="site-header">
    <div class="header-inner shell">
      <a class="brand" href="${
      prefix}index.html" aria-label="Inpalakan Timbers home"><img class="brand-logo" src="${
      logoUrl(
          prefix)}" alt="Inpalakan Timbers logo" width="44" height="44"><span class="brand-name">INPALAKAN <small>TIMBERS</small></span></a>
      <nav class="main-nav" aria-label="Main navigation">
        <a class="${active === 'work' ? 'is-active' : ''}" href="${
      prefix}gallery.html">Our Work</a>
        <a href="${prefix}index.html#services">Services</a>
        <a href="${prefix}index.html#location">Location</a>
      </nav>
      <a class="header-work-link ${active === 'work' ? 'is-active' : ''}" href="${
      prefix}gallery.html">Our Work</a>
      <a class="header-cta" href="${
      whatsappHref()}" target="_blank" rel="noopener noreferrer" data-whatsapp>Enquire <span aria-hidden="true">↗</span></a>
    </div>
  </header>`;
}

function footer(prefix = '') {
  return `<footer class="site-footer" id="contact">
    <div class="shell footer-grid">
      <div>
        <p class="eyebrow light">LET'S MAKE SOMETHING LAST</p>
        <h2>Have a design<br><em>in mind?</em></h2>
        <p>Send us a design code or a photo of what inspires you. We can discuss dimensions, finishes, and custom crafting for your space.</p>
        <div class="footer-cta-group">
          <a class="button button-light button-with-brand-icon" href="${
      whatsappHref()}" target="_blank" rel="noopener noreferrer" data-whatsapp>${
      icon('whatsapp')}<span>Chat on WhatsApp</span></a>
          <a class="button button-outline-light" href="${
      site.mapUrl}" target="_blank" rel="noopener noreferrer">
            ${icon('map')}<span>Find us on Google Maps</span>
          </a>
        </div>
      </div>
      <div class="footer-aside" id="location">
        <a class="footer-brand" href="${prefix}index.html">
          <img class="footer-brand-logo" src="${
      logoUrl(
          prefix)}" alt="Inpalakan Timbers logo" width="56" height="56" loading="lazy">
          <span class="footer-brand-text">INPALAKAN <small>TIMBERS</small></span>
        </a>
        <p class="footer-location-label">VISIT OUR WORKSHOP</p>
        <address>${esc(site.address)}</address>
        <p class="footer-service-area">Serving Valvettithurai, Point Pedro, Nelliady, Thondaimanaru, Thikkam, and the wider Vadamarachy area.</p>
        <div class="footer-links">
          <a href="${prefix}gallery.html">Portfolio</a>
          <a href="${prefix}index.html#services">Services</a>
          <a href="${
      site.facebookUrl}" target="_blank" rel="noopener noreferrer" class="footer-icon-link">${
      icon('facebook')}<span>Facebook</span></a>
          <a href="tel:${site.phone.replace(/\s+/g, '')}" class="footer-icon-link">${
      icon('phone')}<span>${esc(site.phone)}</span></a>
        </div>
      </div>
    </div>
    <div class="shell footer-bottom">
      <span>© ${
      new Date()
          .getFullYear()} Inpalakan Timbers. All rights reserved.</span>
    </div>
  </footer>`;
}

function generatePlaylist(prefix = '') {
  const list = [];
  projects.forEach(project => {
    const views = project.views && project.views.length > 1 ?
        project.views :
        [{src: project.image, label: 'Full front view', alt: project.alt}];
    views.forEach((v, idx) => {
      list.push({
        code: project.code,
        category: project.category,
        collection: 'work',
        group: project.code,
        title: project.title,
        src: `${prefix}${projectImagePath(project, v.src)}`,
        rawSrc: v.src,
        label: v.label || `View ${idx + 1}`,
        alt: v.alt || project.alt,
        url: projectUrl(project, prefix),
        whatsapp: whatsappHref(project.code)
      });
    });
  });
  samplePatterns.forEach(pattern => list.push({
    code: pattern.code,
    category: pattern.category,
    collection: 'sample',
    group: pattern.code,
    title: pattern.title,
    src: `${prefix}images/concepts/${pattern.category}/${pattern.image}`,
    rawSrc: pattern.image,
    label: pattern.category === 'doors' ? 'Sample door pattern' :
        pattern.category === 'kitchens' ? 'Sample kitchen cupboard pattern' :
        pattern.category === 'tv-units' ? 'Sample TV-unit pattern' :
                                           'Sample gypsum ceiling pattern',
    alt: pattern.alt,
    url: `${prefix}images/concepts/${pattern.category}/${pattern.image}`,
    whatsapp: whatsappHref(pattern.code)
  }));
  return list;
}

function layout({
  title,
  description,
  body,
  prefix = '',
  active = '',
  image = '',
  path = ''
}) {
  const canonical = baseUrl && path ? `${baseUrl}/${path}` : '';
  const socialImage =
      baseUrl && (image || site.logo || 'images/Others/logo.png') ?
      `${baseUrl}/${image || site.logo || 'images/Others/logo.png'}` :
      '';
  const logo = logoUrl(prefix);
  const playlistJson = JSON.stringify(generatePlaylist(prefix));
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="theme-color" content="#f5f0e8"><title>${
      esc(title)} · Inpalakan Timbers</title><meta name="description" content="${
      esc(description)}"><meta property="og:type" content="website"><meta property="og:site_name" content="Inpalakan Timbers"><meta property="og:title" content="${
      esc(title)} · Inpalakan Timbers"><meta property="og:description" content="${
      esc(description)}">${
      canonical ? `<link rel="canonical" href="${
                      esc(canonical)}"><meta property="og:url" content="${
                      esc(canonical)}">` :
                  ''}${
      socialImage ? `<meta property="og:image" content="${esc(socialImage)}">` :
                    ''}<link rel="icon" href="${
      logo}" type="image/png"><link rel="apple-touch-icon" href="${
      logo}"><link rel="stylesheet" href="${prefix}styles.css"><script src="${
      prefix}site.js" defer></script></head><body><a class="skip-link" href="#main">Skip to content</a>${
      header(prefix, active)}<main id="main">${body}</main>${footer(prefix)}
  <div id="fullscreen-lightbox" class="lightbox-modal" hidden role="dialog" aria-modal="true" aria-label="Full screen image viewer">
    <div class="lightbox-backdrop"></div>
    <div class="lightbox-header">
      <div class="lightbox-badge">
        <span id="lb-code" class="lb-code"></span>
        <span id="lb-counter" class="lb-counter"></span>
      </div>
      <div class="lightbox-header-actions">
        <button id="lb-close-btn" class="lb-close-btn" type="button" aria-label="Close full screen viewer (Esc)">✕</button>
      </div>
    </div>
    <div class="lightbox-stage">
      <button id="lb-prev-btn" class="lb-nav-btn lb-prev" type="button" aria-label="Previous image (Left arrow)">‹</button>
      <div class="lightbox-slide">
        <img id="lb-image" class="lightbox-img" src="" alt="" draggable="false">
      </div>
      <button id="lb-next-btn" class="lb-nav-btn lb-next" type="button" aria-label="Next image (Right arrow)">›</button>
    </div>
    <div class="lightbox-bottom-sheet">
      <div id="lb-thumbnails" class="lb-thumbnails" aria-label="Images in this collection"></div>
      <div class="lightbox-actions">
        <a id="lb-whatsapp-btn" class="lb-whatsapp" href="#" target="_blank" rel="noopener noreferrer">
          Ask about this design on WhatsApp
        </a>
        <button id="lb-share-btn" class="lb-share-btn" type="button" aria-label="Share this design" title="Share">↗</button>
      </div>
    </div>
  </div>
  <script id="catalog-playlist" type="application/json">${playlistJson}</script>
</body></html>`;
}

function card(project, prefix = '', index = 0) {
  const viewsBadge = project.views && project.views.length > 1 ?
      `<span class="card-views-badge">${project.views.length} views</span>` :
      '';
  const searchKeywords =
      `${project.code} ${project.title} ${project.category} ${
          categories[project.category]?.singular ||
          ''} ${categories[project.category]?.english || ''}`;
  const url = projectUrl(project, prefix);
  const category = categories[project.category];
  return `<article class="project-card" data-category="${project.category}" data-code="${
      esc(project.code)}" data-keywords="${esc(searchKeywords)}">
    <div class="card-image-wrap">
      <a class="card-image" href="${url}" data-open-lightbox="${esc(project.code)}" aria-label="View ${
      esc(project.title)} (${esc(project.code)}) full screen">
      <img src="${imageUrl(project, prefix)}" alt="${
      esc(project.alt)}" loading="${
      index < 4 ? 'eager' : 'lazy'}" decoding="async">
      ${viewsBadge}
      <span class="card-image-gradient" aria-hidden="true"></span>
      <span class="card-overlay">
        <span class="card-overlay-row"><span class="card-code">${esc(project.code)}</span></span>
      </span>
      </a>
      <button class="card-expand-btn" type="button" aria-label="View full screen ${
      esc(project.code)}" data-open-lightbox="${
      esc(project.code)}" title="Full screen">⛶</button>
    </div>
  </article>`;
}

function patternCard(pattern, index = 0) {
  const type = pattern.category === 'doors' ? 'door' :
      pattern.category === 'kitchens' ? 'kitchen cupboard' :
      pattern.category === 'tv-units' ? 'TV-unit' : 'gypsum ceiling';
  const image = `images/concepts/${pattern.category}/${pattern.image}`;
  const keywords = `${pattern.code} ${pattern.title} sample pattern ${type}`;
  return `<article class="project-card sample-pattern-card" data-category="${pattern.category}" data-code="${esc(pattern.code)}" data-keywords="${esc(keywords)}">
    <div class="card-image-wrap">
      <button class="card-image sample-pattern-image" type="button" aria-label="View sample pattern ${esc(pattern.code)} full screen" data-open-lightbox="${esc(pattern.code)}">
        <img src="${image}" alt="${esc(pattern.alt)}" loading="${index < 2 ? 'eager' : 'lazy'}" decoding="async">
        <span class="ai-generated-badge">Sample</span>
        <span class="card-image-gradient" aria-hidden="true"></span>
        <span class="card-overlay">
          <span class="card-overlay-row"><span class="card-code">${esc(pattern.code)}</span></span>
        </span>
      </button>
      <button class="card-expand-btn" type="button" aria-label="View full screen ${esc(pattern.code)}" data-open-lightbox="${esc(pattern.code)}" title="Full screen">⛶</button>
    </div>
  </article>`;
}

function homePage() {
  const heroProject = projects.find(p => p.code === 'KC-021');
  if (!heroProject) throw new Error('Missing featured home design KC-021');
  const featured = [
    heroProject, ...projects.filter(p => p.featured && p.code !== 'KC-021')
  ];
  const categoryCoverSelections = {
    doors: {
      code: 'DR-008',
      image: 'door-two-tone-peacock-veranda-full.jpg',
      alt: 'Paired timber entrance doors with dark-stained carved peacock panels and floral rosettes'
    },
    windows: {
      code: 'WN-019',
      image: 'window-wn-021.jpg',
      alt: 'Three-panel timber window with textured glass and safety grille'
    },
    kitchens: {
      code: 'GR-008',
      image: 'granite-mirror-black-undermount-double-sink.jpg',
      alt: 'Mirror-polished black granite countertop with undermount double-bowl stainless steel sink and gooseneck faucet'
    },
    bedrooms: {
      code: 'BC-024',
      image: 'bedroom-teal-wardrobe-mirror-bed-suite.jpg',
      alt: 'Modern fitted bedroom suite in soft teal with mirrored closet door and matching bedhead storage'
    },
    gypsum: {
      code: 'GY-005',
      image: 'gypsum-classic-hall-ceiling.jpg',
      alt: 'Classic perimeter false ceiling with soft warm downlights illuminating hall walls'
    },
    furniture: {
      code: 'FN-004',
      image: 'furniture-pooja-cabinet-lit-front.jpg',
      alt: 'Illuminated timber pooja cabinet with carved crown'
    },
    'tv-units': {
      code: 'TV-004',
      image: 'tv-unit-rounded-teal-wide.jpg',
      alt: 'Teal television feature wall with rounded display towers'
    }
  };
  const categoryCovers = Object.fromEntries(
      Object.entries(categoryCoverSelections).map(([key, selection]) => {
        const project = projects.find(p => p.code === selection.code);
        if (!project || project.category !== key)
          throw new Error(`Invalid category cover ${key}: ${selection.code}`);
        return [key, {...project, image: selection.image, alt: selection.alt}];
      }));

  const servicesByKey = Object.fromEntries(
      (site.services || []).map(service => [service.key, service]));
  const categoryTiles =
      Object.entries(categories)
          .map(([key, category], index) => {
            const cover = categoryCovers[key];
            return `<a class="category-tile category-${
                key}" href="gallery.html?category=${key}" aria-label="View ${
                esc(category.title)} designs">
      <img src="${imageUrl(cover)}" alt="${
                esc(cover?.alt ||
                    category.title)}" loading="${index < 4 ? 'eager' : 'lazy'}">
      <span class="category-shade"></span>
      <span class="category-copy">
        <strong>${category.title}</strong>
        <span class="category-subtitle">${
                esc(servicesByKey[key]?.tamil || category.english)}</span>
        <span class="category-link">View designs ${icon('arrow')}</span>
      </span>
    </a>`;
          })
          .join('');

  const body = `<section class="hero">
    <div class="hero-copy">
      <div class="hero-copy-inner">
        <h1 class="hero-business-title">
          <span class="hero-name-en">Inpalakan <em>Timbers</em></span>
          <span class="hero-name-ta" lang="ta">இன்பழகன் கைத்தொழிலகம்</span>
        </h1>
        <p class="hero-since"><span></span> SINCE 2006 <span></span></p>
        <p class="hero-lead">Custom carved doors, windows, modular kitchens &amp; granite worktops, gypsum ceilings, and custom furniture. Explore our work, find a design code, and connect with our workshop.</p>
        <div class="hero-actions">
          <a class="button button-dark" href="gallery.html">View Our Work ${
      icon('arrow')}</a>
          <a class="text-link" href="#services">Our services <span aria-hidden="true">↘</span></a>
        </div>
        <div class="hero-footnote"><span class="rule"></span> YOUR VISION, OUR CRAFTSMANSHIP</div>
      </div>
    </div>
    <div class="hero-visual">
      <img src="${imageUrl(heroProject)}" alt="${
      esc(heroProject.alt)}" fetchpriority="high">
    </div>
  </section>

  <section class="section services-section shell" id="services">
    <div class="section-kicker"><span class="section-index">01 / SERVICES &amp; SPECIALTIES</span><span class="hairline"></span></div>
    <div class="section-heading">
      <div>
        <p class="eyebrow">WHAT WE CRAFT</p>
        <h2>Our services &amp;<br><em>craftsmanship.</em></h2>
        <p class="section-heading-lead">Explore by category and tap any image to see completed designs.</p>
      </div>
      <a class="text-link" href="gallery.html">Browse full portfolio ${
      icon('arrow')}</a>
    </div>
    <div class="category-grid">
      ${categoryTiles}
    </div>
  </section>

  <section class="section featured-section">
    <div class="shell">
      <div class="section-heading">
        <div>
          <p class="eyebrow">A CLOSER LOOK</p>
          <h2>Selected work.</h2>
        </div>
        <a class="text-link" href="gallery.html">See all ${
      projects.length} designs ${icon('arrow')}</a>
      </div>
      <div class="project-grid featured-slider" aria-label="Selected work. Swipe horizontally to see more designs">
        ${featured.map((p, i) => card(p, '', i)).join('')}
      </div>
      <p class="swipe-hint" aria-hidden="true">Swipe to explore <span>→</span></p>
    </div>
  </section>
  `;

  return layout({
    title: 'Timber craftsmanship since 2006',
    description:
        'Explore real door, window, kitchen, bedroom, gypsum ceiling, and custom furniture projects by Inpalakan Timbers in Valvettithurai.',
    body,
    path: 'index.html',
    image: projectImagePath(heroProject)
  });
}

function galleryPage() {
  const totalGalleryItems = projects.length + samplePatterns.length;
  const body = `<section class="page-hero shell">
    <p class="eyebrow">OUR COMPLETED WORK</p>
    <h1>Choose a design<br><em>you like.</em></h1>
    <p>Tap a category, then tap any photo to see it clearly. Every design has a reference code you can send to us on WhatsApp.</p>
  </section>
  <section class="gallery-section shell" aria-label="Project gallery">
    <div class="gallery-toolbar">
      <div class="filters" role="group" aria-label="Filter designs">
        <button class="filter is-active" type="button" data-filter="all" aria-pressed="true">
          All <span>${totalGalleryItems}</span>
        </button>
        ${
      Object.entries(categories)
          .map(
              ([key, category]) => `
          <button class="filter" type="button" data-filter="${
                  key}" aria-pressed="false">
            ${category.icon} ${category.title} <span>${
                  projects.filter(p => p.category === key).length +
                  samplePatterns.filter(p => p.category === key).length}</span>
          </button>
        `).join('')}
      </div>
      <div class="gallery-search-wrap">
        <input class="gallery-search" type="search" placeholder="Search designs, for example DR-004" aria-label="Search designs" data-gallery-search>
      </div>
      <p class="gallery-count" aria-live="polite"><span id="visible-count">${
      totalGalleryItems}</span> designs</p>
    </div>
    <div class="project-grid gallery-grid">
      ${projects.map((p, i) => card(p, '', i)).join('')}
    </div>
    <section class="sample-patterns" data-sample-patterns aria-labelledby="sample-patterns-title">
      <div class="sample-patterns-heading">
        <div><p class="eyebrow">DESIGN INSPIRATION</p><h2 id="sample-patterns-title">Sample door patterns.</h2></div>
        <p>Reference patterns for discussing a similar custom door. Ask us how a pattern can be adapted for your entrance.</p>
      </div>
      <div class="project-grid gallery-grid sample-pattern-grid">
        ${doorPatterns.map((pattern, i) => patternCard(pattern, i)).join('')}
      </div>
    </section>
    <section class="sample-patterns" data-sample-patterns aria-labelledby="sample-kitchen-patterns-title">
      <div class="sample-patterns-heading">
        <div><p class="eyebrow">DESIGN INSPIRATION</p><h2 id="sample-kitchen-patterns-title">Sample kitchen patterns.</h2></div>
        <p>Metallic-painted cupboard references with clean single-board slab doors and no bevelled profiles. Ask us how a finish and layout can be adapted for your kitchen.</p>
      </div>
      <div class="project-grid gallery-grid sample-pattern-grid">
        ${kitchenPatterns.map((pattern, i) => patternCard(pattern, i)).join('')}
      </div>
    </section>
    <section class="sample-patterns" data-sample-patterns aria-labelledby="sample-tv-unit-patterns-title">
      <div class="sample-patterns-heading">
        <div><p class="eyebrow">DESIGN INSPIRATION</p><h2 id="sample-tv-unit-patterns-title">Sample TV-unit patterns.</h2></div>
        <p>Metallic-painted TV-unit references designed for practical Sri Lankan living halls. Ask us how a layout and finish can be adapted for your home.</p>
      </div>
      <div class="project-grid gallery-grid sample-pattern-grid">
        ${tvUnitPatterns.map((pattern, i) => patternCard(pattern, i)).join('')}
      </div>
    </section>
    <section class="sample-patterns" data-sample-patterns aria-labelledby="sample-gypsum-patterns-title">
      <div class="sample-patterns-heading">
        <div><p class="eyebrow">DESIGN INSPIRATION</p><h2 id="sample-gypsum-patterns-title">Sample gypsum ceiling patterns.</h2></div>
        <p>Practical ceiling references with balanced shapes and concealed lighting. Ask us how a pattern can be adjusted for your room dimensions.</p>
      </div>
      <div class="project-grid gallery-grid sample-pattern-grid">
        ${gypsumPatterns.map((pattern, i) => patternCard(pattern, i)).join('')}
      </div>
    </section>
    <p class="empty-state" hidden>No designs match your search or filter.</p>
  </section>
  <section class="gallery-note shell">
    <span class="asterisk">✳</span>
    <p>Like a detail in one of these designs? Note its reference code, click full screen to inspect details, or tap WhatsApp to talk directly with our workshop.</p>
  </section>`;

  return layout({
    title: 'Portfolio & Designs',
    description:
        'Browse completed Inpalakan Timbers doors, windows, kitchens & granite worktops, ceilings, and furniture. Every design has a shareable page and a WhatsApp enquiry code.',
    body,
    active: 'work',
    path: 'gallery.html'
  });
}

function projectPage(project) {
  const category = categories[project.category];
  const related =
      projects
          .filter(
              p => p.category === project.category && p.code !== project.code)
          .slice(0, 2);
  const views =
      project.views && project.views.length > 1 ? project.views : null;
  const initialAlt = views ? views[0].alt : project.alt;

  const thumbsHtml = views ?
      `
    <div class="detail-gallery-nav" role="region" aria-label="Available views of this design">
      <div class="thumbs-scroller">
        ${
          views
              .map(
                  (v, i) => `
          <button class="thumb-btn ${
                      i === 0 ?
                          'is-active' :
                      ''}" type="button" data-view-src="../${
                      projectImagePath(project, v.src)}" data-view-label="${
                      esc(v.label)}" data-view-alt="${
                      esc(v.alt)}" aria-label="${esc(v.label)}" ${
                      i === 0 ? 'aria-current="true"' : ''}>
            <img src="../${projectImagePath(project, v.src)}" alt="${
                      esc(v.alt)}" loading="lazy">
          </button>
        `).join('')}
      </div>
    </div>
  ` :
      '';

  const body = `<section class="detail-shell shell">
    <nav class="breadcrumbs" aria-label="Breadcrumb">
      <a href="../index.html">Home</a><span>/</span>
      <a href="../gallery.html?category=${project.category}">${
      category.title}</a><span>/</span>
      <span aria-current="page">${esc(project.code)}</span>
    </nav>
    <div class="detail-grid">
      <div class="detail-image-wrap">
        <div class="detail-main-frame" role="button" tabindex="0" aria-label="Click to view full screen" data-fullscreen-trigger data-project-code="${
      esc(project.code)}" data-project-category="${esc(project.category)}">
          <img class="detail-image" id="active-detail-image" src="${
      imageUrl(project, '../')}" alt="${esc(initialAlt)}" fetchpriority="high">
          <span class="image-stamp">${esc(project.code)}</span>
          <span class="fullscreen-hint"><span>⛶ Tap for full screen</span></span>
        </div>
        ${thumbsHtml}
        <p class="fullscreen-tip"><span>💡 Tap photo to view in full screen and slide through images</span></p>
      </div>
      <div class="detail-content">
        <div class="detail-info">
          <span>DESIGN REFERENCE</span>
          <strong>${esc(project.code)}</strong>
        </div>
        <div class="detail-actions">
          <a class="button button-dark" href="${
      whatsappHref(
          project
              .code)}" target="_blank" rel="noopener noreferrer" data-whatsapp-code="${
      esc(project.code)}">
            Ask about this design ${icon('arrow')}
          </a>
          <button class="button button-outline share-button" type="button" data-share data-title="${
      esc(project.title)}" aria-label="Share ${esc(project.title)}">
            ${icon('share')} <span>Share design</span>
          </button>
        </div>
      </div>
    </div>
  </section>
  <section class="related-section">
    <div class="shell">
      <div class="section-heading">
        <div>
          <p class="eyebrow">KEEP EXPLORING</p>
          <h2>More ${category.english.toLowerCase()}.</h2>
        </div>
        <a class="text-link" href="../gallery.html?category=${
      project.category}">
          View all ${category.title.toLowerCase()} ${icon('arrow')}
        </a>
      </div>
      <div class="project-grid related-grid">
        ${related.map((p, i) => card(p, '../', i)).join('')}
      </div>
    </div>
  </section>
  <div class="mobile-action">
    <a href="${
      whatsappHref(
          project
              .code)}" target="_blank" rel="noopener noreferrer" data-whatsapp-code="${
      esc(project.code)}">
      Enquire about ${esc(project.code)} ${icon('arrow')}
    </a>
  </div>`;

  return layout({
    title: `${project.title} (${project.code})`,
    description: `${project.summary} View design ${
        project.code} and ask Inpalakan Timbers about a similar project.`,
    body,
    prefix: '../',
    active: 'work',
    path: `projects/${project.slug}.html`,
    image: projectImagePath(project)
  });
}

assertContent();
await rm(dist, {recursive: true, force: true});
await mkdir(join(dist, 'projects'), {recursive: true});
await cp(join(root, 'public'), dist, {recursive: true});
await mkdir(join(dist, 'images/concepts/doors'), {recursive: true});
if (existsSync(join(root, 'references/door-patterns'))) {
  await cp(join(root, 'references/door-patterns'), join(dist, 'images/concepts/doors'), {recursive: true});
}
if (existsSync(join(root, 'references/concepts/doors'))) {
  await cp(join(root, 'references/concepts/doors'), join(dist, 'images/concepts/doors'), {recursive: true});
}
await mkdir(join(dist, 'images/concepts/kitchens'), {recursive: true});
await cp(join(root, 'references/kitchen-patterns'), join(dist, 'images/concepts/kitchens'), {recursive: true});
await mkdir(join(dist, 'images/concepts/tv-units'), {recursive: true});
await cp(join(root, 'references/tv-unit-patterns'), join(dist, 'images/concepts/tv-units'), {recursive: true});
await mkdir(join(dist, 'images/concepts/gypsum'), {recursive: true});
await cp(join(root, 'references/gypsum-patterns'), join(dist, 'images/concepts/gypsum'), {recursive: true});
await cp(join(root, 'src/styles.css'), join(dist, 'styles.css'));
await cp(join(root, 'src/site.js'), join(dist, 'site.js'));
await writeFile(join(dist, 'index.html'), homePage());
await writeFile(join(dist, 'gallery.html'), galleryPage());
for (const project of projects) {
  await writeFile(
      join(dist, 'projects', `${project.slug}.html`), projectPage(project));
}
const files = await readdir(join(dist, 'projects'));
console.log(`Built Inpalakan portfolio: home, gallery, and ${
    files.length} design pages in dist/`);

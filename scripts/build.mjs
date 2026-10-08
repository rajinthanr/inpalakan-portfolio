import {existsSync} from 'node:fs';
import {cp, mkdir, readdir, readFile, rm, writeFile} from 'node:fs/promises';
import {join} from 'node:path';
import {fileURLToPath} from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const dist = join(root, 'dist');
const site = JSON.parse(await readFile(join(root, 'data/site.json'), 'utf8'));
const projects =
    JSON.parse(await readFile(join(root, 'data/projects.json'), 'utf8'));
const sampleCodes =
    JSON.parse(await readFile(join(root, 'data/sample-codes.json'), 'utf8'));
const baseUrl = (process.env.PUBLIC_BASE_URL || 'https://inpalakan-timbers.rajinthan.com').replace(/\/$/, '');

function sampleCode(legacyCode) {
  const code = sampleCodes[legacyCode];
  if (!code) throw new Error(`Missing sample code for ${legacyCode}`);
  return code;
}

function modernFirst(items, priorityCodes) {
  const available = new Set(items.map(item => item.code));
  const missing = priorityCodes.find(code => !available.has(code));
  if (missing) throw new Error(`Unknown gallery priority code: ${missing}`);
  const priority = new Map(priorityCodes.map((code, index) => [code, index]));
  return [...items].sort((a, b) =>
      (priority.get(a.code) ?? priorityCodes.length) -
      (priority.get(b.code) ?? priorityCodes.length));
}

const galleryProjects = modernFirst(projects, [
  'KIT-001', 'BED-001', 'KIT-002', 'BED-002', 'TVU-001', 'DOR-001',
  'KIT-003', 'TVU-002', 'GYP-001', 'DOR-002', 'WIN-001', 'FUR-001',
  'BED-003', 'KIT-004', 'GYP-002', 'KIT-005', 'BED-004', 'DOR-003'
]);

const doorPatterns = [
  ['SP-001', 'Floral vine carving', '01-floral-vine.png'],
  ['SP-002', 'Vertical slat grid', '01-vertical-slat-grid.png'],
  ['SP-003', 'Circular geometry', '02-circular-geometry.png'],
  ['SP-004', 'Horizontal slat bands', '02-horizontal-slat-bands.png'],
  [
    'SP-005', 'Peacock heritage entrance', '02-peacock-heritage-double-door.jpg'
  ],
  [
    'SP-006', 'Circular medallion entrance',
    '03-circular-medallion-double-door.jpg'
  ],
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
  [
    'SP-021', 'Horizontal slats with vine detail',
    '10-horizontal-slats-vine.png'
  ],
  ['SP-022', 'Mixed module single door', '10-mixed-module-single.png'],
  [
    'SP-023', 'Teak multi-panel divider rails',
    '18-teak-multi-panel-divider-rails.jpg'
  ]
].map(([legacyCode, title, image]) => ({
        code: sampleCode(legacyCode),
        legacyCode,
        title,
        image,
        category: 'doors',
        alt: `Sample door pattern: ${title}`
      }));

const kitchenPatterns = [
  ['KS-001', 'Champagne metallic L-shape', '01-champagne-metallic-l-shape.png'],
  ['KS-002', 'Graphite metallic U-shape', '02-graphite-metallic-u-shape.png'],
  ['KS-003', 'Sage metallic galley', '03-sage-metallic-galley.png'],
  [
    'KS-004', 'Pearl silver metallic L-shape',
    '04-pearl-silver-metallic-l-shape.png'
  ],
  ['KS-005', 'Bronze metallic peninsula', '05-bronze-metallic-peninsula.png'],
  ['KS-006', 'Midnight blue metallic kitchen', '06-midnight-blue-metallic.png'],
  [
    'KS-007', 'Rose-gold and charcoal metallic',
    '07-rose-gold-charcoal-metallic.png'
  ],
  [
    'KS-008', 'Pearl white metallic galley',
    '08-pearl-white-metallic-galley.png'
  ],
  ['KS-009', 'Teal metallic corner kitchen', '09-teal-metallic-corner.png'],
  [
    'KS-010', 'Gunmetal and champagne island',
    '10-gunmetal-champagne-island.png'
  ],
  [
    'KS-011', 'Champagne and grey kitchen with granite and mirror',
    '11-sl-champagne-graphite-granite-mirror.jpg'
  ],
  [
    'KS-012', 'Bronze kitchen with granite and mirror',
    '12-sl-bronze-pearl-tan-brown-granite-mirror.jpg'
  ],
  [
    'KS-013', 'Blue kitchen with granite island and mirror',
    '13-sl-midnight-blue-black-granite-island-mirror.jpg'
  ],
  [
    'KS-014', 'Green kitchen with granite and mirror',
    '14-sl-sage-green-black-galaxy-granite-mirror.jpg'
  ]
].map(([legacyCode, title, image]) => ({
        code: sampleCode(legacyCode),
        legacyCode,
        title,
        image,
        category: 'kitchens',
        alt: `Sample metallic kitchen cupboard pattern: ${title}`
      }));

const granitePatterns = [
  [
    'GR-004', 'Timber kitchen with black granite',
    '01-sl-teak-l-shape-granite.jpg'
  ],
  [
    'GR-005', 'Black Galaxy granite waterfall kitchen island',
    '02-sl-waterfall-island-open-plan.jpg'
  ],
  [
    'GR-006', 'Black granite worktop with drain grooves',
    '03-sl-sink-fluted-drainboard-window.jpg'
  ],
  [
    'GR-007', 'Brown granite worktop with timber cupboards',
    '04-sl-teak-cabinets-tan-brown-granite.jpg'
  ],
  [
    'GR-008', 'Black granite worktop with double sink',
    '05-undermount-sink-mirror-black.jpg'
  ],
  [
    'GR-009', 'Granite kitchen island with waterfall sides',
    '06-waterfall-island-mitered-edge.jpg'
  ],
  [
    'GR-010', 'L-shaped granite kitchen worktop',
    '07-l-shaped-wrap-countertop.jpg'
  ],
  [
    'GR-011', 'Granite worktop with fitted hob',
    '08-flush-cooktop-precision-cutout.jpg'
  ],
  [
    'GR-012', 'Granite worktop with drain grooves',
    '09-carved-drainboard-flutes.jpg'
  ],
  [
    'GR-013', 'Granite breakfast counter',
    '10-breakfast-bar-cantilever-overhang.jpg'
  ],
  [
    'GR-014', 'U-shaped granite kitchen worktop',
    '11-u-shaped-full-kitchen-worktop.jpg'
  ],
  [
    'GR-015', 'Granite worktop edge options',
    '12-edge-profiles-bullnose-bevel-detail.jpg'
  ],
  [
    'GR-016', 'Fitting a granite worktop',
    '13-craftsmen-on-site-installation.jpg'
  ]
].map(([legacyCode, title, image]) => ({
        code: sampleCode(legacyCode),
        legacyCode,
        title,
        image,
        category: 'kitchens',
        kind: 'granite',
        alt: `Sample granite countertop pattern: ${title}`
      }));

const tvUnitPatterns = [
  [
    'TVS-001', 'Metallic teal display wall', '01-metallic-teal-display-wall.png'
  ],
  ['TVS-002', 'Graphite and champagne wall', '02-graphite-champagne-wall.png'],
  ['TVS-003', 'Pearl-grey corner unit', '03-pearl-grey-corner-unit.png'],
  [
    'TVS-005', 'Champagne and charcoal media wall',
    '05-champagne-charcoal-media-wall.png'
  ],
  ['TVS-006', 'Graphite asymmetric unit', '06-graphite-asymmetric-unit.png'],
  ['TVS-008', 'Bronze and gunmetal wall', '08-bronze-gunmetal-wall.png'],
  ['TVS-009', 'Layered rectangle wall', '09-layered-rectangle-wall.png'],
  ['TVS-010', 'Media wall with desk', '10-media-wall-desk.png'],
  [
    'TVS-011', 'Graphite and bronze hall unit',
    '11-graphite-bronze-sri-lankan-hall.png'
  ],
  ['TVS-012', 'Open-plan divider unit', '12-open-plan-divider-unit.png'],
  ['TVS-013', 'Under-stair sage unit', '13-under-stair-sage-unit.png'],
  ['TVS-014', 'Pearl-grey open-hall unit', '14-pearl-grey-open-hall.png'],
  [
    'TVS-015', 'Column-integrated blue unit',
    '15-column-integrated-blue-unit.png'
  ],
  [
    'TVS-016', 'Metallic TV unit with window seat',
    '16-slate-blue-window-seat-tv.webp',
    'Slate-blue metallic TV cupboards turning into a cushioned window seat with lower drawers'
  ],
  [
    'TVS-017', 'Pearl-grey TV unit with loft cupboards',
    '17-pearl-champagne-loft-tv.webp',
    'Pearl-grey metallic TV unit with tall side cupboard, overhead loft doors and lower drawers'
  ],
  [
    'TVS-018', 'Champagne sliding TV cupboard',
    '18-champagne-sliding-tv-cupboard.webp',
    'Champagne metallic sliding doors partly open around a TV with lower storage cupboards'
  ],
  [
    'TVS-019', 'Sage TV unit with side storage',
    '19-sage-graphite-storage-tv.webp',
    'Sage metallic TV base with lower drawers and a tall side cupboard open to shelves and a pull-out tray'
  ],
  [
    'TVS-020', 'Bronze TV unit with pull-out table',
    '20-bronze-pullout-table-tv.webp',
    'Bronze and pearl metallic TV cupboards with a supported pull-out side table and upper cupboard'
  ]
].map(([legacyCode, title, image, alt]) => ({
        code: sampleCode(legacyCode),
        legacyCode,
        title,
        image,
        category: 'tv-units',
        alt: alt || `Sample TV-unit pattern: ${title}`
      }));

const gypsumPatterns = [
  ['GYS-001', 'Double-step rectangle ceiling', '01-double-step-rectangle.png'],
  ['GYS-002', 'Octagon and circle tray ceiling', '02-octagon-circle-tray.png'],
  ['GYS-003', 'Green star centre ceiling', '03-green-star-centre.png'],
  ['GYS-004', 'S-curve hall ceiling', '04-s-curve-hall.png'],
  ['GYS-005', 'Concentric ring halo ceiling', '05-concentric-ring-halo.png'],
  [
    'GYS-006', 'Connected rectangle islands',
    '06-connected-rectangle-islands.png'
  ],
  ['GYS-007', 'Scalloped corner tray ceiling', '07-scalloped-corner-tray.png'],
  [
    'GYS-008', 'Rounded rectangle tray ceiling', '08-rounded-rectangle-tray.png'
  ],
  ['GYS-009', 'Simple cross feature ceiling', '09-simple-cross-feature.png'],
  [
    'GYS-010', 'Symmetrical square tray ceiling',
    '10-symmetrical-square-tray.png'
  ]
].map(([legacyCode, title, image]) => ({
        code: sampleCode(legacyCode),
        legacyCode,
        title,
        image,
        category: 'gypsum',
        alt: `Sample gypsum ceiling pattern: ${title}`
      }));

const bedroomPatterns = [
  [
    'BCS-016', 'Grey and champagne fitted wardrobe',
    '01-grey-champagne-wardrobe.webp',
    'Grey and champagne wardrobe with loft doors, two lower drawers, and a narrow open corner shelf'
  ],
  [
    'BCS-017', 'Teal bedroom wardrobe and bed suite',
    '02-teal-bedroom-suite.webp',
    'Teal wardrobes framing a bed beneath bridge cupboards, with a separate narrow dressing mirror'
  ],
  [
    'BCS-018', 'Metallic sliding wardrobe with mirror',
    '03-sliding-wardrobe.webp',
    'Bronze and pearl-grey sliding wardrobe with a narrow mirror and open hanging storage'
  ],
  [
    'BCS-019', 'Sage and graphite corner wardrobe',
    '04-sage-graphite-corner-wardrobe.webp',
    'L-shaped sage and graphite wardrobe with open clothing storage, drawers, and a dressing mirror'
  ],
  [
    'BCS-020', 'Champagne wardrobe with granite vanity',
    '05-champagne-granite-vanity.webp',
    'Champagne wardrobe beside a narrow dressing mirror and dark granite vanity top'
  ],
  [
    'BCS-002', 'Full-height wardrobe with top storage',
    '02-sl-floor-to-ceiling-loft-wardrobe.jpg'
  ],
  [
    'BCS-004', 'Bedroom cupboards around a bed',
    '04-sl-fitted-bed-suite-overhead-bridge.jpg'
  ],
  [
    'BCS-006', 'Two-colour wardrobe with corner shelves',
    '06-sl-two-tone-minimalist-corner-shelves.jpg'
  ],
  [
    'BCS-007', 'Wardrobe storage for sarees and clothes',
    '07-sl-internal-saree-wardrobe-organization.jpg'
  ],
  [
    'BCS-008', 'L-shaped corner wardrobe',
    '08-sl-corner-l-shaped-fitted-wardrobe.jpg'
  ],
  [
    'BCS-009', 'Bedroom cupboard with study desk',
    '09-sl-study-desk-bookshelf-wardrobe.jpg'
  ]
].map(([legacyCode, title, image, alt]) => ({
        code: sampleCode(legacyCode),
        legacyCode,
        title,
        image,
        category: 'bedrooms',
        alt: alt || `Sample bedroom cupboard pattern: ${title}`
      }));

const furniturePatterns = [
  [
    'FUS-001', 'Six-seat timber dining set',
    '01-dining-table-six-chairs.webp',
    'Timber dining table with six slatted chairs and light fabric seats'
  ],
  [
    'FUS-002', 'Storage bed with side tables',
    '02-storage-bed-side-tables.webp',
    'Timber bed with a slatted headboard, two open storage drawers and matching side tables'
  ],
  [
    'FUS-003', 'Study desk with bookshelf',
    '03-study-desk-bookshelf.webp',
    'Timber study desk with three graphite drawers, open bookshelves and a matching chair'
  ],
  [
    'FUS-004', 'Living room display sideboard',
    '04-living-room-sideboard.webp',
    'Timber sideboard with closed cupboards, three drawers and a lit glass display bay'
  ],
  [
    'FUS-005', 'Timber pooja cabinet',
    '05-pooja-cabinet.webp',
    'Freestanding timber pooja cabinet with a carved upper opening, drawer and lower doors'
  ],
  [
    'FUS-006', 'Timber sofa set',
    '06-timber-sofa-set.webp',
    'Timber-framed three-seat sofa and two armchairs with sage cushions'
  ],
  [
    'FUS-008', 'Open room divider bookshelf',
    '08-room-divider-bookshelf.webp',
    'Open timber room divider with staggered shelves and low graphite storage cupboards'
  ],
  [
    'FUS-009', 'Coffee table with drawers',
    '09-coffee-table-drawers.webp',
    'Low timber coffee table with one drawer open, a second drawer and a lower shelf'
  ],
  [
    'FUS-010', 'Dressing table with mirror',
    '10-dressing-table-mirror.webp',
    'Timber dressing table with a narrow portrait mirror, two drawers, side cupboard and stool'
  ]
].map(([legacyCode, title, image, alt]) => ({
        code: sampleCode(legacyCode),
        legacyCode,
        title,
        image,
        category: 'furniture',
        alt
      }));

const galleryDoorPatterns = modernFirst(doorPatterns, [
  'DOR-501', 'DOR-502', 'DOR-503', 'DOR-504', 'DOR-505', 'DOR-506',
  'DOR-507', 'DOR-508', 'DOR-509', 'DOR-510', 'DOR-511'
]);
const galleryGranitePatterns = modernFirst(granitePatterns, [
  'KIT-515', 'KIT-516', 'KIT-517', 'KIT-518'
]);
const galleryGypsumPatterns = modernFirst(gypsumPatterns, [
  'GYP-501', 'GYP-502', 'GYP-503', 'GYP-504', 'GYP-505'
]);

const samplePatterns = [
  ...galleryDoorPatterns, ...kitchenPatterns, ...galleryGranitePatterns,
  ...bedroomPatterns, ...furniturePatterns, ...tvUnitPatterns,
  ...galleryGypsumPatterns
];

const codePrefixes = {
  doors: 'DOR', windows: 'WIN', kitchens: 'KIT', bedrooms: 'BED',
  furniture: 'FUR', gypsum: 'GYP', 'tv-units': 'TVU'
};

const categories = {
  doors: {
    title: 'Carved Doors',
    english: 'Carved Doors',
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
    title: 'Kitchen Cupboards',
    english: 'Kitchen Cupboards',
    singular: 'Kitchen Cupboard',
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
    title: 'TV Wall Units',
    english: 'TV Wall Units',
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
  const legacyCodes = new Set();
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
    if (!new RegExp(`^${codePrefixes[project.category]}-[0-9]{3}$`)
             .test(project.code) || Number(project.code.slice(-3)) < 1 ||
        Number(project.code.slice(-3)) >= 500)
      throw new Error(`Invalid completed-work code: ${project.code}`);
    if (codes.has(project.code) || slugs.has(project.slug))
      throw new Error(`Duplicate code or slug: ${project.code}`);
    if (project.legacyCode && legacyCodes.has(project.legacyCode))
      throw new Error(`Duplicate old code: ${project.legacyCode}`);
    codes.add(project.code);
    slugs.add(project.slug);
    if (project.legacyCode) legacyCodes.add(project.legacyCode);
  }
  for (const pattern of samplePatterns) {
    if (!new RegExp(`^${codePrefixes[pattern.category]}-[0-9]{3}$`)
             .test(pattern.code) || Number(pattern.code.slice(-3)) < 501)
      throw new Error(`Invalid sample code: ${pattern.code}`);
    if (codes.has(pattern.code))
      throw new Error(`Duplicate code: ${pattern.code}`);
    if (legacyCodes.has(pattern.legacyCode))
      throw new Error(`Duplicate old code: ${pattern.legacyCode}`);
    codes.add(pattern.code);
    legacyCodes.add(pattern.legacyCode);
  }
}

function projectUrl(project, prefix = '') {
  return `${prefix}projects/${project.slug}.html`;
}

function projectImagePath(project, filename = project.image) {
  if (project.isSample || project.collection === 'sample') {
    return `images/concepts/${project.category}/${filename}`;
  }
  return `images/projects/${project.category}/${filename}`;
}

function imageUrl(project, prefix = '') {
  return `${prefix}${projectImagePath(project)}`;
}

function whatsappHref(code = '') {
  const message = code ?
      `Hello Inpalakan Timbers, I like design ${
          code}. Can you make something similar for my home?` :
      'Hello Inpalakan Timbers, I would like to discuss a project.';
  return `https://wa.me/${site.whatsappNumber}?text=${
      encodeURIComponent(message)}`;
}

function icon(name) {
  if (name === 'arrow')
    return '<svg aria-hidden="true" viewBox="0 0 24 24" fill="none"><path d="M4 12h15m-6-6 6 6-6 6" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  if (name === 'share')
    return '<svg aria-hidden="true" viewBox="0 0 24 24" fill="none"><path d="M12 15V3m0 0L7.5 7.5M12 3l4.5 4.5M5 13.5v5A2.5 2.5 0 0 0 7.5 21h9a2.5 2.5 0 0 0 2.5-2.5v-5" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  if (name === 'download')
    return '<svg aria-hidden="true" viewBox="0 0 24 24" fill="none"><path d="M12 3v12m0 0 4-4m-4 4-4-4M5 19h14" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';
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
      <a class="header-work-link ${
      active === 'work' ? 'is-active' :
                          ''}" href="${prefix}gallery.html">Our Work</a>
      <a class="header-cta" href="${
      whatsappHref()}" target="_blank" rel="noopener noreferrer" data-whatsapp>Enquire <span aria-hidden="true">↗</span></a>
    </div>
  </header>`;
}

function footer(prefix = '') {
  return `<footer class="site-footer" id="contact">
    <div class="shell footer-grid">
      <div>
        <p class="eyebrow light">LET'S TALK ABOUT YOUR DESIGN</p>
        <h2>Have a design<br><em>in mind?</em></h2>
        <p>Send us a design code or a photo. We can discuss what you need for your home.</p>
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
        <p class="footer-service-area">We work in Valvettithurai, Point Pedro, Nelliady, Karaveddy, Vadamarachy, and nearby areas.</p>
        <div class="footer-links">
          <a href="${prefix}index.html#services">Services</a>
          <a href="${
      site.facebookUrl}" target="_blank" rel="noopener noreferrer" class="footer-icon-link">${
      icon('facebook')}<span>Facebook</span></a>
          <a href="tel:${
      site.phone.replace(/\s+/g, '')}" class="footer-icon-link">${
      icon('phone')}<span>${esc(site.phone)}</span></a>
        </div>
      </div>
    </div>
    <div class="shell footer-bottom">
      <span>© ${
      new Date().getFullYear()} Inpalakan Timbers. All rights reserved.</span>
    </div>
  </footer>`;
}

function generatePlaylist(prefix = '') {
  const list = [];
  galleryProjects.forEach(project => {
    const views = project.views && project.views.length > 1 ?
        project.views :
        [{src: project.image, label: 'Full front view', alt: project.alt}];
    views.forEach((v, idx) => {
      list.push({
        code: project.code,
        legacyCode: project.legacyCode,
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
    legacyCode: pattern.legacyCode,
    category: pattern.category,
    collection: 'sample',
    group: pattern.code,
    title: pattern.title,
    src: `${prefix}images/concepts/${pattern.category}/${pattern.image}`,
    rawSrc: pattern.image,
    label: pattern.category === 'doors' ?
        'Sample door pattern' :
        pattern.category === 'kitchens' ?
        (pattern.kind === 'granite' ? 'Sample granite countertop pattern' :
                                         'Sample kitchen cupboard pattern') :
        pattern.category === 'bedrooms' ? 'Sample bedroom cupboard pattern' :
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
  path = '',
  structuredData = []
}) {
  const pageTitle = title.includes('Inpalakan Timbers') ? title : `${title} · Inpalakan Timbers`;
  const canonicalPath = path === 'index.html' ? '' : path;
  const canonical = baseUrl ? (canonicalPath ? `${baseUrl}/${canonicalPath}` : `${baseUrl}/`) : '';
  const socialImage =
      baseUrl && (image || site.logo || 'images/Others/logo.png') ?
      `${baseUrl}/${image || site.logo || 'images/Others/logo.png'}` :
      '';
  const logo = logoUrl(prefix);
  const playlistJson = JSON.stringify(generatePlaylist(prefix));
  const jsonLdScripts = structuredData && structuredData.length ?
      structuredData.map(data => `<script type="application/ld+json">${JSON.stringify(data)}</script>`).join('') :
      '';
  return `<!doctype html>
<html lang="en"><head><!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-PY4803MNBN"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());

  gtag('config', 'G-PY4803MNBN');
</script><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="theme-color" content="#f5f0e8"><title>${
      esc(pageTitle)}</title><meta name="description" content="${
      esc(description)}"><meta property="og:type" content="website"><meta property="og:site_name" content="Inpalakan Timbers"><meta property="og:title" content="${
      esc(pageTitle)}"><meta property="og:description" content="${
      esc(description)}">${
      canonical ? `<link rel="canonical" href="${
                      esc(canonical)}"><meta property="og:url" content="${
                      esc(canonical)}">` :
                  ''}${
      socialImage ?
          `<meta property="og:image" content="${esc(socialImage)}"><meta name="twitter:image" content="${esc(socialImage)}">` :
          ''}<meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${
      esc(pageTitle)}"><meta name="twitter:description" content="${
      esc(description)}">${jsonLdScripts}<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link rel="icon" href="${
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
          ${icon('whatsapp')} <span>Enquire</span>
        </a>
        <button id="lb-share-btn" class="lb-round-action" type="button" aria-label="Share this design" title="Share">${icon('share')}</button>
        <a id="lb-download-btn" class="lb-round-action" href="#" download aria-label="Save this image" title="Save image">${icon('download')}</a>
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
      `${project.code} ${project.legacyCode || ''} ${project.title} ${project.category} ${
          categories[project.category]?.singular ||
          ''} ${categories[project.category]?.english || ''}`;
  const url = projectUrl(project, prefix);
  const category = categories[project.category];
  return `<article class="project-card" data-category="${
      project.category}" data-code="${esc(project.code)}" data-keywords="${
      esc(searchKeywords)}">
    <div class="card-image-wrap">
      <a class="card-image" href="${url}" data-open-lightbox="${
      esc(project.code)}" aria-label="View ${esc(project.title)} (${
      esc(project.code)}) full screen">
      <img src="${imageUrl(project, prefix)}" alt="${
      esc(project.alt)}" loading="${
      index < 4 ? 'eager' : 'lazy'}" decoding="async">
      ${viewsBadge}
      <span class="card-image-gradient" aria-hidden="true"></span>
      <span class="card-overlay">
        <span class="card-overlay-row"><span class="card-code">${
      esc(project.code)}</span></span>
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
      pattern.category === 'kitchens'       ? (pattern.kind === 'granite' ?
                                                   'granite countertop' :
                                                   'kitchen cupboard') :
      pattern.category === 'bedrooms'       ? 'bedroom cupboard' :
      pattern.category === 'furniture'      ? 'custom furniture' :
      pattern.category === 'tv-units'       ? 'TV-unit' :
                                              'gypsum ceiling';
  const image = `images/concepts/${pattern.category}/${pattern.image}`;
  const keywords = `${pattern.code} ${pattern.legacyCode || ''} ${pattern.title} sample pattern ${type}`;
  return `<article class="project-card sample-pattern-card" data-category="${
      pattern.category}" data-code="${esc(pattern.code)}" data-keywords="${
      esc(keywords)}">
    <div class="card-image-wrap">
      <button class="card-image sample-pattern-image" type="button" aria-label="View sample pattern ${
      esc(pattern.code)} full screen" data-open-lightbox="${esc(pattern.code)}">
        <img src="${image}" alt="${esc(pattern.alt)}" loading="${
      index < 2 ? 'eager' : 'lazy'}" decoding="async">
        <span class="ai-generated-badge">Sample</span>
        <span class="card-image-gradient" aria-hidden="true"></span>
        <span class="card-overlay">
          <span class="card-overlay-row"><span class="card-code">${
      esc(pattern.code)}</span></span>
        </span>
      </button>
      <button class="card-expand-btn" type="button" aria-label="View full screen ${
      esc(pattern.code)}" data-open-lightbox="${
      esc(pattern.code)}" title="Full screen">⛶</button>
    </div>
  </article>`;
}

const localBusinessSchema = {
  '@context': 'https://schema.org',
  '@type': 'HomeAndConstructionBusiness',
  'name': 'Inpalakan Timbers',
  'alternateName': 'இன்பழகன் கைத்தொழிலகம்',
  'description': 'Inpalakan Timbers makes doors, cupboards, windows, furniture, and gypsum ceilings in Valvettithurai.',
  'url': `${baseUrl}/`,
  'telephone': site.phone,
  'email': site.email,
  'priceRange': '$$',
  'image': `${baseUrl}/images/Others/logo.png`,
  'address': {
    '@type': 'PostalAddress',
    'streetAddress': 'Vaavini Veethi',
    'addressLocality': 'Valvettithurai',
    'addressRegion': 'Northern Province',
    'addressCountry': 'LK'
  },
  'geo': {
    '@type': 'GeoCoordinates',
    'latitude': 9.8277,
    'longitude': 80.1707
  },
  'hasMap': site.mapUrl,
  'sameAs': [
    site.facebookUrl
  ],
  'areaServed': [
    'Valvettithurai',
    'Point Pedro',
    'Nelliady',
    'Thondaimanaru',
    'Thikkam',
    'Karaveddy',
    'Vadamarachy',
    'Jaffna'
  ]
};

const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  'name': 'Inpalakan Timbers',
  'url': `${baseUrl}/`
};

function homePage() {
  const heroProject = projects.find(p => p.code === 'KIT-001');
  if (!heroProject) throw new Error('Missing featured home design KIT-001');
  const selectedWorkCodes = [
    'KIT-001', 'BED-001', 'TVU-001', 'GYP-003', 'DOR-003', 'WIN-003',
    'DOR-007', 'FUR-006', 'DOR-006'
  ];
  const featured = selectedWorkCodes.map(code => {
    const proj = projects.find(p => p.code === code);
    if (!proj) throw new Error(`Missing selected work design: ${code}`);
    return proj;
  });
  const categoryCoverSelections = {
    doors: {
      code: 'DOR-007',
      image: 'door-two-tone-peacock-veranda-full.jpg',
      alt:
          'Paired timber entrance doors with dark-stained carved peacock panels and floral rosettes'
    },
    windows: {
      code: 'WIN-008',
      image: 'window-wn-021.jpg',
      alt: 'Three-panel timber window with textured glass and safety grille'
    },
    kitchens: {
      code: 'KIT-516',
      image: '05-undermount-sink-mirror-black.jpg',
      alt:
          'Mirror-polished black granite countertop with undermount double-bowl stainless steel sink and gooseneck faucet'
    },
    bedrooms: {
      code: 'BED-001',
      image: 'bedroom-teal-wardrobe-mirror-bed-suite.jpg',
      alt:
          'Modern fitted bedroom suite in soft teal with mirrored closet door and matching bedhead storage'
    },
    gypsum: {
      code: 'GYP-003',
      image: 'gypsum-magenta-gold-tray.jpg',
      alt:
          'Dual-tone magenta and warm gold false ceiling tray with ambient LED strip lighting and downlights'
    },
    furniture: {
      code: 'FUR-006',
      image: 'furniture-pooja-cabinet-side.jpg',
      alt: 'Handcrafted timber pooja cabinet with carved crown and storage'
    },
    'tv-units': {
      code: 'TVU-001',
      image: 'tv-unit-rounded-teal-wide.jpg',
      alt: 'Teal television feature wall with rounded display towers'
    }
  };
  const categoryCovers = Object.fromEntries(
      Object.entries(categoryCoverSelections).map(([key, selection]) => {
        const project = projects.find(p => p.code === selection.code) ||
            samplePatterns.find(p => p.code === selection.code);
        if (!project || project.category !== key)
          throw new Error(`Invalid category cover ${key}: ${selection.code}`);
        const isSample = !projects.some(p => p.code === selection.code);
        return [
          key,
          {...project, image: selection.image, alt: selection.alt, isSample}
        ];
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
        <span class="category-subtitle" lang="ta">${
                esc(servicesByKey[key]?.tamil || category.english)}</span>
        <span class="category-link">View designs ${icon('arrow')}</span>
      </span>
    </a>`;
          })
          .join('');

  const body = `<section class="hero">
    <div class="hero-copy">
      <div class="hero-copy-inner">
        <div class="hero-title-block">
          <h1 class="hero-business-title">
            <span class="hero-name-en">Inpalakan <em>Timbers</em></span>
            <span class="hero-name-ta" lang="ta">இன்பழகன் கைத்தொழிலகம்</span>
          </h1>
          <p class="hero-since"><span></span> SINCE 2006 <span></span></p>
        </div>
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
    <div class="section-heading">
      <div>
        <p class="eyebrow">WHAT WE DO</p>
        <h2>Our services.</h2>
        <p class="section-heading-lead">Carpentry, doors, pantry cupboards, granite worktops and gypsum ceilings from our Valvettithurai workshop. Choose a category to see our work.</p>
      </div>
      <a class="text-link" href="gallery.html">See all designs ${
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
          <p class="eyebrow">OUR WORK</p>
          <h2>Featured work.</h2>
        </div>
        <a class="text-link" href="gallery.html">See all ${
      projects.length} designs ${icon('arrow')}</a>
      </div>
      <div class="project-grid featured-slider" aria-label="Featured work. Swipe to see more designs">
        ${featured.map((p, i) => card(p, '', i)).join('')}
      </div>
      <p class="swipe-hint" aria-hidden="true">Swipe to see more <span>→</span></p>
    </div>
  </section>
  `;

  return layout({
    title: 'Carpentry & Kitchen Cupboards in Valvettithurai | Inpalakan Timbers',
    description:
        'Inpalakan Timbers makes doors, pantry and kitchen cupboards, granite worktops, furniture and gypsum ceilings in Valvettithurai and nearby Vadamarachy.',
    body,
    path: 'index.html',
    image: projectImagePath(heroProject),
    structuredData: [localBusinessSchema, websiteSchema]
  });
}

function galleryPage() {
  const totalGalleryItems = projects.length + samplePatterns.length;
  const body = `<section class="page-hero shell">
    <h1>Our Work</h1>
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
        <input class="gallery-search" type="search" placeholder="Search by name or code" aria-label="Search designs" data-gallery-search>
      </div>
      <p class="gallery-count" aria-live="polite"><span id="visible-count">${
      totalGalleryItems}</span> designs</p>
    </div>
    <div class="project-grid gallery-grid">
      ${galleryProjects.map((p, i) => card(p, '', i)).join('')}
    </div>
    <section class="sample-patterns" data-sample-patterns aria-labelledby="sample-patterns-title">
      <div class="sample-patterns-heading">
        <div><p class="eyebrow">SAMPLE DESIGNS</p><h2 id="sample-patterns-title">Door design ideas.</h2></div>
        <p>See a style you like? Send us its code.</p>
      </div>
      <div class="project-grid gallery-grid sample-pattern-grid">
        ${galleryDoorPatterns.map((pattern, i) => patternCard(pattern, i)).join('')}
      </div>
    </section>
    <section class="sample-patterns" data-sample-patterns aria-labelledby="sample-kitchen-patterns-title">
      <div class="sample-patterns-heading">
        <div><p class="eyebrow">SAMPLE DESIGNS</p><h2 id="sample-kitchen-patterns-title">Kitchen cupboard ideas.</h2></div>
        <p>See different colours and cupboard layouts.</p>
      </div>
      <div class="project-grid gallery-grid sample-pattern-grid">
        ${kitchenPatterns.map((pattern, i) => patternCard(pattern, i)).join('')}
      </div>
    </section>
    <section class="sample-patterns" data-sample-patterns aria-labelledby="sample-granite-patterns-title">
      <div class="sample-patterns-heading">
        <div><p class="eyebrow">SAMPLE DESIGNS</p><h2 id="sample-granite-patterns-title">Granite worktop ideas.</h2></div>
        <p>See different worktop shapes and finishes.</p>
      </div>
      <div class="project-grid gallery-grid sample-pattern-grid">
        ${galleryGranitePatterns.map((pattern, i) => patternCard(pattern, i)).join('')}
      </div>
    </section>
    <section class="sample-patterns" data-sample-patterns aria-labelledby="sample-bedroom-patterns-title">
      <div class="sample-patterns-heading">
        <div><p class="eyebrow">SAMPLE DESIGNS</p><h2 id="sample-bedroom-patterns-title">Bedroom cupboard ideas.</h2></div>
        <p>See cupboards, dressing tables and storage ideas.</p>
      </div>
      <div class="project-grid gallery-grid sample-pattern-grid">
        ${bedroomPatterns.map((pattern, i) => patternCard(pattern, i)).join('')}
      </div>
    </section>
    <section class="sample-patterns" data-sample-patterns aria-labelledby="sample-furniture-patterns-title">
      <div class="sample-patterns-heading">
        <div><p class="eyebrow">SAMPLE DESIGNS</p><h2 id="sample-furniture-patterns-title">Custom furniture ideas.</h2></div>
        <p>See dining, bedroom, study and living room furniture ideas.</p>
      </div>
      <div class="project-grid gallery-grid sample-pattern-grid">
        ${furniturePatterns.map((pattern, i) => patternCard(pattern, i)).join('')}
      </div>
    </section>
    <section class="sample-patterns" data-sample-patterns aria-labelledby="sample-tv-unit-patterns-title">
      <div class="sample-patterns-heading">
        <div><p class="eyebrow">SAMPLE DESIGNS</p><h2 id="sample-tv-unit-patterns-title">TV wall unit ideas.</h2></div>
        <p>Ideas for a neat living room wall.</p>
      </div>
      <div class="project-grid gallery-grid sample-pattern-grid">
        ${tvUnitPatterns.map((pattern, i) => patternCard(pattern, i)).join('')}
      </div>
    </section>
    <section class="sample-patterns" data-sample-patterns aria-labelledby="sample-gypsum-patterns-title">
      <div class="sample-patterns-heading">
        <div><p class="eyebrow">SAMPLE DESIGNS</p><h2 id="sample-gypsum-patterns-title">Gypsum ceiling ideas.</h2></div>
        <p>See different ceiling shapes and lights.</p>
      </div>
      <div class="project-grid gallery-grid sample-pattern-grid">
        ${galleryGypsumPatterns.map((pattern, i) => patternCard(pattern, i)).join('')}
      </div>
    </section>
    <p class="empty-state" hidden>No designs match your search or filter.</p>
  </section>
  <section class="gallery-note shell">
    <span class="asterisk">✳</span>
    <p>Like a design? Send its code to us on WhatsApp and tell us what you need.</p>
  </section>`;

  return layout({
    title: 'Doors, Cupboards & Carpentry Work | Inpalakan Timbers',
    description:
        'See doors, pantry cupboards, kitchen cupboards, granite worktops and gypsum ceilings from our Valvettithurai workshop. Find a design code and ask us on WhatsApp.',
    body,
    active: 'work',
    path: 'gallery.html',
    structuredData: [localBusinessSchema]
  });
}

function projectPage(project) {
  const category = categories[project.category];
  const related =
      galleryProjects
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
                      i === 0 ? 'is-active' :
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
        <p class="fullscreen-tip"><span>Tap the photo to see it full screen. Swipe to see more.</span></p>
      </div>
      <div class="detail-content">
        <div class="detail-info">
          <span>DESIGN CODE</span>
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
          <p class="eyebrow">SEE MORE</p>
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

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    'itemListElement': [
      {
        '@type': 'ListItem',
        'position': 1,
        'name': 'Home',
        'item': `${baseUrl}/`
      },
      {
        '@type': 'ListItem',
        'position': 2,
        'name': 'Portfolio',
        'item': `${baseUrl}/gallery.html`
      },
      {
        '@type': 'ListItem',
        'position': 3,
        'name': category.title,
        'item': `${baseUrl}/gallery.html?category=${project.category}`
      },
      {
        '@type': 'ListItem',
        'position': 4,
        'name': `${project.title} (${project.code})`,
        'item': `${baseUrl}/projects/${project.slug}.html`
      }
    ]
  };

  const projectArtworkSchema = {
    '@context': 'https://schema.org',
    '@type': 'VisualArtwork',
    'name': `${project.title} (${project.code})`,
    'description': project.alt,
    'image': `${baseUrl}/${projectImagePath(project)}`,
    'artMedium': category.singular,
    'creator': {
      '@type': 'Organization',
      'name': 'Inpalakan Timbers',
      'url': `${baseUrl}/`
    }
  };

  return layout({
    title: `${project.title} (${project.code}) | Inpalakan Timbers`,
    description: `${project.title} by Inpalakan Timbers. Design code ${project.code}. Ask us about a similar design on WhatsApp.`,
    body,
    prefix: '../',
    active: 'work',
    path: `projects/${project.slug}.html`,
    image: projectImagePath(project),
    structuredData: [breadcrumbSchema, projectArtworkSchema]
  });
}

function generateSitemap() {
  const urls = [];

  urls.push(`  <url>
    <loc>${baseUrl}/</loc>
  </url>`);

  urls.push(`  <url>
    <loc>${baseUrl}/gallery.html</loc>
  </url>`);

  for (const project of projects) {
    const imgUrl = `${baseUrl}/${projectImagePath(project)}`;
    urls.push(`  <url>
    <loc>${baseUrl}/projects/${project.slug}.html</loc>
    <image:image>
      <image:loc>${imgUrl}</image:loc>
      <image:title>${esc(project.title)} (${esc(project.code)})</image:title>
      <image:caption>${esc(project.alt)}</image:caption>
    </image:image>
  </url>`);
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${urls.join('\n')}
</urlset>
`;
}

assertContent();
await rm(dist, {recursive: true, force: true});
await mkdir(join(dist, 'projects'), {recursive: true});
await cp(join(root, 'public'), dist, {recursive: true});
await mkdir(join(dist, 'images/concepts/doors'), {recursive: true});
if (existsSync(join(root, 'references/door-patterns'))) {
  await cp(
      join(root, 'references/door-patterns'),
      join(dist, 'images/concepts/doors'), {recursive: true});
}
if (existsSync(join(root, 'references/concepts/doors'))) {
  await cp(
      join(root, 'references/concepts/doors'),
      join(dist, 'images/concepts/doors'), {recursive: true});
}
await mkdir(join(dist, 'images/concepts/kitchens'), {recursive: true});
await cp(
    join(root, 'references/kitchen-patterns'),
    join(dist, 'images/concepts/kitchens'), {recursive: true});
if (existsSync(join(root, 'references/granite-samples'))) {
  await cp(
      join(root, 'references/granite-samples'),
      join(dist, 'images/concepts/kitchens'), {recursive: true});
}
await mkdir(join(dist, 'images/concepts/bedrooms'), {recursive: true});
for (const pattern of bedroomPatterns) {
  const sourceFolder = pattern.image.endsWith('.webp') ?
      'references/concepts/bedroom-cupboards' :
      'references/bedroom-cupboards';
  await cp(
      join(root, sourceFolder, pattern.image),
      join(dist, 'images/concepts/bedrooms', pattern.image));
}
await mkdir(join(dist, 'images/concepts/furniture'), {recursive: true});
for (const pattern of furniturePatterns) {
  await cp(
      join(root, 'references/concepts/furniture', pattern.image),
      join(dist, 'images/concepts/furniture', pattern.image));
}
await mkdir(join(dist, 'images/concepts/tv-units'), {recursive: true});
await cp(
    join(root, 'references/tv-unit-patterns'),
    join(dist, 'images/concepts/tv-units'), {recursive: true});
for (const pattern of tvUnitPatterns.filter(p => p.image.endsWith('.webp'))) {
  await cp(
      join(root, 'references/concepts/tv-units', pattern.image),
      join(dist, 'images/concepts/tv-units', pattern.image));
}
await mkdir(join(dist, 'images/concepts/gypsum'), {recursive: true});
await cp(
    join(root, 'references/gypsum-patterns'),
    join(dist, 'images/concepts/gypsum'), {recursive: true});
await cp(join(root, 'src/styles.css'), join(dist, 'styles.css'));
await cp(join(root, 'src/site.js'), join(dist, 'site.js'));
await writeFile(join(dist, 'index.html'), homePage());
await writeFile(join(dist, 'gallery.html'), galleryPage());
await writeFile(join(dist, 'sitemap.xml'), generateSitemap());
await writeFile(
    join(dist, 'robots.txt'),
    `User-agent: *\nAllow: /\n\nSitemap: ${baseUrl}/sitemap.xml\n`);
for (const project of projects) {
  await writeFile(
      join(dist, 'projects', `${project.slug}.html`), projectPage(project));
}
const files = await readdir(join(dist, 'projects'));
console.log(`Built Inpalakan portfolio: home, gallery, and ${
    files.length} design pages in dist/`);

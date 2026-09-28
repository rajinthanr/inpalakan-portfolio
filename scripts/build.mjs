import {cp, mkdir, readdir, readFile, rm, writeFile} from 'node:fs/promises';
import {join} from 'node:path';
import {fileURLToPath} from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const dist = join(root, 'dist');
const site = JSON.parse(await readFile(join(root, 'data/site.json'), 'utf8'));
const projects =
    JSON.parse(await readFile(join(root, 'data/projects.json'), 'utf8'));
const baseUrl = (process.env.PUBLIC_BASE_URL || '').replace(/\/$/, '');
const categories = {
  doors: {
    title: 'Doors',
    singular: 'Door',
    intro: 'Entrances and interior doors with character in every detail.'
  },
  windows: {
    title: 'Windows',
    singular: 'Window',
    intro: 'Timber frames that shape light and bring warmth to a room.'
  },
  cupboards: {
    title: 'Cupboards',
    singular: 'Cupboard',
    intro: 'Storage and kitchen work made to feel at home in its space.'
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
      throw new Error(`Unknown category: ${project.category}`);
    if (codes.has(project.code) || slugs.has(project.slug))
      throw new Error(`Duplicate code or slug: ${project.code}`);
    codes.add(project.code);
    slugs.add(project.slug);
  }
}

function projectUrl(project, prefix = '') {
  return `${prefix}projects/${project.slug}.html`;
}

function imageUrl(project, prefix = '') {
  return `${prefix}images/projects/${project.image}`;
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
      <nav class="main-nav" aria-label="Main navigation"><a class="${
      active === 'work' ?
          'is-active' :
          ''}" href="${prefix}gallery.html">Our work</a><a href="${
      prefix}index.html#about">About</a><a href="${
      prefix}index.html#contact">Contact</a></nav>
      <a class="header-cta" href="${
      whatsappHref()}" target="_blank" rel="noopener noreferrer" data-whatsapp>Enquire <span aria-hidden="true">↗</span></a>
    </div>
  </header>`;
}

function footer(prefix = '') {
  return `<footer class="site-footer" id="contact"><div class="shell footer-grid">
    <div><p class="eyebrow light">LET'S MAKE SOMETHING LAST</p><h2>Have a design<br><em>in mind?</em></h2><p>Send us a design code or a photo of what inspires you. We can talk through the details together.</p><a class="button button-light" href="${
      whatsappHref()}" target="_blank" rel="noopener noreferrer" data-whatsapp>Chat on WhatsApp ${
      icon('arrow')}</a></div>
    <div class="footer-aside"><a class="footer-brand" href="${
      prefix}index.html"><img class="footer-brand-logo" src="${
      logoUrl(
          prefix)}" alt="Inpalakan Timbers logo" width="56" height="56" loading="lazy"><span class="footer-brand-text">INPALAKAN <small>TIMBERS</small></span></a><p>Your vision, our craftsmanship.</p><div class="footer-links"><a href="${
      prefix}gallery.html">View all work</a><a href="${
      site.facebookUrl}" target="_blank" rel="noopener noreferrer">Facebook</a><a href="${
      whatsappHref()}" target="_blank" rel="noopener noreferrer" data-whatsapp>WhatsApp</a></div></div>
  </div><div class="shell footer-bottom"><span>© ${
      new Date()
          .getFullYear()} Inpalakan Timbers</span><span>Crafted for the spaces you live in.</span></div></footer>`;
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
        title: project.title,
        src: `${prefix}images/projects/${v.src}`,
        rawSrc: v.src,
        label: v.label || `View ${idx + 1}`,
        alt: v.alt || project.alt,
        url: projectUrl(project, prefix),
        whatsapp: whatsappHref(project.code)
      });
    });
  });
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
      logo}"><link rel="stylesheet" href="${
      prefix}styles.css" defer><script src="${
      prefix}site.js" defer></script></head><body>${
      header(prefix, active)}<main id="main">${body}</main>${footer(prefix)}
  <div id="fullscreen-lightbox" class="lightbox-modal" hidden role="dialog" aria-modal="true" aria-label="Full screen image viewer">
    <div class="lightbox-backdrop"></div>
    <div class="lightbox-header">
      <div class="lightbox-badge">
        <span id="lb-code" class="lb-code"></span>
        <span id="lb-counter" class="lb-counter"></span>
      </div>
      <div class="lightbox-header-actions">
        <a id="lb-details-link" class="lb-details-link" href="#">Open details ↗</a>
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
    <div class="lightbox-footer">
      <div class="lightbox-info">
        <p id="lb-caption" class="lb-caption"></p>
        <span id="lb-category" class="lb-category"></span>
      </div>
      <a id="lb-whatsapp-btn" class="button button-whatsapp lb-whatsapp" href="#" target="_blank" rel="noopener noreferrer">
        Chat on WhatsApp <span aria-hidden="true">💬</span>
      </a>
    </div>
  </div>
  <script id="catalog-playlist" type="application/json">${playlistJson}</script>
</body></html>`;
}

function card(project, prefix = '', index = 0) {
  const viewsBadge = project.views && project.views.length > 1 ?
      `<span class="card-views-badge">${project.views.length} views</span>` :
      '';
  const searchKeywords = `${project.code} ${project.title} ${
      project.category} ${categories[project.category]?.singular || ''}`;
  return `<a class="project-card" href="${
      projectUrl(
          project, prefix)}" data-category="${project.category}" data-code="${
      esc(project.code)}" data-keywords="${esc(searchKeywords)}">
    <span class="card-image">
      <img src="${imageUrl(project, prefix)}" alt="${
      esc(project.alt)}" loading="${
      index < 4 ? 'eager' : 'lazy'}" decoding="async">
      ${viewsBadge}
      <button class="card-expand-btn" type="button" aria-label="View full screen ${
      esc(project.code)}" data-open-lightbox="${
      esc(project.code)}" title="Full screen">⛶</button>
    </span>
    <span class="card-meta-code">
      <strong class="card-code">${esc(project.code)}</strong>
    </span>
  </a>`;
}

function homePage() {
  const featured = projects.filter(p => p.featured);
  const categoryCovers = Object.fromEntries(
      Object.keys(categories)
          .map(
              key =>
                  [key,
                   projects.find(p => p.category === key && p.featured) ||
                       projects.find(p => p.category === key)]));
  const categoryTiles =
      Object.entries(categories)
          .map(
              ([key, category], index) => `<a class="category-tile category-${
                  key}" href="gallery.html?category=${key}"><img src="${
                  imageUrl(categoryCovers[key])}" alt="${
                  esc(categoryCovers[key].alt)}" loading="${
                  index ?
                      'lazy' :
                      'eager'}"><span class="category-shade"></span><span class="category-copy"><span class="category-number">0${
                  index + 1} / EXPLORE</span><strong>${
                  category
                      .title}</strong><span class="category-link">See collection ${
                  icon('arrow')}</span></span></a>`)
          .join('');
  const body = `<section class="hero"><div class="hero-copy"><div class="hero-copy-inner"><p class="eyebrow">TIMBER WORK, MADE PERSONAL</p><h1>Crafted to<br><em>belong.</em></h1><p class="hero-lead">Doors, windows and cabinetry made for real homes. Explore our work, find a detail you love, and start a conversation.</p><div class="hero-actions"><a class="button button-dark" href="gallery.html">Explore our work ${
      icon(
          'arrow')}</a><a class="text-link" href="#about">Get to know us <span aria-hidden="true">↘</span></a></div><div class="hero-footnote"><span class="rule"></span> YOUR VISION, OUR CRAFTSMANSHIP</div></div></div><div class="hero-visual"><img src="${
      imageUrl(projects[0])}" alt="${
      esc(projects[0]
              .alt)}" fetchpriority="high"><a class="hero-image-caption" href="${
      projectUrl(projects[0])}"><span>Featured design <strong>${
      esc(projects[0]
              .code)}</strong></span><span aria-hidden="true">↗</span></a></div></section>
  <section class="section section-intro shell" id="about"><div class="section-kicker"><span class="section-index">01 / THE WORK</span><span class="hairline"></span></div><div class="intro-grid"><h2>Timber details that<br><em>feel like home.</em></h2><div class="intro-copy"><p>From a welcoming front door to the storage you use every day, each piece has its own purpose and personality. Browse real projects below and save the designs that speak to you.</p><div class="intro-badge"><img class="intro-badge-logo" src="${
      logoUrl()}" alt="Inpalakan Timbers emblem" width="46" height="46" loading="lazy"><div><strong>Inpalakan Timbers</strong><span>Master craftsmanship · Est. 2006</span></div></div></div></div></section>
  <section class="section categories-section shell"><div class="section-heading"><div><p class="eyebrow">FIND YOUR INSPIRATION</p><h2>Explore by category.</h2></div><a class="text-link" href="gallery.html">View all designs ${
      icon('arrow')}</a></div><div class="category-grid">${
      categoryTiles}</div></section>
  <section class="section featured-section"><div class="shell"><div class="section-heading"><div><p class="eyebrow">A CLOSER LOOK</p><h2>Selected work.</h2></div><a class="text-link" href="gallery.html">See the full collection ${
      icon('arrow')}</a></div><div class="project-grid">${
      featured.map((p, i) => card(p, '', i)).join('')}</div></div></section>
  <section class="section how-section shell"><div class="section-kicker"><span class="section-index">02 / YOUR NEXT PROJECT</span><span class="hairline"></span></div><div class="how-grid"><h2>See something<br><em>you like?</em></h2><div><p>Every design has a reference code. Open the design page, share it with family, or send its code to us on WhatsApp. Tell us what you would like to adapt for your own space.</p><a class="button button-outline" href="gallery.html">Find a design ${
      icon('arrow')}</a></div></div></section>`;
  return layout({
    title: 'Crafted to belong',
    description:
        'Explore real door, window and cupboard projects by Inpalakan Timbers, then enquire about a design on WhatsApp.',
    body,
    path: 'index.html',
    image: 'images/projects/door-carved-entrance.jpg'
  });
}

function galleryPage() {
  const body = `<section class="page-hero shell"><p class="eyebrow">THE PORTFOLIO</p><h1>Made for<br><em>real spaces.</em></h1><p>Browse doors, windows and cupboards from our work. Open any design for a shareable page and its reference code.</p></section><section class="gallery-section shell" aria-label="Project gallery"><div class="gallery-toolbar"><div class="filters" role="group" aria-label="Filter designs"><button class="filter is-active" type="button" data-filter="all" aria-pressed="true">All <span>${
      projects.length}</span></button>${
      Object.entries(categories)
          .map(
              ([key, category]) =>
                  `<button class="filter" type="button" data-filter="${
                      key}" aria-pressed="false">${category.title} <span>${
                      projects.filter(p => p.category === key)
                          .length}</span></button>`)
          .join(
              '')}</div><div class="gallery-search-wrap"><input class="gallery-search" type="search" placeholder="Search by code or keyword (e.g. DR-020)..." aria-label="Search designs" data-gallery-search></div><p class="gallery-count" aria-live="polite"><span id="visible-count">${
      projects
          .length}</span> designs</p></div><div class="project-grid gallery-grid">${
      projects.map((p, i) => card(p, '', i))
          .join(
              '')}</div><p class="empty-state" hidden>No designs match your search or filter.</p></section><section class="gallery-note shell"><span class="asterisk">✳</span><p>Like a detail in one of these designs? Send us its code and tell us what you imagine for your own space.</p></section>`;
  return layout({
    title: 'Our work',
    description:
        'Browse completed Inpalakan Timbers doors, windows and cupboards. Every design has a shareable page and a WhatsApp enquiry code.',
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
  const initialCaption = views ? ` (${views[0].label})` : '';

  const thumbsHtml = views ?
      `
    <div class="detail-gallery-nav" role="region" aria-label="Available views of this design">
      <p class="thumbs-title">Available views (${
          views.length}) · <small>tap to view angle</small></p>
      <div class="thumbs-scroller">
        ${
          views
              .map(
                  (v, i) => `
          <button class="thumb-btn ${
                      i === 0 ?
                          'is-active' :
                          ''}" type="button" data-view-src="../images/projects/${
                      v.src}" data-view-label="${
                      esc(v.label)}" data-view-alt="${
                      esc(v.alt)}" aria-label="${esc(v.label)}" ${
                      i === 0 ? 'aria-current="true"' : ''}>
            <img src="../images/projects/${v.src}" alt="${
                      esc(v.alt)}" loading="lazy">
            <span class="thumb-label">${esc(v.label)}</span>
          </button>
        `).join('')}
      </div>
    </div>
  ` :
      '';

  const body = `<section class="detail-shell shell"><nav class="breadcrumbs" aria-label="Breadcrumb"><a href="../index.html">Home</a><span>/</span><a href="../gallery.html?category=${
      project.category}">${
      category.title}</a><span>/</span><span aria-current="page">${
      esc(project
              .code)}</span></nav><div class="detail-grid"><div class="detail-image-wrap"><div class="detail-main-frame" role="button" tabindex="0" aria-label="Click to view full screen" data-fullscreen-trigger data-project-code="${
      esc(project.code)}" data-project-category="${
      esc(project
              .category)}"><img class="detail-image" id="active-detail-image" src="${
      imageUrl(project, '../')}" alt="${
      esc(initialAlt)}" fetchpriority="high"><span class="image-stamp">INPALAKAN TIMBERS <span>●</span> ${
      esc(project.code)}<span id="active-view-caption">${
      esc(initialCaption)}</span></span><span class="fullscreen-hint"><span>⛶ Tap for full screen</span></span></div>${
      thumbsHtml}<p class="fullscreen-tip"><span>💡 Tap photo to view in full screen and slide through images</span></p></div><div class="detail-content"><p class="eyebrow">${
      esc(category.singular.toUpperCase())} / ${esc(project.code)}</p><h1>${
      esc(project
              .title)}<span class="title-period">.</span></h1><p class="detail-summary">${
      esc(project
              .summary)}</p><div class="detail-rule"></div><div class="detail-info"><span>DESIGN REFERENCE</span><strong>${
      esc(project
              .code)}</strong></div><p class="detail-prompt">Interested in a similar idea? Mention this code when you contact us, and tell us what you would like for your space.</p><div class="detail-actions"><a class="button button-dark" href="${
      whatsappHref(
          project
              .code)}" target="_blank" rel="noopener noreferrer" data-whatsapp-code="${
      esc(project.code)}">Ask about this design ${
      icon(
          'arrow')}</a><button class="button button-outline share-button" type="button" data-share data-title="${
      esc(project.title)}" aria-label="Share ${esc(project.title)}">${
      icon(
          'share')} <span>Share design</span></button></div><p class="source-note">Photograph from Inpalakan Timbers' ${
      category.title
          .toLowerCase()} collection.</p></div></div></section><section class="related-section"><div class="shell"><div class="section-heading"><div><p class="eyebrow">KEEP EXPLORING</p><h2>More ${
      category.title
          .toLowerCase()}.</h2></div><a class="text-link" href="../gallery.html?category=${
      project.category}">View all ${category.title.toLowerCase()} ${
      icon('arrow')}</a></div><div class="project-grid related-grid">${
      related.map((p, i) => card(p, '../', i))
          .join('')}</div></div></section><div class="mobile-action"><a href="${
      whatsappHref(
          project
              .code)}" target="_blank" rel="noopener noreferrer" data-whatsapp-code="${
      esc(project.code)}">Enquire about ${esc(project.code)} ${
      icon('arrow')}</a></div>`;
  return layout({
    title: `${project.title} (${project.code})`,
    description: `${project.summary} View design ${
        project.code} and ask Inpalakan Timbers about a similar project.`,
    body,
    prefix: '../',
    active: 'work',
    path: `projects/${project.slug}.html`,
    image: `images/projects/${project.image}`
  });
}

assertContent();
await rm(dist, {recursive: true, force: true});
await mkdir(join(dist, 'projects'), {recursive: true});
await cp(join(root, 'public'), dist, {recursive: true});
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

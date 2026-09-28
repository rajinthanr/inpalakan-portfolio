# Inpalakan Timbers portfolio

A mobile-first portfolio for Inpalakan Timbers. Clients can browse completed doors, windows, and cupboards, open a design's own page, share its link, and ask about a similar project on WhatsApp using its reference code.

## Run locally

Node.js is the only build requirement; there are no npm dependencies.

```bash
node scripts/build.mjs
python3 -m http.server 8765 --directory dist
```

Open `http://localhost:8765/`. The generated `dist/` folder is ignored by Git and is the folder to deploy to a static host when the site is ready.

## Add a design

1. Add a web-ready JPG or WebP to `public/images/projects/` (prefer a clear finished-work photo with a descriptive filename).
2. Add an entry to `data/projects.json` with a unique, permanent `code` and `slug`, one of the existing categories, an accurate short summary, and useful image alt text.
3. Run `node scripts/build.mjs`. The homepage/gallery and the design's shareable page are generated together.

The gallery can be expanded without a backend. Each project currently has one selected photo; additional photos and richer project details can be added to the data and page template later. Keep codes and slugs unchanged after sharing them with clients.

The business number and Facebook link are in `data/site.json`. The number currently comes from Inpalakan's public Facebook page and should be confirmed before publishing. The design enquiry button includes the design code and page link automatically.

For rich WhatsApp/Facebook link previews after hosting, build with the final public origin:

```bash
PUBLIC_BASE_URL=https://your-domain.example node scripts/build.mjs
```

This adds absolute canonical and Open Graph image URLs to each generated page. The site has **not** been deployed yet.

## Source collections

- [General work](https://photos.app.goo.gl/tAwMZrMWhgwRMvmS9)
- [Doors](https://photos.app.goo.gl/bYvt1CHPr3SCNLo47)
- [Cupboards](https://photos.app.goo.gl/hZsPh5dw3j2s4vff7)
- [Windows](https://photos.app.goo.gl/17SfQxbBY2sAMRaA7)
- [Facebook page](https://www.facebook.com/inpalakan)

The 105 portfolio photos were selected from the shared work albums (40 doors, 30 windows, and 35 cupboards/interiors). Titles and descriptions describe visible design details only. Confirm preferred captions, ordering, and any additional project details before public launch.

`references/concepts/doors/` contains five AI-generated door concepts from the earlier exploration. Those are **not** photographs of Inpalakan's completed work and do not appear in the website gallery.

## Multi-view design catalog

Projects with multiple photo angles (elevations, interior fittings, close-up carvings, hardware) are consolidated under **one permanent design code**:
- The main gallery card displays only the primary, full-front high-quality view with a count badge (e.g. `5 views`).
- Inside the project page, an interactive thumbnail gallery allows customers to toggle between all available angles (facade elevation, hardware close-ups, interior drawers, storage mechanisms) without leaving the design page.
- WhatsApp enquiry buttons automatically attach the single permanent design code and canonical link.

## 100% Free budget hosting options

The site is a pure static portfolio (HTML, CSS, JS, optimized images) and can be hosted permanently with **zero running costs**:

### Option 1: GitHub Pages (Recommended — 100% Free forever)
1. Push your repository to GitHub.
2. In GitHub repository settings: **Settings → Pages → Source: GitHub Actions**.
3. The included workflow (`.github/workflows/deploy.yml`) will automatically build and publish your site on every push to `main`.
4. Free custom domain support (e.g. `inpalakantimbers.com`) with automatic SSL.

### Option 2: Cloudflare Pages (100% Free forever & blazing fast in Sri Lanka)
1. Sign up for a free [Cloudflare](https://dash.cloudflare.com/) account.
2. Go to **Workers & Pages → Create Application → Pages → Connect to Git**.
3. Select this repository and set:
   - **Build command**: `node scripts/build.mjs`
   - **Build output directory**: `dist`
4. Click **Save and Deploy**. Cloudflare serves assets from their Colombo edge pop with unlimited bandwidth.

## Visual direction

Warm ivory, deep green, and muted brass frame the real work. The layout uses large photography, restrained typography, phone-friendly gallery filters, and direct paths from inspiration to enquiry.

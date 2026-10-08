# Inpalakan Timbers portfolio

A mobile-first static portfolio for Inpalakan Timbers. Clients can browse completed work, search or filter the catalog, open a full-screen photo viewer, share a design page, and ask about a similar project on WhatsApp using its permanent reference code.

## Current catalog

- 122 completed-work designs and 98 sample designs
- 154 photographs connected to completed-work designs
- 25 completed-work designs with multiple views
- 9 featured designs on the home page

The site generates a home page, a searchable gallery, and one shareable page for every design. The generated output belongs in `dist/` and is intentionally ignored by Git.

The gallery shows selected modern completed work first. Older styles follow in their existing order. Sample sections also put modern designs first. Codes now follow this gallery order within each category; keep each assigned code fixed when changing the order later.

On phones, the main action and sticky header lead directly to **Our Work**. Gallery filters wrap into large tap targets, and each result shows a readable title, category, reference code, and separate full-screen control. The home-page featured designs use a horizontal, touch-friendly snap slider so customers can browse without a long vertical list.

The opening hero presents the English and Tamil business names with “Since 2006” and features design `KIT-001`. A subtle brass ornamental texture is applied consistently across the site through CSS.

Homepage category tiles use an explicit cover selection in `scripts/build.mjs`. The current covers are `DOR-007`, `WIN-008`, `KIT-516`, `BED-001`, `GYP-003`, `FUR-006`, and `TVU-001` for their matching categories.

Services and portfolio categories share one homepage section: each service is represented by a curated photograph that opens its filtered gallery.

The closing section combines the project enquiry and workshop location. It provides one clear action each for WhatsApp and Google Maps, followed by compact Facebook and phone links with recognizable icons.

## Run locally

Node.js 20 or newer is recommended. The build has no installed npm dependencies.

```bash
npm run build
python3 -m http.server 8765 --directory dist
```

Open `http://localhost:8765/`. You can also run `npm start` after building; that command uses `npx serve dist` and may download `serve` if it is not already available.

## Project structure

| Path | Purpose |
| --- | --- |
| `data/projects.json` | Design codes, slugs, categories, captions, featured state, and optional multi-view image lists |
| `data/sample-codes.json` | Fixed sample codes and their older search aliases; display order does not change these codes |
| `data/site.json` | Brand, contact, social, source-album, and planned service information |
| `public/images/projects/<category>/` | Completed-work photographs grouped by their catalog category |
| `public/images/projects/unassigned-cupboards/` | Older unused cupboard source photos awaiting a kitchen, bedroom, or furniture classification |
| `public/images/Others/logo.png` | Current business logo |
| `src/styles.css` | Responsive visual design |
| `src/site.js` | Filters, search, sharing, multi-view controls, and full-screen viewer behavior |
| `scripts/build.mjs` | Validates catalog data and generates the static site in `dist/` |
| `.github/workflows/deploy.yml` | GitHub Pages build and deployment workflow for `main` |
| `references/concepts/doors/` | AI-generated door concepts kept separate from completed work |
| `references/concepts/bedroom-cupboards/` | AI-generated bedroom cupboard concepts; optimized WebP copies are included in the gallery's bedroom sample section |
| `references/concepts/furniture/` | AI-generated furniture concepts; optimized WebP copies are included in the gallery's furniture sample section |
| `references/concepts/tv-units/` | AI-generated metallic-finish TV-unit concepts; optimized WebP copies are included in the TV sample section |
| `scratch/` | Local image-import helpers; these are working utilities rather than site runtime files |

The current templates use the logo, contact, location, social, and service fields from `data/site.json`. Service entries include the Tamil subtitle shown on each image tile; all other public-facing site copy is English.

## Add or update a design

1. Add a web-ready JPG or WebP to the matching folder under `public/images/projects/`, such as `doors/`, `windows/`, or `kitchens/`. Prefer a clear finished-work photo with a descriptive filename.
2. Add or edit the entry in `data/projects.json`. Keep `code` and `slug` unique and permanent, choose an existing category, and write accurate alt text and a short summary.
3. For a multi-view design, add a `views` array. Each view needs `src`, `label`, and `alt`; keep the primary image first and set `image` to that same filename. Store every view in the folder matching the project's `category`; filenames in the JSON remain relative to that folder.
4. Set `featured` to `true` only when the design should appear in the home-page selection.
5. Run `npm run build` and review the home page, gallery, design page, full-screen viewer, sharing, and WhatsApp message on a phone-sized screen.

Example multi-view entry:

```json
{
  "code": "DOR-045",
  "slug": "curved-panel-door",
  "category": "doors",
  "title": "Curved panel door",
  "summary": "A single door with stepped panels and a sweeping curved detail.",
  "image": "door-curved-panel.jpg",
  "alt": "Single timber door with rectangular panels and a broad curved inset",
  "featured": false,
  "views": [
    {
      "src": "door-curved-panel.jpg",
      "label": "Full front view",
      "alt": "Full front view of a timber door with a curved inset panel"
    },
    {
      "src": "door-curved-panel-angle.jpg",
      "label": "Angled perspective",
      "alt": "Angled view of the door leaf and timber architrave"
    }
  ]
}
```

Keep completed work clearly separate from the concept images under `references/`. Do not assign a timber species, manufacturing method, dimension, price, or location unless it has been confirmed.

Reference codes use three letters for the category and three digits for the design. Completed work starts at `001` in the current gallery order for each category. Samples start at `501` in their current display order. Keep these codes fixed after sharing them with clients. Existing pages keep their slugs, and older codes remain searchable through the `legacyCode` field.

| Category | Code prefix |
| --- | --- |
| Doors | `DOR` |
| Windows | `WIN` |
| Kitchen cupboards and granite samples | `KIT` |
| Bedroom cupboards | `BED` |
| Furniture | `FUR` |
| Gypsum ceilings | `GYP` |
| TV wall units | `TVU` |

## Sharing and public URLs

Every design page has a stable code, a native share button with a copy-link fallback, and a WhatsApp enquiry button. The WhatsApp message includes the design code; after deployment, the browser adds the public page link.

Build with the final public origin so generated pages contain absolute canonical and Open Graph image URLs for WhatsApp and Facebook previews:

```bash
PUBLIC_BASE_URL=https://your-domain.example npm run build
```

## Search visibility

The build writes a sitemap and a `robots.txt` file using `PUBLIC_BASE_URL`. Set that variable to the address visitors actually use before publishing. The sitemap lists the home page, gallery, and completed-work design pages. Keep page titles and descriptions plain and accurate, and put place names only where they describe the business or a verified service area.

After publishing, check that the home page, `robots.txt`, and `sitemap.xml` open at the public address. Verify the site in Google Search Console, submit `sitemap.xml`, and check its indexing and search-query reports. The business owner should also verify and complete the Google Business Profile with the same website, phone, workshop address, services, and real work photos. Ask genuine customers for reviews without offering rewards.

## Source collections

- [General work](https://photos.app.goo.gl/tAwMZrMWhgwRMvmS9)
- [Doors](https://photos.app.goo.gl/bYvt1CHPr3SCNLo47)
- [Cupboards](https://photos.app.goo.gl/hZsPh5dw3j2s4vff7)
- [Windows](https://photos.app.goo.gl/17SfQxbBY2sAMRaA7)
- [Gypsum work](https://photos.app.goo.gl/kTYfrKLphUuwB9aCA)
- [Facebook page](https://www.facebook.com/inpalakan)

Titles and descriptions should describe visible design details only. Confirm captions, ordering, business contact details, and any project-specific claims before a public launch.

## Deployment

### GitHub Pages

1. Push the repository to GitHub.
2. Open **Settings → Pages** and select **GitHub Actions** as the source.
3. Push to `main`, or run the workflow manually from the Actions tab.
4. The included workflow builds with Node.js 20 and deploys `dist/`.

The workflow uses the standard GitHub Pages project URL for canonical and social-preview links. If the site later uses a custom domain, add a repository Actions variable named `PUBLIC_BASE_URL` containing that origin, without a trailing slash.

GitHub Pages supports a custom domain and HTTPS. Its generated site URL is available from the completed deployment job.

### Cloudflare Pages

1. Connect this repository to a Cloudflare Pages project.
2. Use `npm run build` as the build command.
3. Use `dist` as the output directory.
4. Set `PUBLIC_BASE_URL` to the final site origin when the domain is known.

## Visual direction

Warm ivory, deep green, and muted brass frame the real work. The interface prioritizes large photography, restrained typography, phone-friendly filters and search, touch navigation, and a short path from inspiration to a WhatsApp enquiry.

# Project guidance

Build and maintain a mobile-first portfolio for Inpalakan Timbers. Treat `README.md` as the current repository handbook and `data/projects.json` as the catalog source of truth.

## Content rules

- Keep photographs of completed work separate from the AI-generated concepts in `references/concepts/doors/`.
- Do not claim a timber species, manufacturing method, dimension, price, or project location unless it is verified.
- Preserve existing permanent design codes and slugs after a design has been shared with clients.
- Use concise descriptions based on visible details and useful, specific image alt text.
- Keep a multi-view design under one project entry and one design code. Put its primary image first in `views` and use the same filename in `image`.

## Product priorities

- Optimize every page for phone browsing, touch controls, and fast access to WhatsApp.
- Keep gallery filters, code search, full-screen viewing, native sharing, and copy-link fallback working.
- Include the stable design code in each project page and WhatsApp enquiry message.
- Keep generated links relative during local development. Use `PUBLIC_BASE_URL` for canonical and social-preview URLs in hosted builds.

## Repository workflow

- Edit source files under `data/`, `public/`, `src/`, and `scripts/`; do not hand-edit generated files in `dist/`.
- Run `npm run build` after catalog, template, style, or script changes.
- Review the generated home page, gallery, at least one single-image design, and at least one multi-view design.
- Treat `data/site.json` fields as configuration only when `scripts/build.mjs` actually renders them. The address, map, email, Tamil name, albums, and services are currently stored for planned sections.
- Preserve local work in `scratch/`; its import scripts are development helpers and are not required by the deployed site.
- Do not publish the site or change the business's external accounts without the user's authorization.

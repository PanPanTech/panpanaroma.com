# PanPan Aroma

Source for [www.panpanaroma.com](https://www.panpanaroma.com), an English B2B website for essential oil sourcing, wholesale and private label projects.

The GitHub repository stores application code. The existing OpenAI Sites project runs the application as a Cloudflare Worker. This project is not a GitHub Pages export.

## Local development

Use Node.js 24 or newer, npm, and Git for the documented commands. The TypeScript-based Node test runner requires native TypeScript stripping support.

```sh
npm ci
node --test tests/*.test.mjs
node scripts/check-release.mjs
npm run build
```

`npm run dev` starts a loopback development preview. `npm run build` produces a deployable Worker and client assets under `dist/`; it does not upload or publish the website. `npm start` previews that built Worker locally from `dist/server/wrangler.json`. Publishing to the owner's Cloudflare account is `.github/workflows/deploy-cloudflare-worker.yml`. That workflow deploys a Worker with Wrangler. GitHub Pages is not used. Preserve `.openai/hosting.json` so the existing OpenAI Sites project can still deploy during the cutover. See `MIGRATION.md`.

No credentials are required to read the source, run the tests or build. Hosted publishing and DNS changes require their respective account access. Keep local environment files, credentials, generated outputs and runtime state out of Git.

## Source layout

- `app/` and `components/`: rendered pages, shared interface and request forms.
- `content/`: website, product enquiry, buyer guide and blog content.
- `lib/shared-inquiry.ts`: public enquiry service endpoint and payload mapping.
- `public/images/miyuki-10ml/`: authorized MIYUKI 10ml product and scene references.
- `public/images/catalogue/`: reviewed unbranded carrier oil container references.
- `public/images/unbranded/`: the reviewed generic Vetiver bottle reference.
- `public/illustrations/`: authored botanical and packaging illustrations.
- `content/image-policy.json`: current brand exclusions and blocked image hashes.
- `scripts/`, `worker/`, `deploy/`, `.github/workflows/`, `.openai/`: build integration, Worker deploy config, and hosting configuration.
- `tests/`: local checks for catalogue filtering, public discovery, enquiry mapping and domain handling.

## Enquiry forms

The quote, sample and contact forms use the shared enquiry service:

```text
https://inquiry.panpantechnology.com/api/inquiries
```

The browser sends the contact details, product interest, quantity, project notes, source page, language and attribution fields. A success message requires an HTTP success and `ok: true` from the service. Zoho synchronization may complete separately after the enquiry has been saved.

The service endpoint is public configuration, not a credential. Backend service credentials and customer records are managed outside this repository. The service must allow the production origin in its CORS configuration.

Legacy Sites D1 route, schema and authenticated inbox code remains for compatibility with the existing project. New website form submissions use the shared service rather than that legacy inbox. Neither the application backend nor the enquiry service runs on GitHub. Existing `verify-local.mjs`, `verify-blog.mjs` and `verify-expansion-v2.mjs` scripts describe earlier private-site acceptance checks; use the test suite and `check-release.mjs` for the current public content gate.

## Content and release rules

Product names are sourcing enquiry candidates until the required identity and specification fields are verified. Pending entries do not assert present inventory, purity, certifications or fixed commercial terms. Release checks retain the distinction between publicly readable sourcing information and verified product offers.

The public source excludes raw supplier backups, original label files, private quotations, customer records, internal audit evidence and historical image source mappings. Changes to business claims, specifications and publishing status must be reviewed against the applicable product or project evidence.

The image manifest maps 40 of the 55 product enquiry candidates to matching references: 33 MIYUKI 10ml images, six unbranded carrier oil containers and one generic Vetiver bottle. The remaining 15 candidates retain illustrations where an accurate matching reference was not available. The home page hero, packaging and set sections use reviewed MIYUKI 10ml imagery. Catalogue composites and packaging references are not presented as newly photographed stock or proof of current specifications. Visible claims on historical labels do not establish verified purity, organic certification or current supply specifications. Final packaging, labels and product details are confirmed with the quotation. Detailed source locations and image review evidence remain outside the public repository.

MUMIANHUA / 木棉花 images are prohibited throughout this website under the current project policy. Do not restore earlier catalogue images or renamed copies. The release guard checks explicit image brands and the SHA256 of every public file, including unreferenced files. The 36 withdrawn derivatives remain in internal archives and prior Git history; repository history has not been rewritten.

## Domain and hosting

The canonical production origin is `https://www.panpanaroma.com` (`content/site.json`). Requests to `https://panpanaroma.com` return 301 to that host with the same path and query. DNS for the zone is managed separately from GitHub. A push to `main` deploys the Worker to the owner's Cloudflare account once the Actions secrets in `MIGRATION.md` are set. That push does not change DNS until the `panpanaroma.com` zone is on that account and the Worker custom domains are attached. Both the apex and `www` stay in `deploy/cloudflare-worker.json` so the apex redirect keeps running inside Worker `panpanaroma`. GitHub Pages is not part of this hosting path.

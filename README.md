# PanPan Aroma

Source for [panpanaroma.com](https://panpanaroma.com), an English B2B website for essential oil sourcing, wholesale and private label projects.

The GitHub repository stores application code. The existing OpenAI Sites project runs the application as a Cloudflare Worker. This project is not a GitHub Pages export.

## Local development

Use Node.js 24 or newer, npm, and Git for the documented commands. The TypeScript-based Node test runner requires native TypeScript stripping support.

```sh
npm ci
node --test tests/*.test.mjs
node scripts/check-release.mjs
npm run build
```

`npm run dev` starts a loopback development preview. `npm run build` produces a deployable Worker and client assets under `dist/`; it does not upload or publish the website. `npm start` previews that built Worker locally. The Sites lifecycle tooling handles the hosted deployment. Preserve the existing identity in `.openai/hosting.json` when updating this site.

No credentials are required to read the source, run the tests or build. Hosted publishing and DNS changes require their respective account access. Keep local environment files, credentials, generated outputs and runtime state out of Git.

## Source layout

- `app/` and `components/`: rendered pages, shared interface and request forms.
- `content/`: website, product enquiry, buyer guide and blog content.
- `lib/shared-inquiry.ts`: public enquiry service endpoint and payload mapping.
- `public/illustrations/`: authored botanical and packaging illustrations.
- `scripts/`, `worker/`, `.openai/`: build integration and hosting configuration.
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

## Domain and hosting

The production domain is `panpanaroma.com`. Its DNS is managed separately from GitHub. Keep canonical URLs and site metadata in `content/site.json` aligned with the active production domain. A repository push alone does not change DNS or deploy the running Sites application.

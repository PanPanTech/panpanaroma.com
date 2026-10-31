# Move production hosting to Cloudflare Workers

Production for [panpanaroma.com](https://panpanaroma.com) deploys from this repository with GitHub Actions and Wrangler onto the owner's Cloudflare account. A push to `main` builds the vinext Worker under `dist/` and runs `wrangler deploy`.

This is a Cloudflare Worker. GitHub Pages is not used, and this repository has no Pages workflow.

OpenAI Sites can keep deploying during the cutover. `.openai/hosting.json` stays in the repo, including the Sites `project_id` and the D1 binding name `DB`. Do not delete that file until the Sites project is retired.

## What the build already expects

`npm run build` runs vinext and `@cloudflare/vite-plugin`. The plugin writes `dist/server/wrangler.json` with:

- `main` pointing at the Worker entry it just emitted
- `assets.directory` pointing at `../client`
- `compatibility_date` and `compatibility_flags` (`nodejs_compat`)
- a D1 binding named `DB`

The D1 database id in that file is the Sites placeholder `00000000-0000-4000-8000-000000000000` from `scripts/site-creator-bindings.mjs`. Sites replaces that placeholder in its own control plane. `wrangler deploy` against the owner's account rejects it, because that database does not exist there.

`npm start` previews `dist/server/wrangler.json` locally with Miniflare. Leave that file unchanged. The production deploy uses a sibling file, `dist/server/wrangler.production.json`, written by `node scripts/prepare-workers-deploy.mjs`. The script copies the generated entry, assets, and compatibility settings, sets the Worker name from `deploy/cloudflare-worker.json`, and removes the placeholder D1 binding.

There is intentionally no `wrangler.json`, `wrangler.jsonc`, or `wrangler.toml` at the repository root. The Cloudflare Vite plugin loads a root Wrangler file and merges it into every build, including a Sites build. Production-only routes live in `deploy/cloudflare-worker.json`, which the plugin does not read.

The vendored Sites Vite plugin does not have to be removed for a bare Worker:

- ChatGPT sign-in mocking runs only in the Vite dev server.
- The production build copies `.openai/hosting.json` and `drizzle/` to `dist/.openai` for Sites. Wrangler does not need that directory.
- The Worker entry is `vinext/server/fetch-handler`. Legacy inbox code reads `oai-authenticated-user-*` request headers. A self-hosted Worker does not receive those headers, so `/inbox` stays closed. Public pages do not use that sign-in.

Public quote, sample, and contact forms POST to `https://inquiry.panpantechnology.com/api/inquiries`. They do not write to Sites D1. Legacy `/api/inquiries` and `/api/health` still expect a `DB` binding; without one they return unavailable. That is acceptable for the public site.

## 1. Create the Worker on the owner's account

1. Open the Cloudflare account that should own panpanaroma.com.
2. In Workers & Pages, claim a `workers.dev` subdomain if the account does not already have one. GitHub Actions cannot answer Wrangler's interactive prompt for that subdomain.
3. Create an API token. The dashboard template **Edit Cloudflare Workers** matches this deploy. Restrict it to this account. Include Zone / Workers Routes / Edit for the `panpanaroma.com` zone only when you are ready to attach the custom domains. Include Account / D1 / Edit only if you create the optional legacy database below.
4. Copy the account id from the Workers overview. That value is `CLOUDFLARE_ACCOUNT_ID`.

Do not commit the token or the account id. Do not put them in the workflow file.

### Optional legacy D1

Skip this unless you still need the on-site inbox stored in D1. New website forms do not use it.

```sh
export CLOUDFLARE_API_TOKEN
export CLOUDFLARE_ACCOUNT_ID
npx wrangler d1 create panpanaroma
npx wrangler d1 execute panpanaroma --remote --file=drizzle/0000_outgoing_killmonger.sql
```

`wrangler d1 create` prints a database id. Store that id as the GitHub secret `CLOUDFLARE_D1_DATABASE_ID`. The database name must be `panpanaroma`, or set the Actions variable `CLOUDFLARE_D1_DATABASE_NAME` to the name you created. The binding inside the Worker remains `DB`.

Applying the SQL file creates the legacy `inquiries` and `events` tables. It does not import records from the Sites database.

## 2. Set GitHub Actions secrets

In this repository, open Settings → Secrets and variables → Actions.

| Name | Kind | Required | Purpose |
| --- | --- | --- | --- |
| `CLOUDFLARE_API_TOKEN` | Secret | Yes | Wrangler authentication |
| `CLOUDFLARE_ACCOUNT_ID` | Secret | Yes | Account that owns the Worker |
| `CLOUDFLARE_D1_DATABASE_ID` | Secret | No | Real D1 id for the legacy `DB` binding |
| `CLOUDFLARE_D1_DATABASE_NAME` | Variable | No | D1 name when the id is set. Defaults to `panpanaroma` |
| `CLOUDFLARE_ATTACH_CUSTOM_DOMAINS` | Variable | No | Set to `true` only after the zone is active on this account |

Leave `CLOUDFLARE_ATTACH_CUSTOM_DOMAINS` unset for the first deploy. The Worker is then published only on its `workers.dev` hostname. Attaching `panpanaroma.com` before the zone is on this account makes `wrangler deploy` fail.

Set the two required secrets before merging this workflow to `main` if the first push should deploy. If the first run fails because the secrets are missing, add them and re-run the workflow, or run it with **workflow_dispatch** on `main`.

## 3. Deploy and open the preview URL

Merging to `main`, pushing to `main`, or running the workflow manually starts `.github/workflows/deploy-cloudflare-worker.yml`.

The workflow:

1. Installs dependencies with `npm ci` on Node.js 22.
2. Runs `node --test tests/*.test.mjs` and `node scripts/check-release.mjs`.
3. Runs `npm run build`.
4. Writes `dist/server/wrangler.production.json`.
5. Deploys that config with `cloudflare/wrangler-action@v4` and Wrangler 4.92.0, the version in `package.json`.

The deploy job summary records the Worker URL from the action output. It looks like `https://panpanaroma.<account-subdomain>.workers.dev`. The subdomain belongs to the Cloudflare account; this repository does not choose it.

Confirm the public pages on that URL before changing DNS. The `workers.dev` hostname is public once the deploy succeeds. Form submissions from that origin succeed only if `https://inquiry.panpantechnology.com` allows it in CORS. Production CORS for `https://panpanaroma.com` is separate and must stay allowed.

Pull requests run the test and build job only. They do not deploy.

## 4. Point panpanaroma.com at the Worker

Do this after the `workers.dev` site looks right.

1. Add the zone `panpanaroma.com` to the same Cloudflare account. At the registrar, replace the current nameservers with the Cloudflare nameservers shown for that zone. Lower the TTL at the current DNS host first if it lets you.
2. When the zone is active, set the Actions variable `CLOUDFLARE_ATTACH_CUSTOM_DOMAINS` to `true` and re-run **Deploy Cloudflare Worker** on `main`. The deploy adds Worker custom domains for `panpanaroma.com` and `www.panpanaroma.com` from `deploy/cloudflare-worker.json`.
3. Cloudflare creates the proxied DNS records and the certificate for those custom domains. Leave those records proxied. Do not add a second A or CNAME for the same hostname.
4. The same attachment can be done in the dashboard: Workers & Pages → `panpanaroma` → Settings → Domains & Routes → Add → Custom domain. Use either the workflow variable or the dashboard, then keep them in agreement on the next deploy.

Manual DNS, if you are not using Worker custom domains: create a proxied CNAME for `www` to `panpanaroma.<account-subdomain>.workers.dev`, and a proxied CNAME for the apex to the same target. Cloudflare flattens the apex CNAME. Then add Worker routes for those hostnames. Do not combine manual records with `custom_domain` on the same hostname.

Check both of these after the certificate is issued:

- `https://panpanaroma.com`
- `https://www.panpanaroma.com`

The site canonical origin remains `https://panpanaroma.com` (`content/site.json`). Both hostnames serve this Worker.

To stop publishing the `workers.dev` hostname after the custom domains work, set `"workers_dev": false` in `deploy/cloudflare-worker.json` and deploy again.

## 5. Retire OpenAI Sites

1. Confirm the apex and `www` hostnames stay on the owner's Worker for a full DNS TTL cycle.
2. Remove `panpanaroma.com` from the Sites project so Sites cannot attach the domain again.
3. Stop deploying the Sites project whose id is in `.openai/hosting.json` (`appgprj_6ad86578710c819189c428d973dab134`).
4. Delete or archive that Sites project when you no longer need its deployment history. The legacy Sites D1 database is not the live enquiry store.
5. Keep `.openai/hosting.json` in git until that project is gone. A later change can remove the Sites plugin and the legacy inbox; this migration does not.

## Local checks

These match the README and do not need Cloudflare credentials:

```sh
npm ci
node --test tests/*.test.mjs
node scripts/check-release.mjs
npm run build
node scripts/prepare-workers-deploy.mjs
```

After the last command:

- `dist/server/wrangler.json` still has the Sites placeholder D1 id. `npm start` uses this file.
- `dist/server/wrangler.production.json` names the Worker `panpanaroma` and omits that placeholder id.

A manual deploy from a trusted machine uses the same production file:

```sh
export CLOUDFLARE_API_TOKEN
export CLOUDFLARE_ACCOUNT_ID
npx wrangler deploy --config dist/server/wrangler.production.json --no-bundle --no-x-autoconfig
```

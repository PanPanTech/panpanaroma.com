import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";
import {
  createProductionWranglerConfig,
  prepareWorkersDeploy,
} from "../scripts/prepare-workers-deploy.mjs";
import { SITE_CREATOR_PLACEHOLDER_DATABASE_ID } from "../scripts/site-creator-bindings.mjs";

const overlay = JSON.parse(
  readFileSync(new URL("../deploy/cloudflare-worker.json", import.meta.url), "utf8"),
);

function generatedConfig() {
  return {
    name: "site-creator-vinext-starter",
    topLevelName: "site-creator-vinext-starter",
    main: "index.js",
    compatibility_date: "2026-05-15",
    compatibility_flags: ["nodejs_compat"],
    account_id: "should-not-be-copied",
    assets: { directory: "../client" },
    d1_databases: [
      {
        binding: "DB",
        database_name: "site-creator-d1",
        database_id: SITE_CREATOR_PLACEHOLDER_DATABASE_ID,
      },
    ],
    services: [
      {
        binding: "CONNECTORS",
        service: "sites-connector-preview",
      },
    ],
    rules: [{ type: "ESModule", globs: ["**/*.js"] }],
  };
}

test("production config drops the Sites placeholder D1 id and preview service", () => {
  const source = generatedConfig();
  const config = createProductionWranglerConfig(source, {
    name: "panpanaroma",
    workersDev: true,
    customDomains: ["panpanaroma.com", "www.panpanaroma.com"],
    attachCustomDomains: false,
  });

  assert.equal(config.name, "panpanaroma");
  assert.equal(config.topLevelName, "panpanaroma");
  assert.equal(config.workers_dev, true);
  assert.equal(config.keep_vars, true);
  assert.equal(config.main, "index.js");
  assert.equal(config.assets.directory, "../client");
  assert.equal("account_id" in config, false);
  assert.equal("d1_databases" in config, false);
  assert.equal("routes" in config, false);
  assert.deepEqual(config.services, []);
  assert.equal(source.name, "site-creator-vinext-starter");
  assert.equal(
    source.d1_databases[0].database_id,
    SITE_CREATOR_PLACEHOLDER_DATABASE_ID,
  );
  assert.equal(
    JSON.stringify(config).includes(SITE_CREATOR_PLACEHOLDER_DATABASE_ID),
    false,
  );
});

test("optional D1 id is applied only when provided", () => {
  const config = createProductionWranglerConfig(generatedConfig(), {
    name: "panpanaroma",
    workersDev: true,
    attachCustomDomains: false,
    d1DatabaseId: "11111111-2222-4333-8444-555555555555",
    d1DatabaseName: "panpanaroma-legacy",
  });
  assert.deepEqual(config.d1_databases, [
    {
      binding: "DB",
      database_name: "panpanaroma-legacy",
      database_id: "11111111-2222-4333-8444-555555555555",
    },
  ]);
});

test("blank D1 id is treated as unset", () => {
  const text = prepareWorkersDeploy({
    generatedText: JSON.stringify(generatedConfig()),
    overlay,
    env: {
      CLOUDFLARE_D1_DATABASE_ID: "  ",
      CLOUDFLARE_ATTACH_CUSTOM_DOMAINS: "",
    },
  });
  const config = JSON.parse(text);
  assert.equal("d1_databases" in config, false);
  assert.equal("routes" in config, false);
  assert.equal(config.name, "panpanaroma");
  assert.deepEqual(config.compatibility_flags, ["nodejs_compat"]);
});

test("custom domains are attached only when the flag is set", () => {
  const text = prepareWorkersDeploy({
    generatedText: JSON.stringify(generatedConfig()),
    overlay,
    env: { CLOUDFLARE_ATTACH_CUSTOM_DOMAINS: "true" },
  });
  const config = JSON.parse(text);
  assert.deepEqual(config.routes, [
    { pattern: "panpanaroma.com", custom_domain: true },
    { pattern: "www.panpanaroma.com", custom_domain: true },
  ]);
});

test("invalid D1 id fails without echoing the value", () => {
  assert.throws(
    () =>
      createProductionWranglerConfig(generatedConfig(), {
        name: "panpanaroma",
        d1DatabaseId: "not-a-database-id",
      }),
    /CLOUDFLARE_D1_DATABASE_ID must be a UUID/,
  );
  try {
    createProductionWranglerConfig(generatedConfig(), {
      name: "panpanaroma",
      d1DatabaseId: "super-secret-token-value",
    });
  } catch (error) {
    assert.equal(String(error.message).includes("super-secret-token-value"), false);
  }
});

test("repo root has no Wrangler file for the Vite plugin to merge", () => {
  for (const filename of ["wrangler.json", "wrangler.jsonc", "wrangler.toml"]) {
    assert.equal(
      existsSync(new URL(`../${filename}`, import.meta.url)),
      false,
      filename,
    );
  }
});

test("workflow deploys with wrangler-action and does not publish GitHub Pages", () => {
  const workflow = readFileSync(
    new URL("../.github/workflows/deploy-cloudflare-worker.yml", import.meta.url),
    "utf8",
  );
  assert.match(workflow, /cloudflare\/wrangler-action@v4/);
  assert.match(workflow, /secrets\.CLOUDFLARE_API_TOKEN/);
  assert.match(workflow, /secrets\.CLOUDFLARE_ACCOUNT_ID/);
  assert.match(workflow, /push:/);
  assert.match(workflow, /branches:\s*\n\s*- main/);
  assert.match(workflow, /workflow_dispatch:/);
  assert.equal(workflow.includes("peaceiris/actions-gh-pages"), false);
  assert.equal(workflow.includes("actions/deploy-pages"), false);
  assert.equal(workflow.includes("actions/upload-pages-artifact"), false);
  assert.equal(workflow.includes("pages: write"), false);
});

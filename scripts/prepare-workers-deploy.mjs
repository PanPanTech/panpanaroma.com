import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import {
  PRODUCTION_WORKER_NAME,
  SITE_CREATOR_PLACEHOLDER_DATABASE_ID,
} from "./site-creator-bindings.mjs";

const root = fileURLToPath(new URL("..", import.meta.url));
const generatedConfigPath = path.join(root, "dist/server/wrangler.json");
const productionConfigPath = path.join(
  root,
  "dist/server/wrangler.production.json",
);
const overlayPath = path.join(root, "deploy/cloudflare-worker.json");

const workerNamePattern = /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/;
const databaseNamePattern = /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/;
const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const hostnamePattern =
  /^(?=.{1,253}$)(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}$/;

export function createProductionWranglerConfig(generated, options) {
  if (!generated || typeof generated !== "object" || Array.isArray(generated)) {
    throw new Error("Generated Wrangler config must be an object.");
  }
  if (typeof generated.main !== "string" || generated.main.length === 0) {
    throw new Error(
      "Generated Wrangler config is missing main. Run npm run build first.",
    );
  }
  if (
    !generated.assets ||
    typeof generated.assets.directory !== "string" ||
    generated.assets.directory.length === 0
  ) {
    throw new Error("Generated Wrangler config is missing assets.directory.");
  }

  const name = options.name ?? PRODUCTION_WORKER_NAME;
  assertWorkerName(name);

  const config = structuredClone(generated);
  config.name = name;
  if ("topLevelName" in config) config.topLevelName = name;
  config.workers_dev = options.workersDev !== false;
  config.keep_vars = true;
  delete config.account_id;

  if (Array.isArray(config.services)) {
    config.services = config.services.filter(
      (service) =>
        service?.binding !== "CONNECTORS" &&
        service?.service !== "sites-connector-preview",
    );
  }

  const databases = Array.isArray(config.d1_databases)
    ? config.d1_databases
    : [];
  const withoutPlaceholder = databases.filter(
    (database) =>
      database?.database_id !== SITE_CREATOR_PLACEHOLDER_DATABASE_ID,
  );

  if (options.d1DatabaseId) {
    const databaseId = options.d1DatabaseId.trim().toLowerCase();
    if (!uuidPattern.test(databaseId)) {
      throw new Error(
        "CLOUDFLARE_D1_DATABASE_ID must be a UUID. The value was not printed.",
      );
    }
    if (databaseId === SITE_CREATOR_PLACEHOLDER_DATABASE_ID) {
      throw new Error(
        "CLOUDFLARE_D1_DATABASE_ID is the Sites placeholder. Create a D1 database in the owner's account.",
      );
    }
    const databaseName = options.d1DatabaseName?.trim() || PRODUCTION_WORKER_NAME;
    if (!databaseNamePattern.test(databaseName)) {
      throw new Error(
        "CLOUDFLARE_D1_DATABASE_NAME must contain only lowercase letters, numbers, and hyphens.",
      );
    }
    const rest = withoutPlaceholder.filter(
      (database) => database?.binding !== "DB",
    );
    config.d1_databases = [
      ...rest,
      {
        binding: "DB",
        database_name: databaseName,
        database_id: databaseId,
      },
    ];
  } else if (withoutPlaceholder.length > 0) {
    config.d1_databases = withoutPlaceholder;
  } else {
    delete config.d1_databases;
  }

  delete config.routes;
  if (options.attachCustomDomains) {
    const domains = options.customDomains ?? [];
    if (domains.length === 0) {
      throw new Error(
        "CLOUDFLARE_ATTACH_CUSTOM_DOMAINS is set, but deploy/cloudflare-worker.json lists no custom_domains.",
      );
    }
    config.routes = domains.map((hostname) => ({
      pattern: assertHostname(hostname),
      custom_domain: true,
    }));
  }

  if (JSON.stringify(config).includes(SITE_CREATOR_PLACEHOLDER_DATABASE_ID)) {
    throw new Error(
      "Production Wrangler config still contains the Sites placeholder D1 database id.",
    );
  }

  return config;
}

export function productionOptionsFromEnv(overlay, env = process.env) {
  if (!overlay || typeof overlay !== "object" || Array.isArray(overlay)) {
    throw new Error("deploy/cloudflare-worker.json must be a JSON object.");
  }
  assertWorkerName(overlay.name);
  if (overlay.workers_dev !== undefined && typeof overlay.workers_dev !== "boolean") {
    throw new Error("workers_dev in deploy/cloudflare-worker.json must be a boolean.");
  }
  if (!Array.isArray(overlay.custom_domains)) {
    throw new Error(
      "deploy/cloudflare-worker.json must include a custom_domains array.",
    );
  }

  return {
    name: overlay.name,
    workersDev: overlay.workers_dev !== false,
    customDomains: overlay.custom_domains,
    attachCustomDomains: envFlag(env.CLOUDFLARE_ATTACH_CUSTOM_DOMAINS),
    d1DatabaseId: blank(env.CLOUDFLARE_D1_DATABASE_ID)
      ? undefined
      : String(env.CLOUDFLARE_D1_DATABASE_ID),
    d1DatabaseName: blank(env.CLOUDFLARE_D1_DATABASE_NAME)
      ? undefined
      : String(env.CLOUDFLARE_D1_DATABASE_NAME),
  };
}

export function prepareWorkersDeploy({
  generatedText,
  overlay,
  env = process.env,
} = {}) {
  const generated = JSON.parse(generatedText);
  const config = createProductionWranglerConfig(
    generated,
    productionOptionsFromEnv(overlay, env),
  );
  return `${JSON.stringify(config, null, 2)}\n`;
}

function assertWorkerName(name) {
  if (typeof name !== "string" || !workerNamePattern.test(name)) {
    throw new Error(
      `Worker name must contain only lowercase letters, numbers, and hyphens. Received ${JSON.stringify(name)}.`,
    );
  }
}

function assertHostname(value) {
  const hostname = String(value).trim().toLowerCase();
  if (!hostnamePattern.test(hostname) || hostname.includes("*")) {
    throw new Error(`Invalid custom domain hostname: ${hostname}`);
  }
  return hostname;
}

function envFlag(value) {
  return ["1", "true", "yes"].includes(String(value ?? "").trim().toLowerCase());
}

function blank(value) {
  return value == null || String(value).trim() === "";
}

function main() {
  const generatedText = readFileSync(generatedConfigPath, "utf8");
  const overlay = JSON.parse(readFileSync(overlayPath, "utf8"));
  const productionText = prepareWorkersDeploy({
    generatedText,
    overlay,
    env: process.env,
  });
  writeFileSync(productionConfigPath, productionText);
  const reread = readFileSync(generatedConfigPath, "utf8");
  if (reread !== generatedText) {
    throw new Error(
      "Refusing to continue: dist/server/wrangler.json was modified. npm start must keep the generated Sites config.",
    );
  }
  if (!reread.includes(SITE_CREATOR_PLACEHOLDER_DATABASE_ID)) {
    throw new Error(
      "dist/server/wrangler.json no longer contains the Sites placeholder D1 id.",
    );
  }

  const config = JSON.parse(productionText);
  console.log(
    JSON.stringify(
      {
        output: path.relative(root, productionConfigPath),
        name: config.name,
        workersDev: config.workers_dev === true,
        d1Binding: Array.isArray(config.d1_databases) && config.d1_databases.length > 0,
        customDomains: Array.isArray(config.routes)
          ? config.routes.map((route) => route.pattern)
          : [],
      },
      null,
      2,
    ),
  );
}

const entry = process.argv[1];
if (entry && import.meta.url === pathToFileURL(entry).href) {
  try {
    main();
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  }
}

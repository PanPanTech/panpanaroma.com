import { spawnSync } from "node:child_process";
import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { normalizeCloudflareSecret } from "../scripts/normalize-cloudflare-secrets.mjs";

const root = fileURLToPath(new URL("..", import.meta.url));

test("trims edge whitespace, quotes, and a line break inside the token", () => {
  assert.equal(normalizeCloudflareSecret("  tok_example  \n"), "tok_example");
  assert.equal(normalizeCloudflareSecret("tok_example\r\n"), "tok_example");
  assert.equal(normalizeCloudflareSecret('"tok_example"'), "tok_example");
  assert.equal(normalizeCloudflareSecret("'tok_example'\n"), "tok_example");
  assert.equal(normalizeCloudflareSecret("tok_\nexample"), "tok_example");
  assert.equal(normalizeCloudflareSecret('  "tok_\nexample"  '), "tok_example");
  assert.equal(normalizeCloudflareSecret("abc123"), "abc123");
});

test("empty and whitespace-only secrets stay empty", () => {
  assert.equal(normalizeCloudflareSecret(""), "");
  assert.equal(normalizeCloudflareSecret(" \n\t"), "");
  assert.equal(normalizeCloudflareSecret('""'), "");
  assert.equal(normalizeCloudflareSecret(undefined), "");
});

test("cli stores trimmed credentials and masks them", () => {
  const dir = mkdtempSync(path.join(tmpdir(), "cf-secrets-"));
  const envFile = path.join(dir, "github.env");
  writeFileSync(envFile, "");
  const result = spawnSync(
    process.execPath,
    ["scripts/normalize-cloudflare-secrets.mjs"],
    {
      cwd: root,
      encoding: "utf8",
      env: {
        ...process.env,
        GITHUB_ENV: envFile,
        CLOUDFLARE_API_TOKEN: "tok_example\n",
        CLOUDFLARE_ACCOUNT_ID: '"abc123def456"\r\n',
      },
    },
  );
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /::add-mask::tok_example\n/);
  assert.match(result.stdout, /::add-mask::abc123def456\n/);
  assert.equal(result.stdout.includes("Normalized Cloudflare credentials"), true);
  const written = readFileSync(envFile, "utf8");
  assert.match(written, /CLOUDFLARE_API_TOKEN<<CF_[0-9a-f]+\ntok_example\nCF_[0-9a-f]+\n/);
  assert.match(written, /CLOUDFLARE_ACCOUNT_ID<<CF_[0-9a-f]+\nabc123def456\nCF_[0-9a-f]+\n/);
});

test("cli rejects a whitespace-only token without masking it", () => {
  const dir = mkdtempSync(path.join(tmpdir(), "cf-secrets-"));
  const envFile = path.join(dir, "github.env");
  writeFileSync(envFile, "");
  const result = spawnSync(
    process.execPath,
    ["scripts/normalize-cloudflare-secrets.mjs"],
    {
      cwd: root,
      encoding: "utf8",
      env: {
        ...process.env,
        GITHUB_ENV: envFile,
        CLOUDFLARE_API_TOKEN: "\n",
        CLOUDFLARE_ACCOUNT_ID: "abc123",
      },
    },
  );
  assert.equal(result.status, 1);
  assert.match(result.stderr, /CLOUDFLARE_API_TOKEN/);
  assert.equal(result.stdout.includes("::add-mask::"), false);
  assert.equal(readFileSync(envFile, "utf8"), "");
});

test("deploy passes the normalized credentials into wrangler-action", () => {
  const workflow = readFileSync(
    new URL("../.github/workflows/deploy-cloudflare-worker.yml", import.meta.url),
    "utf8",
  );
  assert.match(workflow, /node scripts\/normalize-cloudflare-secrets\.mjs/);
  assert.match(workflow, /apiToken: \$\{\{ env\.CLOUDFLARE_API_TOKEN \}\}/);
  assert.match(workflow, /accountId: \$\{\{ env\.CLOUDFLARE_ACCOUNT_ID \}\}/);
  const deploy = workflow.slice(workflow.indexOf("uses: cloudflare/wrangler-action@v4"));
  assert.equal(deploy.includes("secrets.CLOUDFLARE_API_TOKEN"), false);
  assert.equal(deploy.includes("secrets.CLOUDFLARE_ACCOUNT_ID"), false);
});

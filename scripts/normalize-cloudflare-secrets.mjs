import { appendFileSync } from "node:fs";
import { randomUUID } from "node:crypto";
import { pathToFileURL } from "node:url";

// Cloudflare API tokens and account IDs contain no whitespace. A pasted
// secret often gains a trailing line break, a wrapping quote, or a line
// break in the middle. Undici rejects an Authorization value that still
// contains a line break after edge whitespace is removed.
export function normalizeCloudflareSecret(value) {
  let text = String(value ?? "").replaceAll("\0", "");
  text = text.trim();
  if (text.length >= 2) {
    const first = text[0];
    const last = text.at(-1);
    if ((first === '"' && last === '"') || (first === "'" && last === "'")) {
      text = text.slice(1, -1).trim();
    }
  }
  return text.replace(/\s+/g, "");
}

function maskForLogs(value) {
  const encoded = value
    .replaceAll("%", "%25")
    .replaceAll("\r", "%0D")
    .replaceAll("\n", "%0A");
  process.stdout.write(`::add-mask::${encoded}\n`);
}

function writeGithubEnv(name, value) {
  const path = process.env.GITHUB_ENV;
  if (!path) {
    throw new Error("GITHUB_ENV is not set.");
  }
  const delimiter = `CF_${randomUUID().replaceAll("-", "")}`;
  appendFileSync(path, `${name}<<${delimiter}\n${value}\n${delimiter}\n`);
}

function main() {
  const token = normalizeCloudflareSecret(process.env.CLOUDFLARE_API_TOKEN);
  const account = normalizeCloudflareSecret(process.env.CLOUDFLARE_ACCOUNT_ID);
  if (!token || !account) {
    console.error(
      "Set the GitHub Actions secrets CLOUDFLARE_API_TOKEN and CLOUDFLARE_ACCOUNT_ID before deploying. See MIGRATION.md.",
    );
    process.exitCode = 1;
    return;
  }
  maskForLogs(token);
  maskForLogs(account);
  writeGithubEnv("CLOUDFLARE_API_TOKEN", token);
  writeGithubEnv("CLOUDFLARE_ACCOUNT_ID", account);
  console.log(
    "Normalized Cloudflare credentials for Wrangler. Whitespace and one pair of wrapping quotes were removed.",
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

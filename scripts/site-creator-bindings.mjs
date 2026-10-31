// Placeholder D1 id used for local Miniflare and for the OpenAI Sites control
// plane, which replaces it when Sites deploys. It is not a database in the
// owner's Cloudflare account. `wrangler deploy` rejects this id, so the
// production config must drop it unless a real database id is supplied.
export const SITE_CREATOR_PLACEHOLDER_DATABASE_ID =
  "00000000-0000-4000-8000-000000000000";

export const PRODUCTION_WORKER_NAME = "panpanaroma";

import assert from "node:assert/strict";
import test from "node:test";
import { redirectApexToWww } from "../worker/canonical-host.ts";

function location(requestUrl) {
  const response = redirectApexToWww(new Request(requestUrl));
  assert.ok(response, requestUrl);
  assert.equal(response.status, 301);
  return response.headers.get("location");
}

test("apex redirects to www and keeps path and query", () => {
  assert.equal(location("https://panpanaroma.com/"), "https://www.panpanaroma.com/");
  assert.equal(
    location("https://panpanaroma.com/blog/?x=1"),
    "https://www.panpanaroma.com/blog/?x=1",
  );
  assert.equal(
    location("http://panpanaroma.com/essential-oils/lavender/?utm_source=qa&y=a%20b"),
    "https://www.panpanaroma.com/essential-oils/lavender/?utm_source=qa&y=a%20b",
  );
});

test("apex adds the canonical trailing slash to page paths in one hop", () => {
  assert.equal(location("https://panpanaroma.com/about"), "https://www.panpanaroma.com/about/");
  assert.equal(location("https://panpanaroma.com/essential-oils?aroma=citrus"), "https://www.panpanaroma.com/essential-oils/?aroma=citrus");
  assert.equal(location("https://panpanaroma.com/sitemap.xml"), "https://www.panpanaroma.com/sitemap.xml");
  assert.equal(location("https://panpanaroma.com/llms.txt"), "https://www.panpanaroma.com/llms.txt");
});

test("www and other hosts are not redirected", () => {
  assert.equal(redirectApexToWww(new Request("https://www.panpanaroma.com/")), null);
  assert.equal(redirectApexToWww(new Request("https://www.panpanaroma.com/blog/?x=1")), null);
  assert.equal(redirectApexToWww(new Request("https://panpanaroma.example.workers.dev/")), null);
  assert.equal(redirectApexToWww(new Request("https://preview.panpanaroma.com/")), null);
});

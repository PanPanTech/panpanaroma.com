/**
 * 301 exactly `panpanaroma.com` to www, keeping path and query. Other hosts pass through.
 * Page paths get the trailing slash used by canonical tags and the sitemap
 * (next.config `trailingSlash: true`), so the apex lands on the final URL in one hop.
 * File-like paths such as /sitemap.xml or /llms.txt are left as they are.
 */
export function redirectApexToWww(request: Request): Response | null {
  const url = new URL(request.url);
  if (url.hostname !== "panpanaroma.com") return null;
  url.hostname = "www.panpanaroma.com";
  url.protocol = "https:";
  const last = url.pathname.split("/").at(-1) ?? "";
  if (!url.pathname.endsWith("/") && !last.includes(".")) url.pathname += "/";
  return Response.redirect(url.toString(), 301);
}

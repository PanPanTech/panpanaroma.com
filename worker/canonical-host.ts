/** 301 exactly `panpanaroma.com` to www, keeping path and query. Other hosts pass through. */
export function redirectApexToWww(request: Request): Response | null {
  const url = new URL(request.url);
  if (url.hostname !== "panpanaroma.com") return null;
  url.hostname = "www.panpanaroma.com";
  url.protocol = "https:";
  return Response.redirect(url.toString(), 301);
}

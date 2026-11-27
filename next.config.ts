import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Canonical tags, sitemap entries and internal links all use a trailing
  // slash, so the server must redirect "/path" to "/path/" (not the reverse).
  trailingSlash: true,
};

export default nextConfig;

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async headers() {
    const base = [
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
      { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
    ];
    return [
      // nessun altro sito può incorniciare le pagine (clickjacking)
      { source: "/:path*", headers: [...base, { key: "X-Frame-Options", value: "DENY" }] },
      { source: "/admin/:path*", headers: [{ key: "Cache-Control", value: "no-store" }] },
    ];
  },
  async redirects() {
    return [
      // vecchi URL di WordPress → nuovi
      { source: "/feed", destination: "/feed.xml", permanent: true },
      { source: "/sitemap.xml", destination: "/sitemap-index.xml", permanent: true },
      { source: "/sitemap_index.xml", destination: "/sitemap-index.xml", permanent: true },
      { source: "/page/:n", destination: "/", permanent: true },
      { source: "/articolo/:slug", destination: "/:slug", permanent: true },
      { source: "/categoria/:slug", destination: "/category/:slug", permanent: true },
      { source: "/", has: [{ type: "query", key: "s" }], destination: "/cerca?q=:s", permanent: false },
    ];
  },
};

export default nextConfig;

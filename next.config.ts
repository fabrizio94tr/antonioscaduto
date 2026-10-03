import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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

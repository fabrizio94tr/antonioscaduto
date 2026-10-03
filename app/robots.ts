import type { MetadataRoute } from "next";
import { IS_STAGING, SITE_URL } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  if (IS_STAGING) return { rules: { userAgent: "*", disallow: "/" } };
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/admin", "/api", "/cerca"] },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}

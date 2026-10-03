import type { Metadata } from "next";
import "./globals.css";
import { IS_STAGING, SITE_URL } from "@/lib/seo";
import { getSettings } from "@/lib/settings";

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings();
  return {
    metadataBase: new URL(SITE_URL),
    title: { default: `${s.site_title} - ${s.tagline}`, template: `%s | ${s.site_title}` },
    description: s.meta_description,
    robots: IS_STAGING ? { index: false, follow: false } : undefined,
    openGraph: { siteName: s.site_title, locale: "it_IT", type: "website", images: s.og_image ? [s.og_image] : undefined },
    twitter: { card: "summary_large_image" },
    alternates: { canonical: "/", types: { "application/rss+xml": "/feed.xml" } },
  };
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: `try{var t=localStorage.getItem("theme")||(matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light");document.documentElement.dataset.theme=t}catch(e){}` }} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Titillium+Web:wght@400;600;700;900&display=swap" rel="stylesheet" />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}

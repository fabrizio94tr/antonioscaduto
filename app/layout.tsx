import type { Metadata } from "next";
import "./globals.css";
import { IS_STAGING, SITE_URL } from "@/lib/seo";
import Consent from "@/components/Consent";
import IntroSplash from "@/components/IntroSplash";
import Reveal from "@/components/Reveal";
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
    verification: s.gsc_verification ? { google: s.gsc_verification } : undefined,
    alternates: { canonical: "/", types: { "application/rss+xml": "/feed.xml" } },
  };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const s = await getSettings();
  return (
    <html lang="it" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: `try{var t=localStorage.getItem("theme")||(matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light");document.documentElement.dataset.theme=t}catch(e){}` }} />
        <script dangerouslySetInnerHTML={{ __html: `document.documentElement.classList.add("js")` }} />
        {s.intro === "1" && <script dangerouslySetInnerHTML={{ __html: `try{if(!sessionStorage.getItem("intro-seen")&&!/^\\/(admin|anteprima)/.test(location.pathname))document.documentElement.classList.add("intro-on")}catch(e){}` }} />}
        <link rel="preload" href="/fonts/plex-sans-var.woff2" as="font" type="font/woff2" crossOrigin="" />
        <link rel="preload" href="/fonts/anton-400.woff2" as="font" type="font/woff2" crossOrigin="" />
      </head>
      <body>
        {s.intro === "1" && <IntroSplash title={s.site_title} tagline={s.tagline} />}
        {children}
        <Reveal />
        <Consent gaId={s.ga_id} adsClient={s.adsense_client} />
      </body>
    </html>
  );
}

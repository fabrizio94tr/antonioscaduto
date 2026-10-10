import type { Metadata } from "next";
import "./globals.css";
import "./style-new.css";
import { IS_STAGING, SITE_URL } from "@/lib/seo";
import Consent from "@/components/Consent";
import IntroSplash from "@/components/IntroSplash";
import Reveal from "@/components/Reveal";
import StyleSwitch from "@/components/StyleSwitch";
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
  const defStyle = s.style_default === "new" ? "new" : "classic";
  const switchOn = s.style_switch !== "0";
  return (
    <html lang="it" data-style={defStyle} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: `try{var t=localStorage.getItem("theme")||(matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light");document.documentElement.dataset.theme=t}catch(e){}` }} />
        <script dangerouslySetInnerHTML={{ __html: `document.documentElement.classList.add("js")` }} />
        <script dangerouslySetInnerHTML={{ __html: switchOn
          ? `try{var m={nuovo:"new","new":"new",classico:"classic",classic:"classic"},q=m[new URLSearchParams(location.search).get("stile")];if(q)localStorage.setItem("style",q);document.documentElement.dataset.style=q||localStorage.getItem("style")||"${defStyle}"}catch(e){}`
          : `document.documentElement.dataset.style="${defStyle}"` }} />
        {s.intro !== "0" && s.intro !== "" && <script dangerouslySetInnerHTML={{ __html: `try{if(!sessionStorage.getItem("intro-seen")&&!/^\\/(admin|anteprima)/.test(location.pathname))document.documentElement.classList.add("intro-on")}catch(e){}` }} />}
        <link rel="preload" href="/fonts/plex-sans-var.woff2" as="font" type="font/woff2" crossOrigin="" />
        <link rel="preload" href="/fonts/anton-400.woff2" as="font" type="font/woff2" crossOrigin="" />
      </head>
      <body>
        {s.intro !== "0" && s.intro !== "" && <IntroSplash title={s.site_title} tagline={s.tagline} />}
        {children}
        <Reveal />
        {switchOn && <StyleSwitch />}
        <Consent gaId={s.ga_id} adsClient={s.adsense_client} />
      </body>
    </html>
  );
}

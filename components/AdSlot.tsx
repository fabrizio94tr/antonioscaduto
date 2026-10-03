import AdUnit from "./AdUnit";
import { getSettings } from "@/lib/settings";

/** Spazio pubblicitario: AdSense se configurato, altrimenti il banner sponsor diretto, altrimenti niente. */
export default async function AdSlot({ slot }: { slot: "article" | "sidebar" | "home" }) {
  const s = await getSettings();
  const id = s[`ad_slot_${slot}`];
  if (s.adsense_client && id) return <AdUnit client={s.adsense_client} slot={id} />;
  if (s.sponsor_image && s.sponsor_link) {
    return (
      <div className="ad">
        <small>Sponsor</small>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <a href={s.sponsor_link} target="_blank" rel="sponsored noopener noreferrer"><img src={s.sponsor_image} alt="Sponsor" loading="lazy" style={{ height: "auto" }} /></a>
      </div>
    );
  }
  return null;
}

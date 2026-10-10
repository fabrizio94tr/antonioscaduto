import KineticBand from "./KineticBand";
import { getSettings } from "@/lib/settings";

export default async function KineticBandServer() {
  const s = await getSettings();
  return <KineticBand word={`${s.site_title} · ${s.tagline} · `} />;
}

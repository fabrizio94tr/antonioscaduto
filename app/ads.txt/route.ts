import { getSettings } from "@/lib/settings";

export const revalidate = 3600;

/** ads.txt richiesto da AdSense: viene generato dal codice editore impostato in Admin → Impostazioni. */
export async function GET() {
  const { adsense_client } = await getSettings();
  const pub = (adsense_client ?? "").replace(/^ca-/, "");
  const body = pub ? `google.com, ${pub}, DIRECT, f08c47fec0942fa0\n` : "";
  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}

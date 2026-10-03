import { saveSettings } from "../../actions";
import { getSettings } from "@/lib/settings";

const F: [string, string, string?][] = [
  ["site_title", "Nome del sito"],
  ["tagline", "Slogan"],
  ["og_image", "Immagine social predefinita (URL, 1200×630)"],
  ["contact_email", "Email di contatto"],
  ["facebook", "Facebook (URL)"],
  ["instagram", "Instagram (URL)"],
  ["x", "X / Twitter (URL)"],
  ["youtube", "YouTube (URL)"],
  ["telegram", "Telegram (URL)"],
];

export default async function Settings({ searchParams }: { searchParams: Promise<{ salvato?: string }> }) {
  const s = await getSettings();
  return (
    <>
      <h1>Impostazioni del sito</h1>
      {(await searchParams).salvato && <p className="notice ok">Salvato ✓</p>}
      <form action={saveSettings} className="f narrow">
        {F.map(([k, label]) => <label key={k}>{label}<input type="text" name={k} defaultValue={s[k] ?? ""} /></label>)}
        <label>Meta description della home<textarea name="meta_description" rows={3} defaultValue={s.meta_description} /></label>
        <button className="btn">Salva impostazioni</button>
      </form>
    </>
  );
}

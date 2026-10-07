import { saveSettings } from "../../actions";
import { getSettings } from "@/lib/settings";

const GROUPS: { title: string; hint?: string; fields: [string, string][] }[] = [
  { title: "Sito", fields: [["site_title", "Nome del sito"], ["tagline", "Slogan"], ["og_image", "Immagine social predefinita (URL, 1200×630)"], ["contact_email", "Email di contatto"]] },
  { title: "Autore (box in home e negli articoli)", fields: [["author_name", "Nome"], ["author_photo", "Foto (URL)"], ["author_bio", "Presentazione breve"]] },
  { title: "Social", fields: [["facebook", "Facebook (URL)"], ["instagram", "Instagram (URL)"], ["x", "X / Twitter (URL)"], ["youtube", "YouTube (URL)"], ["telegram", "Telegram (URL)"]] },
  {
    title: "Statistiche e Search Console",
    hint: "Se inserisci l'ID di Google Analytics compare in automatico il banner cookie. I dati partono solo dopo il consenso.",
    fields: [["ga_id", "ID Google Analytics (G-XXXXXXXXXX)"], ["gsc_verification", "Codice di verifica Google Search Console (solo il contenuto del meta tag)"]],
  },
  {
    title: "Pubblicità",
    hint: "AdSense: inserisci l'ID editore e gli ID dei blocchi. Il banner sponsor diretto compare dove non c'è AdSense.",
    fields: [["adsense_client", "ID editore AdSense (ca-pub-…)"], ["ad_slot_home", "Blocco AdSense: home"], ["ad_slot_sidebar", "Blocco AdSense: colonna laterale"], ["ad_slot_article", "Blocco AdSense: articolo"], ["sponsor_image", "Banner sponsor: URL immagine"], ["sponsor_link", "Banner sponsor: link"]],
  },
  { title: "Newsletter", hint: "Mittente per l'invio (deve essere verificato su Resend), es. Antonio Scaduto <news@tuodominio.it>", fields: [["newsletter_from", "Mittente"]] },
];

export default async function Settings({ searchParams }: { searchParams: Promise<{ salvato?: string }> }) {
  const s = await getSettings();
  return (
    <>
      <h1>Impostazioni del sito</h1>
      {(await searchParams).salvato && <p className="notice ok">Salvato ✓</p>}
      <form action={saveSettings} className="f narrow">
        {GROUPS.map((g) => (
          <fieldset key={g.title} className="card-box">
            <legend><b>{g.title}</b></legend>
            {g.hint && <p className="updated">{g.hint}</p>}
            {g.fields.map(([k, label]) => <label key={k}>{label}<input type="text" name={k} defaultValue={s[k] ?? ""} /></label>)}
            {g.title === "Sito" && <label>Meta description della home<textarea name="meta_description" rows={3} defaultValue={s.meta_description} /></label>}
          </fieldset>
        ))}
        <button className="btn">Salva impostazioni</button>
      </form>
    </>
  );
}

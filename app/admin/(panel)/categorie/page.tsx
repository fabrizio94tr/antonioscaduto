import { saveCategory } from "../../actions";
import { supabaseServer } from "@/lib/supabase";

export default async function Categories({ searchParams }: { searchParams: Promise<{ salvato?: string }> }) {
  const sb = await supabaseServer();
  const { data } = await sb.from("categories").select("*").order("position");
  return (
    <>
      <h1>Categorie</h1>
      {(await searchParams).salvato && <p className="notice ok">Salvato ✓</p>}
      <p className="updated">Le categorie &quot;nel menu&quot; compaiono nella barra nera in alto. Titolo e descrizione SEO servono per la pagina /category/nome.</p>
      {(data ?? []).map((c) => (
        <details key={c.id} className="card-box">
          <summary><b>{c.name}</b> <small>/category/{c.slug}</small> {c.in_menu && <span className="badge">menu</span>}</summary>
          <form action={saveCategory} className="f narrow">
            <input type="hidden" name="id" value={c.id} />
            <label>Nome<input type="text" name="name" defaultValue={c.name} required /></label>
            <label>Posizione nel menu<input type="text" name="position" defaultValue={c.position} /></label>
            <label className="chk"><input type="checkbox" name="in_menu" defaultChecked={c.in_menu} /> Mostra nel menu</label>
            <label>Descrizione<textarea name="description" rows={2} defaultValue={c.description ?? ""} /></label>
            <label>Titolo SEO<input type="text" name="meta_title" defaultValue={c.meta_title ?? ""} /></label>
            <label>Meta description<textarea name="meta_description" rows={2} defaultValue={c.meta_description ?? ""} /></label>
            <button className="btn">Salva</button>
          </form>
        </details>
      ))}
      <details className="card-box">
        <summary><b>+ Nuova categoria</b></summary>
        <form action={saveCategory} className="f narrow">
          <label>Nome<input type="text" name="name" required /></label>
          <label>Posizione<input type="text" name="position" defaultValue={99} /></label>
          <label className="chk"><input type="checkbox" name="in_menu" defaultChecked /> Mostra nel menu</label>
          <button className="btn">Crea</button>
        </form>
      </details>
    </>
  );
}

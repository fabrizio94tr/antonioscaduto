import { saveArticle, deleteArticle } from "@/app/admin/actions";
import type { Article, Category } from "@/lib/types";

const toLocal = (iso: string) => {
  const d = new Date(iso);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
};

export default function ArticleForm({ article, categories }: { article?: Article; categories: Category[] }) {
  return (
    <>
      <form action={saveArticle} className="f">
        {article && <input type="hidden" name="id" value={article.id} />}
        <label>Titolo<input type="text" name="title" defaultValue={article?.title} required /></label>
        <label>Slug (URL, lascia vuoto per generarlo)<input type="text" name="slug" defaultValue={article?.slug} /></label>
        <label>Categoria
          <select name="category_id" defaultValue={article?.category_id ?? ""}>
            <option value="">—</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </label>
        <label>Sommario<input type="text" name="excerpt" defaultValue={article?.excerpt ?? ""} /></label>
        <label>URL immagine<input type="text" name="image_url" defaultValue={article?.image_url ?? ""} /></label>
        <label>Testo (paragrafi separati da riga vuota)<textarea name="content" defaultValue={article?.content} /></label>
        <label>Data pubblicazione
          <input type="datetime-local" name="published_at" defaultValue={article ? toLocal(article.published_at) : toLocal(new Date().toISOString())} />
        </label>
        <label className="chk"><input type="checkbox" name="published" defaultChecked={article?.published ?? true} /> Pubblicato</label>
        <label className="chk"><input type="checkbox" name="featured" defaultChecked={article?.featured ?? false} /> In evidenza (home)</label>
        <button className="btn">Salva</button>
      </form>
      {article && (
        <form action={deleteArticle} style={{ marginTop: 20 }}>
          <input type="hidden" name="id" value={article.id} />
          <button className="btn" style={{ background: "#900" }}>Elimina articolo</button>
        </form>
      )}
    </>
  );
}

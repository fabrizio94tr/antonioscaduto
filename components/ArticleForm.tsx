"use client";

import { useActionState, useState } from "react";
import { saveArticle, deleteArticle } from "@/app/admin/actions";
import type { Article, Category } from "@/lib/types";
import { slugify } from "@/lib/slug";
import RichEditor, { uploadImage } from "./admin/RichEditor";
import SeoPanel from "./admin/SeoPanel";

const toLocal = (iso: string) => {
  const d = new Date(iso);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
};

function Counter({ value, max }: { value: string; max: number }) {
  return <span className={`counter ${value.length > max ? "over" : ""}`}>{value.length}/{max}</span>;
}

export default function ArticleForm({ article, categories, siteTitle }: { article?: Article; categories: Category[]; siteTitle: string }) {
  const [state, action, pending] = useActionState(saveArticle, null);
  const [title, setTitle] = useState(article?.title ?? "");
  const [slug, setSlug] = useState(article?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(article));
  const [excerpt, setExcerpt] = useState(article?.excerpt ?? "");
  const [content, setContent] = useState(article?.content ?? "");
  const [image, setImage] = useState(article?.image_url ?? "");
  const [metaTitle, setMetaTitle] = useState(article?.meta_title ?? "");
  const [metaDesc, setMetaDesc] = useState(article?.meta_description ?? "");
  const [ogImage, setOgImage] = useState(article?.og_image_url ?? "");
  const [kw, setKw] = useState(article?.focus_keyword ?? "");
  const [tags, setTags] = useState(article?.tags?.join(", ") ?? "");
  const [uploading, setUploading] = useState<"" | "cover" | "og">("");
  const [aiBusy, setAiBusy] = useState(false);

  const suggest = async () => {
    setAiBusy(true);
    try {
      const r = await fetch("/api/admin/ai-seo", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ title, content, category: categories.find((c) => c.id === (document.querySelector<HTMLSelectElement>("[name=category_id]")?.value ?? ""))?.name }) });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error);
      setMetaTitle(j.meta_title); setMetaDesc(j.meta_description); setKw(j.focus_keyword);
      if (!tags.trim()) setTags((j.tags as string[]).join(", "));
    } catch (e) {
      alert((e as Error).message);
    } finally {
      setAiBusy(false);
    }
  };

  const onTitle = (v: string) => {
    setTitle(v);
    if (!slugTouched) setSlug(slugify(v));
  };

  const upload = async (file: File | undefined, kind: "cover" | "og") => {
    if (!file) return;
    setUploading(kind);
    try {
      const url = await uploadImage(file);
      if (kind === "cover") setImage(url); else setOgImage(url);
    } catch (e) {
      alert((e as Error).message);
    } finally {
      setUploading("");
    }
  };

  const isPublished = article?.published ?? false;

  return (
    <>
      <form action={action} className="editor-layout">
        {article && <input type="hidden" name="id" value={article.id} />}
        <input type="hidden" name="content" value={content} />

        <div className="col-main">
          {state?.error && <p className="notice">{state.error}</p>}
          <input
            className="title-input" name="title" value={title} onChange={(e) => onTitle(e.target.value)}
            placeholder="Titolo dell'articolo" required
          />
          <p className="permalink">
            URL: /<input name="slug" value={slug} onChange={(e) => { setSlug(slugify(e.target.value)); setSlugTouched(true); }} placeholder="generato-dal-titolo" />
          </p>
          <RichEditor value={content} onChange={setContent} />
          <label>Sommario / occhiello <small>(mostrato sotto il titolo)</small>
            <textarea name="excerpt" rows={3} value={excerpt} onChange={(e) => setExcerpt(e.target.value)} />
          </label>

          <details className="card-box" open>
            <summary>SEO</summary>
            <button type="button" className="btn ghost" onClick={suggest} disabled={aiBusy} style={{ marginBottom: 10 }}>{aiBusy ? "Sto pensando…" : "✨ Suggerisci titolo SEO, descrizione e tag con l'AI"}</button>
            <div className="seo-grid">
              <div className="f">
                <label>Parola chiave principale
                  <input type="text" name="focus_keyword" value={kw} onChange={(e) => setKw(e.target.value)} placeholder="es. calciomercato Milan" />
                </label>
                <label>Titolo SEO (meta title) <Counter value={metaTitle || title} max={60} />
                  <input type="text" name="meta_title" value={metaTitle} onChange={(e) => setMetaTitle(e.target.value)} placeholder={title || "Se vuoto usa il titolo dell'articolo"} />
                </label>
                <label>Meta description <Counter value={metaDesc} max={160} />
                  <textarea name="meta_description" rows={3} value={metaDesc} onChange={(e) => setMetaDesc(e.target.value)} placeholder="Se vuota viene generata dall'inizio del testo" />
                </label>
                <label>URL canonico <small>(solo se l&apos;articolo è una copia di un altro)</small>
                  <input type="text" name="canonical_url" defaultValue={article?.canonical_url ?? ""} placeholder="https://…" />
                </label>
                <label>Immagine per i social (Open Graph) <small>(1200×630 consigliata; se vuota usa la copertina)</small>
                  <input type="text" name="og_image_url" value={ogImage} onChange={(e) => setOgImage(e.target.value)} placeholder="https://…" />
                  <input type="file" accept="image/*" onChange={(e) => upload(e.target.files?.[0], "og")} />
                  {uploading === "og" && <small>Caricamento…</small>}
                </label>
                <label className="chk"><input type="checkbox" name="noindex" defaultChecked={article?.noindex} /> Non indicizzare (noindex): nascondi a Google</label>
              </div>
              <SeoPanel
                title={title} slug={slug} content={content} excerpt={excerpt} hasImage={Boolean(image)}
                metaTitle={metaTitle} metaDescription={metaDesc} focusKeyword={kw} ogImage={ogImage || image} siteTitle={siteTitle}
              />
            </div>
          </details>
        </div>

        <aside className="col-side">
          <div className="card-box">
            <h3>Pubblicazione</h3>
            <p className="status-line">
              Stato: <span className="badge">{!article ? "Nuovo" : isPublished ? (new Date(article.published_at) > new Date() ? "Programmato" : "Pubblicato") : "Bozza"}</span>
            </p>
            <label>Data e ora <small>(futura = programmato)</small>
              <input type="datetime-local" name="published_at" defaultValue={toLocal(article?.published_at ?? new Date().toISOString())} />
            </label>
            <div className="btn-row">
              <button className="btn ghost" name="intent" value="draft" disabled={pending}>Salva bozza</button>
              <button className="btn" name="intent" value="publish" disabled={pending}>{isPublished ? "Aggiorna" : "Pubblica"}</button>
            </div>
            {article && isPublished && (
              <p><a href={`/${article.slug}`} target="_blank" rel="noopener noreferrer" className="tag">Vedi sul sito ↗</a></p>
            )}
          </div>

          <div className="card-box">
            <h3>Categoria</h3>
            <select name="category_id" defaultValue={article?.category_id ?? ""}>
              <option value="">— nessuna —</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <label>Tag <small>(separati da virgola)</small>
              <input type="text" name="tags" value={tags} onChange={(e) => setTags(e.target.value)} placeholder="Milan, Serie A" />
            </label>
            <label>Autore
              <input type="text" name="author_name" defaultValue={article?.author_name ?? "Antonio Scaduto"} />
            </label>
          </div>

          <div className="card-box">
            <h3>Immagine di copertina</h3>
            {image && <div className="thumb" style={{ backgroundImage: `url(${image})` }} />}
            <input type="hidden" name="image_url" value={image} />
            <input type="file" accept="image/*" onChange={(e) => upload(e.target.files?.[0], "cover")} />
            {uploading === "cover" && <small>Caricamento…</small>}
            <input type="text" value={image} onChange={(e) => setImage(e.target.value)} placeholder="oppure incolla un URL" />
            {image && <button type="button" className="linklike" onClick={() => setImage("")}>Rimuovi</button>}
          </div>

          <div className="card-box">
            <h3>Visibilità in home</h3>
            <label className="chk"><input type="checkbox" name="featured" defaultChecked={article?.featured} /> In evidenza (hero)</label>
            <label className="chk"><input type="checkbox" name="breaking" defaultChecked={article?.breaking} /> Ultim&apos;ora (ticker rosso)</label>
          </div>
        </aside>
      </form>

      {article && (
        <form action={deleteArticle} onSubmit={(e) => { if (!confirm("Eliminare definitivamente l'articolo?")) e.preventDefault(); }}>
          <input type="hidden" name="id" value={article.id} />
          <button className="btn danger">Elimina articolo</button>
        </form>
      )}
    </>
  );
}

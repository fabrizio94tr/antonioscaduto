"use client";

import { useState } from "react";
import { savePage, deletePage } from "@/app/admin/actions";
import type { Page } from "@/lib/types";
import RichEditor from "./RichEditor";

export default function PageForm({ page, error }: { page?: Page; error?: string }) {
  const [content, setContent] = useState(page?.content ?? "");
  const [mt, setMt] = useState(page?.meta_title ?? "");
  const [md, setMd] = useState(page?.meta_description ?? "");
  return (
    <>
      {error && <p className="notice">{error}</p>}
      <form action={savePage} className="f narrow">
        <input type="hidden" name="original_slug" value={page?.slug ?? ""} />
        <input type="hidden" name="content" value={content} />
        <label>Titolo<input type="text" name="title" defaultValue={page?.title} required /></label>
        <label>URL (slug)<input type="text" name="slug" defaultValue={page?.slug} placeholder="generato dal titolo" /></label>
        <RichEditor value={content} onChange={setContent} />
        <h3>SEO</h3>
        <label>Titolo SEO <span className="counter">{mt.length}/60</span><input type="text" name="meta_title" value={mt} onChange={(e) => setMt(e.target.value)} /></label>
        <label>Meta description <span className="counter">{md.length}/160</span><textarea name="meta_description" rows={3} value={md} onChange={(e) => setMd(e.target.value)} /></label>
        <label className="chk"><input type="checkbox" name="noindex" defaultChecked={page?.noindex} /> Non indicizzare (noindex)</label>
        <button className="btn">Salva pagina</button>
      </form>
      {page && (
        <form action={deletePage} onSubmit={(e) => { if (!confirm("Eliminare la pagina?")) e.preventDefault(); }}>
          <input type="hidden" name="slug" value={page.slug} />
          <button className="btn danger">Elimina pagina</button>
        </form>
      )}
    </>
  );
}

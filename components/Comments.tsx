import { addComment } from "@/app/actions";
import CommentStatus from "./CommentStatus";
import { fmtStamp, getComments } from "@/lib/data";

export default async function Comments({ articleId, slug }: { articleId: string; slug: string }) {
  const list = await getComments(articleId);
  return (
    <section id="commenti" className="comments">
      <h2 className="section-title"><span>Commenti ({list.length})</span></h2>
      <CommentStatus />
      <ul className="comment-list">
        {list.map((c) => (
          <li key={c.id}>
            <b>{c.author}</b> <time>{fmtStamp(c.created_at)}</time>
            <p>{c.body}</p>
          </li>
        ))}
      </ul>
      <form action={addComment} className="comment-form">
        <input type="hidden" name="slug" value={slug} />
        <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden className="hp" />
        <input type="text" name="author" placeholder="Il tuo nome" required minLength={2} maxLength={60} />
        <textarea name="body" placeholder="Scrivi un commento (niente link)…" rows={4} required minLength={3} maxLength={1500} />
        <button className="btn">Invia commento</button>
      </form>
    </section>
  );
}

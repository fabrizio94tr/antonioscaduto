import CommentBox from "./CommentBox";
import { fmtStamp, getComments } from "@/lib/data";

export default async function Comments({ articleId, slug }: { articleId: string; slug: string }) {
  const list = await getComments(articleId);
  return (
    <section id="commenti" className="comments">
      <details className="comments-box">
        <summary>Mostra i commenti{list.length > 0 ? ` (${list.length})` : ""}</summary>
        {list.length > 0 && (
          <ul className="comment-list">
            {list.map((c) => (
              <li key={c.id}>
                <b>{c.author}</b> <time>{fmtStamp(c.created_at)}</time>
                <p>{c.body}</p>
              </li>
            ))}
          </ul>
        )}
        <CommentBox articleId={articleId} slug={slug} />
      </details>
    </section>
  );
}

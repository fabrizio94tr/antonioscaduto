import Cover from "./Cover";
import { getSettings } from "@/lib/settings";

export default async function AuthorCard() {
  const s = await getSettings();
  if (!s.author_bio) return null;
  return (
    <section className="widget author-card" data-reveal>
      <div className="author-avatar">{s.author_photo ? <Cover src={s.author_photo} alt={s.author_name} /> : s.author_name.slice(0, 1)}</div>
      <p className="author-txt"><b>{s.author_name}</b> {s.author_bio}</p>
    </section>
  );
}

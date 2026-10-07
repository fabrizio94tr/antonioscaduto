import { subscribe } from "@/app/actions";

export default function Newsletter() {
  return (
    <section className="widget newsletter" data-reveal>
      <h2>Newsletter</h2>
      <p>Le notizie e le esclusive di calciomercato direttamente nella tua email.</p>
      <form action={subscribe}>
        <input type="email" name="email" placeholder="La tua email" required aria-label="Email" />
        <button className="btn">Iscriviti</button>
      </form>
    </section>
  );
}

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
      <p className="nl-priv">Iscrivendoti accetti di ricevere la newsletter e dichiari di aver letto l&apos;<a href="/privacy-policy">informativa privacy</a>. Puoi disiscriverti in ogni momento.</p>
    </section>
  );
}

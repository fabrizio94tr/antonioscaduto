import BallShape from "./BallShape";
import IntroControl from "./IntroControl";

/**
 * Intro di apertura (~3 s): il pallone del logo cade dall'alto, rimbalza sempre più basso fino a fermarsi,
 * rotola a sinistra al suo posto e accanto compare la scritta: il risultato è il logo del sito.
 * Si vede una volta per sessione (script nell'<head> + sessionStorage), si salta con un tocco o con Esc,
 * e si nasconde da sola via CSS anche se il JavaScript non parte.
 */
export default function IntroSplash({ title, tagline }: { title: string; tagline: string }) {
  return (
    <div className="intro-splash" aria-hidden="true">
      <div className="is-center">
        <div className="is-logo">
          {/* x: rotola a sinistra · y: rimbalzi · squash: schiacciamento all'impatto · spin: rotazione */}
          <span className="is-ballx">
            <span className="is-shadow" />
            <span className="is-bally">
              <span className="is-squash">
                <svg className="is-spin" viewBox="0 0 24 24"><BallShape id="intro-ball-clip" /></svg>
              </span>
            </span>
          </span>
          <span className="is-text">
            {Array.from(title).map((ch, i) => (
              <span key={i} style={{ ["--i" as string]: i }}>{ch === " " ? " " : ch}</span>
            ))}
          </span>
        </div>
        <small className="is-tagline">{tagline}</small>
      </div>
      <IntroControl />
    </div>
  );
}

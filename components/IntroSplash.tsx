import BallShape from "./BallShape";
import IntroControl from "./IntroControl";

/**
 * Intro di apertura (~2,5 s): compare il nome, un piede carica il colpo e calcia il pallone verso lo schermo,
 * il pallone si ingrandisce e svela il sito. Si vede una volta per sessione (script nell'<head> + sessionStorage),
 * si salta con un tocco, e si nasconde da sola via CSS anche se il JavaScript non parte.
 */
export default function IntroSplash({ title, tagline }: { title: string; tagline: string }) {
  return (
    <div className="intro-splash" aria-hidden="true">
      <div className="intro-stage">
        <div className="intro-title">
          <span>{title}</span>
          <small>{tagline}</small>
        </div>
        <div className="intro-shadow" />
        <svg className="intro-boot" viewBox="0 -60 150 250" overflow="visible">
          {/* gamba con calzettone */}
          <path d="M38 -420 H66 L64 120 H40 Z" fill="#f3f7f4" />
          <rect x="39" y="64" width="26" height="9" fill="#2ee66b" />
          <rect x="39.4" y="80" width="25.2" height="5" fill="#2ee66b" />
          {/* scarpino */}
          <path d="M40 118 L64 118 L67 129 C82 133 98 137 115 147 C127 153 131 160 127 167 L125 172 H28 L26 150 C26 138 34 130 40 126 Z" fill="#2ee66b" stroke="#07170e" strokeWidth="2.5" strokeLinejoin="round" />
          <path d="M28 168 H125 L124 174 H29 Z" fill="#e8f0ea" stroke="#07170e" strokeWidth="1.5" />
          <g fill="#07170e"><rect x="36" y="174" width="8" height="7" rx="1.5" /><rect x="58" y="174" width="8" height="7" rx="1.5" /><rect x="90" y="174" width="8" height="7" rx="1.5" /><rect x="110" y="174" width="8" height="7" rx="1.5" /></g>
          <g stroke="#07170e" strokeWidth="3" strokeLinecap="round"><path d="M72 131 L80 125" /><path d="M85 137 L93 130" /><path d="M98 143 L106 136" /></g>
        </svg>
        <svg className="intro-ball" viewBox="0 0 24 24"><BallShape id="intro-ball-clip" /></svg>
      </div>
      <IntroControl />
    </div>
  );
}

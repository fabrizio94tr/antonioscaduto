import IntroControl from "./IntroControl";

/**
 * Intro di apertura (~2,5 s): il nome, un calciatore che carica il colpo e calcia, il pallone che vola verso lo schermo
 * e svela il sito. Si vede una volta per sessione (script nell'<head> + sessionStorage), si salta con un tocco e si
 * nasconde da sola via CSS anche se il JavaScript non parte.
 *
 * Il calciatore è un disegno vettoriale a segmenti articolati (vista laterale, rivolto a destra): ogni gruppo .pl-*
 * ruota attorno alla propria articolazione (anca, ginocchio, caviglia, spalla, gomito). Pose e tempi in globals.css.
 */
const SKIN = "#e8b98f";
const SKIN_D = "#c98e66";
const KIT = "#2ee66b";
const KIT_D = "#17a84c";
const SHORTS = "#f4f7f4";
const SHORTS_D = "#c9d3cc";
const DARK = "#0b1a11";

function Boot() {
  return (
    <>
      <path d="M96 291 H118 C119 298 121.5 302 126 305 C139 307 151 309.5 157.5 313 C160 314.5 160 316.5 157 317 H91 V304 C91 298 93 293 96 291 Z" fill={DARK} />
      <path d="M96 291 H118 C119 297 120 300 122 303 C112 304 101 302 91 301 C91 297 93 293 96 291 Z" fill="#14281c" />
      <path d="M99 302 C110 305 121 308 133 310" fill="none" stroke={KIT} strokeWidth="2.6" strokeLinecap="round" />
      <g stroke="#e8f0ea" strokeWidth="1.8" strokeLinecap="round"><path d="M121 301 l4 -3.2" /><path d="M127 304 l4 -3" /><path d="M133 306.5 l4 -2.6" /></g>
      <path d="M90 314 H159 V318.5 H90 Z" fill="#eef3ef" />
      <g fill={DARK}><rect x="97" y="318.5" width="6" height="4" rx="1.2" /><rect x="113" y="318.5" width="6" height="4" rx="1.2" /><rect x="136" y="318.5" width="6" height="4" rx="1.2" /><rect x="150" y="318.5" width="5" height="3.2" rx="1.2" /></g>
    </>
  );
}

function Arm({ near }: { near: boolean }) {
  const sleeve = near ? KIT : KIT_D;
  const skin = near ? SKIN : SKIN_D;
  return (
    <g className={near ? "pl-arm-n" : "pl-arm-f"} transform={near ? undefined : "translate(-5 2)"}>
      <path d="M108 96 H124 L121.5 133 H110.5 Z" fill={skin} />
      <path d="M106.5 90 C113 84.5 125 86.5 126.5 97 L122.5 114 H107.5 Z" fill={sleeve} />
      <path d="M107.5 110 H122.5" stroke="#f4f7f4" strokeWidth="2.6" />
      <g className="pl-forearm">
        <path d="M110.5 131 H122 L120 158 H112.5 Z" fill={skin} />
        <path d="M110.8 140 H121.4" stroke="#f4f7f4" strokeWidth="2.4" />
        <ellipse cx="116" cy="162" rx="6.2" ry="7.2" fill={skin} />
      </g>
    </g>
  );
}

export default function IntroSplash({ title, tagline }: { title: string; tagline: string }) {
  return (
    <div className="intro-splash" aria-hidden="true">
      <div className="intro-lights"><i /><i /></div>
      <div className="intro-stage">
        <div className="intro-title">
          <span>{title}</span>
          <small>{tagline}</small>
        </div>

        <svg className="intro-player" viewBox="0 0 260 345">
          <defs>
            <linearGradient id="pl-shade" x1="0" x2="1" y1="0" y2="0">
              <stop offset="0" stopColor="#000" stopOpacity=".34" /><stop offset=".55" stopColor="#000" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="pl-rim" x1="0" x2="1" y1="0" y2="0">
              <stop offset=".72" stopColor="#fff" stopOpacity="0" /><stop offset="1" stopColor="#fff" stopOpacity=".5" />
            </linearGradient>
            <linearGradient id="pl-swoosh" x1="0" x2="1" y1="0" y2="0">
              <stop offset="0" stopColor="#fff" stopOpacity="0" /><stop offset=".7" stopColor="#fff" stopOpacity=".85" /><stop offset="1" stopColor={KIT} />
            </linearGradient>
            <radialGradient id="pl-ground" cx=".5" cy=".5" r=".5">
              <stop offset="0" stopColor="#000" stopOpacity=".42" /><stop offset="1" stopColor="#000" stopOpacity="0" />
            </radialGradient>
          </defs>

          <ellipse cx="120" cy="323" rx="84" ry="7" fill="url(#pl-ground)" />
          <ellipse className="pl-ballshadow" cx="222" cy="323" rx="26" ry="4.5" fill="url(#pl-ground)" />

          <g className="pl-root">
            {/* braccio lontano */}
            <g className="pl-torso"><Arm near={false} /></g>

            {/* gamba d'appoggio (lontana) */}
            <g transform="translate(-7 0)">
              <path d="M95 168 H121 C120 192 118 214 117.5 234 H98.5 C97.5 214 96 192 95 168 Z" fill={SKIN_D} />
              <path d="M92 164 H124 C126 184 128 198 128 207 Q108 213 88 207 C88 198 90 184 92 164 Z" fill={SHORTS_D} />
              <path d="M98.5 234 H117.5 C119 248 116.5 270 113.5 297 H101.5 C99.5 270 97 248 98.5 234 Z" fill={KIT_D} />
              <rect x="98" y="244" width="19" height="3.6" fill="#e5ece7" /><rect x="98.4" y="251" width="18.2" height="2.2" fill="#e5ece7" />
              <Boot />
            </g>

            {/* busto, testa, pantaloncini alti (ruotano attorno all'anca) */}
            <g className="pl-torso">
              <path d="M109 66 H125 L128 86 C122 91 115 90 109 85 Z" fill={SKIN} />
              <path d="M104 90 C106 82 114 80 122 84 C132 88 137 98 135 110 C133 128 127 148 124 168 L96 168 C96 146 100 118 104 90 Z" fill={KIT} />
              <path d="M104 90 C106 82 114 80 122 84 C132 88 137 98 135 110 C133 128 127 148 124 168 L96 168 C96 146 100 118 104 90 Z" fill="url(#pl-shade)" />
              <path d="M131 92 C136 100 135 114 133 126" fill="none" stroke="#fff" strokeOpacity=".35" strokeWidth="2" strokeLinecap="round" />
              <path d="M101 126 L131 112" stroke="#f4f7f4" strokeWidth="5" strokeOpacity=".9" />
              <path d="M110 83 C114 91 124 92 130 87" fill="none" stroke="#f4f7f4" strokeWidth="3.4" strokeLinecap="round" />
              <path d="M94 160 H126 L129 176 H91 Z" fill={SHORTS} />
              <path d="M94 160 H126 L129 176 H91 Z" fill="url(#pl-shade)" />
              <path d="M124 161 L127 176" stroke={KIT} strokeWidth="2.6" />
              {/* testa di profilo */}
              <circle cx="121" cy="52" r="16.5" fill={SKIN} />
              <ellipse cx="119" cy="63" rx="12" ry="9" fill={SKIN} />
              <path d="M135.5 52 C140 53 142.5 57 140 60 C138.5 61.5 136.5 61 135 60 Z" fill={SKIN} />
              <ellipse cx="113" cy="55" rx="3.4" ry="5" fill={SKIN_D} />
              <path d="M104.5 54 C102 36 117 31 130 37 C136 40 138 46 137 50 C132 43 122 42 116 48 C113 51 112 55 114 60 C109 60 105.5 58 104.5 54 Z" fill="#18120e" />
              <path d="M127 48 L134.5 47" stroke="#18120e" strokeWidth="2.2" strokeLinecap="round" />
              <ellipse cx="130.5" cy="53" rx="1.9" ry="2.5" fill="#18120e" /><circle cx="131.1" cy="52.2" r=".7" fill="#fff" />
              <path d="M129.5 66.5 C131.5 67.3 133.5 67.1 134.6 66.2" fill="none" stroke="#b9785a" strokeWidth="1.2" strokeLinecap="round" />
              <path d="M133 39 C138 43 139 51 136 57" fill="none" stroke="#fff" strokeOpacity=".28" strokeWidth="2" strokeLinecap="round" />
              <g className="pl-torsoarms-near"><Arm near /></g>
            </g>

            {/* gamba che calcia: anca → ginocchio → caviglia */}
            <g className="pl-thigh">
              <path d="M95 168 H121 C120 192 118 214 117.5 234 H98.5 C97.5 214 96 192 95 168 Z" fill={SKIN} />
              <path d="M95 168 H121 C120 192 118 214 117.5 234 H98.5 C97.5 214 96 192 95 168 Z" fill="url(#pl-shade)" />
              <path d="M92 164 H124 C126 184 128 198 128 207 Q108 213 88 207 C88 198 90 184 92 164 Z" fill={SHORTS} />
              <path d="M92 164 H124 C126 184 128 198 128 207 Q108 213 88 207 C88 198 90 184 92 164 Z" fill="url(#pl-shade)" />
              <path d="M123 170 C125 186 127 198 127 206" fill="none" stroke={KIT} strokeWidth="2.6" />
              <g className="pl-shin">
                <ellipse cx="108" cy="234" rx="10.5" ry="9" fill={SKIN} />
                <path d="M98.5 234 H117.5 C119 248 116.5 270 113.5 297 H101.5 C99.5 270 97 248 98.5 234 Z" fill={KIT} />
                <path d="M98.5 234 H117.5 C119 248 116.5 270 113.5 297 H101.5 C99.5 270 97 248 98.5 234 Z" fill="url(#pl-shade)" />
                <rect x="98" y="244" width="19" height="3.6" fill="#f4f7f4" /><rect x="98.4" y="251" width="18.2" height="2.2" fill="#f4f7f4" />
                <g className="pl-foot"><Boot /></g>
              </g>
            </g>
          </g>

          {/* effetti: scia del calcio, esplosione all'impatto, polvere d'erba */}
          <path className="pl-swoosh" d="M26 262 A135 135 0 0 0 190 296" fill="none" stroke="url(#pl-swoosh)" strokeWidth="9" strokeLinecap="round" pathLength="100" />
          <g className="pl-burst" style={{ transformOrigin: "204px 312px" }}>
            <circle cx="204" cy="312" r="15" fill="none" stroke={KIT} strokeWidth="3" />
            <g stroke="#fff" strokeWidth="2.4" strokeLinecap="round">
              <path d="M204 286 v-12" /><path d="M222 292 l8 -8" /><path d="M186 292 l-8 -8" /><path d="M230 312 h12" /><path d="M178 312 h-12" /><path d="M224 330 l8 6" />
            </g>
          </g>
          <g className="pl-dust" fill="#cdeed8">
            <circle cx="200" cy="318" r="2.6" /><circle cx="192" cy="320" r="2" /><circle cx="210" cy="320" r="2.2" /><circle cx="186" cy="317" r="1.6" /><circle cx="216" cy="316" r="1.6" />
          </g>
        </svg>

        <span className="intro-flash" />
        {/* eslint-disable @next/next/no-img-element */}
        <img className="intro-ball ghost g2" src="/ball.svg" alt="" />
        <img className="intro-ball ghost g1" src="/ball.svg" alt="" />
        <img className="intro-ball" src="/ball.svg" alt="" />
        {/* eslint-enable @next/next/no-img-element */}
      </div>
      <IntroControl />
    </div>
  );
}

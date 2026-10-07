import BallShape from "./BallShape";
import IntroControl from "./IntroControl";
import "./intro-anim.css";

/**
 * Intro di apertura (~2,5 s): stadio di notte, un calciatore prende la rincorsa e calcia il pallone verso lo
 * schermo; il pallone si ingrandisce e svela il sito. Le pose del calciatore (anca, ginocchio, caviglia, braccia)
 * sono keyframe generati da scripts/intro-anim.mjs: le misure qui sotto devono combaciare con quelle dello script.
 * Si vede una volta per sessione (script nell'<head> + sessionStorage), si salta con un tocco o con Esc,
 * e si nasconde da sola via CSS anche se il JavaScript non parte.
 */

// viewBox comune ai due livelli: con "slice" la scena riempie lo schermo sia in verticale sia in orizzontale
const VB = "-110 -190 620 580";
const HORIZON = 150;
const GROUND = 210;

// strisce del prato in prospettiva (convergono verso un punto di fuga sopra l'orizzonte)
const VP = { x: 200, y: 112 };
const BOTTOM = 500;
const atHorizon = (x: number) => VP.x + ((x - VP.x) * (HORIZON - VP.y)) / (BOTTOM - VP.y);
const STRIPES = Array.from({ length: 13 }, (_, i) => {
  const a = -1000 + i * 2 * 100, b = a + 100;
  return `${atHorizon(a)},${HORIZON} ${atHorizon(b)},${HORIZON} ${b},${BOTTOM} ${a},${BOTTOM}`;
});

// pubblico in tribuna: puntini chiari pseudo-casuali (sempre uguali, niente differenze server/client)
const rnd = (n: number) => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
const CROWD = Array.from({ length: 170 }, (_, i) => {
  const y = HORIZON - 64 + rnd(i + 0.5) * 52;
  return [+(-110 + rnd(i) * 620).toFixed(1), +y.toFixed(1), +(0.6 + rnd(i + 0.2) * 1.1).toFixed(2), +(0.08 + rnd(i + 0.9) * 0.3).toFixed(2)];
});

const SKIN = ["#c98a62", "#a06a4a"];
const KIT = ["#2ee66b", "#1eae52"];
const SHORTS = ["#f1f5f2", "#c3cec7"];
const BOOT = ["#f6f8f6", "#b9c4bd"];

/** Gamba: coscia (ruota all'anca) → stinco (al ginocchio) → scarpino (alla caviglia). s = "N" vicina, "F" lontana. */
function Leg({ s }: { s: "N" | "F" }) {
  const d = s === "N" ? 0 : 1;
  return (
    <g className={`ip-th${s}`}>
      <line x1="0" y1="8" x2="0" y2="48" stroke={SKIN[d]} strokeWidth="15" strokeLinecap="round" />
      <path d="M-11 -6 H11 L12 24 Q0 28 -11 24 Z" fill={SHORTS[d]} />
      <g className={`ip-kn${s}`}>
        <ellipse cx="-3.5" cy="13" rx="7" ry="11.5" fill={SKIN[d]} />
        <line x1="0" y1="0" x2="0" y2="40" stroke={SKIN[d]} strokeWidth="12" strokeLinecap="round" />
        <path d="M-7 15 Q-9 30 -6 44 H6 Q7 30 6.5 15 Z" fill={KIT[d]} />
        <rect x="-7.6" y="15" width="14.2" height="3.2" fill={SHORTS[d]} />
        <g className={`ip-an${s}`}>
          <path d="M-6 -7 H5 C7 -4 10 -2 16 -1 C21 0 23 3 22 5 L21 6 H-7 C-9 4 -9 -3 -6 -7 Z" fill={BOOT[d]} />
          <path d="M-7.5 5 H21.5 L20.5 7.5 H-7 Z" fill="#101a14" />
          <path d="M-3 0 C3 2 9 1.5 15 0" fill="none" stroke={KIT[d]} strokeWidth="1.8" strokeLinecap="round" />
        </g>
      </g>
    </g>
  );
}

/** Braccio: omero (ruota alla spalla) → avambraccio (al gomito). */
function Arm({ s }: { s: "N" | "F" }) {
  const d = s === "N" ? 0 : 1;
  return (
    <g className={`ip-ua${s}`}>
      <line x1="0" y1="6" x2="0" y2="26" stroke={SKIN[d]} strokeWidth="8.5" strokeLinecap="round" />
      <path d="M-6.5 -4 Q0 -8 6.5 -4 L6 14 Q0 16 -6 14 Z" fill={KIT[d]} />
      <g className={`ip-fa${s}`}>
        <line x1="0" y1="0" x2="0" y2="22" stroke={SKIN[d]} strokeWidth="7.5" strokeLinecap="round" />
        <circle cx="0.5" cy="26" r="4.6" fill={SKIN[d]} />
      </g>
    </g>
  );
}

export default function IntroSplash({ title, tagline }: { title: string; tagline: string }) {
  return (
    <div className="intro-splash" aria-hidden="true">
      {/* livello 1: stadio e prato */}
      <svg className="ip-layer" viewBox={VB} preserveAspectRatio="xMidYMid slice">
        <defs>
          <linearGradient id="ip-sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#020805" />
            <stop offset="1" stopColor="#0b2617" />
          </linearGradient>
          <linearGradient id="ip-grass" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#0d3a20" />
            <stop offset=".35" stopColor="#14552e" />
            <stop offset="1" stopColor="#0a2c18" />
          </linearGradient>
          <radialGradient id="ip-flood">
            <stop offset="0" stopColor="#f4fff7" stopOpacity=".95" />
            <stop offset=".08" stopColor="#d9ffe6" stopOpacity=".55" />
            <stop offset=".35" stopColor="#2ee66b" stopOpacity=".12" />
            <stop offset="1" stopColor="#2ee66b" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="ip-pool" cx=".5" cy=".5" r=".5">
            <stop offset="0" stopColor="#3dff86" stopOpacity=".2" />
            <stop offset="1" stopColor="#3dff86" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="ip-fog" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#0b2617" stopOpacity="1" />
            <stop offset="1" stopColor="#0b2617" stopOpacity="0" />
          </linearGradient>
        </defs>
        <rect x="-200" y="-250" width="800" height="750" fill="url(#ip-sky)" />
        {/* tribuna con il pubblico (rumore) e la luce dei riflettori */}
        <path d={`M-200 ${HORIZON - 70} L600 ${HORIZON - 70} L600 ${HORIZON} L-200 ${HORIZON} Z`} fill="#06150c" />
        <g className="ip-crowd">{CROWD.map(([x, y, r, o], i) => <circle key={i} cx={x} cy={y} r={r} fill={i % 7 ? "#9fd8b2" : "#f4fff7"} opacity={o} />)}</g>
        <rect x="-200" y={HORIZON - 8} width="800" height="8" fill="#0a1f13" />
        <rect x="-200" y={HORIZON - 9} width="800" height="1.2" fill="#2ee66b" opacity=".55" />
        <g className="ip-floods">
          <circle cx="-150" cy="-150" r="340" fill="url(#ip-flood)" />
          <circle cx="550" cy="-150" r="340" fill="url(#ip-flood)" />
        </g>
        {/* prato */}
        <rect x="-200" y={HORIZON} width="800" height={BOTTOM - HORIZON} fill="url(#ip-grass)" />
        <g fill="#ffffff" opacity=".05">{STRIPES.map((p) => <polygon key={p} points={p} />)}</g>
        <path d={`M-200 ${GROUND + 28} L600 ${GROUND + 28}`} stroke="#e8f5ec" strokeOpacity=".5" strokeWidth="2.2" />
        <ellipse cx="225" cy={GROUND} rx="230" ry="60" fill="url(#ip-pool)" />
        <rect x="-200" y={HORIZON} width="800" height="30" fill="url(#ip-fog)" />
      </svg>

      <div className="ip-title">
        <span>{title}</span>
        <small>{tagline}</small>
      </div>

      {/* livello 2: calciatore e pallone (stesso viewBox) */}
      <svg className="ip-layer ip-act" viewBox={VB} preserveAspectRatio="xMidYMid slice" overflow="visible">
        <defs>
          <radialGradient id="ip-shade" cx=".36" cy=".3" r=".75">
            <stop offset="0" stopColor="#fff" stopOpacity="0" />
            <stop offset=".55" stopColor="#0b2617" stopOpacity=".08" />
            <stop offset="1" stopColor="#020805" stopOpacity=".6" />
          </radialGradient>
          <radialGradient id="ip-shadow">
            <stop offset="0" stopColor="#000" stopOpacity=".55" />
            <stop offset="1" stopColor="#000" stopOpacity="0" />
          </radialGradient>
        </defs>
        <g className="ip-cam">
          <ellipse className="ip-pshadow" cx="4" cy="0" rx="34" ry="5" fill="url(#ip-shadow)" />
          <ellipse className="ip-bshadow" cx="0" cy="0" rx="14" ry="3.2" fill="url(#ip-shadow)" />

          {/* calciatore: l'origine del gruppo è l'anca */}
          <g className="ip-player">
            <g className="ip-body">
              {/* le braccia ruotano col busto: tre gruppi con la stessa animazione per l'ordine di disegno */}
              <g className="ip-torso"><Arm s="F" /></g>
              <Leg s="F" />
              <g className="ip-torso">
                <path d="M-10 6 C-12 -14 -15 -38 -11 -56 C-8 -64 6 -66 11 -58 C15 -44 14 -22 10 6 Z" fill={KIT[0]} />
                <path d="M-13 -5 H13 L14 9 Q0 13 -14 9 Z" fill={SHORTS[0]} />
                <path d="M-9.5 -52 C-13 -36 -11 -16 -9 2" fill="none" stroke="#0b2617" strokeOpacity=".18" strokeWidth="4" strokeLinecap="round" />
                <g className="ip-head">
                  <line x1="0" y1="2" x2="1" y2="-8" stroke={SKIN[0]} strokeWidth="8" strokeLinecap="round" />
                  <circle cx="2" cy="-16" r="10.5" fill={SKIN[0]} />
                  <path d="M11.5 -18 L14.5 -12.5 L11 -11.5 Z" fill={SKIN[0]} />
                  <path d="M-8.8 -10 C-11.5 -18 -8 -27.5 1 -27.8 C8 -28 12.5 -24 12.6 -20.5 C9 -22.5 5 -22 2.5 -20 C1 -17 -1.5 -15 -4 -14.5 C-5.5 -12 -6.5 -10.5 -8.8 -10 Z" fill="#1c140f" />
                  <circle cx="-1.2" cy="-14" r="2.4" fill={SKIN[1]} />
                  <circle cx="8.3" cy="-17.6" r="1.1" fill="#1c140f" />
                </g>
              </g>
              <Leg s="N" />
              <g className="ip-torso"><Arm s="N" /></g>
            </g>
          </g>

          {/* pallone: il gruppo esterno vola e cresce, quello interno gira, l'ombreggiatura resta ferma */}
          <g className="ip-ball">
            <circle r="11" fill="#f7faf8" />
            <g className="ip-spin" color="#0e1712">
              <svg x="-11.6" y="-11.6" width="23.2" height="23.2" viewBox="0 0 24 24" overflow="hidden">
                <BallShape id="ip-ball-clip" />
              </svg>
            </g>
            <circle r="11" fill="url(#ip-shade)" />
          </g>

          <g className="ip-impact">
            <circle className="ip-ring" r="8" fill="none" stroke="#e9fff1" strokeWidth="2" />
            <g className="ip-turf" fill="#2b7a45">
              <circle cx="0" cy="0" r="1.6" style={{ ["--dx" as string]: "-22px", ["--dy" as string]: "-18px" }} />
              <circle cx="0" cy="0" r="1.2" style={{ ["--dx" as string]: "-12px", ["--dy" as string]: "-26px" }} />
              <circle cx="0" cy="0" r="1.4" style={{ ["--dx" as string]: "6px", ["--dy" as string]: "-22px" }} />
              <circle cx="0" cy="0" r="1" style={{ ["--dx" as string]: "18px", ["--dy" as string]: "-14px" }} />
              <circle cx="0" cy="0" r="1.3" style={{ ["--dx" as string]: "-28px", ["--dy" as string]: "-8px" }} />
              <circle cx="0" cy="0" r="0.9" style={{ ["--dx" as string]: "-4px", ["--dy" as string]: "-30px" }} />
            </g>
          </g>
        </g>
      </svg>

      <IntroControl />
    </div>
  );
}

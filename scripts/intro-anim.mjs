// Genera components/intro-anim.css: i keyframe dell'intro (rincorsa, calcio, volo del pallone).
// Il calciatore è uno scheletro 2D (anca → ginocchio → caviglia, spalla → gomito): qui si descrivono le pose
// nel tempo, si calcolano le posizioni con la cinematica diretta (così il piede d'appoggio non scivola e il
// pallone sta esattamente dove arriva il collo del piede) e si campionano in keyframe CSS.
// Uso: node scripts/intro-anim.mjs   (le misure devono combaciare con components/IntroSplash.tsx)
import { writeFileSync } from "node:fs";

// ---- misure dello scheletro (unità del viewBox) ----
const THIGH = 48, SHIN = 46, GROUND = 210, BALL_R = 11;
const SOLE = [[-7, 6], [14, 6], [21, 4]]; // tallone, pianta, punta (rispetto alla caviglia)
const INSTEP = [11, 0];                  // collo del piede: dove colpisce il pallone

// ---- tempi (secondi) ----
const RUN_END = 1.15; // il piede d'appoggio tocca terra accanto al pallone
const BACK = 1.28;    // massimo caricamento della gamba
const HIT = 1.425;    // impatto
const FOLLOW = 1.7;   // gamba alta a fine tiro
const SETTLE = 2.15;  // ricaduta
const END = 2.35;     // fine animazione del calciatore
const FLIGHT = 0.9;   // durata del volo del pallone verso lo schermo
const CYCLE = 0.62;   // durata di un passo doppio in corsa
const FPS = 40;

// ---- interpolazione ----
const lerp = (a, b, k) => a + (b - a) * k;
const smooth = (k) => k * k * (3 - 2 * k);
function cr(p0, p1, p2, p3, k) { // Catmull-Rom
  const k2 = k * k, k3 = k2 * k;
  return 0.5 * (2 * p1 + (-p0 + p2) * k + (2 * p0 - 5 * p1 + 4 * p2 - p3) * k2 + (-p0 + 3 * p1 - 3 * p2 + p3) * k3);
}
/** keys: [[t, v], ...] ordinati; curva morbida che passa per tutti i punti */
function curve(keys, t, loop = false) {
  const n = keys.length;
  if (loop) {
    t = ((t % 1) + 1) % 1;
    let i = 0; while (i < n - 1 && keys[i + 1][0] <= t) i++;
    const a = keys[i], b = i + 1 < n ? keys[i + 1] : [1 + keys[0][0], keys[0][1]];
    const p0 = keys[(i - 1 + n) % n][1], p3 = keys[(i + 2) % n][1];
    return cr(p0, a[1], b[1], p3, (t - a[0]) / (b[0] - a[0]));
  }
  if (t <= keys[0][0]) return keys[0][1];
  if (t >= keys[n - 1][0]) return keys[n - 1][1];
  let i = 0; while (keys[i + 1][0] < t) i++;
  const a = keys[i], b = keys[i + 1];
  const p0 = (keys[i - 1] ?? a)[1], p3 = (keys[i + 2] ?? b)[1];
  return cr(p0, a[1], b[1], p3, (t - a[0]) / (b[0] - a[0]));
}

// ---- ciclo di corsa (fase 0 = appoggio di quella gamba); angoli in gradi, positivo = verso dietro ----
const RUN_THIGH = [[0, -24], [0.14, -10], [0.3, 14], [0.42, 22], [0.58, 2], [0.74, -38], [0.88, -44]];
const RUN_KNEE = [[0, 14], [0.14, 34], [0.3, 20], [0.42, 72], [0.58, 112], [0.74, 82], [0.88, 34]];
const RUN_ANKLE = [[0, 4], [0.14, -8], [0.3, 22], [0.42, 34], [0.58, 22], [0.74, 6], [0.88, 0]];
const runLeg = (p) => ({ th: curve(RUN_THIGH, p, true), kn: curve(RUN_KNEE, p, true), an: curve(RUN_ANKLE, p, true) });

// gamba lontana (d'appoggio) in fase 0 a RUN_END: arriva sul pallone col piede giusto
const PHASE0 = 1 - (RUN_END / CYCLE) % 1;
const phaseFar = (t) => t / CYCLE + PHASE0;

/** posa a fine corsa campionata dal ciclo (per raccordare le fasi senza scatti) */
function runPose(t) {
  const pf = phaseFar(t), pn = pf + 0.5;
  const far = runLeg(pf), near = runLeg(pn);
  const sw = Math.sin(2 * Math.PI * pn);
  return {
    thN: near.th, knN: near.kn, anN: near.an, thF: far.th, knF: far.kn, anF: far.an,
    torso: 13 + 2 * Math.cos(4 * Math.PI * pn), head: -10,
    // le braccia vanno in opposizione alla gamba dello stesso lato
    uaN: -near.th * 0.85 + 4, faN: -78 + 14 * sw, uaF: -far.th * 0.85 + 4, faF: -78 - 14 * sw,
  };
}

// pose chiave del tiro (dopo la corsa)
const KICK = {
  thN: [[BACK, 34], [HIT - 0.035, 2], [HIT, -24], [HIT + 0.08, -56], [FOLLOW, -78], [FOLLOW + 0.15, -62], [SETTLE, -22], [END, -18]],
  knN: [[BACK, 118], [HIT - 0.035, 88], [HIT, 60], [HIT + 0.08, 16], [FOLLOW, 6], [FOLLOW + 0.15, 14], [SETTLE, 24], [END, 20]],
  anN: [[BACK, 38], [HIT - 0.035, 36], [HIT, 32], [HIT + 0.08, 30], [FOLLOW, 26], [FOLLOW + 0.15, 18], [SETTLE, 6], [END, 4]],
  thF: [[BACK, -16], [HIT, -4], [HIT + 0.08, 0], [FOLLOW, 8], [SETTLE, 4], [END, 2]],
  knF: [[BACK, 26], [HIT, 30], [HIT + 0.08, 26], [FOLLOW, 14], [SETTLE, 18], [END, 16]],
  anF: [[BACK, -4], [HIT, -4], [FOLLOW, -2], [SETTLE, -2], [END, -2]],
  torso: [[BACK, 4], [HIT, 9], [HIT + 0.08, 0], [FOLLOW, -14], [SETTLE, -4], [END, -2]],
  head: [[BACK, -6], [HIT, -4], [HIT + 0.1, 12], [FOLLOW, 20], [SETTLE, 14], [END, 12]],
  uaN: [[BACK, 38], [HIT, 46], [FOLLOW, 30], [SETTLE, 10], [END, 8]],
  faN: [[BACK, -40], [HIT, -30], [FOLLOW, -40], [SETTLE, -30], [END, -28]],
  uaF: [[BACK, -62], [HIT, -96], [HIT + 0.08, -100], [FOLLOW, -84], [SETTLE, -30], [END, -20]],
  faF: [[BACK, -30], [HIT, -14], [FOLLOW, -20], [SETTLE, -40], [END, -40]],
};
const JOINTS = Object.keys(KICK);

function pose(t) {
  if (t <= RUN_END) return runPose(t);
  // raccordo: due campioni del ciclo prima di RUN_END danno la tangente giusta all'inizio del tiro
  const out = {};
  for (const j of JOINTS) {
    const keys = [[RUN_END - 0.06, runPose(RUN_END - 0.06)[j]], [RUN_END, runPose(RUN_END)[j]], ...KICK[j]];
    out[j] = curve(keys, t);
  }
  return out;
}

// ---- cinematica diretta ----
const rad = (d) => (d * Math.PI) / 180;
const rot = ([x, y], d) => { const c = Math.cos(rad(d)), s = Math.sin(rad(d)); return [x * c - y * s, x * s + y * c]; };
const add = (a, b) => [a[0] + b[0], a[1] + b[1]];
function foot(th, kn, an, p) {
  const knee = rot([0, THIGH], th);
  const ankle = add(knee, rot([0, SHIN], th + kn));
  return add(ankle, rot(p, th + kn + an));
}
const lowest = (th, kn, an) => SOLE.map((p) => foot(th, kn, an, p)).reduce((a, b) => (b[1] > a[1] ? b : a));

// ---- simulazione: posizione dell'anca nel mondo ----
const DT = 1 / FPS;
const N = Math.round(END * FPS);
const frames = [];
// velocità di corsa = velocità media con cui il piede d'appoggio scorre all'indietro rispetto all'anca
let speed;
{
  let sum = 0, cnt = 0;
  for (let p = 0.02; p < 0.28; p += 0.01) {
    const a = runLeg(p), b = runLeg(p + 0.01);
    sum += (lowest(a.th, a.kn, a.an)[0] - lowest(b.th, b.kn, b.an)[0]) / (0.01 * CYCLE); cnt++;
  }
  speed = sum / cnt;
}
let hipX = 0, anchor = null;
for (let i = 0; i <= N; i++) {
  const t = i * DT, P = pose(t);
  const fN = lowest(P.thN, P.knN, P.anN), fF = lowest(P.thF, P.knF, P.anF);
  let hipY;
  if (t <= RUN_END) {
    hipX = speed * t;
    // in corsa: il piede più basso tocca terra, più una piccola fase di volo
    const flight = 2.2 * Math.max(0, Math.sin(4 * Math.PI * (phaseFar(t) - 0.28)));
    hipY = GROUND - Math.max(fN[1], fF[1]) - flight;
  } else {
    // nel tiro il piede d'appoggio (lontano) resta inchiodato: l'anca si muove sopra di lui
    if (!anchor) anchor = hipX + fF[0];
    hipX = anchor - fF[0];
    hipY = GROUND - fF[1];
  }
  frames.push({ t, P, hipX, hipY });
}
// a fine corsa il raccordo può far "saltare" l'anca: lo spalmo sui frame successivi
{
  const i0 = Math.round(RUN_END * FPS);
  const prev = frames[i0 - 1], cur = frames[i0 + 1];
  const expected = prev.hipX + 2 * speed * DT;
  const jump = cur.hipX - expected;
  for (let i = i0 + 1; i <= N; i++) frames[i].hipX -= jump * (1 - smooth(Math.min(1, (i - i0) / (0.25 * FPS))));
}

// pallone: dove arriva il collo del piede al momento dell'impatto
const hitF = frames[Math.round(HIT * FPS)];
const inst = add([hitF.hipX, hitF.hipY], foot(hitF.P.thN, hitF.P.knN, hitF.P.anN, INSTEP));
const ballX0 = inst[0] + BALL_R * 0.85;
// sposto tutto perché il pallone stia a x = 232 (leggermente a destra del centro)
const SHIFT = 232 - ballX0;
for (const f of frames) f.hipX += SHIFT;
const BX = 232, BY = GROUND - BALL_R;

console.log(`velocità corsa ${speed.toFixed(0)} u/s, partenza x=${frames[0].hipX.toFixed(0)}, anca a fine corsa x=${frames[Math.round(RUN_END * FPS)].hipX.toFixed(0)}`);
console.log(`collo del piede all'impatto y=${inst[1].toFixed(1)} (centro pallone ${BY}, terra ${GROUND})`);
for (const f of frames.filter((f) => Math.abs(f.t - HIT) < 0.08)) {
  const lo = add([f.hipX, f.hipY], lowest(f.P.thN, f.P.knN, f.P.anN));
  const ins = add([f.hipX, f.hipY], foot(f.P.thN, f.P.knN, f.P.anN, INSTEP));
  console.log(`  t=${f.t.toFixed(3)} punta più bassa y=${lo[1].toFixed(1)} collo=(${ins[0].toFixed(0)},${ins[1].toFixed(1)})`);
}
for (const f of frames.filter((_, i) => i % 4 === 0)) {
  const fN = add([f.hipX, f.hipY], lowest(f.P.thN, f.P.knN, f.P.anN));
  console.log(`t=${f.t.toFixed(2)} anca=(${f.hipX.toFixed(0)},${f.hipY.toFixed(0)}) piede calciante y=${fN[1].toFixed(0)}`);
}

// ---- semplificazione: tolgo i keyframe che l'interpolazione lineare già ricostruisce ----
function simplify(samples, tol) { // samples: [[t, [v1, v2...]]]
  const keep = [0];
  let a = 0;
  for (let b = 2; b < samples.length; b++) {
    const [ta, va] = samples[a], [tb, vb] = samples[b];
    let ok = true;
    for (let m = a + 1; m < b && ok; m++) {
      const [tm, vm] = samples[m], k = (tm - ta) / (tb - ta);
      ok = vm.every((v, d) => Math.abs(lerp(va[d], vb[d], k) - v) <= tol);
    }
    if (!ok) { keep.push(b - 1); a = b - 1; }
  }
  keep.push(samples.length - 1);
  return keep.map((i) => samples[i]);
}
const f1 = (n) => (Math.abs(n) < 0.05 ? "0" : n.toFixed(1).replace(/\.0$/, ""));
const pct = (t, dur) => `${+((t / dur) * 100).toFixed(2)}%`;
function keyframes(name, samples, fmt, dur, tol = 0.8) {
  const s = simplify(samples, tol);
  return `@keyframes ${name}{${s.map(([t, v]) => `${pct(t, dur)}{transform:${fmt(v)}}`).join("")}}`;
}

const css = [];
css.push(`/* Generato da scripts/intro-anim.mjs: non modificare a mano. */`);
const J = (j, fmt, tol) => keyframes(`ip-${j}`, frames.map((f) => [f.t, [f.P[j]]]), fmt, END, tol);
css.push(keyframes("ip-body", frames.map((f) => [f.t, [f.hipX, f.hipY]]), ([x, y]) => `translate(${f1(x)}px,${f1(y)}px)`, END, 0.4));
css.push(keyframes("ip-pshadow", frames.map((f) => [f.t, [f.hipX]]), ([x]) => `translate(${f1(x)}px,${GROUND}px)`, END, 0.6));
css.push(J("torso", ([a]) => `rotate(${f1(a)}deg)`));
css.push(J("head", ([a]) => `translate(3px,-62px) rotate(${f1(a)}deg)`));
for (const s of ["N", "F"]) {
  css.push(J(`th${s}`, ([a]) => `rotate(${f1(a)}deg)`));
  css.push(J(`kn${s}`, ([a]) => `translate(0,${THIGH}px) rotate(${f1(a)}deg)`));
  css.push(J(`an${s}`, ([a]) => `translate(0,${SHIN}px) rotate(${f1(a)}deg)`));
  css.push(J(`ua${s}`, ([a]) => `translate(2px,-54px) rotate(${f1(a)}deg)`));
  css.push(J(`fa${s}`, ([a]) => `translate(0,26px) rotate(${f1(a)}deg)`));
}

// ---- volo del pallone: si alza, gira e arriva addosso allo schermo (crescita prospettica 1/(1-u)) ----
const BALL_END = HIT + FLIGHT;
const CX = 215, CY = 100; // centro della scena: lì il pallone "colpisce" la camera
const ball = [], bshadow = [];
for (let i = 0; i <= Math.round(BALL_END * FPS); i++) {
  const t = i * DT, u = Math.max(0, t - HIT);
  let x = BX, y = BY, sx = 1, sy = 1, h = 0;
  if (t > HIT) {
    const k = u / FLIGHT;
    const sc = 1 / (1 - 0.985 * k);          // 1 → ~65
    h = 330 * u - 260 * u * u;               // altezza "reale" sopra il prato
    const px = BX + 150 * u, py = BY - h;     // traiettoria vista di lato
    const pull = (1 - 1 / sc) ** 2;               // avvicinandosi converge al centro dello schermo
    x = lerp(px, CX, pull); y = lerp(py, CY, pull);
    // schiacciamento all'impatto
    const sq = Math.max(0, 1 - u / 0.07);
    sx = sc * (1 - 0.18 * sq); sy = sc * (1 + 0.12 * sq);
  }
  ball.push([t, [x, y, sx, sy]]);
  bshadow.push([t, [BX + 150 * u, Math.max(0, 1 - h / 90), t > HIT ? Math.max(0.35, 1 - h / 160) : 1]]);
}
const bDur = BALL_END;
css.push(keyframes("ip-ball", ball, ([x, y, sx, sy]) => `translate(${f1(x)}px,${f1(y)}px) scale(${sx.toFixed(3)},${sy.toFixed(3)})`, bDur, 0.35));
{
  const s = simplify(bshadow, 0.02);
  css.push(`@keyframes ip-bshadow{${s.map(([t, [x, o, k]]) => `${pct(t, bDur)}{transform:translate(${f1(x)}px,${GROUND}px) scale(${k.toFixed(2)});opacity:${o.toFixed(2)}}`).join("")}}`);
}
// rotazione: ferma fino all'impatto, poi tanta e via via più lenta
css.push(`@keyframes ip-spin{0%,${pct(HIT, bDur)}{transform:rotate(0)}${pct(HIT + 0.25, bDur)}{transform:rotate(420deg)}100%{transform:rotate(760deg)}}`);

// tempi condivisi con il CSS scritto a mano
css.push(`.intro-splash{--ip-dur:${END}s;--ip-ball-dur:${bDur.toFixed(2)}s;--ip-hit:${HIT}s;--ip-out:${(BALL_END - 0.08).toFixed(2)}s}`);
css.push(`.ip-impact{transform:translate(${BX - BALL_R}px,${BY + 2}px)}`);

writeFileSync(new URL("../components/intro-anim.css", import.meta.url), css.join("\n") + "\n");
console.log(`scritto components/intro-anim.css (${css.join("\n").length} byte)`);

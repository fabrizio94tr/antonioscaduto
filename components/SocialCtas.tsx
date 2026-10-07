import { getSettings } from "@/lib/settings";

const LABELS: [string, string, string][] = [
  ["facebook", "Seguici su Facebook", "f"], ["x", "Seguici su X", "𝕏"], ["instagram", "Seguici su Instagram", "◎"],
  ["youtube", "Iscriviti su YouTube", "▶"], ["telegram", "Canale Telegram", "✈"],
];

export default async function SocialCtas() {
  const s = await getSettings();
  const list = LABELS.filter(([k]) => s[k]);
  if (!list.length) return null;
  return (
    <div style={{ display: "grid", gap: 8 }} data-reveal>
      {list.map(([k, label, icon]) => (
        <a key={k} href={s[k]} target="_blank" rel="noopener noreferrer" className={`cta-btn cta-${k}`}>{label} <span>{icon}</span></a>
      ))}
    </div>
  );
}

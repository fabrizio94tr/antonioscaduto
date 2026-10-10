import type { Reliability } from "@/lib/types";

const INFO: Record<Reliability, { label: string; hint: string }> = {
  ufficiale: { label: "Ufficiale", hint: "Comunicato ufficiale del club o confermato" },
  fonte: { label: "Fonte diretta", hint: "Informazione da fonte diretta" },
  indiscrezione: { label: "Indiscrezione", hint: "Indiscrezione di mercato, non ancora confermata" },
};

/** Badge "indice di affidabilità" di una notizia. Non mostra nulla se non impostato. */
export default function ReliabilityBadge({ value }: { value?: Reliability | null }) {
  if (!value || !INFO[value]) return null;
  return (
    <span className={`rel rel-${value}`} title={INFO[value].hint}>
      <i aria-hidden />{INFO[value].label}
    </span>
  );
}

// Data e ora della redazione sempre nel fuso di Roma, sia nel browser sia sul server (Vercel gira in UTC).
const TZ = "Europe/Rome";

const parts = (d: Date) => {
  const f = new Intl.DateTimeFormat("en-GB", { timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit", hourCycle: "h23" });
  return Object.fromEntries(f.formatToParts(d).map((p) => [p.type, p.value])) as Record<string, string>;
};

/** ISO → "AAAA-MM-GGTHH:MM" nell'ora di Roma (valore per <input type="datetime-local">). */
export function toRomeInput(iso: string) {
  const p = parts(new Date(iso));
  return `${p.year}-${p.month}-${p.day}T${p.hour}:${p.minute}`;
}

/** "AAAA-MM-GGTHH:MM" letto come ora di Roma → ISO UTC. */
export function fromRomeInput(local: string) {
  const [d, t = "00:00"] = local.split("T");
  const [y, m, g] = d.split("-").map(Number);
  const [h, min] = t.split(":").map(Number);
  const guess = Date.UTC(y, m - 1, g, h, min);
  // scarto tra l'ora di Roma e UTC in quel momento (1 o 2 ore a seconda dell'ora legale)
  const p = parts(new Date(guess));
  const offset = Date.UTC(+p.year, +p.month - 1, +p.day, +p.hour, +p.minute) - guess;
  return new Date(guess - offset).toISOString();
}

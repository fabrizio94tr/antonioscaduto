/** Nome gigante sull'hero (stile "GILA"): primo tag, altrimenti ciò che precede i due punti nel titolo. */
export function heroName(title: string, tags?: string[] | null, fallback = ""): string {
  const t = tags?.find((x) => x.length <= 16);
  if (t) return t;
  const head = title.split(/[:“"]/)[0]?.trim() ?? "";
  if (head && head.length <= 18 && head.length < title.length) return head;
  return fallback;
}

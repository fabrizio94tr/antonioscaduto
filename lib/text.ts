export const stripHtml = (s: string) =>
  s.replace(/<[^>]*>/g, " ").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&#8217;/g, "’").replace(/\s+/g, " ").trim();

export const wordCount = (s: string) => (stripHtml(s).match(/\S+/g) ?? []).length;
export const readingMinutes = (s: string) => Math.max(1, Math.round(wordCount(s) / 200));
export const autoDescription = (s: string, n = 155) => {
  const t = stripHtml(s);
  return t.length <= n ? t : t.slice(0, n).replace(/\s+\S*$/, "") + "…";
};

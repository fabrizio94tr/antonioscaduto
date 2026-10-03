const BASE = "https://api.football-data.org/v4";
export const scoresEnabled = Boolean(process.env.FOOTBALL_DATA_KEY);

export const LEAGUES: Record<string, string> = {
  SA: "Serie A", CL: "Champions League", PL: "Premier League", PD: "LaLiga", BL1: "Bundesliga", FL1: "Ligue 1",
};

async function api<T>(path: string): Promise<T | null> {
  try {
    const r = await fetch(BASE + path, { headers: { "X-Auth-Token": process.env.FOOTBALL_DATA_KEY! }, next: { revalidate: 60 } });
    return r.ok ? ((await r.json()) as T) : null;
  } catch { return null; }
}

export type Match = {
  id: number; utcDate: string; status: string; matchday?: number;
  homeTeam: { shortName?: string; name: string }; awayTeam: { shortName?: string; name: string };
  score: { fullTime: { home: number | null; away: number | null } };
};
export type Row = {
  position: number; team: { shortName?: string; name: string }; playedGames: number; won: number; draw: number; lost: number;
  goalsFor: number; goalsAgainst: number; points: number;
};

export async function getMatches(code: string): Promise<Match[]> {
  const day = (d: number) => new Date(Date.now() + d * 864e5).toISOString().slice(0, 10);
  const d = await api<{ matches: Match[] }>(`/competitions/${code}/matches?dateFrom=${day(-3)}&dateTo=${day(3)}`);
  return d?.matches ?? [];
}

export async function getStandings(code: string): Promise<Row[]> {
  const d = await api<{ standings: { type: string; table: Row[] }[] }>(`/competitions/${code}/standings`);
  return d?.standings?.find((s) => s.type === "TOTAL")?.table ?? [];
}

import { cache } from "react";
import { hasSupabase, supabasePublic } from "./supabase";
import type { Settings } from "./types";

export const DEFAULT_SETTINGS: Settings = {
  site_title: "Antonio Scaduto",
  tagline: "Il calcio a 360 gradi",
  meta_description: "Antonio Scaduto: notizie, calciomercato, interviste ed esclusive. Il calcio a 360 gradi.",
  og_image: "", contact_email: "", facebook: "", instagram: "", x: "", youtube: "", telegram: "",
  ga_id: "", gsc_verification: "", adsense_client: "", ad_slot_article: "", ad_slot_sidebar: "", ad_slot_home: "",
  sponsor_image: "", sponsor_link: "", newsletter_from: "",
  author_name: "Antonio Scaduto",
  author_bio: "Segue il calcio a 360 gradi da anni: dalle serie minori alla Serie A, con un occhio sempre aperto sul mercato.",
  author_photo: "",
  logo_spin: "",
  intro: "",
};

export const getSettings = cache(async function getSettings(): Promise<Settings> {
  if (!hasSupabase) return process.env.INTRO_PREVIEW === "1" ? { ...DEFAULT_SETTINGS, intro: "1" } : DEFAULT_SETTINGS;
  const sb = supabasePublic();
  const { data } = await sb.from("settings").select("key,value");
  const out = { ...DEFAULT_SETTINGS };
  for (const r of data ?? []) if (r.value !== "") out[r.key] = r.value;
  if (process.env.INTRO_PREVIEW === "1") out.intro = "1"; // solo per provare l'intro in locale
  return out;
});

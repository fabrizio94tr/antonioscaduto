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
};

export const getSettings = cache(async function getSettings(): Promise<Settings> {
  if (!hasSupabase) return DEFAULT_SETTINGS;
  const sb = supabasePublic();
  const { data } = await sb.from("settings").select("key,value");
  const out = { ...DEFAULT_SETTINGS };
  for (const r of data ?? []) if (r.value !== "") out[r.key] = r.value;
  return out;
});

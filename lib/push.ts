import webpush from "web-push";
import { supabaseServer } from "./supabase";
import { SITE_URL } from "./seo";

export const pushEnabled = Boolean(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY);

/** Invia una notifica a tutti gli iscritti (richiede sessione admin: la tabella è protetta). */
export async function sendPush(payload: { title: string; body?: string; path: string }) {
  if (!pushEnabled) return { sent: 0, skipped: true };
  webpush.setVapidDetails(`mailto:${process.env.VAPID_CONTACT ?? "info@antonioscaduto.com"}`, process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!, process.env.VAPID_PRIVATE_KEY!);
  const sb = await supabaseServer();
  const { data } = await sb.from("push_subscriptions").select("*");
  const body = JSON.stringify({ title: payload.title, body: payload.body ?? "", url: `${SITE_URL}${payload.path}` });
  let sent = 0;
  const dead: string[] = [];
  await Promise.all((data ?? []).map(async (s) => {
    try {
      await webpush.sendNotification({ endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } }, body);
      sent++;
    } catch (e) {
      const code = (e as { statusCode?: number }).statusCode;
      if (code === 404 || code === 410) dead.push(s.endpoint);
    }
  }));
  if (dead.length) await sb.from("push_subscriptions").delete().in("endpoint", dead);
  return { sent, skipped: false };
}

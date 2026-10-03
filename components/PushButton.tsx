"use client";

import { useEffect, useState } from "react";

const b64 = (s: string) => {
  const pad = "=".repeat((4 - (s.length % 4)) % 4);
  const raw = atob((s + pad).replace(/-/g, "+").replace(/_/g, "/"));
  return Uint8Array.from(raw, (c) => c.charCodeAt(0));
};

export default function PushButton({ vapid }: { vapid: string }) {
  const [state, setState] = useState<"hidden" | "off" | "on">("hidden");

  useEffect(() => {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) return;
    navigator.serviceWorker.register("/sw.js").then(async (reg) => {
      const sub = await reg.pushManager.getSubscription();
      setState(sub ? "on" : "off");
    }).catch(() => {});
  }, []);

  if (state === "hidden") return null;

  const enable = async () => {
    const perm = await Notification.requestPermission();
    if (perm !== "granted") return;
    const reg = await navigator.serviceWorker.ready;
    const sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: b64(vapid) });
    await fetch("/api/push/subscribe", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(sub) });
    setState("on");
  };

  return (
    <button onClick={state === "off" ? enable : undefined} className="icon-btn" title={state === "on" ? "Notifiche attive" : "Attiva le notifiche"} aria-label="Notifiche">
      {state === "on" ? "🔔" : "🔕"}
    </button>
  );
}

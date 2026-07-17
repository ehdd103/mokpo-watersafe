"use client";

import type { NotificationItem } from "@/types";

const SENT_KEY = "watersafe:browser-notified";

export async function notifyBrowserOfVisitMatches(items: NotificationItem[]) {
  if (typeof window === "undefined" || !("Notification" in window) || Notification.permission !== "granted") return;
  const matching = items.filter((item) => item.type === "visit-alert" && !item.read);
  if (!matching.length) return;

  let sent: string[] = [];
  try { sent = JSON.parse(localStorage.getItem(SENT_KEY) ?? "[]") as string[]; } catch { sent = []; }
  const pending = matching.filter((item) => !sent.includes(item.id));
  if (!pending.length) return;

  const registration = "serviceWorker" in navigator ? await navigator.serviceWorker.getRegistration() : undefined;
  const completed: string[] = [];
  for (const item of pending) {
    try {
      const options: NotificationOptions = { body: item.description, icon: "/icon.svg", tag: item.id, data: { href: item.href } };
      if (registration) await registration.showNotification(item.title, options);
      else new Notification(item.title, options);
      completed.push(item.id);
    } catch { /* 앱 내부 알림은 계속 제공됩니다. */ }
  }
  if (completed.length) localStorage.setItem(SENT_KEY, JSON.stringify([...new Set([...sent, ...completed])].slice(-100)));
}

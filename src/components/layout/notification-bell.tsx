"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Bell, Inbox } from "lucide-react";
import { api, type NotificationEntry } from "@/lib/api-client";

export function NotificationBell({ locale }: { locale: string }) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<NotificationEntry[]>([]);
  const [unread, setUnread] = useState(0);

  const load = () => {
    api.notifications.list().then((r) => { setItems(r.notifications); setUnread(r.unread); }).catch(() => {});
  };

  useEffect(() => {
    load();
    const i = setInterval(load, 60_000);
    return () => clearInterval(i);
  }, []);

  const openPanel = async () => {
    setOpen((o) => !o);
    if (!open && unread > 0) {
      setUnread(0);
      try { await api.notifications.markRead(); setItems((prev) => prev.map((n) => ({ ...n, read: true }))); } catch {}
    }
  };

  return (
    <div className="relative">
      <button onClick={openPanel} aria-label="Notifications" className="relative w-9 h-9 flex items-center justify-center rounded-full border border-white/[0.10] hover:bg-white/[0.06] transition-colors text-[var(--t-text)]">
        <Bell size={16} />
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full bg-[var(--color-accent)] text-white text-[10px] font-bold flex items-center justify-center font-[family-name:var(--font-mono)]">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="glass absolute right-0 mt-2 w-80 max-h-[420px] overflow-y-auto rounded-2xl border border-[var(--t-border)] shadow-[var(--shadow-lg)] z-50 p-1.5">
            {items.length === 0 ? (
              <div className="flex flex-col items-center text-center py-10 px-4">
                <Inbox size={24} className="text-[var(--t-text-muted)] mb-2" />
                <p className="text-sm text-[var(--t-text-secondary)]">No notifications yet</p>
              </div>
            ) : (
              items.map((n) => {
                const inner = (
                  <>
                    <div className="flex items-center gap-2">
                      {!n.read && <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent)] shrink-0" />}
                      <p className="text-sm font-semibold text-[var(--t-text)] leading-tight">{n.title}</p>
                    </div>
                    {n.body && <p className="text-xs text-[var(--t-text-secondary)] mt-0.5 leading-snug">{n.body}</p>}
                    <p className="text-[10px] text-[var(--t-text-muted)] mt-1 font-[family-name:var(--font-mono)]">{new Date(n.created_at).toLocaleDateString()}</p>
                  </>
                );
                const cls = "block rounded-xl px-3 py-2.5 hover:bg-white/[0.05] transition-colors";
                return n.link
                  ? <Link key={n.id} href={`/${locale}${n.link}`} onClick={() => setOpen(false)} className={cls}>{inner}</Link>
                  : <div key={n.id} className={cls}>{inner}</div>;
              })
            )}
          </div>
        </>
      )}
    </div>
  );
}

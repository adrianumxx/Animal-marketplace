"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { MessageCircle, Loader2, X, Send } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api-client";

type Target = { seller_id?: string; shelter_id?: string; vet_id?: string; listing_id?: string };

export function MessageButton({ target, recipientName, label = "Send message", className }: {
  target: Target; recipientName?: string; label?: string; className?: string;
}) {
  const params = useParams();
  const router = useRouter();
  const locale = params.locale as string;
  const [open, setOpen] = useState(false);
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);

  const isAuthed = () => typeof window !== "undefined" && !!localStorage.getItem("pt_token");

  const onOpen = () => {
    if (!isAuthed()) { router.push(`/${locale}/login`); return; }
    setOpen(true);
  };

  const send = async () => {
    if (body.trim().length < 2) { toast.error("Write a message first"); return; }
    setBusy(true);
    try {
      const r = await api.inquiries.create({ ...target, message: body.trim() });
      toast.success("Message sent");
      router.push(`/${locale}/messages?c=${r.id}`);
    } catch (e) {
      const m = (e as Error).message;
      toast.error(m === "Unauthorized" || m.includes("Sign in") ? "Sign in to send a message" : m);
      if (m === "Unauthorized") router.push(`/${locale}/login`);
    } finally { setBusy(false); }
  };

  return (
    <>
      <button onClick={onOpen} className={className ?? "btn-primary inline-flex items-center justify-center gap-2"}>
        <MessageCircle size={15} /> {label}
      </button>

      {open && (
        <div className="fixed inset-0 z-[var(--z-modal)] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setOpen(false)}>
          <div className="w-full max-w-md bg-[var(--t-surface)] border border-white/[0.10] rounded-2xl p-6 shadow-[0_20px_60px_rgba(0,0,0,0.5)]" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-bold text-[var(--t-text)]">Message {recipientName || "this provider"}</h3>
              <button onClick={() => setOpen(false)} className="p-1.5 rounded-lg hover:bg-white/[0.06] text-[var(--t-text-muted)]"><X size={16} /></button>
            </div>
            <p className="text-sm text-[var(--t-text-muted)] mb-4">They&apos;ll reply in your PawTrust inbox.</p>
            <textarea autoFocus value={body} onChange={(e) => setBody(e.target.value)} rows={5}
              placeholder="Hi, I'd like to ask about…" className="input-dark !h-auto py-3 resize-none w-full mb-4" />
            <button onClick={send} disabled={busy} className="btn-primary w-full inline-flex items-center justify-center gap-2 disabled:opacity-60">
              {busy ? <Loader2 size={16} className="animate-spin" /> : <Send size={15} />}
              {busy ? "Sending…" : "Send message"}
            </button>
          </div>
        </div>
      )}
    </>
  );
}

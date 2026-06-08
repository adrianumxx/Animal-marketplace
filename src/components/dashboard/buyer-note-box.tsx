"use client";

import { useState } from "react";
import { StickyNote, Plus } from "lucide-react";
import { toast } from "sonner";
import { api, type BuyerNoteEntry } from "@/lib/api-client";

export function BuyerNoteBox({ buyerEmail }: { buyerEmail: string }) {
  const [open, setOpen] = useState(false);
  const [notes, setNotes] = useState<BuyerNoteEntry[]>([]);
  const [draft, setDraft] = useState("");
  const [loaded, setLoaded] = useState(false);

  const toggle = async () => {
    const next = !open;
    setOpen(next);
    if (next && !loaded) {
      try { const r = await api.buyerNotes.list(buyerEmail); setNotes(r.notes); } catch { /* */ }
      setLoaded(true);
    }
  };

  const add = async () => {
    if (!draft.trim()) return;
    try {
      const r = await api.buyerNotes.create({ buyer_email: buyerEmail, body: draft.trim() });
      setNotes((p) => [r.note, ...p]);
      setDraft("");
      toast.success("Note saved");
    } catch (e) { toast.error((e as Error).message); }
  };

  return (
    <div className="mt-3 pt-3 border-t border-white/[0.05]">
      <button onClick={toggle} className="flex items-center gap-1.5 text-xs font-semibold text-[var(--t-text-muted)] hover:text-[var(--color-accent)] transition-colors">
        <StickyNote size={13} /> Private notes {notes.length > 0 && `(${notes.length})`}
      </button>
      {open && (
        <div className="mt-2 space-y-2">
          {notes.map((n) => (
            <p key={n.id} className="text-xs text-[var(--t-text-secondary)] bg-white/[0.03] border border-white/[0.05] rounded-lg px-3 py-2">{n.body}</p>
          ))}
          <div className="flex gap-2">
            <input value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Add a private note about this buyer…" className="input-dark h-9 text-sm flex-1" />
            <button onClick={add} disabled={!draft.trim()} className="btn-secondary px-3 py-1.5 text-sm disabled:opacity-50"><Plus size={14} /></button>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import { useState } from "react";
import { Heart, Loader2, Check } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api-client";

const PRESETS = [10, 25, 50, 100]; // euros
const FEE_RATE = 0.05;

export function DonatePanel({ shelterId, shelterName }: { shelterId: string; shelterName: string }) {
  const [amount, setAmount] = useState(25);
  const [custom, setCustom] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  const euros = custom ? Math.max(0, parseInt(custom) || 0) : amount;
  const cents = Math.round(euros * 100);
  const fee = +(euros * FEE_RATE).toFixed(2);
  const net = +(euros - fee).toFixed(2);

  const donate = async () => {
    if (cents < 100) { toast.error("Minimum donation is €1"); return; }
    setBusy(true);
    try {
      await api.donations.create({ shelter_id: shelterId, amount: cents });
      setDone(true);
      toast.success("Thank you! Redirecting to secure payment…");
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  if (done) {
    return (
      <div className="rounded-2xl border border-[rgba(0,166,153,0.25)] bg-[rgba(0,166,153,0.06)] p-6 text-center">
        <div className="w-12 h-12 rounded-full bg-[rgba(0,166,153,0.15)] flex items-center justify-center mx-auto mb-3 text-[var(--color-accent-teal)]"><Check size={22} /></div>
        <p className="font-bold text-[var(--t-text)]">Thank you for supporting {shelterName}</p>
        <p className="text-sm text-[var(--t-text-secondary)] mt-1">Secure payment via Stripe is being finalized — you&apos;ll get a confirmation by email.</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-white/[0.08] bg-[var(--t-surface)] p-6">
      <div className="flex items-center gap-2 mb-1">
        <Heart size={18} className="text-[var(--color-accent)]" />
        <h3 className="font-bold text-[var(--t-text)]">Support this shelter</h3>
      </div>
      <p className="text-sm text-[var(--t-text-secondary)] mb-5">100% of your gift funds animal care. Choose an amount:</p>

      <div className="grid grid-cols-4 gap-2 mb-3">
        {PRESETS.map((p) => (
          <button key={p} onClick={() => { setAmount(p); setCustom(""); }}
            className={`py-2.5 rounded-xl text-sm font-bold border transition-all ${!custom && amount === p ? "border-[var(--color-accent)] bg-[rgba(255,56,92,0.10)] text-[var(--color-accent)]" : "border-white/[0.10] text-[var(--t-text-secondary)] hover:border-white/[0.20]"}`}>
            €{p}
          </button>
        ))}
      </div>
      <input type="number" min={1} value={custom} onChange={(e) => setCustom(e.target.value)} placeholder="Other amount (€)"
        className="input-dark w-full mb-4" />

      {/* Transparent fee breakdown */}
      <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3.5 text-sm space-y-1.5 mb-4">
        <div className="flex justify-between text-[var(--t-text-secondary)]"><span>Your donation</span><span className="font-[family-name:var(--font-mono)]">€{euros.toFixed(2)}</span></div>
        <div className="flex justify-between text-[var(--t-text-muted)]"><span>PawTrust platform fee (5%)</span><span className="font-[family-name:var(--font-mono)]">−€{fee.toFixed(2)}</span></div>
        <div className="flex justify-between font-bold text-[var(--t-text)] pt-1.5 border-t border-white/[0.06]"><span>Shelter receives</span><span className="font-[family-name:var(--font-mono)] text-[var(--color-accent-teal)]">€{net.toFixed(2)}</span></div>
      </div>

      <button onClick={donate} disabled={busy} className="btn-primary w-full inline-flex items-center justify-center gap-2 disabled:opacity-60">
        {busy ? <Loader2 size={16} className="animate-spin" /> : <Heart size={16} />}
        {busy ? "Processing…" : `Donate €${euros.toFixed(0)}`}
      </button>
      <p className="text-[11px] text-[var(--t-text-muted)] text-center mt-2.5">Secure payment · Tax receipt by email</p>
    </div>
  );
}

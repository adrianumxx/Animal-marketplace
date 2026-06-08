"use client";

import { useState, FormEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api-client";

const ROLES = [
  { value: "buyer",  emoji: "🐾", label: "Buy an animal",  desc: "Browse verified listings and contact breeders" },
  { value: "seller", emoji: "🏅", label: "Sell animals",   desc: "List your animals as a verified breeder" },
  { value: "shelter", emoji: "🏠", label: "Run a shelter or rescue", desc: "Rehome animals and receive adoption requests" },
  { value: "vet",    emoji: "🩺", label: "Veterinary partner", desc: "Join our veterinary partner network" },
];

const NEEDS_BUSINESS_NAME = ["seller", "shelter", "vet"];

export default function RegisterPage() {
  const params = useParams();
  const locale = params.locale as string;
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("buyer");
  const [businessName, setBusinessName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await api.auth.signup({
        email, password, full_name: fullName, role,
        business_name: NEEDS_BUSINESS_NAME.includes(role) ? businessName : undefined,
      });
      localStorage.setItem("pt_token", res.token);
      localStorage.setItem("pt_user", JSON.stringify({ ...res.user, seller_id: res.seller_id }));
      const dest = role === "seller" ? "/dashboard"
        : role === "shelter" ? "/dashboard/shelter"
        : role === "vet" ? "/dashboard/vet"
        : "/account";
      router.push(`/${locale}${dest}`);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[var(--t-bg)] flex flex-col items-center justify-center px-4 py-16 pt-28">
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full bg-[radial-gradient(circle,rgba(255,56,92,0.10)_0%,transparent_70%)] pointer-events-none" />

      <Link href={`/${locale}`} className="flex items-center gap-2 mb-8 relative z-10">
        <div className="w-8 h-8 rounded-xl bg-[var(--color-accent)] flex items-center justify-center shadow-[0_0_12px_rgba(255,56,92,0.4)]">
          <svg width="18" height="18" viewBox="0 0 32 32" fill="none">
            <path d="M10 13c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm12 0c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm-6 2c-3.3 0-6 2.7-6 6 0 1.7 1.3 3 3 3h6c1.7 0 3-1.3 3-3 0-3.3-2.7-6-6-6z" fill="white"/>
          </svg>
        </div>
        <span className="text-white font-bold text-xl tracking-[-0.02em] font-[family-name:var(--font-display)]">
          paw<span className="text-[var(--color-accent)]">trust</span>
        </span>
      </Link>

      <div className="w-full max-w-md relative z-10">
        <div className="bg-[var(--t-surface)] rounded-2xl border border-white/[0.06] p-8 shadow-[0_8px_40px_rgba(0,0,0,0.5)]">
          <h1 className="text-2xl font-bold text-[var(--t-text)] mb-1 text-center tracking-[-0.02em]">Create account</h1>
          <p className="text-[rgba(232,228,221,0.45)] text-sm mb-6 text-center">Join PawTrust — the verified pet marketplace</p>

          {error && (
            <div className="mb-4 px-4 py-3 rounded-xl bg-[rgba(255,56,92,0.10)] border border-[rgba(255,56,92,0.25)] text-[var(--color-accent)] text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[rgba(232,228,221,0.50)] uppercase tracking-[0.08em] mb-2 font-[family-name:var(--font-mono)]">Full name</label>
              <input type="text" className="input-dark w-full" placeholder="Jane Doe"
                value={fullName} onChange={e => setFullName(e.target.value)} required />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[rgba(232,228,221,0.50)] uppercase tracking-[0.08em] mb-2 font-[family-name:var(--font-mono)]">Email</label>
              <input type="email" className="input-dark w-full" placeholder="jane@example.com"
                value={email} onChange={e => setEmail(e.target.value)} required />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[rgba(232,228,221,0.50)] uppercase tracking-[0.08em] mb-2 font-[family-name:var(--font-mono)]">Password</label>
              <input type="password" className="input-dark w-full" placeholder="At least 8 characters"
                value={password} onChange={e => setPassword(e.target.value)} required minLength={8} />
            </div>

            {/* Role selector */}
            <div>
              <label className="block text-xs font-semibold text-[rgba(232,228,221,0.50)] uppercase tracking-[0.08em] mb-3 font-[family-name:var(--font-mono)]">I want to</label>
              <div className="space-y-2">
                {ROLES.map((r) => (
                  <label
                    key={r.value}
                    className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                      role === r.value
                        ? "border-[rgba(255,56,92,0.40)] bg-[rgba(255,56,92,0.08)]"
                        : "border-white/[0.08] hover:border-[rgba(255,56,92,0.30)] hover:bg-[rgba(255,56,92,0.05)]"
                    }`}
                  >
                    <input
                      type="radio"
                      name="role"
                      value={r.value}
                      checked={role === r.value}
                      onChange={() => setRole(r.value)}
                      className="mt-0.5 accent-[var(--color-accent)]"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span>{r.emoji}</span>
                        <span className="text-sm font-semibold text-[var(--t-text)]">{r.label}</span>
                      </div>
                      <div className="text-xs text-[rgba(232,228,221,0.40)] mt-0.5">{r.desc}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {NEEDS_BUSINESS_NAME.includes(role) && (
              <div>
                <label className="block text-xs font-semibold text-[rgba(232,228,221,0.50)] uppercase tracking-[0.08em] mb-2 font-[family-name:var(--font-mono)]">
                  {role === "shelter" ? "Organization name" : role === "vet" ? "Clinic name" : "Business / Kennel name"}
                </label>
                <input type="text" className="input-dark w-full"
                  placeholder={role === "shelter" ? "e.g. Happy Paws Rescue" : role === "vet" ? "e.g. Clinique Mertens" : "e.g. Goldenfarm Kennel"}
                  value={businessName} onChange={e => setBusinessName(e.target.value)} />
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3.5 mt-2 disabled:opacity-60"
            >
              {loading ? "Creating account…" : "Create account"}
            </button>
          </form>

          <p className="text-center text-xs text-[rgba(232,228,221,0.30)] mt-4 leading-relaxed">
            By continuing you agree to our{" "}
            <Link href={`/${locale}/terms`} className="text-[rgba(232,228,221,0.60)] font-medium hover:text-[var(--t-text)] transition-colors">Terms</Link>
            {" & "}
            <Link href={`/${locale}/privacy`} className="text-[rgba(232,228,221,0.60)] font-medium hover:text-[var(--t-text)] transition-colors">Privacy Policy</Link>
          </p>
        </div>

        <p className="text-center text-sm text-[rgba(232,228,221,0.40)] mt-5">
          Already have an account?{" "}
          <Link href={`/${locale}/login`} className="text-[var(--color-accent)] hover:text-[var(--color-accent-hover)] font-semibold transition-colors">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}

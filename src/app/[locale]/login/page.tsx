"use client";

import { useState, FormEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ShieldCheck } from "lucide-react";
import { api } from "@/lib/api-client";

export default function LoginPage() {
  const params = useParams();
  const locale = params.locale as string;
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await api.auth.login({ email, password });
      localStorage.setItem("pt_token", res.token);
      localStorage.setItem("pt_user", JSON.stringify({ ...res.user, seller_id: res.seller_id }));
      if (res.user.role === "seller") {
        router.push(`/${locale}/dashboard`);
      } else {
        router.push(`/${locale}`);
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[var(--t-bg)] flex">

      {/* ── Left panel — brand photo ─────────────────────────────── */}
      <div className="hidden lg:block lg:w-[55%] relative overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1601979031925-424e53b6caaa?w=1200&h=1600&fit=crop"
          alt="PawTrust"
          fill
          className="object-cover opacity-60"
          priority
          sizes="55vw"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--t-bg)] via-[rgba(10,10,15,0.5)] to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[rgba(10,10,15,.8)] via-transparent to-transparent" />
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-[radial-gradient(circle,rgba(255,56,92,0.20)_0%,transparent_70%)] pointer-events-none" />

        <div className="absolute inset-0 flex flex-col justify-between p-12">
          <Link href={`/${locale}`} className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-[var(--color-accent)] flex items-center justify-center shadow-[0_0_16px_rgba(255,56,92,0.5)]">
              <svg width="20" height="20" viewBox="0 0 32 32" fill="none">
                <path d="M10 13c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm12 0c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm-6 2c-3.3 0-6 2.7-6 6 0 1.7 1.3 3 3 3h6c1.7 0 3-1.3 3-3 0-3.3-2.7-6-6-6z" fill="white"/>
              </svg>
            </div>
            <span className="text-white font-bold text-xl tracking-[-0.02em] font-[family-name:var(--font-display)]">
              paw<span className="text-[var(--color-accent)]">trust</span>
            </span>
          </Link>

          <div>
            <blockquote className="text-[var(--t-text)] text-3xl font-bold leading-tight mb-6 max-w-sm tracking-[-0.02em]">
              &quot;The safest way to find your next companion.&quot;
            </blockquote>
            <div className="flex flex-wrap gap-2">
              {["Manually verified listings", "Licensed breeders only", "GDPR compliant"].map((item) => (
                <div key={item} className="flex items-center gap-1.5 glass rounded-full px-3 py-1.5">
                  <ShieldCheck size={12} className="text-[var(--color-accent-teal)]" />
                  <span className="text-[rgba(232,228,221,0.80)] text-xs font-medium">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Right panel — form ────────────────────────────────────── */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 sm:px-12 py-12 bg-[var(--t-bg)]">
        <div className="w-full max-w-sm">

          <div className="lg:hidden mb-8 flex justify-center">
            <Link href={`/${locale}`} className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-[var(--color-accent)] flex items-center justify-center">
                <svg width="18" height="18" viewBox="0 0 32 32" fill="none">
                  <path d="M10 13c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm12 0c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm-6 2c-3.3 0-6 2.7-6 6 0 1.7 1.3 3 3 3h6c1.7 0 3-1.3 3-3 0-3.3-2.7-6-6-6z" fill="white"/>
                </svg>
              </div>
              <span className="text-white font-bold text-xl tracking-[-0.02em] font-[family-name:var(--font-display)]">
                paw<span className="text-[var(--color-accent)]">trust</span>
              </span>
            </Link>
          </div>

          <h1 className="text-2xl font-bold text-[var(--t-text)] mb-1 tracking-[-0.02em]">Welcome back</h1>
          <p className="text-[rgba(232,228,221,0.50)] text-sm mb-8">Sign in to your PawTrust account</p>

          {error && (
            <div className="mb-4 px-4 py-3 rounded-xl bg-[rgba(255,56,92,0.10)] border border-[rgba(255,56,92,0.25)] text-[var(--color-accent)] text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[rgba(232,228,221,0.60)] uppercase tracking-[0.08em] mb-2 font-[family-name:var(--font-mono)]">Email</label>
              <input
                type="email"
                className="input-dark w-full"
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-semibold text-[rgba(232,228,221,0.60)] uppercase tracking-[0.08em] font-[family-name:var(--font-mono)]">Password</label>
              </div>
              <input
                type="password"
                className="input-dark w-full"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3.5 mt-2 disabled:opacity-60"
            >
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>

          <p className="text-center text-sm text-[rgba(232,228,221,0.40)] mt-6">
            No account?{" "}
            <Link href={`/${locale}/register`} className="text-[var(--color-accent)] hover:text-[var(--color-accent-hover)] font-semibold transition-colors">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

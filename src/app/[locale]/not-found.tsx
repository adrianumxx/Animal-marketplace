import Link from "next/link";
import { PawPrint, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="bg-[var(--t-bg)] min-h-screen flex items-center justify-center px-6">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 rounded-2xl bg-[rgba(255,56,92,0.10)] border border-[rgba(255,56,92,0.15)] flex items-center justify-center text-[var(--color-accent)] mx-auto mb-6">
          <PawPrint size={28} />
        </div>
        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--color-accent)] font-[family-name:var(--font-mono)] mb-3">404</p>
        <h1 className="text-3xl font-black text-[var(--t-text)] tracking-[-0.02em] mb-3">This page wandered off</h1>
        <p className="text-[var(--t-text-secondary)] mb-8 font-[family-name:var(--font-body)]">
          The page you’re looking for doesn’t exist or has moved. Let’s get you back on track.
        </p>
        <div className="flex flex-wrap gap-3 justify-center">
          <Link href="/" className="btn-primary inline-flex items-center gap-2"><ArrowLeft size={15} /> Back home</Link>
          <Link href="/en/search" className="btn-secondary inline-flex">Browse animals</Link>
        </div>
      </div>
    </div>
  );
}

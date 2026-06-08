"use client";

import { useEffect, useState } from "react";
import { api, type AdminUserRow } from "@/lib/api-client";

const CAPS = ["seller", "shelter", "vet"] as const;

export function AdminUserManager() {
  const [users, setUsers] = useState<AdminUserRow[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  const load = (q = "") => {
    setLoading(true);
    api.adminUsers.list(q).then((r) => setUsers(r.users)).catch((e) => setError((e as Error).message)).finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const patch = async (id: string, body: Partial<{ role: string; capabilities: string[]; account_status: string; seller_tier: number }>) => {
    setSavingId(id); setError("");
    try {
      const r = await api.adminUsers.update({ id, ...body });
      if (r.user) setUsers((prev) => prev.map((u) => (u.id === id ? r.user! : u)));
    } catch (e) { setError((e as Error).message); }
    finally { setSavingId(null); }
  };

  const toggleCap = (u: AdminUserRow, cap: string) => {
    const next = u.capabilities.includes(cap) ? u.capabilities.filter((c) => c !== cap) : [...u.capabilities, cap];
    patch(u.id, { capabilities: next });
  };

  return (
    <section className="mb-10">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="text-base font-bold text-[var(--t-text)]">Role management</h2>
        <form onSubmit={(e) => { e.preventDefault(); load(search); }} className="flex gap-2">
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search email" className="input-dark h-9 text-sm max-w-[200px]" />
          <button className="btn-secondary text-sm py-1.5">Search</button>
        </form>
      </div>
      {error && <p className="mb-3 text-sm text-[var(--color-accent)]">{error}</p>}
      {loading ? (
        <div className="skeleton h-20 w-full" />
      ) : (
        <div className="grid gap-2">
          {users.map((u) => (
            <div key={u.id} className="rounded-2xl border border-[var(--t-border)] bg-[var(--t-surface)] p-4 flex flex-wrap items-center gap-3 transition-colors hover:border-[var(--t-border-hover)]">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 ${u.role === "admin" ? "bg-[var(--color-accent-warm)]" : "bg-[var(--color-accent)]"}`}>
                {(u.full_name || u.email || "U").charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-bold text-[var(--t-text)] truncate">{u.full_name || u.email}</div>
                <div className="text-xs text-[var(--t-text-muted)] truncate">{u.email}</div>
              </div>

              <select
                value={u.role === "admin" ? "admin" : "user"}
                onChange={(e) => patch(u.id, { role: e.target.value })}
                className="input-dark h-9 text-sm w-[110px]"
              >
                <option value="user">user</option>
                <option value="admin">admin</option>
              </select>

              <div className="flex gap-1.5">
                {CAPS.map((c) => (
                  <button
                    key={c}
                    onClick={() => toggleCap(u, c)}
                    className={`px-2.5 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                      u.capabilities.includes(c)
                        ? "bg-[rgba(255,56,92,0.10)] border-[rgba(255,56,92,0.30)] text-[var(--color-accent)]"
                        : "border-[var(--t-border)] text-[var(--t-text-muted)] hover:border-[var(--t-border-hover)]"
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>

              <select
                value={u.account_status}
                onChange={(e) => patch(u.id, { account_status: e.target.value })}
                className="input-dark h-9 text-sm w-[120px]"
              >
                <option value="active">active</option>
                <option value="suspended">suspended</option>
                <option value="banned">banned</option>
              </select>

              {savingId === u.id && <span className="text-xs text-[var(--t-text-muted)]">saving…</span>}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

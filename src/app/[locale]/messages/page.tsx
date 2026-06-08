"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Send, ArrowLeft, MessageCircle, ExternalLink } from "lucide-react";
import { api, type ConversationSummary, type ConversationHead, type ThreadMessage } from "@/lib/api-client";

export default function MessagesPage() {
  const params = useParams();
  const router = useRouter();
  const search = useSearchParams();
  const locale = (params?.locale as string) || "en";

  const [convos, setConvos] = useState<ConversationSummary[]>([]);
  const [active, setActive] = useState<string | null>(search.get("c"));
  const [head, setHead] = useState<ConversationHead | null>(null);
  const [messages, setMessages] = useState<ThreadMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(true);
  const endRef = useRef<HTMLDivElement>(null);

  const selectConversation = (id: string | null) => {
    setActive(id);
    if (!id) {
      setHead(null);
      setMessages([]);
    }
  };

  useEffect(() => {
    api.conversations.list().then((r) => setConvos(r.conversations)).catch(() => router.push(`/${locale}/login`)).finally(() => setLoading(false));
  }, [locale, router]);

  useEffect(() => {
    if (!active) return;
    api.conversations.thread(active).then((r) => { setHead(r.conversation); setMessages(r.messages); }).catch(() => {});
  }, [active]);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const send = async () => {
    if (!draft.trim() || !active) return;
    const body = draft.trim();
    setDraft("");
    try {
      const r = await api.conversations.send(active, body);
      setMessages((m) => [...m, r.message]);
    } catch { /* */ }
  };

  if (loading) return <div className="bg-[var(--t-bg)] min-h-screen flex items-center justify-center"><div className="skeleton w-40 h-6" /></div>;

  return (
    <div className="bg-[var(--t-bg)] min-h-screen">
      <div className="max-w-[1100px] mx-auto px-0 sm:px-8 pt-20 lg:pt-24 pb-0 sm:pb-10">
        <h1 className="text-2xl font-black text-[var(--t-text)] tracking-[-0.02em] px-5 sm:px-0 mb-5">Messages</h1>
        <div className="grid md:grid-cols-[320px_1fr] border border-[var(--t-border)] sm:rounded-2xl overflow-hidden h-[calc(100vh-180px)] min-h-[420px]">

          {/* List */}
          <div className={`border-r border-[var(--t-border)] overflow-y-auto bg-[var(--t-surface)] ${active ? "hidden md:block" : "block"}`}>
            {convos.length === 0 ? (
              <div className="p-8 text-center text-sm text-[var(--t-text-secondary)]">No conversations yet.</div>
            ) : convos.map((c) => (
              <button key={c.id} onClick={() => selectConversation(c.id)} className={`w-full text-left px-4 py-3.5 border-b border-[var(--t-border)] hover:bg-white/[0.04] transition-colors ${active === c.id ? "bg-white/[0.05]" : ""}`}>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-bold text-[var(--t-text)] truncate">{c.counterpart}</span>
                  {c.unread > 0 && <span className="min-w-[18px] h-[18px] px-1 rounded-full bg-[var(--color-accent)] text-white text-[10px] font-bold flex items-center justify-center shrink-0">{c.unread}</span>}
                </div>
                <p className="text-xs text-[var(--t-text-muted)] truncate mt-0.5">{c.listing_title}</p>
                <p className="text-xs text-[var(--t-text-secondary)] truncate mt-0.5">{c.last_message}</p>
              </button>
            ))}
          </div>

          {/* Thread */}
          <div className={`flex flex-col bg-[var(--t-bg)] ${active ? "flex" : "hidden md:flex"}`}>
            {!head ? (
              <div className="flex-1 flex flex-col items-center justify-center text-[var(--t-text-muted)]">
                <MessageCircle size={28} className="mb-2" /><p className="text-sm">Select a conversation</p>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-3 px-4 py-3 border-b border-[var(--t-border)]">
                  <button onClick={() => selectConversation(null)} className="md:hidden text-[var(--t-text-secondary)]"><ArrowLeft size={18} /></button>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-[var(--t-text)] truncate">{head.counterpart}</p>
                    {head.listing_id && <Link href={`/${locale}/listings/${head.listing_id}`} className="text-xs text-[var(--color-accent)] hover:underline flex items-center gap-1">{head.listing_title} <ExternalLink size={10} /></Link>}
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {messages.map((m) => (
                    <div key={m.id} className={`flex ${m.mine ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${m.mine ? "bg-[var(--color-accent)] text-white" : "bg-[var(--t-surface)] border border-[var(--t-border)] text-[var(--t-text)]"}`}>
                        {m.body}
                        <div className={`text-[10px] mt-1 font-[family-name:var(--font-mono)] ${m.mine ? "text-white/60" : "text-[var(--t-text-muted)]"}`}>{new Date(m.created_at).toLocaleDateString()}</div>
                      </div>
                    </div>
                  ))}
                  <div ref={endRef} />
                </div>

                <form onSubmit={(e) => { e.preventDefault(); send(); }} className="flex items-center gap-2 p-3 border-t border-[var(--t-border)]">
                  <input value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Write a message…" className="input-dark flex-1" />
                  <button type="submit" disabled={!draft.trim()} className="btn-primary px-4 disabled:opacity-50"><Send size={16} /></button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

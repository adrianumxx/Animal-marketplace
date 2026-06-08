"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Send, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

const schema = z.object({
  buyer_name: z.string().min(2, "Name must be at least 2 characters"),
  buyer_email: z.string().email("Invalid email address"),
  buyer_phone: z.string().optional(),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

type InquiryFormData = z.infer<typeof schema>;

interface InquiryFormProps {
  listingId: string;
  locale?: string;
  labels?: {
    title?: string;
    name?: string;
    email?: string;
    phone?: string;
    message?: string;
    placeholder?: string;
    submit?: string;
    success?: string;
    disclaimer?: string;
  };
}

export function InquiryForm({ listingId, labels = {} }: InquiryFormProps) {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<InquiryFormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: InquiryFormData) => {
    setLoading(true);
    try {
      const res = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, listing_id: listingId }),
      });
      if (res.ok) { setSubmitted(true); reset(); }
    } catch { /* noop */ } finally { setLoading(false); }
  };

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <div className="w-14 h-14 rounded-full bg-[var(--t-surface)] flex items-center justify-center mb-4">
          <CheckCircle2 className="text-[var(--color-accent)]" size={28} />
        </div>
        <h3 className="text-base font-bold text-[var(--t-text)] mb-1">
          {labels.success || "Inquiry sent!"}
        </h3>
        <p className="text-sm text-[var(--t-text-muted)]">The breeder will get back to you soon.</p>
        <button
          onClick={() => setSubmitted(false)}
          className="mt-4 text-sm text-[var(--color-accent)] hover:text-[var(--color-accent-hover)] font-semibold"
        >
          Send another inquiry
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
      <div>
        <label className="block text-xs font-semibold text-[var(--t-text)] mb-1">
          {labels.name || "Your name"} <span className="text-[var(--color-accent)]">*</span>
        </label>
        <input
          {...register("buyer_name")}
          className={cn(
            "w-full px-3 py-2.5 rounded-xl border text-sm text-[var(--t-text)] placeholder:text-[var(--t-text-secondary)] focus:outline-none focus:ring-2 focus:ring-[rgba(255,90,95,.2)] focus:border-[var(--color-accent)] transition-colors",
            errors.buyer_name ? "border-red-300 bg-red-50" : "border-[var(--t-border)] bg-white"
          )}
          placeholder="Jane Doe"
        />
        {errors.buyer_name && <p className="mt-1 text-xs text-red-500">{errors.buyer_name.message}</p>}
      </div>

      <div>
        <label className="block text-xs font-semibold text-[var(--t-text)] mb-1">
          {labels.email || "Email address"} <span className="text-[var(--color-accent)]">*</span>
        </label>
        <input
          {...register("buyer_email")}
          type="email"
          className={cn(
            "w-full px-3 py-2.5 rounded-xl border text-sm text-[var(--t-text)] placeholder:text-[var(--t-text-secondary)] focus:outline-none focus:ring-2 focus:ring-[rgba(255,90,95,.2)] focus:border-[var(--color-accent)] transition-colors",
            errors.buyer_email ? "border-red-300 bg-red-50" : "border-[var(--t-border)] bg-white"
          )}
          placeholder="jane@example.com"
        />
        {errors.buyer_email && <p className="mt-1 text-xs text-red-500">{errors.buyer_email.message}</p>}
      </div>

      <div>
        <label className="block text-xs font-semibold text-[var(--t-text)] mb-1">
          {labels.phone || "Phone number"}
        </label>
        <input
          {...register("buyer_phone")}
          type="tel"
          className="w-full px-3 py-2.5 rounded-xl border border-[var(--t-border)] bg-white text-sm text-[var(--t-text)] placeholder:text-[var(--t-text-secondary)] focus:outline-none focus:ring-2 focus:ring-[rgba(255,90,95,.2)] focus:border-[var(--color-accent)] transition-colors"
          placeholder="+32 xxx xx xx xx"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-[var(--t-text)] mb-1">
          {labels.message || "Your message"} <span className="text-[var(--color-accent)]">*</span>
        </label>
        <textarea
          {...register("message")}
          rows={4}
          className={cn(
            "w-full px-3 py-2.5 rounded-xl border text-sm text-[var(--t-text)] placeholder:text-[var(--t-text-secondary)] resize-none focus:outline-none focus:ring-2 focus:ring-[rgba(255,90,95,.2)] focus:border-[var(--color-accent)] transition-colors",
            errors.message ? "border-red-300 bg-red-50" : "border-[var(--t-border)] bg-white"
          )}
          placeholder={labels.placeholder || "Hi, I'm interested in this listing…"}
        />
        {errors.message && <p className="mt-1 text-xs text-red-500">{errors.message.message}</p>}
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] disabled:opacity-60 text-white font-semibold py-3.5 px-4 rounded-xl transition-colors text-sm shadow-sm"
      >
        {loading
          ? <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          : <Send size={15} />
        }
        {labels.submit || "Send inquiry"}
      </button>

      {labels.disclaimer && (
        <p className="text-xs text-[var(--t-text-muted)] text-center">{labels.disclaimer}</p>
      )}
    </form>
  );
}

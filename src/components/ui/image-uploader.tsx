"use client";

import { useState } from "react";
import { Camera, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api-client";

interface ImageUploaderProps {
  value?: string | null;
  onChange: (url: string) => void;
  variant?: "cover" | "avatar";
  label?: string;
}

export function ImageUploader({ value, onChange, variant = "cover", label }: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);

  const handle = async (file: File | undefined) => {
    if (!file) return;
    setUploading(true);
    try {
      const { url } = await api.upload.image(file);
      onChange(url);
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setUploading(false);
    }
  };

  const isAvatar = variant === "avatar";
  const shape = isAvatar ? "w-24 h-24 rounded-full" : "w-full aspect-[3/1] rounded-2xl";

  return (
    <div className="space-y-1.5">
      {label && <span className="text-xs font-semibold text-[var(--t-text-muted)] uppercase tracking-[0.06em] font-[family-name:var(--font-mono)]">{label}</span>}
      <label className={`relative ${shape} block overflow-hidden border border-[var(--t-border)] bg-[var(--t-elevated)] cursor-pointer group`}>
        {value ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={value} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[var(--t-text-muted)]"><Camera size={isAvatar ? 22 : 28} /></div>
        )}
        <div className="absolute inset-0 bg-black/45 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-semibold gap-1.5">
          {uploading ? <Loader2 size={16} className="animate-spin" /> : <><Camera size={14} /> {value ? "Change" : "Upload"}</>}
        </div>
        <input type="file" accept="image/*" className="hidden" disabled={uploading} onChange={(e) => handle(e.target.files?.[0])} />
      </label>
    </div>
  );
}

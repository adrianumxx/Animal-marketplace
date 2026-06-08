import { Breadcrumb, type Crumb } from "@/components/ui/breadcrumb";

interface PageHeaderProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  crumbs?: Crumb[];
  action?: React.ReactNode;
  align?: "left" | "center";
}

/** Unified page header used across the platform for visual cohesion. */
export function PageHeader({ eyebrow, title, subtitle, crumbs, action, align = "left" }: PageHeaderProps) {
  const centered = align === "center";
  return (
    <div className="relative border-b border-[var(--t-border)] pt-28 pb-10 overflow-hidden">
      {/* subtle atmosphere */}
      <div className="absolute top-[-40%] left-[15%] w-[520px] h-[300px] rounded-full bg-[radial-gradient(circle,rgba(255,56,92,0.08)_0%,transparent_70%)] pointer-events-none" />
      <div className={`relative max-w-[1760px] mx-auto px-6 sm:px-10 lg:px-20 ${centered ? "text-center flex flex-col items-center" : ""}`}>
        {crumbs && crumbs.length > 0 && <div className="mb-4"><Breadcrumb items={crumbs} /></div>}
        <div className={`flex ${centered ? "flex-col items-center gap-4" : "items-end justify-between gap-6"} w-full`}>
          <div className={centered ? "max-w-2xl" : "min-w-0"}>
            {eyebrow && (
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--color-accent)] font-[family-name:var(--font-mono)] mb-2">{eyebrow}</p>
            )}
            <h1 className="text-3xl lg:text-[42px] font-black text-[var(--t-text)] tracking-[-0.03em] leading-[1.05]">{title}</h1>
            {subtitle && (
              <p className={`text-[var(--t-text-secondary)] text-lg mt-3 leading-relaxed font-[family-name:var(--font-body)] ${centered ? "" : "max-w-2xl"}`}>{subtitle}</p>
            )}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      </div>
    </div>
  );
}

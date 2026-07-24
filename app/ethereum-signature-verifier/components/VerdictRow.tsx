import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export type VerdictTone = "success" | "danger" | "warning" | "plain" | "loading";

interface VerdictRowProps {
  tone: VerdictTone;
  icon: ReactNode;
  label: string;
  pill?: string;
  summary: string;
}

const TONE_STYLES: Record<VerdictTone, { iconBg: string; iconText: string; labelText: string }> = {
  success: { iconBg: "bg-success/16", iconText: "text-success", labelText: "text-success" },
  danger: { iconBg: "bg-danger/15", iconText: "text-danger", labelText: "text-danger" },
  warning: { iconBg: "bg-warning/16", iconText: "text-warning", labelText: "text-warning" },
  plain: {
    iconBg: "bg-card-hover border border-border",
    iconText: "text-muted-fg",
    labelText: "text-foreground",
  },
  loading: { iconBg: "bg-brand/14", iconText: "text-brand", labelText: "text-muted-fg" },
};

export function VerdictRow({ tone, icon, label, pill, summary }: VerdictRowProps) {
  const styles = TONE_STYLES[tone];
  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <span
            className={cn(
              "flex-shrink-0 size-11 rounded-full inline-flex items-center justify-center",
              styles.iconBg,
              styles.iconText,
            )}
          >
            {icon}
          </span>
          <span
            className={cn(
              "font-heading text-[32px] font-semibold tracking-[-0.02em] leading-[1.05]",
              styles.labelText,
            )}
          >
            {label}
          </span>
        </div>
        {pill && (
          <span className="inline-flex items-center gap-1.75 h-7 px-3 rounded-full border border-border font-mono text-xs text-muted-fg bg-card-hover whitespace-nowrap">
            {pill}
          </span>
        )}
      </div>
      <p className="mt-3.75 text-[15.5px] leading-relaxed text-foreground max-w-[58ch]">{summary}</p>
    </div>
  );
}

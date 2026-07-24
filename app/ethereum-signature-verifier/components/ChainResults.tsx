import { cn } from "@/lib/utils";
import { CheckIcon, WarningTriangleIcon, XIcon } from "./icons";
import type { ChainOutcome } from "../types";

const STATUS_STYLES: Record<
  ChainOutcome["status"],
  { border: string; iconBg: string; iconText: string; label: string }
> = {
  valid: { border: "border-l-success", iconBg: "bg-success/16", iconText: "text-success", label: "valid" },
  invalid: { border: "border-l-danger", iconBg: "bg-danger/15", iconText: "text-danger", label: "invalid" },
  unknown: {
    border: "border-l-warning",
    iconBg: "bg-warning/16",
    iconText: "text-warning",
    label: "couldn't determine",
  },
};

export function ChainResults({ chains }: { chains: ChainOutcome[] }) {
  return (
    <div className="mt-5 flex flex-col gap-2">
      {chains.map((chain) => {
        const styles = STATUS_STYLES[chain.status];
        return (
          <div
            key={chain.chain}
            className={cn(
              "flex items-center gap-3.25 px-4 py-3.5 rounded-[10px] border border-border bg-card-hover border-l-[3px]",
              styles.border,
            )}
          >
            <span
              className={cn(
                "flex-shrink-0 size-6 rounded-full inline-flex items-center justify-center",
                styles.iconBg,
                styles.iconText,
              )}
            >
              {chain.status === "valid" && <CheckIcon className="size-3.5" strokeWidth={3} />}
              {chain.status === "invalid" && <XIcon className="size-3.25" strokeWidth={2.8} />}
              {chain.status === "unknown" && <WarningTriangleIcon className="size-3.25" strokeWidth={2.4} />}
            </span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2.25">
                <span className="text-sm font-semibold">{chain.chainLabel}</span>
                <span className={cn("font-mono text-[11px]", styles.iconText)}>{styles.label}</span>
              </div>
              <div className="font-mono text-xs text-muted-fg mt-0.5">{chain.detail}</div>
            </div>
            <span className="font-mono text-[11px] text-faint whitespace-nowrap">
              {chain.latencyMs.toLocaleString()} ms
            </span>
          </div>
        );
      })}
    </div>
  );
}

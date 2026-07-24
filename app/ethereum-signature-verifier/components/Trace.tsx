import { cn } from "@/lib/utils";
import { CheckIcon, SpinnerIcon, WarningTriangleIcon, XIcon } from "./icons";
import { CopyButton } from "./CopyButton";
import type { StepStatus, TraceStep } from "../types";

export function Trace({ steps }: { steps: TraceStep[] }) {
  return (
    <div className="mt-6">
      <div className="font-mono text-[11px] tracking-[0.11em] uppercase text-faint mb-1.5">Trace</div>
      {steps.map((step, i) => (
        <div
          key={`${step.label}-${i}`}
          className={cn("group flex gap-3 items-start py-2.75", i > 0 && "border-t border-border")}
        >
          <StepIcon status={step.status} />
          <div className="flex-1 min-w-0 flex items-baseline gap-2.5">
            <div className="flex-1 min-w-0">
              <div
                className={cn(
                  "text-[13.5px] font-medium",
                  step.status === "pending" ? "text-faint" : "text-foreground",
                )}
              >
                {step.label}
              </div>
              <div
                className={cn(
                  "font-mono text-xs mt-0.5",
                  step.status === "pending" && "text-faint",
                  step.status === "running" && "text-brand",
                  (step.status === "ok" || step.status === "fail" || step.status === "warn") &&
                    "text-muted-fg",
                )}
              >
                {step.detail}
              </div>
            </div>
            {step.copyValue && (
              <CopyButton
                value={step.copyValue}
                size="xs"
                className="opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-opacity"
              />
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

const STEP_ICON_STYLES: Record<Exclude<StepStatus, "pending">, string> = {
  ok: "bg-success/16 text-success",
  fail: "bg-danger/15 text-danger",
  warn: "bg-warning/16 text-warning",
  running: "bg-brand/14 text-brand",
};

function StepIcon({ status }: { status: StepStatus }) {
  if (status === "pending") {
    return <span className="flex-shrink-0 size-5.5 rounded-full border-2 border-border mt-px" />;
  }

  return (
    <span
      className={cn(
        "flex-shrink-0 size-5.5 rounded-full inline-flex items-center justify-center mt-px",
        STEP_ICON_STYLES[status],
      )}
    >
      {status === "ok" && <CheckIcon className="size-3" strokeWidth={3} />}
      {status === "fail" && <XIcon className="size-2.75" strokeWidth={2.8} />}
      {status === "warn" && <WarningTriangleIcon className="size-2.75" strokeWidth={2.4} />}
      {status === "running" && <SpinnerIcon className="size-3" strokeWidth={3} />}
    </span>
  );
}

import type { Hex } from "viem";
import { cn } from "@/lib/utils";
import { CopyButton } from "./CopyButton";
import type { DigestComparisonData } from "../types";

export type ComparisonTone = "danger" | "success" | "accent";

export interface ComparisonRowData {
  label: string;
  value: string;
  tone: ComparisonTone;
  note?: string;
}

interface ComparisonShellProps {
  headerLabel: string;
  headerStatus: string;
  headerStatusTone: "danger" | "success";
  top: ComparisonRowData;
  bottom?: ComparisonRowData;
}

const ROW_TONE: Record<ComparisonTone, { border: string; text: string }> = {
  danger: { border: "border-l-danger", text: "text-danger" },
  success: { border: "border-l-success", text: "text-success" },
  accent: { border: "border-l-acct-eoa", text: "text-acct-eoa" },
};

/** Shared shell for the two-block "expected vs actual" comparisons — reused by AddressComparison. */
export function ComparisonShell({ headerLabel, headerStatus, headerStatusTone, top, bottom }: ComparisonShellProps) {
  return (
    <div className="mt-5 rounded-xl border border-border bg-card-hover overflow-hidden">
      <div className="flex justify-between items-center px-4 py-2.25 border-b border-border font-mono text-[11px] tracking-[0.09em] uppercase text-faint">
        <span>{headerLabel}</span>
        <span className={headerStatusTone === "danger" ? "text-danger" : "text-success"}>{headerStatus}</span>
      </div>
      <ComparisonRow row={top} />
      {bottom && (
        <>
          <div className="flex items-center gap-3 px-4.5">
            <div className="flex-1 h-px bg-border" />
            <span className="font-mono text-sm text-faint">↓</span>
            <div className="flex-1 h-px bg-border" />
          </div>
          <ComparisonRow row={bottom} />
        </>
      )}
    </div>
  );
}

function ComparisonRow({ row }: { row: ComparisonRowData }) {
  const tone = ROW_TONE[row.tone];
  return (
    <div className={cn("group flex items-center gap-3 px-4.5 py-4 border-l-[3px]", tone.border)}>
      <div className="flex-1 min-w-0">
        <div className="font-mono text-[10.5px] tracking-[0.06em] uppercase text-faint mb-1.5">{row.label}</div>
        <div className={cn("font-mono text-[19px] font-medium break-all", tone.text)}>{row.value}</div>
        {row.note && <div className="text-xs text-muted-fg mt-1.5">{row.note}</div>}
      </div>
      <CopyButton
        value={row.value}
        className="opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-opacity"
      />
    </div>
  );
}

type DigestComparisonProps =
  | { matched: true; digest: Hex }
  | { matched?: false; digests: DigestComparisonData };

export function DigestComparison(props: DigestComparisonProps) {
  if (props.matched) {
    return (
      <ComparisonShell
        headerLabel="Digest verified"
        headerStatus="match"
        headerStatusTone="success"
        top={{ label: "You hashed & the Safe confirmed", value: props.digest, tone: "success" }}
      />
    );
  }

  const { digests } = props;
  return (
    <ComparisonShell
      headerLabel="Digest comparison"
      headerStatus="mismatch"
      headerStatusTone="danger"
      top={{ label: "You hashed & signed", value: digests.actual, tone: "danger" }}
      bottom={{ label: digests.expectedLabel, value: digests.expected, tone: "success" }}
    />
  );
}

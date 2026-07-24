"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { CopyButton } from "./CopyButton";
import { ChevronRightIcon } from "./icons";
import type { DigestOutcome, MessageMode } from "../lib/digest";

const ROWS: { mode: MessageMode; label: string }[] = [
  { mode: "text", label: "EIP-191" },
  { mode: "typed", label: "EIP-712" },
  { mode: "hash", label: "Raw hash" },
];

export function DigestPanel({
  results,
  active,
}: {
  results: Record<MessageMode, DigestOutcome>;
  active: MessageMode;
}) {
  return (
    <div>
      <div className="font-mono text-[11px] tracking-[0.11em] uppercase text-faint mb-2">
        Digest
      </div>
      <div className="flex flex-col gap-2">
        {ROWS.map(({ mode, label }) => (
          <DigestRow
            key={mode}
            label={label}
            outcome={results[mode]}
            isActive={mode === active}
          />
        ))}
      </div>
    </div>
  );
}

function DigestRow({
  label,
  outcome,
  isActive,
}: {
  label: string;
  outcome: DigestOutcome;
  isActive: boolean;
}) {
  const failed = outcome.digest === null;

  return (
    <div
      className={cn(
        "rounded-xl border border-border px-4 py-3.5",
        isActive
          ? "border-l-[3px] border-l-brand bg-card-hover"
          : "bg-transparent opacity-50",
      )}
    >
      <div className="flex items-center gap-2 mb-2">
        <span className="text-[13.5px] font-semibold text-foreground">
          {label}
        </span>
        {isActive && (
          <span className="inline-flex items-center gap-1.25 font-mono text-[10.5px] text-brand">
            <span className="size-1.25 rounded-full bg-brand" />
            active
          </span>
        )}
      </div>

      {!failed ? (
        <div className="group flex items-start gap-3">
          <div className="flex-1 min-w-0 font-mono text-[19px] font-medium break-all text-foreground">
            {outcome.digest}
          </div>
          <CopyButton
            value={outcome.digest as string}
            size="xs"
            className="opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-opacity mt-0.5"
          />
        </div>
      ) : (
        <div className="text-[13px] font-normal leading-relaxed text-muted-fg">
          {outcome.error}
        </div>
      )}

      <div className="font-mono text-xs text-muted-fg mt-1.75">
        {outcome.detail}
      </div>

      {outcome.mode === "text" && outcome.preimage && (
        <Eip191Disclosure preimage={outcome.preimage} naive={outcome.naive} />
      )}
    </div>
  );
}

function Eip191Disclosure({
  preimage,
  naive,
}: {
  preimage: string;
  naive?: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="mt-3 pt-3 border-t border-border">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex items-center gap-2 w-full bg-transparent border-none p-0 cursor-pointer text-muted-fg text-[12.5px] font-medium"
      >
        <ChevronRightIcon
          className={cn("size-3 transition-transform", open && "rotate-90")}
        />
        Show what was actually hashed
      </button>

      {open && (
        <div className="mt-2.5 flex flex-col gap-2.5">
          <div className="group flex items-start gap-3">
            <div className="flex-1 min-w-0 font-mono text-xs leading-relaxed break-all text-foreground">
              {preimage}
            </div>
            <CopyButton
              value={preimage}
              size="xs"
              className="opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-opacity mt-0.5"
            />
          </div>

          <p className="text-xs leading-relaxed text-muted-fg">
            The message is not hashed directly - a prefix of{" "}
            <span className="font-mono">
              {"\\x19Ethereum Signed Message:\\n<byte length>"}
            </span>{" "}
            is prepended first, and the <span className="font-mono">0x19</span>{" "}
            marker is what makes a personal_sign signature structurally unusable
            as a transaction.
          </p>

          {naive && (
            <div>
              <div className="font-mono text-[10.5px] tracking-[0.06em] uppercase text-faint mb-1">
                Without the prefix you&apos;d get
              </div>
              <div className="font-mono text-xs leading-relaxed break-all text-danger/75">
                {naive}
              </div>
              <p className="text-xs leading-relaxed text-muted-fg mt-1.5">
                This is the most common cause of a signature that verifies
                nowhere.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

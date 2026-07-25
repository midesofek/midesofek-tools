import { AddressComparison } from "./components/AddressComparison";
import { ChainResults } from "./components/ChainResults";
import { DigestComparison } from "./components/DigestComparison";
import { DigestPanel } from "./components/DigestPanel";
import { DualPath } from "./components/DualPath";
import { Findings } from "./components/Findings";
import { Trace } from "./components/Trace";
import { VerdictRow } from "./components/VerdictRow";
import {
  CheckIcon,
  DualRectanglesIcon,
  MixedIcon,
  SearchIcon,
  SpinnerIcon,
  WarningTriangleIcon,
  XIcon,
} from "./components/icons";
import type {
  DigestResult,
  DualPathResult,
  LoadingResult,
  MultichainResult,
  SingleVerificationResult,
  VerificationResult,
} from "./types";

const RESULT_TAGS = ["EOA", "ERC-1271", "EIP-6492", "EIP-7702", "Safe"];

export function ResultPanel({ result }: { result: VerificationResult | null }) {
  return (
    <div className="rounded-[14px] border border-border bg-card p-5.5 shadow-[0_1px_2px_oklch(0_0_0/0.04),0_10px_30px_-16px_oklch(0_0_0/0.12)]">
      <div className="flex justify-between items-center mb-4.5 font-mono text-[11px] tracking-[0.11em] uppercase text-faint">
        <span>Result</span>
        <span className="normal-case tracking-normal">{resultMeta(result)}</span>
      </div>

      {result === null && <EmptyBody />}
      {result?.status === "loading" && <LoadingBody result={result} />}
      {result?.status === "valid" && <ValidBody result={result} />}
      {result?.status === "invalid" && <InvalidBody result={result} />}
      {result?.status === "unknown" && <UnknownBody result={result} />}
      {result?.status === "multichain" && <MultichainBody result={result} />}
      {result?.status === "dual-path" && <DualPathBody result={result} />}
      {result?.status === "digest" && <DigestBody result={result} />}
    </div>
  );
}

function resultMeta(result: VerificationResult | null): string {
  if (!result) return "awaiting input";
  switch (result.status) {
    case "loading":
      return "streaming…";
    case "unknown":
      return "timed out";
    case "multichain":
      return `${result.chains.length} chains`;
    case "dual-path":
      return "2 paths";
    case "digest":
      return "computed locally";
    case "valid":
    case "invalid":
      // EOA verification is pure secp256k1 — no network, so no latency to show.
      if (result.path === "eoa") return "computed locally";
      return result.latencyMs ? `${result.latencyMs} ms` : "";
  }
}

function EmptyBody() {
  return (
    <div className="min-h-90 flex flex-col items-center justify-center text-center px-6 py-11">
      <span className="size-13 rounded-full inline-flex items-center justify-center border border-border bg-card-hover text-faint mb-4.5">
        <SearchIcon className="size-5.5" />
      </span>
      <div className="font-heading text-[19px] font-semibold text-foreground mb-2">
        No signature checked yet
      </div>
      <p className="text-sm leading-relaxed text-muted-fg mb-5 max-w-[42ch]">
        Enter an address, message, and signature. The verifier detects the account type and runs
        whichever mechanism applies.
      </p>
      <div className="flex flex-wrap gap-1.5 justify-center">
        {RESULT_TAGS.map((tag) => (
          <span
            key={tag}
            className="h-6 px-2.5 inline-flex items-center border border-border rounded-lg font-mono text-[11px] text-faint"
          >
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}

function LoadingBody({ result }: { result: LoadingResult }) {
  return (
    <div>
      <VerdictRow
        tone="loading"
        icon={<SpinnerIcon className="size-6" />}
        label="Verifying…"
        pill="detecting…"
        summary="Running checks against the target chain…"
      />
      <Trace steps={result.trace} />
    </div>
  );
}

function ValidBody({ result }: { result: Extract<SingleVerificationResult, { status: "valid" }> }) {
  return (
    <div>
      <VerdictRow
        tone="success"
        icon={<CheckIcon className="size-5.5" />}
        label="Valid"
        pill={result.pathLabel}
        summary={result.summary}
      />
      {result.matchedDigest && <DigestComparison matched digest={result.matchedDigest} />}
      <Trace steps={result.trace} />
      <Findings findings={result.findings} />
    </div>
  );
}

function InvalidBody({ result }: { result: Extract<SingleVerificationResult, { status: "invalid" }> }) {
  return (
    <div>
      <VerdictRow
        tone="danger"
        icon={<XIcon className="size-5.5" />}
        label="Invalid"
        pill={result.pathLabel}
        summary={result.summary}
      />
      {result.digests && <DigestComparison digests={result.digests} />}
      {result.addresses && <AddressComparison addresses={result.addresses} />}
      <Trace steps={result.trace} />
      <Findings findings={result.findings} />
    </div>
  );
}

const UNKNOWN_CAUSE_TEXT: Record<Extract<SingleVerificationResult, { status: "unknown" }>["cause"], string> = {
  timeout: "A timeout",
  rpc: "An RPC error",
  "unsupported-chain": "An unsupported chain",
};

function UnknownBody({ result }: { result: Extract<SingleVerificationResult, { status: "unknown" }> }) {
  return (
    <div>
      <VerdictRow
        tone="warning"
        icon={<WarningTriangleIcon className="size-5.5" />}
        label="Couldn't determine"
        pill={result.pathLabel}
        summary={result.summary}
      />
      <div className="mt-5 rounded-xl border border-warning/32 border-l-[3px] border-l-warning bg-warning/7 px-4.5 py-4">
        <div className="text-[13.5px] font-semibold text-foreground mb-1.25">No verdict was reached</div>
        <div className="text-[13px] leading-relaxed text-muted-fg mb-3.5">
          {UNKNOWN_CAUSE_TEXT[result.cause]} means the contract could be valid or invalid — the tool
          refuses to guess. Retry, or point it at an RPC you trust.
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            type="button"
            className="h-8 px-3.5 rounded-lg bg-foreground text-background text-xs font-semibold cursor-pointer"
          >
            Retry
          </button>
          <button
            type="button"
            className="h-8 px-3.5 rounded-lg border border-border font-mono text-xs cursor-pointer"
          >
            Set custom RPC
          </button>
        </div>
      </div>
      <Trace steps={result.trace} />
    </div>
  );
}

function MultichainBody({ result }: { result: MultichainResult }) {
  return (
    <div>
      <VerdictRow
        tone="plain"
        icon={<MixedIcon className="size-5" />}
        label="Mixed"
        pill={result.pathLabel}
        summary={result.summary}
      />
      <ChainResults chains={result.chains} />
    </div>
  );
}

function DigestBody({ result }: { result: DigestResult }) {
  const activeOutcome = result.results[result.active];
  return (
    <div>
      <DigestPanel results={result.results} active={result.active} />
      <Trace
        steps={[
          {
            label: "Hashed",
            detail: activeOutcome.detail,
            status: activeOutcome.digest !== null ? "ok" : "fail",
          },
        ]}
      />
      <Findings findings={result.findings} />
    </div>
  );
}

function DualPathBody({ result }: { result: DualPathResult }) {
  return (
    <div>
      <VerdictRow
        tone="plain"
        icon={<DualRectanglesIcon className="size-5" />}
        label="Dual-path"
        pill="EIP-7702"
        summary="This EOA has an active 7702 delegation, so both checks run — and they disagree."
      />
      <DualPath result={result} />
      <Trace steps={result.trace} />
    </div>
  );
}

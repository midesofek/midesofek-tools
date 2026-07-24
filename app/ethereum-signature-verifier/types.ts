import type { Address, Hex } from "viem";
import type { DigestOutcome, MessageMode } from "./lib/digest";

export type { MessageMode } from "./lib/digest";

export type VerificationPath = "eoa" | "erc1271" | "erc6492" | "eip7702";
export type AccountKind = "eoa" | "contract" | "delegated" | "undeployed";
export type ChainId = "ethereum" | "base" | "arbitrum" | "optimism" | "polygon";

export type StepStatus = "ok" | "fail" | "warn" | "pending" | "running";

export interface TraceStep {
  label: string; // "Detected", "Identified", "Hashed", "Called"
  detail: string; // monospace technical line — callers supply the exact
  // phrasing (e.g. "0xffffffff (rejected)" or "reverted: GS026") since a
  // rejection can be a returned magic value or a revert, and this type
  // shouldn't assume which.
  status: StepStatus;
  copyValue?: string; // present when the step's detail includes a copyable value
}

export interface DigestComparisonData {
  actual: Hex;
  expected: Hex;
  expectedLabel: string; // e.g. "The Safe expected"
}

export interface AddressComparisonData {
  claimed: Address;
  recovered: Address;
  recoveredNote?: string; // e.g. "Likely your other wallet."
}

interface VerificationResultBase {
  path: VerificationPath;
  accountKind: AccountKind;
  summary: string;
  trace: TraceStep[];
  pathLabel: string; // e.g. "ERC-1271 · Safe · Base" — the badge shown beside the verdict
  latencyMs?: number;
}

export type UnknownCause = "rpc" | "timeout" | "unsupported-chain";

/**
 * The three-state result of a single verification attempt. "unknown" is a
 * first-class outcome — a timeout or an unsupported chain never got an
 * answer, so it is never rendered as a rejection.
 */
export type SingleVerificationResult =
  | (VerificationResultBase & {
      status: "valid";
      findings: string[];
      /** The confirmed digest, shown as a "digest verified / match" block. */
      matchedDigest?: Hex;
    })
  | (VerificationResultBase & {
      status: "invalid";
      findings: string[];
      digests?: DigestComparisonData;
      addresses?: AddressComparisonData;
    })
  | (VerificationResultBase & {
      status: "unknown";
      cause: UnknownCause;
    });

export interface LoadingResult {
  status: "loading";
  path?: VerificationPath;
  accountKind?: AccountKind;
  trace: TraceStep[];
}

export interface ChainOutcome {
  chain: ChainId;
  chainLabel: string;
  status: "valid" | "invalid" | "unknown";
  detail: string;
  latencyMs: number;
}

export interface MultichainResult {
  status: "multichain";
  pathLabel: string;
  summary: string;
  chains: ChainOutcome[];
}

export interface DualPathResult {
  status: "dual-path";
  delegate: Address;
  eoaResult: { status: "valid" | "invalid"; detail: string };
  smartAccountResult: { status: "valid" | "invalid"; detail: string };
  trace: TraceStep[];
}

/**
 * Phase 2's state: no signature to check yet, just the three hashing recipes
 * run side by side. `active` is whichever mode is selected (auto-detected or
 * user-overridden); `findings` mirrors `results[active].findings` so the
 * Findings row doesn't need to know about the other two recipes.
 */
export interface DigestResult {
  status: "digest";
  detected: MessageMode;
  active: MessageMode;
  results: Record<MessageMode, DigestOutcome>;
  findings: string[];
}

/**
 * What the result panel actually renders. `null` is the empty state.
 * `SingleVerificationResult` covers the ordinary one-chain, one-path case;
 * `MultichainResult` and `DualPathResult` are composite views for the
 * fan-out and EIP-7702 dual-check states that don't reduce to one verdict.
 * `DigestResult` is Phase 2's pre-verification state.
 */
export type VerificationResult =
  | SingleVerificationResult
  | LoadingResult
  | MultichainResult
  | DualPathResult
  | DigestResult;

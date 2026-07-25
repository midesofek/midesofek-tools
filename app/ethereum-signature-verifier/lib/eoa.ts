import {
  recoverAddress,
  isHex,
  isAddress,
  getAddress,
  type Hex,
  type Address,
} from "viem";
import type { MessageMode } from "./digest";
import { buildDigest, type DigestOutcome } from "./digest";

/* ------------------------------------------------------------------ *
 * secp256k1 constants
 * ------------------------------------------------------------------ */

/** Order of the secp256k1 curve. */
const SECP256K1_N =
  0xfffffffffffffffffffffffffffffffebaaedce6af48a03bbfd25e8cd0364141n;
/** Half the curve order. s must be <= this to be canonical (low-s). */
const HALF_N = SECP256K1_N >> 1n;

/* ------------------------------------------------------------------ *
 * Signature normalization
 * ------------------------------------------------------------------ */

export interface SignatureParts {
  r: Hex;
  s: Hex;
  /** the normalized recovery byte: always 27 or 28 */
  v: number;
  /** what v was before normalization, for the trace */
  rawV: number;
  /** the full 65-byte signature with v normalized to 27/28 */
  normalized: Hex;
  /** non-fatal notes for the Findings row */
  findings: string[];
}

export interface NormalizeError {
  error: string;
}

/**
 * Split a 65-byte signature into r/s/v and normalize v to 27/28.
 *
 * The v byte is a recovery hint, but signers disagree about how to encode it:
 *   27 / 28   the original Ethereum convention (what we normalize to)
 *   0 / 1     the raw ECDSA recovery id — many libraries and hardware emit this
 *   >= 31     the "eth_sign" convention (Ledger, Safe): v is offset by 4
 *
 * viem's recover tolerates 0/1 but THROWS on v=31, so this step is not
 * cosmetic — without it, perfectly valid Ledger/Safe signatures fail to verify.
 *
 * We do NOT touch r or s here. Malleability (high-s) is reported by checkLowS,
 * not silently rewritten, because a verifier's job is to describe the signature
 * it was given, not to launder it.
 */
export function normalizeSignature(
  sig: string,
): SignatureParts | NormalizeError {
  const trimmed = sig.trim();

  if (!isHex(trimmed)) {
    return { error: "Signature is not hex — it must start with 0x." };
  }

  const byteLength = (trimmed.length - 2) / 2;
  if (byteLength !== 65) {
    return {
      error: `A signature must be 65 bytes (r + s + v) — this is ${byteLength}.`,
    };
  }

  const hex = trimmed.slice(2);
  const r = ("0x" + hex.slice(0, 64)) as Hex;
  const s = ("0x" + hex.slice(64, 128)) as Hex;
  const rawV = parseInt(hex.slice(128, 130), 16);

  const findings: string[] = [];
  let v: number;

  if (rawV === 27 || rawV === 28) {
    v = rawV;
  } else if (rawV === 0 || rawV === 1) {
    v = rawV + 27;
    findings.push(`v normalized ${rawV} → ${v} (raw recovery id)`);
  } else if (rawV >= 31) {
    // eth_sign convention: subtract 4. 31→27, 32→28.
    v = rawV - 4;
    if (v !== 27 && v !== 28) {
      return { error: `Unrecognised v byte: ${rawV}.` };
    }
    findings.push(`v normalized ${rawV} → ${v} (eth_sign convention)`);
  } else {
    return { error: `Unrecognised v byte: ${rawV}.` };
  }

  const normalized = ("0x" +
    hex.slice(0, 128) +
    v.toString(16).padStart(2, "0")) as Hex;

  return { r, s, v, rawV, normalized, findings };
}

function isNormalizeError(
  x: SignatureParts | NormalizeError,
): x is NormalizeError {
  return "error" in x;
}

/* ------------------------------------------------------------------ *
 * Malleability
 * ------------------------------------------------------------------ */

/**
 * Every ECDSA signature (r, s, v) has a mathematical twin (r, N−s, v')
 * that is equally valid. Modern signers always emit the "low" one (s <= N/2).
 * A high-s signature still verifies, but it's non-canonical and worth flagging —
 * some contracts (and EIP-2 strictly) reject it.
 */
export function checkLowS(s: Hex): { lowS: boolean; finding?: string } {
  const sValue = BigInt(s);
  if (sValue <= HALF_N) return { lowS: true };
  return { lowS: false, finding: "high-s signature (malleable)" };
}

/* ------------------------------------------------------------------ *
 * EOA verification
 * ------------------------------------------------------------------ */

export type TraceStatus = "ok" | "fail" | "warn";

export interface EoaTraceStep {
  label: string;
  detail: string;
  status: TraceStatus;
}

export type EoaVerification =
  | {
      status: "valid";
      recovered: Address;
      claimed: Address;
      digest: Hex;
      trace: EoaTraceStep[];
      findings: string[];
    }
  | {
      status: "invalid";
      /** present when we recovered an address but it didn't match */
      recovered?: Address;
      claimed: Address;
      digest?: Hex;
      /** plain-English reason */
      reason: string;
      trace: EoaTraceStep[];
      findings: string[];
    };

/**
 * Verify a signature as a plain EOA: recover the signer from the digest and
 * compare it to the claimed address. No network — this is pure secp256k1.
 *
 * Recovery essentially never throws on a well-formed signature; it returns
 * SOME address. So "invalid" almost always means "recovered a different
 * address than you claimed" — and we surface that recovered address, because
 * it's usually the single most useful fact for debugging (often the user's
 * other wallet).
 */
export async function verifyEOA(params: {
  address: string;
  message: string;
  mode: MessageMode;
  signature: string;
}): Promise<EoaVerification> {
  const { address, message, mode, signature } = params;
  const trace: EoaTraceStep[] = [];
  const findings: string[] = [];

  // 1. Validate the claimed address
  if (!isAddress(address)) {
    return {
      status: "invalid",
      claimed: address as Address,
      reason: "The address is not a valid Ethereum address.",
      trace: [
        {
          label: "Detected",
          detail: "address failed checksum/format",
          status: "fail",
        },
      ],
      findings,
    };
  }
  const claimed = getAddress(address);
  trace.push({
    label: "Detected",
    detail: "no code at address — externally owned",
    status: "ok",
  });

  // 2. Build the digest (reuses the Phase 2 layer)
  const digestOutcome: DigestOutcome = buildDigest(message, mode);
  if (!digestOutcome.digest) {
    return {
      status: "invalid",
      claimed,
      reason:
        digestOutcome.error ?? "Could not build the digest from this message.",
      trace: [
        ...trace,
        { label: "Hashed", detail: digestOutcome.detail, status: "fail" },
      ],
      findings: digestOutcome.findings ?? [],
    };
  }
  const digest = digestOutcome.digest;
  if (digestOutcome.findings) findings.push(...digestOutcome.findings);
  trace.push({ label: "Hashed", detail: digestOutcome.detail, status: "ok" });

  // 3. Normalize the signature
  const parts = normalizeSignature(signature);
  if (isNormalizeError(parts)) {
    return {
      status: "invalid",
      claimed,
      digest,
      reason: parts.error,
      trace: [
        ...trace,
        { label: "Split", detail: parts.error, status: "fail" },
      ],
      findings,
    };
  }
  findings.push(...parts.findings);
  trace.push({
    label: "Split",
    detail: `65-byte sig · r,s,v · v=${parts.v}`,
    status: "ok",
  });

  // 4. Malleability check (non-fatal)
  const lowS = checkLowS(parts.s);
  if (lowS.finding) findings.push(lowS.finding);

  // 5. Recover
  let recovered: Address;
  try {
    recovered = await recoverAddress({
      hash: digest,
      signature: parts.normalized,
    });
  } catch (e) {
    // Rare: malformed r/s that isn't a valid curve point
    return {
      status: "invalid",
      claimed,
      digest,
      reason: `Signature is malformed — ${(e as Error).message.split("\n")[0]}`,
      trace: [
        ...trace,
        {
          label: "Recovered",
          detail: "not a valid curve point",
          status: "fail",
        },
      ],
      findings,
    };
  }
  trace.push({
    label: "Recovered",
    detail: `ecrecover → ${recovered}`,
    status: "ok",
  });

  // 6. Compare
  const match = recovered.toLowerCase() === claimed.toLowerCase();
  if (match) {
    trace.push({
      label: "Compared",
      detail: "recovered = claimed address",
      status: "ok",
    });
    return { status: "valid", recovered, claimed, digest, trace, findings };
  }

  trace.push({
    label: "Compared",
    detail: "recovered ≠ claimed address",
    status: "fail",
  });
  return {
    status: "invalid",
    recovered,
    claimed,
    digest,
    reason:
      "The signature is cryptographically valid — but it recovers a different address than the one you entered.",
    trace,
    findings,
  };
}

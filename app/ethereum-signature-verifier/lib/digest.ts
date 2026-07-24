import {
  hashMessage,
  hashTypedData,
  keccak256,
  toHex,
  stringToBytes,
  concat,
  isHex,
  type Hex,
} from "viem";

export type MessageMode = "text" | "typed" | "hash";

/** Everything the UI and the trace need about one digest attempt. */
export interface DigestOutcome {
  mode: MessageMode;
  /** null when the input is invalid for this mode */
  digest: Hex | null;
  /** human-readable reason the digest could not be built */
  error?: string;
  /** one-line technical summary for the trace's "Hashed" step */
  detail: string;
  /** EIP-191 only — the exact bytes that were hashed, prefix included */
  preimage?: Hex;
  /** EIP-191 only — what you get if you forget the prefix. The classic bug. */
  naive?: Hex;
  /** EIP-712 only — parsed domain summary for display */
  domain?: {
    name?: string;
    version?: string;
    chainId?: number | string;
    verifyingContract?: string;
    primaryType?: string;
  };
  /** non-fatal observations worth showing in the Findings row */
  findings?: string[];
}

const RAW_HASH_RE = /^0x[0-9a-fA-F]{64}$/;

/**
 * Coerce a numeric-string chainId to a number.
 *
 * Why this exists: when `EIP712Domain` is absent from `types`, viem infers the
 * domain field types from the runtime JS values. A string "1" is then inferred
 * as `string` instead of `uint256`, and the digest comes out silently wrong.
 * When `EIP712Domain` IS declared, the explicit uint256 wins and a string is
 * coerced correctly — so the bug only appears in one of the two shapes, which
 * is exactly what makes it hard to spot in the wild.
 *
 * Real pasted JSON hits this often: JSON-RPC payloads frequently serialise
 * chainId as a string, and devs frequently strip EIP712Domain.
 */
function normalizeDomain(parsed: Record<string, unknown>): {
  normalized: Record<string, unknown>;
  findings: string[];
} {
  const findings: string[] = [];
  const domain = parsed.domain as Record<string, unknown> | undefined;
  if (!domain || typeof domain !== "object")
    return { normalized: parsed, findings };

  const chainId = domain.chainId;
  if (typeof chainId === "string" && /^\d+$/.test(chainId)) {
    findings.push(`chainId coerced "${chainId}" → ${chainId} (uint256)`);
    return {
      normalized: {
        ...parsed,
        domain: { ...domain, chainId: Number(chainId) },
      },
      findings,
    };
  }

  return { normalized: parsed, findings };
}

/**
 * Guess which recipe an input wants. Order matters:
 * JSON first (most specific), then a bare 32-byte hash, else plain text.
 *
 * This is a guess, not a verdict — the UI always lets the user override it.
 */
export function detectMessageType(input: string): MessageMode {
  const trimmed = input.trim();
  if (!trimmed) return "text";

  if (trimmed.startsWith("{")) {
    try {
      const parsed = JSON.parse(trimmed);
      if (
        parsed &&
        typeof parsed === "object" &&
        "types" in parsed &&
        "message" in parsed
      ) {
        return "typed";
      }
    } catch {
      // malformed JSON — fall through and treat as text
    }
  }

  if (RAW_HASH_RE.test(trimmed)) return "hash";

  return "text";
}

/**
 * EIP-191 / personal_sign.
 *
 * The message is NOT hashed directly. A prefix is prepended first:
 *   0x19 + "Ethereum Signed Message:\n" + <byte length> + <message>
 * The leading 0x19 can never begin a valid RLP-encoded transaction, which is
 * what makes a personal_sign signature structurally unusable as a transaction.
 *
 * Note the length is the BYTE length, not the character count — they differ
 * for any non-ASCII input.
 */
export function buildDigest191(text: string): DigestOutcome {
  const bytes = stringToBytes(text);
  const prefix = stringToBytes(`\x19Ethereum Signed Message:\n${bytes.length}`);
  const preimage = concat([prefix, bytes]);

  return {
    mode: "text",
    digest: hashMessage(text),
    detail: `EIP-191 personal_sign · ${bytes.length}-byte message`,
    preimage: toHex(preimage),
    naive: keccak256(bytes),
  };
}

/**
 * EIP-712 typed data.
 *
 * viem is tolerant of the shapes people actually paste: an `EIP712Domain`
 * entry inside `types` is accepted, and numeric fields may arrive as strings.
 * So we validate structure only, and let viem handle coercion.
 */
export function buildDigest712(json: string): DigestOutcome {
  let parsed: Record<string, unknown>;

  try {
    parsed = JSON.parse(json.trim());
  } catch (e) {
    return {
      mode: "typed",
      digest: null,
      error: `Not valid JSON — ${(e as Error).message}`,
      detail: "EIP-712 · parse failed",
    };
  }

  for (const key of ["types", "primaryType", "message"] as const) {
    if (!(key in parsed)) {
      return {
        mode: "typed",
        digest: null,
        error: `Missing "${key}". Typed data needs types, primaryType, domain and message.`,
        detail: `EIP-712 · missing ${key}`,
      };
    }
  }

  const domain = (parsed.domain ?? {}) as Record<string, unknown>;
  const primaryType = String(parsed.primaryType);

  const summary: DigestOutcome["domain"] = {
    name: domain.name as string | undefined,
    version: domain.version as string | undefined,
    chainId: domain.chainId as number | string | undefined,
    verifyingContract: domain.verifyingContract as string | undefined,
    primaryType,
  };

  const { normalized, findings } = normalizeDomain(parsed);

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const digest = hashTypedData(normalized as any);
    const chainPart =
      summary.chainId !== undefined
        ? ` · domain chainId ${summary.chainId}`
        : "";
    return {
      mode: "typed",
      digest,
      detail: `EIP-712 typed-data · ${primaryType}${chainPart}`,
      domain: summary,
      findings,
    };
  } catch (e) {
    return {
      mode: "typed",
      digest: null,
      error: (e as Error).message.split("\n")[0],
      detail: "EIP-712 · hashing failed",
      domain: summary,
      findings,
    };
  }
}

/** Raw 32-byte digest — used as-is. Common with 4337 UserOps and Permit2. */
export function buildDigestRaw(input: string): DigestOutcome {
  const trimmed = input.trim();

  if (!isHex(trimmed)) {
    return {
      mode: "hash",
      digest: null,
      error: "Not hex — a raw digest must start with 0x.",
      detail: "raw hash · not hex",
    };
  }

  const byteLength = (trimmed.length - 2) / 2;
  if (byteLength !== 32) {
    return {
      mode: "hash",
      digest: null,
      error: `A digest must be exactly 32 bytes — this is ${byteLength}.`,
      detail: `raw hash · ${byteLength} bytes`,
    };
  }

  return {
    mode: "hash",
    digest: trimmed as Hex,
    detail: "raw hash · used as-is, no recipe applied",
  };
}

/** Build the digest for one explicit mode. */
export function buildDigest(input: string, mode: MessageMode): DigestOutcome {
  switch (mode) {
    case "text":
      return buildDigest191(input);
    case "typed":
      return buildDigest712(input);
    case "hash":
      return buildDigestRaw(input);
  }
}

/**
 * Build all three recipes at once, and report which one was auto-detected.
 * The Phase 2 UI renders every result so the difference is visible.
 */
export function buildAllDigests(input: string): {
  detected: MessageMode;
  results: Record<MessageMode, DigestOutcome>;
} {
  return {
    detected: detectMessageType(input),
    results: {
      text: buildDigest191(input),
      typed: buildDigest712(input),
      hash: buildDigestRaw(input),
    },
  };
}

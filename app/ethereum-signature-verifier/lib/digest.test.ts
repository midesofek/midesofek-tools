import { describe, it, expect } from "vitest";
import {
  detectMessageType,
  buildDigest191,
  buildDigest712,
  buildDigestRaw,
  buildDigest,
  buildAllDigests,
} from "./digest";
import { EIP191, EIP712, RAW_HASH } from "./fixtures";

describe("detectMessageType", () => {
  it("reads plain text as text", () => {
    expect(detectMessageType("Login to CoolApp")).toBe("text");
  });

  it("reads typed-data JSON as typed", () => {
    expect(detectMessageType(JSON.stringify(EIP712.typedData))).toBe("typed");
  });

  it("reads a 32-byte hex string as a raw hash", () => {
    expect(detectMessageType(RAW_HASH.digest)).toBe("hash");
  });

  it("falls back to text on malformed JSON rather than throwing", () => {
    expect(detectMessageType("{not json")).toBe("text");
  });

  it("does not claim arbitrary JSON is typed data", () => {
    expect(detectMessageType('{"a":1}')).toBe("text");
  });

  it("does not mistake short hex for a digest", () => {
    expect(detectMessageType("0xabcd")).toBe("text");
  });

  it("treats empty input as text", () => {
    expect(detectMessageType("")).toBe("text");
  });
});

describe("buildDigest191", () => {
  it("matches the frozen vector", () => {
    expect(buildDigest191(EIP191.message).digest).toBe(EIP191.digest);
  });

  it("exposes the unprefixed hash so the UI can warn about it", () => {
    expect(buildDigest191(EIP191.message).naive).toBe(EIP191.naiveNoPrefix);
  });

  it("produces a different digest than the unprefixed hash", () => {
    const r = buildDigest191(EIP191.message);
    expect(r.digest).not.toBe(r.naive);
  });

  it("exposes a preimage that starts with the 0x19 marker", () => {
    expect(buildDigest191(EIP191.message).preimage?.startsWith("0x19")).toBe(
      true,
    );
  });

  it("uses byte length, not character count, in the prefix", () => {
    // 'héllo 🚀' is 8 characters but 11 bytes in UTF-8
    expect(buildDigest191("héllo 🚀").detail).toContain("11-byte");
  });

  it("handles an empty message", () => {
    expect(buildDigest191("").digest).toMatch(/^0x[0-9a-f]{64}$/);
  });
});

describe("buildDigest712", () => {
  it("matches the frozen vector", () => {
    expect(buildDigest712(JSON.stringify(EIP712.typedData)).digest).toBe(
      EIP712.digest,
    );
  });

  it("binds the digest to the chain via the domain separator", () => {
    const onBase = JSON.stringify({
      ...EIP712.typedData,
      domain: { ...EIP712.typedData.domain, chainId: 8453 },
    });
    expect(buildDigest712(onBase).digest).toBe(EIP712.digestOnBase);
  });

  it("accepts EIP712Domain inside types, as wallets emit it", () => {
    const withDomainType = JSON.stringify({
      ...EIP712.typedData,
      types: {
        EIP712Domain: [
          { name: "name", type: "string" },
          { name: "version", type: "string" },
          { name: "chainId", type: "uint256" },
          { name: "verifyingContract", type: "address" },
        ],
        ...EIP712.typedData.types,
      },
    });
    expect(buildDigest712(withDomainType).digest).toBe(EIP712.digest);
  });

  it("accepts chainId as a string, as pasted JSON often has it", () => {
    const stringChainId = JSON.stringify({
      ...EIP712.typedData,
      domain: { ...EIP712.typedData.domain, chainId: "1" },
    });
    expect(buildDigest712(stringChainId).digest).toBe(EIP712.digest);
  });

  it("surfaces the primaryType for the trace", () => {
    expect(
      buildDigest712(JSON.stringify(EIP712.typedData)).domain?.primaryType,
    ).toBe("Mail");
  });

  it("returns null with an error on malformed JSON instead of throwing", () => {
    const r = buildDigest712("{oops");
    expect(r.digest).toBeNull();
    expect(r.error).toBeTruthy();
  });

  it("names the missing key when structure is incomplete", () => {
    expect(buildDigest712('{"message":{},"primaryType":"X"}').error).toContain(
      "types",
    );
  });
});

describe("buildDigestRaw", () => {
  it("passes a valid 32-byte digest through unchanged", () => {
    expect(buildDigestRaw(RAW_HASH.digest).digest).toBe(RAW_HASH.digest);
  });

  it("rejects anything that is not 32 bytes", () => {
    expect(buildDigestRaw("0x" + "ab".repeat(31)).digest).toBeNull();
  });

  it("reports the actual byte length so the user can see what is wrong", () => {
    expect(buildDigestRaw("0x" + "ab".repeat(31)).error).toContain("31");
  });

  it("rejects non-hex input", () => {
    expect(buildDigestRaw("hello").digest).toBeNull();
  });

  it("tolerates surrounding whitespace", () => {
    expect(buildDigestRaw(`  ${RAW_HASH.digest}  `).digest).toBe(
      RAW_HASH.digest,
    );
  });
});

describe("buildDigest", () => {
  it("honours an explicit mode over what detection would guess", () => {
    // A raw hash string, forced through the 191 recipe — a real override case
    const r = buildDigest(RAW_HASH.digest, "text");
    expect(r.mode).toBe("text");
    expect(r.digest).not.toBe(RAW_HASH.digest);
  });
});

describe("buildAllDigests", () => {
  it("reports the detected mode and still returns all three attempts", () => {
    const all = buildAllDigests(EIP191.message);
    expect(all.detected).toBe("text");
    expect(all.results.text.digest).toBe(EIP191.digest);
    expect(all.results.typed.digest).toBeNull();
    expect(all.results.hash.digest).toBeNull();
  });

  it("never throws, whatever the input", () => {
    expect(() => buildAllDigests('{"broken":')).not.toThrow();
    expect(() => buildAllDigests("")).not.toThrow();
  });
});

describe("domain normalization — the string-chainId footgun", () => {
  const stringChainId = JSON.stringify({
    ...EIP712.typedData,
    domain: { ...EIP712.typedData.domain, chainId: "1" },
  });

  it("produces the correct digest despite a string chainId", () => {
    expect(buildDigest712(stringChainId).digest).toBe(EIP712.digest);
  });

  it("reports the coercion as a finding so the user learns about it", () => {
    expect(buildDigest712(stringChainId).findings?.[0]).toContain(
      "chainId coerced",
    );
  });

  it("does not report a finding when chainId is already numeric", () => {
    expect(buildDigest712(JSON.stringify(EIP712.typedData)).findings).toEqual(
      [],
    );
  });

  it("leaves a non-numeric chainId alone rather than mangling it", () => {
    const weird = JSON.stringify({
      ...EIP712.typedData,
      domain: { ...EIP712.typedData.domain, chainId: "0x1" },
    });
    expect(buildDigest712(weird).findings).toEqual([]);
  });
});

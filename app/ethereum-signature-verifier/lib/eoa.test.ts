import { describe, it, expect } from "vitest";
import { normalizeSignature, checkLowS, verifyEOA } from "./eoa";
import { EOA } from "./fixtures";

function isErr(x: unknown): x is { error: string } {
  return typeof x === "object" && x !== null && "error" in x;
}

describe("normalizeSignature", () => {
  it("leaves a canonical v=27 signature untouched", () => {
    const r = normalizeSignature(EOA.signature);
    expect(isErr(r)).toBe(false);
    if (!isErr(r)) {
      expect(r.v).toBe(27);
      expect(r.findings).toEqual([]);
    }
  });

  it("lifts a raw recovery id (0) to 27 and reports it", () => {
    const r = normalizeSignature(EOA.signatureRecId);
    expect(isErr(r)).toBe(false);
    if (!isErr(r)) {
      expect(r.v).toBe(27);
      expect(r.findings[0]).toContain("raw recovery id");
      expect(r.normalized).toBe(EOA.signature);
    }
  });

  it("converts the eth_sign convention (31) to 27 and reports it", () => {
    const r = normalizeSignature(EOA.signatureEthSign);
    expect(isErr(r)).toBe(false);
    if (!isErr(r)) {
      expect(r.v).toBe(27);
      expect(r.findings[0]).toContain("eth_sign");
    }
  });

  it("rejects a signature that is not 65 bytes", () => {
    const r = normalizeSignature("0xabcd");
    expect(isErr(r)).toBe(true);
    if (isErr(r)) expect(r.error).toContain("65");
  });

  it("rejects non-hex input", () => {
    expect(isErr(normalizeSignature("not a signature"))).toBe(true);
  });

  it("rejects an unrecognised v byte", () => {
    expect(isErr(normalizeSignature("0x" + "ab".repeat(64) + "05"))).toBe(true);
  });
});

describe("checkLowS", () => {
  it("accepts the canonical low-s signature", () => {
    const p = normalizeSignature(EOA.signature);
    if (!isErr(p)) expect(checkLowS(p.s).lowS).toBe(true);
  });

  it("flags the high-s malleable twin", () => {
    const p = normalizeSignature(EOA.signatureHighS);
    if (!isErr(p)) {
      const c = checkLowS(p.s);
      expect(c.lowS).toBe(false);
      expect(c.finding).toContain("malleable");
    }
  });
});

describe("verifyEOA — the happy path", () => {
  it("verifies a correct signature", async () => {
    const r = await verifyEOA({
      address: EOA.address,
      message: EOA.message,
      mode: "text",
      signature: EOA.signature,
    });
    expect(r.status).toBe("valid");
    if (r.status === "valid") {
      expect(r.recovered).toBe(EOA.address);
      expect(r.digest).toBe(EOA.digest);
    }
  });

  it("verifies identically across all three v encodings", async () => {
    const base = ["signature", "signatureRecId", "signatureEthSign"] as const;
    const results = await Promise.all(
      base.map((k) =>
        verifyEOA({
          address: EOA.address,
          message: EOA.message,
          mode: "text",
          signature: EOA[k],
        }),
      ),
    );
    expect(results.every((r) => r.status === "valid")).toBe(true);
    const recovered = results.map((r) =>
      r.status === "valid" ? r.recovered : null,
    );
    expect(new Set(recovered).size).toBe(1);
  });

  it("returns a checksummed recovered address", async () => {
    const r = await verifyEOA({
      address: EOA.address.toLowerCase(),
      message: EOA.message,
      mode: "text",
      signature: EOA.signature,
    });
    if (r.status === "valid") expect(r.recovered).toBe(EOA.address);
  });
});

describe("verifyEOA — the mismatch case (the important one)", () => {
  it("marks a wrong-address check invalid but surfaces the recovered address", async () => {
    const r = await verifyEOA({
      address: EOA.otherAddress,
      message: EOA.message,
      mode: "text",
      signature: EOA.signature,
    });
    expect(r.status).toBe("invalid");
    if (r.status === "invalid") {
      // the recovered address is the REAL signer, not the claimed one
      expect(r.recovered?.toLowerCase()).toBe(EOA.address.toLowerCase());
      expect(r.reason).toContain("different address");
    }
  });

  it("a wrong message produces a different digest and an unexpected address", async () => {
    const r = await verifyEOA({
      address: EOA.address,
      message: "Login to EvilApp",
      mode: "text",
      signature: EOA.signature,
    });
    expect(r.status).toBe("invalid");
    if (r.status === "invalid") expect(r.recovered).toBeDefined();
  });
});

describe("verifyEOA — high-s", () => {
  it("still verifies but reports the malleability finding", async () => {
    const r = await verifyEOA({
      address: EOA.address,
      message: EOA.message,
      mode: "text",
      signature: EOA.signatureHighS,
    });
    expect(r.status).toBe("valid");
    expect(r.findings.some((f) => f.includes("high-s"))).toBe(true);
  });
});

describe("verifyEOA — input validation", () => {
  it("rejects a malformed address", async () => {
    const r = await verifyEOA({
      address: "0xnothex",
      message: EOA.message,
      mode: "text",
      signature: EOA.signature,
    });
    expect(r.status).toBe("invalid");
    if (r.status === "invalid")
      expect(r.reason).toContain("valid Ethereum address");
  });

  it("rejects a signature of the wrong length", async () => {
    const r = await verifyEOA({
      address: EOA.address,
      message: EOA.message,
      mode: "text",
      signature: "0x1234",
    });
    expect(r.status).toBe("invalid");
    if (r.status === "invalid") expect(r.reason).toContain("65");
  });
});

describe("verifyEOA — trace", () => {
  it("emits a five-step all-ok trace on success", async () => {
    const r = await verifyEOA({
      address: EOA.address,
      message: EOA.message,
      mode: "text",
      signature: EOA.signature,
    });
    expect(r.trace).toHaveLength(5);
    expect(r.trace.every((s) => s.status === "ok")).toBe(true);
  });

  it("keeps Recovered green but ends Compared red on a mismatch", async () => {
    const r = await verifyEOA({
      address: EOA.otherAddress,
      message: EOA.message,
      mode: "text",
      signature: EOA.signature,
    });
    expect(
      r.trace.some((s) => s.label === "Recovered" && s.status === "ok"),
    ).toBe(true);
    expect(r.trace.at(-1)?.status).toBe("fail");
  });
});

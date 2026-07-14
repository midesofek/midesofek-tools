"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import type { DelegationCheck } from "../types";

type FetchState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "success"; check: DelegationCheck };

export function AddressChecker() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialAddress = searchParams.get("address") ?? "";

  const [input, setInput] = useState(initialAddress);
  const [state, setState] = useState<FetchState>({ status: "idle" });

  useEffect(() => {
    if (initialAddress) {
      void runCheck(initialAddress);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function runCheck(address: string) {
    setState({ status: "loading" });
    try {
      const resp = await fetch(
        `/api/eip-7702-check?address=${encodeURIComponent(address)}`,
      );
      const data = await resp.json();
      if (data.ok) {
        setState({ status: "success", check: data.check });
      } else {
        setState({ status: "error", message: data.error });
      }
    } catch {
      setState({
        status: "error",
        message:
          "Couldn't reach the server. Check your connection and try again.",
      });
    }
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed) return;
    const params = new URLSearchParams(searchParams.toString());
    params.set("address", trimmed);
    router.replace(`?${params.toString()}`, { scroll: false });
    void runCheck(trimmed);
  }

  function onClear() {
    setInput("");
    setState({ status: "idle" });
    router.replace("?", { scroll: false });
  }

  return (
    <div className="grid lg:grid-cols-2 gap-12 py-8">
      {/* Left: input */}
      <div className="space-y-6">
        <form onSubmit={onSubmit} className="space-y-3">
          <label htmlFor="eoa-address" className="block text-sm font-medium">
            Ethereum address
          </label>
          <Input
            id="eoa-address"
            placeholder="0x..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="font-mono text-sm"
            autoComplete="off"
            spellCheck={false}
          />
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Paste any Ethereum mainnet address. The tool reads its on-chain code
            and reports whether the account is currently delegated under
            EIP-7702.
          </p>

          <div className="flex gap-2 pt-1">
            <button
              type="submit"
              disabled={!input.trim() || state.status === "loading"}
              className="px-4 py-2 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 rounded-md text-sm font-medium hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
            >
              {state.status === "loading" ? "Checking..." : "Check delegation"}
            </button>
            {(input || state.status !== "idle") && (
              <button
                type="button"
                onClick={onClear}
                className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-900"
              >
                Clear
              </button>
            )}
          </div>
        </form>

        {state.status === "idle" && (
          <div className="pt-4 border-t border-gray-200 dark:border-gray-800">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
              Or try an example:
            </p>
            <ul className="text-xs space-y-1">
              <ExampleLink
                label="Vitalik.eth (plain EOA)"
                address="0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045"
                onPick={(a) => {
                  setInput(a);
                  void runCheck(a);
                  router.replace(`?address=${a}`, { scroll: false });
                }}
              />
              <ExampleLink
                label="A regular contract (WETH9)"
                address="0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"
                onPick={(a) => {
                  setInput(a);
                  void runCheck(a);
                  router.replace(`?address=${a}`, { scroll: false });
                }}
              />
            </ul>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-3 italic">
              Have a known delegated address to add as an example?{" "}
              <a
                href="https://github.com/midesofek/midesofek-tools"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-gray-600 dark:hover:text-gray-300"
              >
                PR welcome
              </a>
              .
            </p>
          </div>
        )}
      </div>

      {/* Right: result */}
      <div className="lg:sticky lg:top-8 lg:self-start">
        {state.status === "idle" && <EmptyState />}
        {state.status === "loading" && <LoadingState />}
        {state.status === "error" && <ErrorState message={state.message} />}
        {state.status === "success" && <ResultCard check={state.check} />}
      </div>
    </div>
  );
}

/* ---------- subcomponents ---------- */

function ExampleLink({
  label,
  address,
  onPick,
}: {
  label: string;
  address: string;
  onPick: (a: string) => void;
}) {
  return (
    <li>
      <button
        type="button"
        onClick={() => onPick(address)}
        className="text-left underline text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
      >
        {label}
      </button>
    </li>
  );
}

function EmptyState() {
  return (
    <div className="border border-dashed border-gray-300 dark:border-gray-700 rounded-2xl p-12 text-center text-sm text-gray-500 dark:text-gray-400">
      Paste an address to check its EIP-7702 delegation status.
    </div>
  );
}

function LoadingState() {
  return (
    <div className="border border-gray-200 dark:border-gray-800 rounded-2xl p-12 text-center">
      <div className="inline-block w-6 h-6 border-2 border-gray-300 dark:border-gray-700 border-t-gray-900 dark:border-t-gray-100 rounded-full animate-spin mb-4" />
      <p className="text-sm text-gray-500 dark:text-gray-400">
        Reading on-chain code...
      </p>
    </div>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <div className="border border-red-200 dark:border-red-900 bg-red-50/50 dark:bg-red-950/20 rounded-2xl p-6">
      <h3 className="font-medium text-red-900 dark:text-red-200 mb-1">
        Couldn&apos;t check this address
      </h3>
      <p className="text-sm text-red-700 dark:text-red-300">{message}</p>
    </div>
  );
}

function ResultCard({ check }: { check: DelegationCheck }) {
  if (check.status === "plain-eoa") {
    return (
      <div className="border border-gray-200 dark:border-gray-800 rounded-2xl p-6 space-y-4">
        <StatusBadge tone="neutral">Plain EOA</StatusBadge>
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
            This address has no code on-chain and is not currently delegated
            under EIP-7702. It behaves as a standard externally owned account.
          </p>
        </div>
        <AddressRow label="Address" value={check.address} />
      </div>
    );
  }

  if (check.status === "contract") {
    return (
      <div className="border border-gray-200 dark:border-gray-800 rounded-2xl p-6 space-y-4">
        <StatusBadge tone="neutral">Regular contract</StatusBadge>
        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
          This address holds{" "}
          <span className="font-mono">{check.codeSize.toLocaleString()}</span>{" "}
          bytes of on-chain code, but the code does not start with the EIP-7702
          delegation prefix (<span className="font-mono">0xef0100</span>).
          It&apos;s a regular smart contract, not a delegated EOA.
        </p>
        <AddressRow label="Address" value={check.address} />
      </div>
    );
  }

  // check.status === "delegated"
  const tone: BadgeTone =
    check.risk === "safe"
      ? "success"
      : check.risk === "malicious"
        ? "danger"
        : check.risk === "broken"
          ? "warning"
          : "neutral";

  const label =
    check.risk === "safe"
      ? "Delegated (verified)"
      : check.risk === "malicious"
        ? "Delegated (KNOWN MALICIOUS)"
        : check.risk === "broken"
          ? "Delegated (broken)"
          : "Delegated (unknown)";

  return (
    <div className="border border-gray-200 dark:border-gray-800 rounded-2xl p-6 space-y-4">
      <StatusBadge tone={tone}>{label}</StatusBadge>

      <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
        {check.reason}
      </p>

      {check.attribution && (
        <div className="text-xs pt-2">
          <span className="text-gray-500 dark:text-gray-400">
            Classified by{" "}
          </span>
          {check.attribution.sourceUrl ? (
            <a
              href={check.attribution.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="underline text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100"
            >
              {check.attribution.source}
            </a>
          ) : (
            <span className="text-gray-700 dark:text-gray-300">
              {check.attribution.source}
            </span>
          )}
          {check.attribution.category && (
            <span className="text-gray-500 dark:text-gray-400">
              {" "}
              · tag:{" "}
              <span className="font-mono text-gray-700 dark:text-gray-300">
                {check.attribution.category}
              </span>
            </span>
          )}
        </div>
      )}

      <div className="space-y-3 pt-2 border-t border-gray-200 dark:border-gray-800">
        <AddressRow label="Delegated account" value={check.address} />
        <AddressRow
          label={
            check.delegateName ? `Delegate (${check.delegateName})` : "Delegate"
          }
          value={check.delegate}
        />
        <div className="text-xs">
          <div className="text-gray-500 dark:text-gray-400 mb-1">
            On-chain code (23 bytes)
          </div>
          <div className="font-mono break-all text-gray-800 dark:text-gray-200">
            {check.rawCode}
          </div>
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400">
          Delegate code size:{" "}
          <span className="font-mono">
            {check.delegateCodeSize.toLocaleString()} bytes
          </span>
        </div>
      </div>
    </div>
  );
}

type BadgeTone = "success" | "danger" | "warning" | "neutral";

function StatusBadge({
  tone,
  children,
}: {
  tone: BadgeTone;
  children: React.ReactNode;
}) {
  const classes = {
    success:
      "bg-green-50 dark:bg-green-950/30 text-green-800 dark:text-green-200 border-green-200 dark:border-green-900",
    danger:
      "bg-red-50 dark:bg-red-950/30 text-red-800 dark:text-red-200 border-red-200 dark:border-red-900",
    warning:
      "bg-amber-50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-200 border-amber-200 dark:border-amber-900",
    neutral:
      "bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200 border-gray-200 dark:border-gray-800",
  }[tone];

  return (
    <span
      className={`inline-block text-xs font-medium px-3 py-1 rounded-full border ${classes}`}
    >
      {children}
    </span>
  );
}

function AddressRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-xs">
      <div className="text-gray-500 dark:text-gray-400 mb-1">{label}</div>
      <a
        href={`https://etherscan.io/address/${value}`}
        target="_blank"
        rel="noopener noreferrer"
        className="font-mono break-all text-gray-800 dark:text-gray-200 hover:underline"
      >
        {value}
      </a>
    </div>
  );
}

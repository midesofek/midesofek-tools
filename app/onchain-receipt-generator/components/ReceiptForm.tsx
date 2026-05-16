"use client";

import { useEffect, useState } from "react";
import { useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Receipt } from "./Receipt";
import type { Receipt as ReceiptType } from "../types";

type FetchState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "success"; receipt: ReceiptType };

export function ReceiptForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTx = searchParams.get("tx") ?? "";

  const [input, setInput] = useState(initialTx);
  const [state, setState] = useState<FetchState>({ status: "idle" });

  // If ?tx=... is present on load, auto-fetch
  useEffect(() => {
    if (initialTx) {
      void fetchReceipt(initialTx);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function fetchReceipt(hash: string) {
    setState({ status: "loading" });
    try {
      const resp = await fetch(`/api/receipt?hash=${encodeURIComponent(hash)}`);
      const data = await resp.json();
      if (data.ok) {
        // Rehydrate Date — JSON serialization turns it into an ISO string
        const receipt = {
          ...data.receipt,
          timestamp: new Date(data.receipt.timestamp),
        };
        setState({ status: "success", receipt });
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
    // Update URL so the receipt is shareable
    const params = new URLSearchParams(searchParams.toString());
    params.set("tx", trimmed);
    router.replace(`?${params.toString()}`, { scroll: false });
    void fetchReceipt(trimmed);
  }

  function onClear() {
    setInput("");
    setState({ status: "idle" });
    router.replace("?", { scroll: false });
  }

  const [isExporting, startExport] = useTransition();

  async function downloadPDF() {
    if (state.status !== "success") return;
    startExport(async () => {
      // Lazy-load the PDF renderer — only ship ~200KB when actually exporting
      const { pdf } = await import("@react-pdf/renderer");
      const { ReceiptPDF } = await import("./ReceiptPDF");
      const blob = await pdf(<ReceiptPDF receipt={state.receipt} />).toBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `receipt-${state.receipt.hash.slice(0, 10)}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    });
  }

  function downloadImage() {
    if (state.status !== "success") return;
    const url = `/api/receipt-image?hash=${encodeURIComponent(state.receipt.hash)}`;
    // Trigger download via temporary anchor with `download` attribute
    const a = document.createElement("a");
    a.href = url;
    a.download = `receipt-${state.receipt.hash.slice(0, 10)}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  return (
    <div className="grid lg:grid-cols-2 gap-12 py-8">
      {/* Left: input */}
      <div className="space-y-6">
        <form onSubmit={onSubmit} className="space-y-3">
          <label htmlFor="tx-hash" className="block text-sm font-medium">
            Transaction hash
          </label>
          <Input
            id="tx-hash"
            placeholder="0x... or Solana signature"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="font-mono text-sm"
            autoComplete="off"
            spellCheck={false}
          />
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Paste any tx hash from Ethereum, Base, BSC, or Solana. Chain is
            detected automatically.
          </p>

          <div className="flex gap-2 pt-1">
            <button
              type="submit"
              disabled={!input.trim() || state.status === "loading"}
              className="px-4 py-2 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 rounded-md text-sm font-medium hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
            >
              {state.status === "loading" ? "Fetching..." : "Generate receipt"}
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

        {/* Example links to help first-time users */}
        {state.status === "idle" && (
          <div className="pt-4 border-t border-gray-200 dark:border-gray-800">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
              Or try an example:
            </p>
            <ul className="text-xs space-y-1">
              <ExampleLink
                label="Ethereum (2018 ETH transfer)"
                hash="0x88df016429689c079f3b2f6ad39fa052532c56795b733da78a91ebe6a713944b"
                onPick={(h) => {
                  setInput(h);
                  void fetchReceipt(h);
                  router.replace(`?tx=${h}`, { scroll: false });
                }}
              />
              <ExampleLink
                label="Base (USDC transfer)"
                hash="0x64e192d275b8eed83f7b3e54e57ad1643675f6dceaa7fe6f55afc35bfb539c7c"
                onPick={(h) => {
                  setInput(h);
                  void fetchReceipt(h);
                  router.replace(`?tx=${h}`, { scroll: false });
                }}
              />
              <ExampleLink
                label="Solana (Raydium swap)"
                hash="3B2ej83XyRxmKmsf77FQMoVzbDbFqm74KViZ2RSnk5pXpJ1YB2cNa9QuYNGwigwxPZk374KhonBvL5PBHri9BU6e"
                onPick={(h) => {
                  setInput(h);
                  void fetchReceipt(h);
                  router.replace(`?tx=${h}`, { scroll: false });
                }}
              />
            </ul>
          </div>
        )}
      </div>

      {/* Right: preview */}
      <div className="lg:sticky lg:top-8 lg:self-start">
        {state.status === "idle" && <EmptyState />}
        {state.status === "loading" && <LoadingState />}
        {state.status === "error" && <ErrorState message={state.message} />}
        {state.status === "success" && (
          <div className="space-y-4">
            <Receipt receipt={state.receipt} />
            <div className="flex gap-2 justify-end flex-wrap">
              <button
                type="button"
                onClick={downloadImage}
                className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-900"
              >
                Download image
              </button>
              <button
                type="button"
                onClick={downloadPDF}
                disabled={isExporting}
                className="px-4 py-2 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 rounded-md text-sm font-medium hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
              >
                {isExporting ? "Generating PDF..." : "Download PDF"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------- subcomponents ---------- */

function ExampleLink({
  label,
  hash,
  onPick,
}: {
  label: string;
  hash: string;
  onPick: (h: string) => void;
}) {
  return (
    <li>
      <button
        type="button"
        onClick={() => onPick(hash)}
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
      Paste a transaction hash to generate a receipt.
    </div>
  );
}

function LoadingState() {
  return (
    <div className="border border-gray-200 dark:border-gray-800 rounded-2xl p-12 text-center">
      <div className="inline-block w-6 h-6 border-2 border-gray-300 dark:border-gray-700 border-t-gray-900 dark:border-t-gray-100 rounded-full animate-spin mb-4" />
      <p className="text-sm text-gray-500 dark:text-gray-400">
        Fetching transaction...
      </p>
    </div>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <div className="border border-red-200 dark:border-red-900 bg-red-50/50 dark:bg-red-950/20 rounded-2xl p-6">
      <h3 className="font-medium text-red-900 dark:text-red-200 mb-1">
        Couldn&apos;t fetch this transaction
      </h3>
      <p className="text-sm text-red-700 dark:text-red-300">{message}</p>
    </div>
  );
}

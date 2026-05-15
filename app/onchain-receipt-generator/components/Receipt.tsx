import type { Receipt as ReceiptType } from "../types";
import { ChainBadge } from "./ChainBadge";
import { formatUsd, formatAmount, formatTimestamp } from "../lib/format";

type ReceiptProps = {
  receipt: ReceiptType;
};

export function Receipt({ receipt }: ReceiptProps) {
  const isFailed = receipt.status === "failed";

  return (
    <article className="bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden">
      {/* Header band */}
      <header className="px-6 py-5 border-b border-gray-100 dark:border-gray-900 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <ChainBadge chain={receipt.chain} />
          <StatusPill status={receipt.status} />
        </div>

        <a
          href={receipt.explorerUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 underline"
        >
          View on explorer ↗
        </a>
      </header>

      {/* Headline amount */}
      <div className="px-6 py-8 border-b border-gray-100 dark:border-gray-900">
        {parseFloat(receipt.value.amount) > 0 ? (
          <>
            <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">
              Amount
            </div>
            <div className="flex items-baseline gap-2 flex-wrap">
              <span className="text-3xl font-semibold tabular-nums">
                {formatAmount(receipt.value.amount)}
              </span>
              <span className="text-lg text-gray-500 dark:text-gray-400">
                {receipt.value.symbol}
              </span>
            </div>
            {receipt.value.usdValue !== undefined && (
              <div className="text-sm text-gray-500 dark:text-gray-400 mt-1 tabular-nums">
                {formatUsd(receipt.value.usdValue)} at time of tx
              </div>
            )}
          </>
        ) : receipt.tokenTransfers.length > 0 ? (
          <>
            <div className="text-sm text-gray-500 dark:text-gray-400 mb-3">
              Token transfers
            </div>
            <ul className="space-y-3">
              {receipt.tokenTransfers.map((t, i) => (
                <li
                  key={i}
                  className="flex items-baseline justify-between gap-4"
                >
                  <div className="flex items-baseline gap-2 min-w-0">
                    <span className="text-xl font-semibold tabular-nums truncate">
                      {formatAmount(t.amount)}
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {t.symbol}
                    </span>
                  </div>
                  <span className="text-sm text-gray-500 dark:text-gray-400 tabular-nums whitespace-nowrap">
                    {formatUsd(t.usdValue)}
                  </span>
                </li>
              ))}
            </ul>
          </>
        ) : (
          <>
            <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">
              Contract interaction
            </div>
            <div className="text-lg font-medium">
              {receipt.contractInteraction?.methodName ??
                "No value transferred"}
            </div>
          </>
        )}
      </div>

      {/* Parties */}
      <Row label="From">
        <Address value={receipt.from} />
      </Row>
      {receipt.to && (
        <Row label="To">
          <Address value={receipt.to} />
        </Row>
      )}

      {/* Network fee */}
      <Row label="Network fee">
        <div className="text-right">
          <div className="text-sm tabular-nums">
            {formatAmount(receipt.fee.amount)} {receipt.fee.symbol}
          </div>
          {receipt.fee.usdValue !== undefined && (
            <div className="text-xs text-gray-500 dark:text-gray-400 tabular-nums">
              {formatUsd(receipt.fee.usdValue)}
            </div>
          )}
        </div>
      </Row>

      {/* Timestamp */}
      <Row label="Date">
        <span className="text-sm">{formatTimestamp(receipt.timestamp)}</span>
      </Row>

      {/* Hash + block */}
      <Row label="Transaction">
        <Address value={receipt.hash} small />
      </Row>
      <Row label="Block">
        <span className="text-sm tabular-nums">
          {receipt.blockNumber.toLocaleString()}
        </span>
      </Row>
    </article>
  );
}

/* ---------- subcomponents ---------- */

function StatusPill({ status }: { status: "success" | "failed" }) {
  if (status === "success") {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300">
        ● Success
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300">
      ● Failed
    </span>
  );
}

function Row({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-900 last:border-b-0 flex items-start justify-between gap-4">
      <span className="text-sm text-gray-500 dark:text-gray-400 shrink-0 pt-0.5">
        {label}
      </span>
      <div className="text-right min-w-0 break-all">{children}</div>
    </div>
  );
}

function Address({ value, small }: { value: string; small?: boolean }) {
  return (
    <span
      className={`font-mono break-all ${small ? "text-xs" : "text-xs sm:text-sm"} text-gray-700 dark:text-gray-300`}
    >
      {value}
    </span>
  );
}

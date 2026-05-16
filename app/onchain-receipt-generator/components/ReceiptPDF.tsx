"use client";

import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import type { Receipt } from "../types";
import { CHAINS } from "../types";
import { formatUsd, formatAmount, formatTimestamp } from "../lib/format";

// Use a clean, system-friendly font. @react-pdf bundles Helvetica by default.
// For monospace addresses, we register Courier (built-in).
const styles = StyleSheet.create({
  page: {
    padding: 56,
    fontFamily: "Helvetica",
    fontSize: 10,
    color: "#0a0a0a",
    backgroundColor: "#ffffff",
  },

  // Header band — brand + receipt title
  headerBand: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    marginBottom: 24,
  },
  brand: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    color: "#0a0a0a",
  },
  receiptTitle: {
    fontSize: 9,
    color: "#6b7280",
    letterSpacing: 2,
  },

  // Status row — chain + status
  statusRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 24,
  },
  pill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
  },
  pillChain: {
    backgroundColor: "#f3f4f6",
    color: "#374151",
  },
  pillSuccess: {
    backgroundColor: "#ecfdf5",
    color: "#047857",
  },
  pillFailed: {
    backgroundColor: "#fef2f2",
    color: "#b91c1c",
  },

  // Headline amount block
  amountBlock: {
    paddingVertical: 16,
    marginBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  amountLabel: {
    fontSize: 9,
    color: "#6b7280",
    marginBottom: 6,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  amountRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 6,
  },
  amountValue: {
    fontSize: 28,
    fontFamily: "Helvetica-Bold",
    color: "#0a0a0a",
  },
  amountSymbol: {
    fontSize: 14,
    color: "#6b7280",
  },
  amountUsd: {
    fontSize: 10,
    color: "#6b7280",
    marginTop: 4,
  },

  // Token transfer rows (when no native value)
  transferList: {
    gap: 8,
  },
  transferRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
  },
  transferAmount: {
    fontSize: 14,
    fontFamily: "Helvetica-Bold",
  },
  transferSymbol: {
    fontSize: 10,
    color: "#6b7280",
    marginLeft: 4,
  },

  // Detail rows
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  detailLabel: {
    fontSize: 9,
    color: "#6b7280",
    textTransform: "uppercase",
    letterSpacing: 1,
    flexShrink: 0,
    width: 100,
  },
  detailValue: {
    fontSize: 10,
    color: "#0a0a0a",
    textAlign: "right",
    flex: 1,
  },
  detailValueRight: {
    alignItems: "flex-end",
  },
  monoText: {
    fontFamily: "Courier",
    fontSize: 9,
    color: "#374151",
  },
  subValue: {
    fontSize: 8,
    color: "#6b7280",
    marginTop: 2,
  },

  // Footer
  footer: {
    position: "absolute",
    bottom: 32,
    left: 56,
    right: 56,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    flexDirection: "row",
    justifyContent: "space-between",
    fontSize: 8,
    color: "#9ca3af",
  },
});

export function ReceiptPDF({ receipt }: { receipt: Receipt }) {
  const chainInfo = CHAINS[receipt.chain];
  const showHeadlineNative = parseFloat(receipt.value.amount) > 0;
  const showHeadlineTokens =
    !showHeadlineNative && receipt.tokenTransfers.length > 0;

  return (
    <Document
      title={`Receipt — ${receipt.hash.slice(0, 10)}`}
      author="midesofek-tools"
      creator="tools.midesofek.com"
    >
      <Page size="A4" style={styles.page}>
        {/* Header band */}
        <View style={styles.headerBand}>
          <Text style={styles.brand}>midesofek-tools</Text>
          <Text style={styles.receiptTitle}>ONCHAIN RECEIPT</Text>
        </View>

        {/* Chain + status pills */}
        <View style={styles.statusRow}>
          <Text style={[styles.pill, styles.pillChain]}>{chainInfo.name}</Text>
          <Text
            style={[
              styles.pill,
              receipt.status === "success"
                ? styles.pillSuccess
                : styles.pillFailed,
            ]}
          >
            {receipt.status === "success" ? "● SUCCESS" : "● FAILED"}
          </Text>
        </View>

        {/* Headline */}
        <View style={styles.amountBlock}>
          {showHeadlineNative ? (
            <>
              <Text style={styles.amountLabel}>Amount</Text>
              <View style={styles.amountRow}>
                <Text style={styles.amountValue}>
                  {formatAmount(receipt.value.amount)}
                </Text>
                <Text style={styles.amountSymbol}>{receipt.value.symbol}</Text>
              </View>
              {receipt.value.usdValue !== undefined && (
                <Text style={styles.amountUsd}>
                  {formatUsd(receipt.value.usdValue)} at time of tx
                </Text>
              )}
            </>
          ) : showHeadlineTokens ? (
            <>
              <Text style={styles.amountLabel}>Token transfers</Text>
              <View style={styles.transferList}>
                {receipt.tokenTransfers.map((t, i) => (
                  <View key={i} style={styles.transferRow}>
                    <View
                      style={{ flexDirection: "row", alignItems: "baseline" }}
                    >
                      <Text style={styles.transferAmount}>
                        {formatAmount(t.amount)}
                      </Text>
                      <Text style={styles.transferSymbol}>{t.symbol}</Text>
                    </View>
                    <Text style={styles.amountUsd}>
                      {formatUsd(t.usdValue)}
                    </Text>
                  </View>
                ))}
              </View>
            </>
          ) : (
            <>
              <Text style={styles.amountLabel}>Contract interaction</Text>
              <Text style={{ fontSize: 14, fontFamily: "Helvetica-Bold" }}>
                {receipt.contractInteraction?.methodName ??
                  "No value transferred"}
              </Text>
            </>
          )}
        </View>

        {/* Detail rows */}
        <DetailRow label="From">
          <Text style={styles.monoText}>{receipt.from}</Text>
        </DetailRow>

        {receipt.to && (
          <DetailRow label="To">
            <Text style={styles.monoText}>{receipt.to}</Text>
          </DetailRow>
        )}

        <DetailRow label="Network fee">
          <View style={styles.detailValueRight}>
            <Text style={styles.detailValue}>
              {formatAmount(receipt.fee.amount)} {receipt.fee.symbol}
            </Text>
            {receipt.fee.usdValue !== undefined && (
              <Text style={styles.subValue}>
                {formatUsd(receipt.fee.usdValue)}
              </Text>
            )}
          </View>
        </DetailRow>

        <DetailRow label="Date">
          <Text style={styles.detailValue}>
            {formatTimestamp(receipt.timestamp)}
          </Text>
        </DetailRow>

        <DetailRow label="Transaction">
          <Text style={styles.monoText}>{receipt.hash}</Text>
        </DetailRow>

        <DetailRow label="Block">
          <Text style={styles.detailValue}>
            {receipt.blockNumber.toLocaleString()}
          </Text>
        </DetailRow>

        {/* Footer */}
        <View style={styles.footer} fixed>
          <Text>tools.midesofek.com</Text>
          <Text>{receipt.explorerUrl}</Text>
        </View>
      </Page>
    </Document>
  );
}

function DetailRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <View style={{ flex: 1, alignItems: "flex-end" }}>{children}</View>
    </View>
  );
}

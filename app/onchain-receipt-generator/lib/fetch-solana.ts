import { CHAINS, type Receipt, type TokenTransfer } from "../types";

const HELIUS_BASE = "https://api.helius.xyz/v0";

type HeliusEnhancedTransaction = {
  signature: string;
  slot: number;
  timestamp: number;
  fee: number; // in lamports
  feePayer: string;
  type: string; // "TRANSFER", "SWAP", "UNKNOWN", etc.
  source: string;
  description: string;
  transactionError: { error: string } | null;
  nativeTransfers: Array<{
    fromUserAccount: string;
    toUserAccount: string;
    amount: number; // in lamports
  }>;
  tokenTransfers: Array<{
    fromUserAccount: string;
    toUserAccount: string;
    tokenAmount: number;
    mint: string;
    tokenStandard?: string;
  }>;
};

const LAMPORTS_PER_SOL = 1_000_000_000;
console.log(process.env.HELIUS_API_KEY);

export async function fetchSolanaReceipt(
  signature: string,
): Promise<Receipt | null> {
  const apiKey = process.env.HELIUS_API_KEY;
  if (!apiKey) throw new Error("HELIUS_API_KEY is not set");

  const url = `${HELIUS_BASE}/transactions?api-key=${apiKey}`;

  const resp = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ transactions: [signature] }),
  });

  if (!resp.ok) throw new Error(`Helius request failed: ${resp.status}`);

  const data: HeliusEnhancedTransaction[] = await resp.json();
  if (!data || data.length === 0) return null;

  const tx = data[0];

  const chainInfo = CHAINS.solana;

  // Determine primary value transfer: the largest nativeTransfer (if any)
  const primaryNative = tx.nativeTransfers
    .slice()
    .sort((a, b) => b.amount - a.amount)[0];

  // From/to: prefer the primary native transfer; fall back to feePayer + first token recipient
  const from = primaryNative?.fromUserAccount ?? tx.feePayer;
  const to =
    primaryNative?.toUserAccount ?? tx.tokenTransfers[0]?.toUserAccount ?? "";

  // Value: native SOL transferred (lamports → SOL)
  const valueAmount = primaryNative
    ? (primaryNative.amount / LAMPORTS_PER_SOL).toString()
    : "0";

  // Fee: lamports → SOL
  const feeAmount = (tx.fee / LAMPORTS_PER_SOL).toString();

  // Token transfers: normalize to our shape
  const tokenTransfers: TokenTransfer[] = tx.tokenTransfers.map((t) => ({
    from: t.fromUserAccount,
    to: t.toUserAccount,
    amount: t.tokenAmount.toString(),
    symbol: t.mint.slice(0, 4).toUpperCase(), // placeholder; real symbol needs a metadata lookup
    tokenAddress: t.mint,
  }));

  // Solana doesn't have an "input data" model like EVM. Use the parsed type/description instead.
  const contractInteraction =
    tx.type !== "TRANSFER" && tx.type !== "UNKNOWN"
      ? { contract: tx.source, methodName: tx.type }
      : undefined;

  return {
    chain: "solana",
    hash: tx.signature,
    status: tx.transactionError ? "failed" : "success",
    timestamp: new Date(tx.timestamp * 1000),
    blockNumber: tx.slot,
    from,
    to,
    value: {
      amount: valueAmount,
      symbol: chainInfo.symbol,
    },
    fee: {
      amount: feeAmount,
      symbol: chainInfo.symbol,
    },
    tokenTransfers,
    contractInteraction,
    explorerUrl: `${chainInfo.explorerUrl}${signature}`,
  };
}

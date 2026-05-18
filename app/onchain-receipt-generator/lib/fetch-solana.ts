import { CHAINS, type Receipt, type TokenTransfer } from "../types";
import { lookupKnownToken } from "./known-tokens";
import { fetchTokenMetaFromApis } from "./fetch-token-meta";

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

const solanaTokenMetaCache = new Map<
  string,
  { symbol: string; decimals: number }
>();

async function getSolanaTokenMeta(
  mintAddress: string,
  heliusApiKey: string,
): Promise<{ symbol: string; decimals: number }> {
  const cacheKey = mintAddress.toLowerCase();
  const cached = solanaTokenMetaCache.get(cacheKey);
  if (cached) return cached;

  // 1. Known tokens registry — instant
  const known = lookupKnownToken("solana", mintAddress);
  if (known) {
    const meta = { symbol: known.symbol, decimals: known.decimals };
    solanaTokenMetaCache.set(cacheKey, meta);
    return meta;
  }

  // 2. Helius getAsset RPC — authoritative on-chain metadata
  try {
    const resp = await fetch(
      `https://mainnet.helius-rpc.com/?api-key=${heliusApiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: "receipt-meta",
          method: "getAsset",
          params: { id: mintAddress },
        }),
      },
    );
    if (resp.ok) {
      const data = await resp.json();
      const tokenInfo = data?.result?.token_info;
      const metaSymbol =
        tokenInfo?.symbol ?? data?.result?.content?.metadata?.symbol;
      if (metaSymbol) {
        const meta = {
          symbol: metaSymbol,
          decimals: tokenInfo?.decimals ?? 9,
        };
        solanaTokenMetaCache.set(cacheKey, meta);
        return meta;
      }
    }
  } catch {
    /* fall through to API fallback */
  }

  // 3. DexScreener / GeckoTerminal fallback
  const apiMeta = await fetchTokenMetaFromApis("solana", mintAddress);
  if (apiMeta) {
    const meta = { symbol: apiMeta.symbol, decimals: apiMeta.decimals };
    solanaTokenMetaCache.set(cacheKey, meta);
    return meta;
  }

  // 4. Final fallback — last 4 chars, more unique than first 4
  const fallback = {
    symbol: mintAddress.slice(-4).toUpperCase(),
    decimals: 9,
  };
  solanaTokenMetaCache.set(cacheKey, fallback);
  return fallback;
}

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
  const tokenTransfers: TokenTransfer[] = await Promise.all(
    tx.tokenTransfers.map(async (t) => {
      const meta = await getSolanaTokenMeta(t.mint, apiKey);
      return {
        from: t.fromUserAccount,
        to: t.toUserAccount,
        amount: t.tokenAmount.toString(),
        symbol: meta.symbol,
        tokenAddress: t.mint,
      };
    }),
  );

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

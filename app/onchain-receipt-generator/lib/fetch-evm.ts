import {
  createPublicClient,
  http,
  formatEther,
  formatUnits,
  decodeEventLog,
  parseAbi,
  type Hash,
} from "viem";
import { mainnet, base, bsc } from "viem/chains";
import { CHAINS, type Chain, type Receipt, type TokenTransfer } from "../types";

// ERC-20 Transfer event signature: Transfer(address indexed from, address indexed to, uint256 value)
const ERC20_TRANSFER_TOPIC =
  "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef";

const erc20Abi = parseAbi([
  "event Transfer(address indexed from, address indexed to, uint256 value)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
]);

/**
 * Get a viem PublicClient for the given chain, using Alchemy's RPC.
 */
function getClient(chain: Chain) {
  const apiKey = process.env.ALCHEMY_API_KEY;
  if (!apiKey) throw new Error("ALCHEMY_API_KEY is not set");

  const chainConfig = {
    ethereum: { viemChain: mainnet, alchemyHost: "eth-mainnet" },
    base: { viemChain: base, alchemyHost: "base-mainnet" },
    bsc: { viemChain: bsc, alchemyHost: "bnb-mainnet" },
  } as const;

  const config = chainConfig[chain as keyof typeof chainConfig];
  if (!config) throw new Error(`${chain} is not a supported EVM chain`);

  return createPublicClient({
    chain: config.viemChain,
    transport: http(`https://${config.alchemyHost}.g.alchemy.com/v2/${apiKey}`),
  });
}

/**
 * Fetch ERC-20 token symbol + decimals. Falls back to "???" / 18 on failure.
 * Cached per-process via the closure of `tokenMetaCache`.
 */
const tokenMetaCache = new Map<string, { symbol: string; decimals: number }>();
async function getTokenMeta(
  client,
  address: `0x${string}`,
): Promise<{ symbol: string; decimals: number }> {
  const cacheKey = `${client.chain?.id}-${address.toLowerCase()}`;
  const cached = tokenMetaCache.get(cacheKey);
  if (cached) return cached;

  try {
    const [symbol, decimals] = await Promise.all([
      client.readContract({
        address,
        abi: erc20Abi,
        functionName: "symbol",
      }),
      client.readContract({
        address,
        abi: erc20Abi,
        functionName: "decimals",
      }),
    ]);
    const meta = { symbol: symbol as string, decimals: Number(decimals) };
    tokenMetaCache.set(cacheKey, meta);
    return meta;
  } catch {
    return { symbol: "???", decimals: 18 };
  }
}

/**
 * Fetch and normalize a transaction from any supported EVM chain via Alchemy.
 * Returns null if the tx isn't found on this chain.
 */
export async function fetchEvmReceipt(
  hash: string,
  chain: Chain,
): Promise<Receipt | null> {
  const chainInfo = CHAINS[chain];
  const client = getClient(chain);

  // 1. Fetch transaction. viem throws TransactionNotFoundError if not found.
  let tx;
  try {
    tx = await client.getTransaction({ hash: hash as Hash });
  } catch (err) {
    // Not found on this chain — caller will try others
    if (err instanceof Error && err.name === "TransactionNotFoundError") {
      return null;
    }
    throw err;
  }

  // If blockNumber is null, the tx is pending or doesn't actually exist on this chain.
  // viem sometimes returns a "found" tx with null blockNumber for cross-chain hash lookups.
  if (tx.blockNumber === null) return null;

  // 2. Fetch receipt (status, gasUsed, logs) and block (timestamp) in parallel
  const [receipt, block] = await Promise.all([
    client.getTransactionReceipt({ hash: hash as Hash }),
    client.getBlock({ blockNumber: tx.blockNumber }),
  ]);

  // 3. Extract ERC-20 transfers from logs
  const transferLogs = receipt.logs.filter(
    (log) => log.topics[0] === ERC20_TRANSFER_TOPIC && log.topics.length === 3,
  );

  const tokenTransfers: TokenTransfer[] = await Promise.all(
    transferLogs.map(async (log) => {
      const meta = await getTokenMeta(client, log.address);
      try {
        const decoded = decodeEventLog({
          abi: erc20Abi,
          data: log.data,
          topics: log.topics,
        });
        // decoded.args is { from, to, value } for Transfer event
        const args = decoded.args as {
          from: string;
          to: string;
          value: bigint;
        };
        return {
          from: args.from,
          to: args.to,
          amount: formatUnits(args.value, meta.decimals),
          symbol: meta.symbol,
          tokenAddress: log.address,
        };
      } catch {
        return {
          from: "0x" + log.topics[1]!.slice(26),
          to: "0x" + log.topics[2]!.slice(26),
          amount: "0",
          symbol: meta.symbol,
          tokenAddress: log.address,
        };
      }
    }),
  );

  // 4. Calculate fee
  const feeWei = receipt.gasUsed * (tx.gasPrice ?? receipt.effectiveGasPrice);

  // 5. Detect contract interaction
  const contractInteraction =
    tx.input && tx.input !== "0x" && tx.to ? { contract: tx.to } : undefined;

  return {
    chain,
    hash: tx.hash,
    status: receipt.status === "success" ? "success" : "failed",
    timestamp: new Date(Number(block.timestamp) * 1000),
    blockNumber: Number(tx.blockNumber),
    from: tx.from,
    to: tx.to ?? "",
    value: {
      amount: formatEther(tx.value),
      symbol: chainInfo.symbol,
    },
    fee: {
      amount: formatEther(feeWei),
      symbol: chainInfo.symbol,
    },
    tokenTransfers,
    contractInteraction,
    explorerUrl: `${chainInfo.explorerUrl}${hash}`,
  };
}

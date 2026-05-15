export type Chain = "ethereum" | "base" | "bsc" | "solana";

export type ChainInfo = {
  id: Chain;
  name: string; // "Ethereum", "Base", etc.
  symbol: string; // "ETH", "BNB", "SOL"
  coingeckoId: string; // "ethereum", "binancecoin", "solana"
  explorerName: string; // "Etherscan", "BaseScan", "BscScan", "Solscan"
  explorerUrl: string; // base URL for tx links
  etherscanChainId?: number; // for Etherscan v2 multi-chain endpoint
};

export const CHAINS: Record<Chain, ChainInfo> = {
  ethereum: {
    id: "ethereum",
    name: "Ethereum",
    symbol: "ETH",
    coingeckoId: "ethereum",
    explorerName: "Etherscan",
    explorerUrl: "https://etherscan.io/tx/",
    etherscanChainId: 1,
  },
  base: {
    id: "base",
    name: "Base",
    symbol: "ETH",
    coingeckoId: "ethereum", // Base uses ETH as native token
    explorerName: "BaseScan",
    explorerUrl: "https://basescan.org/tx/",
    etherscanChainId: 8453,
  },
  bsc: {
    id: "bsc",
    name: "BNB Smart Chain",
    symbol: "BNB",
    coingeckoId: "binancecoin",
    explorerName: "BscScan",
    explorerUrl: "https://bscscan.com/tx/",
    etherscanChainId: 56,
  },
  solana: {
    id: "solana",
    name: "Solana",
    symbol: "SOL",
    coingeckoId: "solana",
    explorerName: "Solscan",
    explorerUrl: "https://solscan.io/tx/",
  },
};

// The canonical receipt shape — every chain returns this.
export type TokenTransfer = {
  from: string;
  to: string;
  amount: string; // decimal string, already formatted with token decimals
  symbol: string;
  tokenAddress: string;
  usdValue?: number; // populated by pricing layer
};

export type Receipt = {
  chain: Chain;
  hash: string;
  status: "success" | "failed";
  timestamp: Date;
  blockNumber: number;
  from: string;
  to: string; // can be empty for contract creation
  value: {
    amount: string; // native token, decimal string
    symbol: string;
    usdValue?: number;
  };
  fee: {
    amount: string;
    symbol: string;
    usdValue?: number;
  };
  tokenTransfers: TokenTransfer[];
  contractInteraction?: {
    contract: string;
    methodName?: string;
  };
  explorerUrl: string; // full URL to the tx on its native explorer
};

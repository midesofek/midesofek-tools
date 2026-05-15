import { CHAINS, type Chain } from "../types";

const CHAIN_COLORS: Record<Chain, { bg: string; text: string }> = {
  ethereum: {
    bg: "bg-indigo-50 dark:bg-indigo-950/40",
    text: "text-indigo-700 dark:text-indigo-300",
  },
  base: {
    bg: "bg-blue-50 dark:bg-blue-950/40",
    text: "text-blue-700 dark:text-blue-300",
  },
  bsc: {
    bg: "bg-yellow-50 dark:bg-yellow-950/40",
    text: "text-yellow-700 dark:text-yellow-300",
  },
  solana: {
    bg: "bg-purple-50 dark:bg-purple-950/40",
    text: "text-purple-700 dark:text-purple-300",
  },
};

export function ChainBadge({ chain }: { chain: Chain }) {
  const info = CHAINS[chain];
  const colors = CHAIN_COLORS[chain];
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${colors.bg} ${colors.text}`}
    >
      {info.name}
    </span>
  );
}

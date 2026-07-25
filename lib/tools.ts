import { differenceInDays } from "date-fns";

export type ToolCategory = "utility" | "crypto" | "developer" | "design";
export type ToolStatus = "live" | "beta" | "coming-soon";

export const NEW_BADGE_DAYS = 30;

export type Tool = {
  slug: string; // URL slug, this must match folder name in app/
  name: string;
  shortDescription: string; // for cards on the homepage
  metaDescription: string; // for <meta name="description">
  keywords: string[]; // for SEO
  icon: string; // emoji for now
  code: string; // 2-char mono monogram for the homepage tile
  category: ToolCategory;
  status: ToolStatus;
  launchedAt?: string; // ISO date for "newest first" sorting
};

export const tools: Tool[] = [
  {
    slug: "qr-code-generator",
    name: "QR Code Generator",
    shortDescription:
      "Custom QR codes for URLs, WiFi, crypto wallets, and social profiles.",
    metaDescription:
      "Free QR code generator with logo and color customization. Create QR codes for URLs, WiFi networks, Bitcoin/Ethereum/Solana wallets, Twitter, GitHub, YouTube, and more. 100% private — runs in your browser.",
    keywords: [
      "qr code generator",
      "free qr code",
      "wifi qr code",
      "bitcoin qr code",
      "ethereum qr code",
      "solana qr code",
      "twitter qr code",
      "github qr code",
      "youtube qr code",
      "crypto qr code generator",
    ],
    icon: "🔗",
    code: "QR",
    category: "utility",
    status: "live",
  },
  {
    slug: "onchain-receipt-generator",
    name: "Onchain Receipt Generator",
    shortDescription:
      "Turn any blockchain transaction into a clean PDF receipt or shareable image. Supports Ethereum, Base, BSC, and Solana.",
    metaDescription:
      "Free onchain receipt generator. Paste any transaction hash from Ethereum, Base, BSC, or Solana — get a clean PDF receipt for accounting, or a shareable image for sharing. USD values, gas costs, recipient/sender, all included. No signup, runs in your browser.",
    keywords: [
      "onchain receipt generator",
      "crypto receipt generator",
      "ethereum transaction receipt",
      "solana transaction receipt",
      "bitcoin receipt pdf",
      "blockchain payment receipt",
      "base transaction receipt",
      "bsc transaction receipt",
      "crypto tax receipt",
      "share crypto transaction",
    ],
    icon: "🧾",
    code: "RC",
    category: "crypto",
    status: "live",
  },
  {
    slug: "eip-7702-decoder",
    name: "EIP-7702 Delegation Checker",
    shortDescription:
      "Is your EOA silently delegated to a smart contract? Paste any Ethereum address and find out — plus flag known phishing/sweeper delegates.",
    metaDescription:
      "Free EIP-7702 delegation checker. Paste any Ethereum address to see whether it's currently delegated to a smart contract via EIP-7702, what the delegate is, and whether it's a known-safe wallet implementation or a known phishing/sweeper contract. Runs against public Ethereum RPC. No signup, no wallet connection.",
    keywords: [
      "eip 7702 decoder",
      "eip 7702 checker",
      "ef0100 delegation lookup",
      "what is my wallet delegated to",
      "is my eoa hijacked",
      "check eip 7702 delegation",
      "eoa delegation checker",
      "crimeenjoyor detector",
      "pectra delegation scanner",
      "eip 7702 sweeper check",
    ],
    icon: "🛡️",
    code: "77",
    category: "crypto",
    status: "live",
    launchedAt: "2026-07-14",
  },
  {
    slug: "ethereum-signature-verifier",
    name: "Ethereum Signature Verifier",
    shortDescription:
      "Verify a signature against an address across all five mechanisms — EOA, ERC-1271, EIP-6492, EIP-7702, and Safe. When it fails, see exactly why.",
    metaDescription:
      "Free Ethereum signature verifier. Verify a signature against an address across all five verification mechanisms — plain EOA (ecrecover), ERC-1271 smart contract wallets, EIP-6492 pre-deploy signatures, EIP-7702 delegated EOAs, and Safe multisigs. When verification fails, see the full trace — which digest was expected, which address was recovered, and why the check was rejected. No signup, runs against public RPC.",
    keywords: [
      "verify ethereum signature",
      "eip-6492 verifier",
      "erc-1271 signature checker",
      "smart wallet signature verify",
      "verify safe signature",
      "eip-7702 signature",
    ],
    icon: "🔐",
    code: "SV",
    category: "crypto",
    status: "live",
    launchedAt: "2026-07-25",
  },
];

// Helpers — used throughout the app
export const getTool = (slug: string): Tool | undefined =>
  tools.find((t) => t.slug === slug);

export const getOtherTools = (slug: string, count = 3): Tool[] =>
  tools.filter((t) => t.slug !== slug && t.status === "live").slice(0, count);

export const getLiveTools = (): Tool[] =>
  tools.filter((t) => t.status === "live");

export const isNewTool = (tool: Tool): boolean =>
  tool.launchedAt !== undefined &&
  differenceInDays(new Date(), new Date(tool.launchedAt)) <= NEW_BADGE_DAYS;

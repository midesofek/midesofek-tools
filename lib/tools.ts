export type ToolCategory = "utility" | "crypto" | "developer" | "design";
export type ToolStatus = "live" | "beta" | "coming-soon";

export type Tool = {
  slug: string; // URL slug, this must match folder name in app/
  name: string;
  shortDescription: string; // for cards on the homepage
  metaDescription: string; // for <meta name="description">
  keywords: string[]; // for SEO
  icon: string; // emoji for now
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
    category: "utility",
    status: "live",
  },
  {
    slug: "onchain-receipt-generator",
    name: "Onchain Receipt Generator",
    shortDescription:
      "Turn any blockchain transaction into a clean PDF receipt or shareable image. ETH, Base, BSC, and Solana.",
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
    category: "utility",
    status: "live",
  },
];

// Helpers — used throughout the app
export const getTool = (slug: string): Tool | undefined =>
  tools.find((t) => t.slug === slug);

export const getOtherTools = (slug: string, count = 3): Tool[] =>
  tools.filter((t) => t.slug !== slug && t.status === "live").slice(0, count);

export const getLiveTools = (): Tool[] =>
  tools.filter((t) => t.status === "live");

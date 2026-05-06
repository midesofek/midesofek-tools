export type QRType =
  | "url"
  | "text"
  | "wifi"
  | "phone"
  | "bitcoin"
  | "ethereum"
  | "solana"
  | "twitter"
  | "github"
  | "youtube";

export type QRTypeConfig = {
  id: QRType;
  label: string;
  icon: string;
  description: string;
};

export const qrTypes: QRTypeConfig[] = [
  { id: "url", label: "URL", icon: "🔗", description: "Link to any website." },
  {
    id: "text",
    label: "Text",
    icon: "📝",
    description: "Plain text — anything.",
  },
  {
    id: "wifi",
    label: "WiFi",
    icon: "📶",
    description: "Share WiFi credentials.",
  },
  {
    id: "phone",
    label: "Phone",
    icon: "📞",
    description: "Tap to call a number.",
  },
  {
    id: "bitcoin",
    label: "Bitcoin",
    icon: "₿",
    description: "Bitcoin payment address.",
  },
  {
    id: "ethereum",
    label: "Ethereum",
    icon: "Ξ",
    description: "Ethereum wallet address.",
  },
  {
    id: "solana",
    label: "Solana",
    icon: "◎",
    description: "Solana wallet address.",
  },
  {
    id: "twitter",
    label: "Twitter",
    icon: "𝕏",
    description: "Link to a Twitter/X profile.",
  },
  {
    id: "github",
    label: "GitHub",
    icon: "🐙",
    description: "Link to a GitHub profile.",
  },
  {
    id: "youtube",
    label: "YouTube",
    icon: "🎦",
    description: "Link to a YouTube channel or video.",
  },
];

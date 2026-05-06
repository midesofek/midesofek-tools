/// @notice Each formatter takes a structured input and returns the string to encode in the QR.

export const formatURL = (url: string): string => {
  if (!url) return "";
  // Auto-prepend https:// if missing
  if (!/^https?:\/\//i.test(url)) return `https://${url}`;
  return url;
};

export const formatText = (text: string): string => text;

export type WiFiInput = {
  ssid: string;
  password: string;
  encryption: "WPA" | "WEP" | "nopass";
  hidden: boolean;
};

export const formatWiFi = ({
  ssid,
  password,
  encryption,
  hidden,
}: WiFiInput): string => {
  if (!ssid) return "";
  // Standard WiFi QR format. Special chars in SSID/password must be escaped.
  const escape = (s: string) => s.replace(/([\\;,":])/g, "\\$1");
  const parts = [
    `WIFI:T:${encryption}`,
    `S:${escape(ssid)}`,
    encryption !== "nopass" ? `P:${escape(password)}` : "",
    hidden ? "H:true" : "",
    "",
  ];
  return parts.filter(Boolean).join(";") + ";";
};

export const formatPhone = (number: string): string => {
  if (!number) return "";
  // tel: scheme — phones recognize this and offer to dial
  return `tel:${number.replace(/\s/g, "")}`;
};

export type CryptoInput = { address: string; amount?: string };

export const formatBitcoin = ({ address, amount }: CryptoInput): string => {
  if (!address) return "";
  // BIP21 URI scheme
  return amount ? `bitcoin:${address}?amount=${amount}` : `bitcoin:${address}`;
};

export const formatEthereum = ({ address, amount }: CryptoInput): string => {
  if (!address) return "";
  // EIP-681 — simplified. Amount is in wei; this enables users enter ETH and convert.
  if (amount) {
    // Convert ETH → wei (1 ETH = 10^18 wei). Use string math to avoid float issues.
    const [whole, decimal = ""] = amount.split(".");
    const padded = (whole + decimal.padEnd(18, "0")).replace(/^0+/, "") || "0";
    return `ethereum:${address}?value=${padded}`;
  }
  return `ethereum:${address}`;
};

export const formatSolana = ({ address, amount }: CryptoInput): string => {
  if (!address) return "";
  // Solana Pay URI spec
  return amount ? `solana:${address}?amount=${amount}` : `solana:${address}`;
};

export const formatTwitter = (handle: string): string => {
  if (!handle) return "";
  const clean = handle.replace(/^@/, "").trim();
  return `https://x.com/${clean}`;
};

export const formatGitHub = (handle: string): string => {
  if (!handle) return "";
  const clean = handle.replace(/^@/, "").trim();
  return `https://github.com/${clean}`;
};

export const formatYouTube = (input: string): string => {
  if (!input) return "";
  // If it's already a full URL, return as-is. If it's a handle (@name), build URL.
  if (/^https?:\/\//i.test(input)) return input;
  const clean = input.replace(/^@/, "").trim();
  return `https://youtube.com/@${clean}`;
};

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
      "Create custom QR codes with logos, colors, and 17+ types.",
    metaDescription:
      "Free QR code generator. Create custom QR codes for URLs, WiFi, vCards, and crypto payments. Add logos, customize colors, download as PNG or SVG. 100% private — runs in your browser.",
    keywords: [
      "qr code generator",
      "free qr code",
      "wifi qr code",
      "vcard qr code",
      "crypto qr code",
    ],
    icon: "🔗",
    category: "utility",
    status: "coming-soon",
  },
];

// Helpers — used throughout the app
export const getTool = (slug: string): Tool | undefined =>
  tools.find((t) => t.slug === slug);

export const getOtherTools = (slug: string, count = 3): Tool[] =>
  tools.filter((t) => t.slug !== slug && t.status === "live").slice(0, count);

export const getLiveTools = (): Tool[] =>
  tools.filter((t) => t.status === "live");

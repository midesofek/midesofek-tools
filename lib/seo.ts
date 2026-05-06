import type { Metadata } from "next";
import { getTool } from "./tools";

const SITE_URL = "https://midesofek-tools.vercel.app"; //will later be tools.midesofek.com whn I secure the subdomain
const SITE_NAME = "midesofek-tools";

export function generateToolMetadata(slug: string): Metadata {
  const tool = getTool(slug);
  if (!tool) return {};

  const url = `${SITE_URL}/${tool.slug}`;
  const title = `${tool.name} — Free, Open-Source`;

  return {
    title,
    description: tool.metaDescription,
    keywords: tool.keywords,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title,
      description: tool.metaDescription,
      url,
      siteName: SITE_NAME,
      type: "website",
      images: [
        {
          url: `${SITE_URL}/og/${tool.slug}.png`,
          width: 1200,
          height: 630,
          alt: tool.name,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: tool.metaDescription,
      images: [
        {
          url: `${SITE_URL}/${tool.slug}/opengraph-image`,
          width: 1200,
          height: 630,
          alt: tool.name,
        },
      ],
      creator: "@midesofek",
    },
  };
}

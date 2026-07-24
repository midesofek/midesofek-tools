import type { MetadataRoute } from "next";
import { tools } from "@/lib/tools";

const SITE_URL = "https://tools.midesofek.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const homepage = {
    url: SITE_URL,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 1,
  };

  // Only the top-level `/${slug}` route is ever emitted here — subpaths like
  // /ethereum-signature-verifier/gallery are never enumerated, and are kept
  // out of the crawl separately via that page's own `robots` metadata.
  const toolPages = tools
    .filter((t) => t.status !== "coming-soon")
    .map((tool) => ({
      url: `${SITE_URL}/${tool.slug}`,
      lastModified: tool.launchedAt ? new Date(tool.launchedAt) : now,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    }));

  return [homepage, ...toolPages];
}

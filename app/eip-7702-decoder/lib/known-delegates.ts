import type { Address } from "viem";
import type { Attribution } from "../types";
import wintermuteData from "@/content/wintermute-delegates.json";
import manualData from "@/content/manual-delegates.json";

/**
 * A single delegate entry from any source (Wintermute, manual, awesome-eip-7702, etc).
 *
 * `category` is the source's own label (e.g. Wintermute uses "Retail Wallets",
 * "Crime", "Service"). It's raw and unnormalized — the risk mapping happens
 * downstream in assess-risk.ts based on this category string.
 */
export type KnownDelegate = {
  address: Address;
  name: string;
  category: string;
  source: string;
  sourceUrl?: string;
  /** Only set for entries pulled from a synced source. */
  syncedAt?: string;
  /** Optional free-text context. */
  description?: string;
};

type RawEntry = {
  address: string;
  name: string;
  category: string;
  source?: string;
  sourceUrl?: string;
  description?: string;
};

/**
 * Build the merged lookup table from both sources.
 *
 * Manual entries WIN over Wintermute entries for the same address — this lets
 * community research correct or supplement automated classifications without
 * fighting the nightly sync.
 */
function buildTable(): Map<string, KnownDelegate> {
  const table = new Map<string, KnownDelegate>();

  const wintermuteMeta = wintermuteData.meta;
  const wintermuteEntries = (wintermuteData.entries as RawEntry[]) ?? [];
  for (const raw of wintermuteEntries) {
    const key = raw.address.toLowerCase();
    table.set(key, {
      address: key as Address,
      name: raw.name,
      category: raw.category,
      source: raw.source ?? wintermuteMeta.source,
      sourceUrl: raw.sourceUrl ?? wintermuteMeta.sourceUrl,
      syncedAt: wintermuteMeta.syncedAt ?? undefined,
      description: raw.description,
    });
  }

  // Manual entries second — they overwrite Wintermute for the same address.
  const manualEntries = (manualData.entries as RawEntry[]) ?? [];
  for (const raw of manualEntries) {
    const key = raw.address.toLowerCase();
    table.set(key, {
      address: key as Address,
      name: raw.name,
      category: raw.category,
      source: raw.source ?? "Community",
      sourceUrl: raw.sourceUrl,
      description: raw.description,
    });
  }

  return table;
}

const TABLE = buildTable();

/**
 * Sync metadata — used by the UI to display "last synced X hours ago" and
 * to attribute the Wintermute source.
 */
export const SYNC_META = {
  source: wintermuteData.meta.source,
  sourceUrl: wintermuteData.meta.sourceUrl,
  syncedAt: wintermuteData.meta.syncedAt,
  entryCount: TABLE.size,
} as const;

/** O(1) lookup by address (case-insensitive). */
export function lookupDelegate(address: Address): KnownDelegate | null {
  return TABLE.get(address.toLowerCase()) ?? null;
}

/**
 * Turn a KnownDelegate into an Attribution object for embedding in results.
 * Cleanly separates "what we know" from "how the UI shows it."
 */
export function toAttribution(delegate: KnownDelegate): Attribution {
  return {
    source: delegate.source,
    sourceUrl: delegate.sourceUrl,
    category: delegate.category,
    syncedAt: delegate.syncedAt,
  };
}

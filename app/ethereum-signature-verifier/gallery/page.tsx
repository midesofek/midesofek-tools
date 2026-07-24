import type { Metadata } from "next";
import { ResultPanel } from "../ResultPanel";
import { fixtures } from "../fixtures";

export const metadata: Metadata = {
  title: "Fixture gallery — Ethereum Signature Verifier",
  robots: { index: false, follow: false },
};

export default function GalleryPage() {
  return (
    <div className="max-w-160 mx-auto p-8 flex flex-col gap-10">
      {Object.entries(fixtures).map(([key, result]) => (
        <div key={key}>
          <div className="font-mono text-xs text-muted-fg mb-2">{key}</div>
          <ResultPanel result={result} />
        </div>
      ))}
    </div>
  );
}

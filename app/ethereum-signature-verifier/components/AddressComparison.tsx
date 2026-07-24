import { ComparisonShell } from "./DigestComparison";
import type { AddressComparisonData } from "../types";

export function AddressComparison({ addresses }: { addresses: AddressComparisonData }) {
  return (
    <ComparisonShell
      headerLabel="Recovered a different address"
      headerStatus="mismatch"
      headerStatusTone="danger"
      top={{ label: "You entered", value: addresses.claimed, tone: "danger" }}
      bottom={{
        label: "Signature recovers",
        value: addresses.recovered,
        tone: "accent",
        note: addresses.recoveredNote,
      }}
    />
  );
}

import type { ToolContent } from "./qr-code-generator";

export const ethereumSignatureVerifierContent: ToolContent = {
  about: {
    heading: "About this tool",
    paragraphs: [
      "Ethereum signature verification isn't one mechanism — it's five. A plain EOA recovers a signer with ecrecover. A smart contract wallet calls isValidSignature under ERC-1271. A counterfactual (not-yet-deployed) smart wallet needs the EIP-6492 wrapper. An EIP-7702 delegated EOA can pass one check and fail the other, since it lives in both worlds at once. A Safe wraps the digest in its own EIP-712 envelope before comparing anything. Most tools guess one of these and stop.",
      "This tool runs whichever mechanisms apply to the address you give it, and when a signature doesn't verify, it shows the full trace — what was hashed, what was recovered, what the contract returned — so 'invalid' never means 'good luck figuring out why.'",
      "Coming soon. The UI is live; the on-chain verification logic ships in a following update.",
    ],
  },
  features: [],
  useCases: [],
  faqs: [],
};

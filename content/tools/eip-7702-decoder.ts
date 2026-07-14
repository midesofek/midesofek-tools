import type { ToolContent } from "./qr-code-generator";

export const eip7702DecoderContent: ToolContent = {
  about: {
    heading: "About this tool",
    paragraphs: [
      "EIP-7702 shipped on Ethereum mainnet with the Pectra upgrade in May 2025. It lets an externally owned account (EOA) install code — turning your regular wallet into something that behaves like a smart contract account, without changing your address. It's the biggest change to how EOAs work since Ethereum launched.",
      "Everything runs through a single signed authorization tuple. One signature installs code that persists on your account until you replace it. That power is what enables gas sponsorship, batched transactions, and passkey wallets. It's also what makes the phishing category dangerous in a new way: one wrong signature and every future call to your EOA runs attacker-supplied code.",
      "This tool answers the direct question: is a given address currently delegated under EIP-7702, and to what? Paste an address, it reads the on-chain code, detects the 23-byte 0xef0100 delegation indicator, extracts the delegate contract, and cross-references it against Wintermute Research's hand-curated categorization of EIP-7702 delegate contracts on Dune — surfacing whether the delegate is a legitimate wallet vendor (MetaMask, Bitget, Alchemy, Trust Wallet, and others) or a Wintermute-tagged sweeper contract.",
      "Currently in phase 1 — the address checker. Phase 2 will add the raw authorization tuple decoder (paste [chain_id, address, nonce, y_parity, r, s], see what a wallet is about to sign, recover the EOA who would be delegated).",
      "Open source. Runs against public Ethereum RPC. No signup, no tracking.",
    ],
  },
  features: [
    {
      title: "Detects the 0xef0100 delegation indicator",
      description:
        "Reads the on-chain code of any Ethereum address and checks for the 23-byte prefix that identifies an EIP-7702 delegation. Extracts the delegate contract address.",
    },
    {
      title: "Cross-references known delegates",
      description:
        "Compares the delegate against a maintained list of verified-safe implementations (MetaMask smart account, Simple7702Account, and other whitelisted contracts) and a blocklist of known sweeper / phishing contracts.",
    },
    {
      title: "Flags broken delegations",
      description:
        "If your EOA is delegated to an address that has no code — a common state after mis-configured transactions — the tool tells you clearly, so you know why calls to your account are failing.",
    },
    {
      title: "Works with any Ethereum address",
      description:
        "Your own EOA, someone else's, a suspected drainer target. No wallet connection required — it's a pure on-chain read.",
    },
    {
      title: "100% private",
      description:
        "No addresses stored, no analytics tied to lookups. The address you paste is sent to an Ethereum RPC and nowhere else.",
    },
    {
      title: "Open source",
      description:
        "MIT-licensed. Fork it, add to the known-delegates list, or self-host with your own RPC. Contributions welcome.",
    },
  ],
  useCases: [
    {
      title: "Check if your EOA has been silently delegated",
      description:
        "If you signed something you didn't fully understand — a wallet-connect prompt, a message from a Telegram DM, a suspicious dApp — this is the first check. Paste your address. If the tool shows a delegation and you didn't authorize it knowingly, treat your wallet as compromised.",
    },
    {
      title: "Verify what a wallet upgrade actually installed",
      description:
        "Modern smart wallets (MetaMask, Ambire, and others) now use EIP-7702 delegation as their upgrade path. After upgrading, check that the delegate on your account matches the wallet vendor's published contract address, not something else.",
    },
    {
      title: "Investigate a drainer victim's address",
      description:
        "Security researchers, incident responders, and reporters covering wallet-drainer attacks can quickly identify EIP-7702 sweeper patterns and name the delegate contract responsible.",
    },
    {
      title: "Sanity-check a delegate before authorizing it",
      description:
        "Wallet engineers and AA SDK users building on 7702 can verify their delegate implementation address is deployed and has code before promoting a signing flow to production.",
    },
    {
      title: "Confirm an un-delegation actually took effect",
      description:
        "Un-delegating means signing a new authorization pointing to the zero address. This tool confirms your account is back to plain EOA state after that.",
    },
  ],
  faqs: [
    {
      question: "What is EIP-7702, in one paragraph?",
      answer:
        "A transaction type (0x04) that lets an EOA install code on itself by signing a small authorization tuple: [chain_id, address, nonce, y_parity, r, s]. Once processed, your account's code field is set to the 23-byte value 0xef0100 || delegate_address. When anyone calls your account after that, the EVM follows that pointer and runs the delegate's code inside your account — your storage, your balance, your nonce. This is what enables gas sponsorship, batched transactions, and passkey wallets, and it's also the mechanism behind a new class of phishing sweepers.",
    },
    {
      question: "What does 0xef0100 mean, and why those specific bytes?",
      answer:
        "It's the delegation indicator — the fixed 3-byte prefix that identifies a code field as an EIP-7702 delegation rather than a normal deployed contract. 0xef is the specific opcode banned by EIP-3541 (contracts can't start with 0xef through normal deployment), so the presence of that first byte is an unambiguous signal that the code was installed via a set-code transaction. 0x0100 is a version identifier. The remaining 20 bytes after the prefix are the delegate contract's address.",
    },
    {
      question: "How does one signature install persistent code?",
      answer:
        "The user signs a hash: keccak256(0x05 ++ rlp([chain_id, address, nonce])). The 0x05 byte is a domain separator — it guarantees this signature can't be replayed as any other kind of Ethereum message. A sponsor then submits a type-0x04 transaction containing that signature, and if it's valid the network writes 0xef0100 || delegate_address into the signer's code field. The delegation persists across transactions until the account owner signs a new authorization replacing it.",
    },
    {
      question: "What is chainId = 0 and why is it dangerous?",
      answer:
        "The chain_id field in an authorization tuple can be set to 0, which means 'valid on every EVM chain.' This is legitimately useful for wallets that want to upgrade across all chains with one signature. But it's the mechanism behind cross-chain replay attacks: a victim signs a chainId=0 tuple thinking it applies to one chain, and an attacker replays the same tuple on other chains where the signer has the same address (same nonce assumption), installing the malicious delegation everywhere at once. If a dApp asks you to sign a chainId=0 authorization, treat it with the same suspicion you'd give an unlimited token approval.",
    },
    {
      question: "How do I un-delegate my account?",
      answer:
        "Sign a new authorization tuple with the delegate address set to the zero address (0x0000000000000000000000000000000000000000). When that transaction is included, the delegation indicator is cleared and your account returns to plain EOA state — code field back to empty. Some wallets expose this as a 'reset' or 'remove smart account' option. Verify it worked by pasting your address here again after the reset transaction confirms.",
    },
    {
      question: "What's a CrimeEnjoyor contract?",
      answer:
        "CrimeEnjoyor is the informal name given to a family of minimal sweeper contracts that early phishing operations delegated victim EOAs to. The pattern was simple and identical across variants: a tiny bytecode that, when called, forwards all ETH and token balances to an attacker-controlled address. Because delegation is persistent, once a victim signed the authorization, every subsequent transaction to their account — including automated retries from wallet software — routed funds to the attacker. Multiple security firms tracked these variants in the first months after Pectra shipped, and estimates at the time suggested a large majority of early delegations pointed at addresses in this family.",
    },
    {
      question: "Why does EXTCODESIZE on a delegated account only return 23?",
      answer:
        "This is a subtle but important detail from the EIP. When another contract inspects your delegated account with EXTCODESIZE, it sees the size of the delegation indicator (23 bytes) — not the size of the delegate's actual code. But when your account's code runs (because someone called it), the CODESIZE opcode inside that execution returns the delegate's full code size. The asymmetry lets contracts detect that an address is a 7702-delegated EOA rather than a regular contract, without breaking the code-runs-with-the-account model. Some contracts use this to gate behavior on whether the caller is a plain EOA.",
    },
    {
      question: "Can the same account be delegated to different contracts on different chains?",
      answer:
        "Yes. Delegation state is per-chain (unless the original signature used chainId=0). Your Ethereum mainnet EOA can be delegated to one contract, your same address on Base delegated to a different one, and your Arbitrum address undelegated. This tool currently checks Ethereum mainnet; multi-chain support is on the roadmap for a later phase.",
    },
    {
      question: "Is this tool safe to use with my address?",
      answer:
        "Yes. The tool only does read operations — it calls getCode on an RPC endpoint, which is a public query that anyone can make against any address. No signature is ever requested, no wallet connection is needed, and no address is stored server-side. You're not authorizing anything by using this.",
    },
    {
      question: "Why is my delegate showing 'unknown' instead of safe or malicious?",
      answer:
        "The known-delegates list is curated and finite. When your delegate isn't in either the whitelist or the blocklist, the tool tells you honestly that it can't classify it. That's a signal to look up the delegate address on Etherscan, check whether the contract is verified, whether it's been publicly audited, and whether the wallet vendor you use has published it as their implementation. False confidence would be more dangerous than 'unknown.'",
    },
  ],
  history: {
    heading: "How EIP-7702 came to exist",
    paragraphs: [
      "The problem EIP-7702 solves is older than the solution. Since Ethereum launched, EOAs — the wallets almost everyone uses — have been rigid. You can send transactions, you can sign messages, and that's it. No batching, no gas sponsorship, no session keys, no social recovery. Meanwhile, smart contract accounts had all of that but were expensive to deploy, hard to migrate to, and had a different address than your existing EOA. Users kept the EOA.",
      "The first serious attempt at bridging this gap was EIP-3074, proposed in 2020. It introduced two new EVM opcodes — AUTH and AUTHCALL — that let an EOA delegate authority to a smart contract via a signed message. The proposal spent years in the discussion phase, gained implementations across clients, and then hit a wall on security concerns: opcodes are permanent, and giving EOAs a new way to hand over authority made it very hard to reason about what a signed message could do downstream. 3074 was ultimately shelved.",
      "In May 2024, Vitalik Buterin proposed EIP-7702 as an alternative. Instead of new opcodes, it introduced a new transaction type — 0x04, the set-code transaction — that lets an EOA install a temporary or persistent pointer to a contract's code. Same end result as 3074 (an EOA behaving like a smart account), but implemented as a transaction envelope rather than as changes to the EVM itself. It went through the standards process in under a year, moved into the Pectra upgrade, and shipped on mainnet in May 2025.",
      "The immediate aftermath was a lesson in the gap between spec design and human behavior. Delegation is a legitimate and safe feature when the signer understands what they're signing. In practice, wallets rushed to expose 7702 authorization flows before UI patterns for explaining them existed. Phishing operations moved faster than the wallets did. Within weeks of Pectra, the first CrimeEnjoyor variants appeared: minimal sweeper contracts that phishing sites would ask victims to delegate to, followed by automated draining of everything the victim held. Wintermute and other researchers estimated that in the early months after launch, well over half of all EIP-7702 delegations on mainnet pointed at contracts in this sweeper family.",
      "The situation has improved as wallet UX has caught up — MetaMask, Ambire, and others now show clear warnings for authorization signatures, and awesome-eip-7702-delegations has emerged as a community-curated list of verified-safe implementations. But the fundamental asymmetry remains: one signature installs code that runs on every future call to your account. Understanding what you're signing, and being able to check what you've already signed, is now table stakes for anyone holding value in an EOA. That's what this tool is for.",
    ],
  },
};

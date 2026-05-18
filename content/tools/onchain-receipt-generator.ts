export const onchainReceiptGeneratorContent = {
  faqs: [
    {
      question: "What chains does this support?",
      answer:
        "Ethereum, Base, BSC, and Solana. Paste any transaction hash and the chain is detected automatically — you don't need to select it.",
    },
    {
      question: "Where does the data come from?",
      answer:
        "Directly from each chain's RPC. EVM chains via Alchemy, Solana via Helius. USD values come from CoinGecko for listed tokens and GeckoTerminal for DEX-only tokens, priced at the day of the transaction.",
    },
    {
      question: "Is this free?",
      answer:
        "Yes. Free, no signup, no rate limits beyond reasonable abuse protection. It's open source — you can self-host it if you want.",
    },
    {
      question: "Why would I need a receipt for an onchain transaction?",
      answer:
        "Crypto-paid freelancers and businesses need a clean PDF for clients, proof of payment, and accounting. This use cases needs something better than sharing a raw explorer link or even worse the transaction hash/signature.",
    },
    {
      question: "Are my transactions private?",
      answer:
        "Transaction hashes are public on-chain data — anyone can look them up. This tool just makes them readable. We don't store hashes, addresses, or any user data. Generated receipts only exist for the duration of your visit unless you download them.",
    },
    {
      question: "What if a token's USD value doesn't show up?",
      answer:
        "Common stables and native wrappers (USDC, USDT, DAI, WETH, WSOL, WBNB) resolve instantly. Other tokens depend on whether CoinGecko or GeckoTerminal indexes them. Fresh memecoins or unlisted tokens may show no USD value — the receipt is still valid.",
    },
    {
      question: "How do I share a receipt?",
      answer:
        "Copy the URL after generating — it includes the transaction hash as a query parameter. Anyone you share it with will see the same receipt. You can also download the image and post it directly.",
    },
  ],
};

export type ToolFeature = {
  title: string;
  description: string;
  icon?: string;
};

export type UseCase = {
  title: string;
  description: string;
};

export type FAQ = {
  question: string;
  answer: string;
};

export type ToolContent = {
  about: {
    heading: string;
    paragraphs: string[];
  };
  features: ToolFeature[];
  useCases: UseCase[];
  faqs: FAQ[];
  history?: {
    heading: string;
    paragraphs: string[];
  };
};

export const qrCodeContent: ToolContent = {
  about: {
    heading: "About this tool",
    paragraphs: [
      "A free QR code generator built for the things builders actually do — sharing a WiFi password at a meetup, putting a crypto wallet on a sticker, or linking a GitHub profile from a printed business card.",
      "Most QR generators online wrap the same API and serve it back with ads, watermarks, and a paywall when you want a clean SVG. This one doesn't. The QR is generated on your device, the logo you upload never leaves your browser, and every export is free.",
      "10 supported types cover what's actually useful: URL, text, WiFi, phone, Bitcoin, Ethereum, Solana, Twitter, GitHub, and YouTube.",
      "Open source on GitHub. Built with Next.js, React, and the `qr-code-styling` library.",
    ],
  },
  features: [
    {
      title: "Supports 10 QR types",
      description:
        "URL, text, WiFi, phone, plus crypto wallets and social profiles.",
      icon: "",
    },
    {
      title: "Logo embedding",
      description:
        "Drop in your logo as PNG, SVG, or JPG. Resizes automatically and stays scannable.",
      icon: "",
    },
    {
      title: "Custom colors and shapes",
      description:
        "Pick foreground and background colors, choose dot and corner shapes. Match your brand.",
      icon: "",
    },
    {
      title: "PNG and SVG export",
      description:
        "Download as PNG for web, SVG for print. No watermarks, no resolution caps.",
      icon: "",
    },
    {
      title: "100% private",
      description:
        "Generation runs in your browser. Logos and addresses never touch a server.",
      icon: "",
    },
    {
      title: "Open source",
      description:
        "MIT-licensed on GitHub. Fork it, audit it, host it yourself and don't forget to leave a star ;)",
      icon: "",
    },
  ],
  useCases: [
    {
      title: "Share WiFi without typing the password",
      description:
        "Print a WiFi QR code on a card by your front door. Guests scan, phone connects, no '6-digits-letter-symbol-symbol' awkwardness.",
    },
    {
      title: "Accept crypto payments on a printed sticker",
      description:
        "Generate a QR for your Bitcoin, Ethereum, or Solana address. Stick it on your laptop, business card, or coffee shop counter — anyone with a wallet app can scan and send.",
    },
    {
      title: "Add a profile QR to your business card",
      description:
        "Most people throw away cards. They keep what's interesting. A QR linking to your GitHub or Twitter is more interesting than a phone number.",
    },
    {
      title: "Tip jar for streamers and creators",
      description:
        "Drop a Solana or Bitcoin QR on your stream overlay or in your video description. Viewers scan, send a tip, no Stripe account, no platform fees.",
    },
    {
      title: "Quick contact for events and conferences",
      description:
        "A QR on your badge that links to your Twitter handle. People meet you, scan once, follow you, done. Saves the 'how do you spell that' conversation.",
    },
  ],
  faqs: [
    {
      question: "Is this QR code generator really free?",
      answer:
        "Yes. Free, no account, no watermarks, no upgrade tier. The code is open source on GitHub — if you don't trust the website, you can run it yourself.",
    },
    {
      question: "Do QR codes expire?",
      answer:
        "The QR code itself never expires — it's just a pattern of dots that encodes a string. What can expire is what's on the other end. A QR pointing to a URL stops working if the URL goes down. A QR encoding plain text or a crypto address never stops working.",
    },
    {
      question: "Why does my Ethereum QR not include the amount?",
      answer:
        "Most wallet apps support address-only QRs (EIP-681 for Ethereum) but their support for the optional amount field varies. Trust Wallet and MetaMask Mobile, for example, parse the address but ignore the amount. The tool includes the amount in the QR per spec; some scanners use it, some don't. Solana Pay support is more consistent — Phantom/Trust Wallet handle it well.",
    },
    {
      question: "Can I add a logo to a QR code without breaking it?",
      answer:
        "Yes — QR codes have built-in error correction, which means up to ~30% of the code can be unreadable and it still scans. The tool uses error correction level Q, which leaves room for a logo in the center without making the QR unreliable. Keep the logo to about 30% of the QR's area.",
    },
    {
      question: "What's the difference between PNG and SVG download?",
      answer:
        "PNG is a fixed-size image good for web, social, and email. SVG is a vector image that scales to any size without blurring, which matters for print, signage, or large displays. If you're printing a QR bigger than a business card, use SVG.",
    },
    {
      question: "Are my QR codes saved or tracked?",
      answer:
        "No. Everything you generate happens in your browser. Your inputs, your logos, your QR codes never leave your device. The site uses Vercel Analytics for basic page-view counts (no cookies, no personal data, GDPR-friendly), but what you generate inside the tool is never sent anywhere.",
    },
    {
      question: "How does a WiFi QR code actually work?",
      answer:
        "It encodes a special string (`WIFI:T:WPA;S:NetworkName;P:Password;;`) that phones recognize as a connection request. Scan it on iPhone or Android, the OS offers to join the network, you tap once, you're online. Useful for guest networks where typing a 20-character password is painful.",
    },
    {
      question: "Can I edit a QR code after I generate it?",
      answer:
        "Not really — QR codes are static. Once generated, the data is locked in. If you need a QR you can update later (for example, change the URL it points to without reprinting), you need a 'dynamic QR' service that uses a redirect URL. Those usually require a subscription. This tool only generates static QRs.",
    },
  ],
  history: {
    heading: "How QR codes were born",
    paragraphs: [
      "The QR code wasn't invented by a tech company or a research lab. It came from an engineer's lunch break and a 2,500 year-old Japanese board game.",
      "In 1994, Masahiro Hara was working at Denso Wave, a Toyota subsidiary, on the frustrating problem of tracking car parts across a factory. The barcodes they used then could only hold 12 digits, not enough to identify the parts moving through the line, and slow to scan because they had to be aligned just right.",
      "Hara was playing Go on his lunch break when he noticed something. The game's board is a grid, pieces are placed at intersections; the patterns of black and white stones form unique configurations that a player can read at a glance, from any angle. What if data could be encoded the same way? Not a line of stripes, but a 2D matrix that could hold thousands of characters and be scanned even when rotated, partially blocked, or printed on a curved surface.",
      "That insight became the QR code: position-detection patterns in three corners (so scanners know which way is up), error correction baked in (so the code still works when smudged or covered by a logo), and capacity for over 4,000 alphanumeric characters in a single square.",
      "What stuck with me when I read this: the 'complex' technology behind QR codes — the thing now used for restaurant menus, payments, and the Bitcoin sticker you might be making with this tool — came from someone playing a game on his break. The best ideas often look like that.",
    ],
  },
};

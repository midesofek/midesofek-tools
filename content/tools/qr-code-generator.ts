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
      // YOU FILL THESE IN — see Step 5.3
      "This is a Free QR Code Generator built to cater for everything you need as a builder. Whether you need to share  a WiFi Connection, your socials/contact to your audience, or receive crypto payments, this tool has got you covered. It’s 100% private and runs entirely in your browser.",
      "Unlike most QR Code Generators, that spams you with ads and a paywall, this tool is ad free, open-source and is 100% free to use.",
      "The QR code is Generated on your device, never sent to any server or database and the logo you upload never leaves your browser",
      "It is built for builders who need to share WiFi at an event, want to share their socials/contact info in a sleek way, or receive Bitcoin, Ethereum or Solana payments without the hassle of setting up a whole page for it.",
      "The supported types cover what you use the most as a builder.",
      "This tool is Open-Source on GitHub, built with Next.js, React and the `qr-code-styling` library",
    ],
  },
  features: [
    // YOU FILL THESE IN — see Step 5.4
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
    // YOU FILL THESE IN — see Step 5.5
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
      title: "Link a video tutorial from a physical product",
      description:
        "Print a QR on the side of packaging that goes to a YouTube unboxing or how-to video. Skip the printed manual nobody reads.",
    },
    {
      title: "Quick contact for events and conferences",
      description:
        "A QR on your badge that links to your Twitter handle. People meet you, scan once, follow you, done. Saves the 'how do you spell that' conversation.",
    },
  ],
  faqs: [
    // YOU FILL THESE IN — see Step 5.6
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
        "No. Everything you generate happens in your browser. The tool doesn't store your inputs, your logos, or your QR codes. There's no analytics on what you generate — only basic site analytics (page views, no personal data).",
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
      // YOU FILL THESE IN — see Step 5.7
      "The widely used QR code idea came from a fun simple Japanese board game known as 'Go'",
      "It was invented by Masahiro Hara, a frustrated Engineer working for Denso Wave in 1994. Tired of tracking inventory with traditional barcodes which couldn't store more than 12 digits numerical data (0-9), Masahiro Hara sought a way to encode more information that could be read quickly.",
      "During one of his launch breaks, Hara was playing Go (a board game that uses a 2D grid of black and white stones) and it sparked an idea. He realized that by using a 2D grid of black and white squares, he could encode much more data than a traditional barcode, which could be scanned from any angle at high speed.",
      "The part that stuck with me is the fact that the 'complex' QR code was inspired by a SIMPLE game",
    ],
  },
};

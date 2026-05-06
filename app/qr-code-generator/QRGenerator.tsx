"use client";

import { useMemo, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { qrTypes, QRType } from "./types";
import {
  formatURL,
  formatText,
  formatWiFi,
  formatPhone,
  formatBitcoin,
  formatEthereum,
  formatSolana,
  formatTwitter,
  formatGitHub,
  formatYouTube,
} from "./formatters";
import {
  URLForm,
  TextForm,
  WiFiForm,
  PhoneForm,
  CryptoForm,
  HandleForm,
  YouTubeForm,
  type WiFiState,
  type CryptoState,
} from "./InputForms";
import { QRPreview, type QRStyle } from "./QRPreview";
import { StyleControls } from "./StyleControls";

export function QRGenerator() {
  const [activeType, setActiveType] = useState<QRType>("url");

  // One state slot per type. Each preserves its input across tab switches.
  const [url, setUrl] = useState("");
  const [text, setText] = useState("");
  const [wifi, setWifi] = useState<WiFiState>({
    ssid: "",
    password: "",
    encryption: "WPA",
    hidden: false,
  });
  const [phone, setPhone] = useState("");
  const [bitcoin, setBitcoin] = useState<CryptoState>({
    address: "",
    amount: "",
  });
  const [ethereum, setEthereum] = useState<CryptoState>({
    address: "",
    amount: "",
  });
  const [solana, setSolana] = useState<CryptoState>({
    address: "",
    amount: "",
  });
  const [twitter, setTwitter] = useState("");
  const [github, setGithub] = useState("");
  const [youtube, setYoutube] = useState("");

  const [style, setStyle] = useState<QRStyle>({
    fgColor: "#000000",
    bgColor: "#ffffff",
    dotShape: "square",
    cornerShape: "square",
  });

  // Compute the encoded string from the active type's state
  const encodedString = useMemo(() => {
    switch (activeType) {
      case "url":
        return formatURL(url);
      case "text":
        return formatText(text);
      case "wifi":
        return formatWiFi(wifi);
      case "phone":
        return formatPhone(phone);
      case "bitcoin":
        return formatBitcoin(bitcoin);
      case "ethereum":
        return formatEthereum(ethereum);
      case "solana":
        return formatSolana(solana);
      case "twitter":
        return formatTwitter(twitter);
      case "github":
        return formatGitHub(github);
      case "youtube":
        return formatYouTube(youtube);
    }
  }, [
    activeType,
    url,
    text,
    wifi,
    phone,
    bitcoin,
    ethereum,
    solana,
    twitter,
    github,
    youtube,
  ]);

  return (
    <div className="grid lg:grid-cols-2 gap-12 py-8">
      {/* Left: inputs */}
      <div className="space-y-6">
        <Tabs
          value={activeType}
          onValueChange={(v) => setActiveType(v as QRType)}
        >
          <TabsList className="flex-wrap h-auto justify-start gap-1">
            {qrTypes.map((t) => (
              <TabsTrigger key={t.id} value={t.id} className="gap-1.5">
                <span>{t.icon}</span>
                <span>{t.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          <div className="mt-6 p-6 border border-gray-200 dark:border-gray-800 rounded-lg">
            <p className="text-sm text-gray-500 mb-4">
              {qrTypes.find((t) => t.id === activeType)?.description}
            </p>

            <TabsContent value="url">
              <URLForm value={url} onChange={setUrl} />
            </TabsContent>
            <TabsContent value="text">
              <TextForm value={text} onChange={setText} />
            </TabsContent>
            <TabsContent value="wifi">
              <WiFiForm value={wifi} onChange={setWifi} />
            </TabsContent>
            <TabsContent value="phone">
              <PhoneForm value={phone} onChange={setPhone} />
            </TabsContent>
            <TabsContent value="bitcoin">
              <CryptoForm
                value={bitcoin}
                onChange={setBitcoin}
                symbol="BTC"
                addressLabel="Bitcoin address"
              />
            </TabsContent>
            <TabsContent value="ethereum">
              <CryptoForm
                value={ethereum}
                onChange={setEthereum}
                symbol="ETH"
                addressLabel="Ethereum address"
              />
            </TabsContent>
            <TabsContent value="solana">
              <CryptoForm
                value={solana}
                onChange={setSolana}
                symbol="SOL"
                addressLabel="Solana address"
              />
            </TabsContent>
            <TabsContent value="twitter">
              <HandleForm
                value={twitter}
                onChange={setTwitter}
                platform="Twitter / X"
              />
            </TabsContent>
            <TabsContent value="github">
              <HandleForm
                value={github}
                onChange={setGithub}
                platform="GitHub"
              />
            </TabsContent>
            <TabsContent value="youtube">
              <YouTubeForm value={youtube} onChange={setYoutube} />
            </TabsContent>
          </div>
        </Tabs>

        <StyleControls style={style} onChange={setStyle} />
      </div>

      {/* Right: preview (sticky on desktop) */}
      <div className="lg:sticky lg:top-8 lg:self-start">
        <QRPreview data={encodedString} style={style} />
      </div>
    </div>
  );
}

"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Each form receives the current value object and an onChange callback.
// The parent owns state — these are controlled components.

export function URLForm({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor="url">URL</Label>
      <Input
        id="url"
        placeholder="example.com"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

export function TextForm({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor="text">Text</Label>
      <Textarea
        id="text"
        placeholder="Anything you want to encode..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={4}
      />
    </div>
  );
}

export type WiFiState = {
  ssid: string;
  password: string;
  encryption: "WPA" | "WEP" | "nopass";
  hidden: boolean;
};

export function WiFiForm({
  value,
  onChange,
}: {
  value: WiFiState;
  onChange: (v: WiFiState) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="ssid">Network name (SSID)</Label>
        <Input
          id="ssid"
          placeholder="MyNetwork"
          value={value.ssid}
          onChange={(e) => onChange({ ...value, ssid: e.target.value })}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="encryption">Encryption</Label>
        <Select
          value={value.encryption}
          onValueChange={(v) =>
            onChange({ ...value, encryption: v as WiFiState["encryption"] })
          }
        >
          <SelectTrigger id="encryption">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="WPA">WPA / WPA2</SelectItem>
            <SelectItem value="WEP">WEP</SelectItem>
            <SelectItem value="nopass">No password</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {value.encryption !== "nopass" && (
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="text"
            placeholder="••••••••"
            value={value.password}
            onChange={(e) => onChange({ ...value, password: e.target.value })}
          />
        </div>
      )}
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={value.hidden}
          onChange={(e) => onChange({ ...value, hidden: e.target.checked })}
        />
        Hidden network
      </label>
    </div>
  );
}

export function PhoneForm({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor="phone">Phone number</Label>
      <Input
        id="phone"
        type="tel"
        placeholder="+234 800 000 0000"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

export type CryptoState = { address: string; amount: string };

export function CryptoForm({
  value,
  onChange,
  symbol,
  addressLabel,
}: {
  value: CryptoState;
  onChange: (v: CryptoState) => void;
  symbol: string;
  addressLabel: string;
}) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="address">{addressLabel}</Label>
        <Input
          id="address"
          placeholder={`Your ${symbol} address`}
          value={value.address}
          onChange={(e) => onChange({ ...value, address: e.target.value })}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="amount">Amount ({symbol}) — optional</Label>
        <Input
          id="amount"
          type="text"
          inputMode="decimal"
          placeholder="0.00"
          value={value.amount}
          onChange={(e) => onChange({ ...value, amount: e.target.value })}
        />
      </div>
    </div>
  );
}

export function HandleForm({
  value,
  onChange,
  platform,
}: {
  value: string;
  onChange: (v: string) => void;
  platform: string;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor="handle">{platform} username</Label>
      <Input
        id="handle"
        placeholder="@username"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

export function YouTubeForm({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor="youtube">YouTube handle or URL</Label>
      <Input
        id="youtube"
        placeholder="@channelname or full URL"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

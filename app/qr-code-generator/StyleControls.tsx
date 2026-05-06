"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { QRStyle } from "./QRPreview";

type StyleControlsProps = {
  style: QRStyle;
  onChange: (style: QRStyle) => void;
};

export function StyleControls({ style, onChange }: StyleControlsProps) {
  const handleLogoUpload = (file: File | null) => {
    if (!file) {
      onChange({ ...style, logoDataUrl: undefined });
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      onChange({ ...style, logoDataUrl: e.target?.result as string });
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-4 pt-6 border-t border-gray-200 dark:border-gray-800">
      <h3 className="font-semibold">Style</h3>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="fg">Foreground</Label>
          <div className="flex gap-2">
            <input
              type="color"
              id="fg"
              value={style.fgColor}
              onChange={(e) => onChange({ ...style, fgColor: e.target.value })}
              className="h-10 w-12 cursor-pointer rounded border border-gray-300"
            />
            <Input
              value={style.fgColor}
              onChange={(e) => onChange({ ...style, fgColor: e.target.value })}
              className="font-mono text-sm"
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="bg">Background</Label>
          <div className="flex gap-2">
            <input
              type="color"
              id="bg"
              value={style.bgColor}
              onChange={(e) => onChange({ ...style, bgColor: e.target.value })}
              className="h-10 w-12 cursor-pointer rounded border border-gray-300"
            />
            <Input
              value={style.bgColor}
              onChange={(e) => onChange({ ...style, bgColor: e.target.value })}
              className="font-mono text-sm"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Dot shape</Label>
          <Select
            value={style.dotShape}
            onValueChange={(v) =>
              onChange({ ...style, dotShape: v as QRStyle["dotShape"] })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="square">Square</SelectItem>
              <SelectItem value="rounded">Rounded</SelectItem>
              <SelectItem value="dots">Dots</SelectItem>
              <SelectItem value="classy">Classy</SelectItem>
              <SelectItem value="extra-rounded">Extra rounded</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Corner shape</Label>
          <Select
            value={style.cornerShape}
            onValueChange={(v) =>
              onChange({ ...style, cornerShape: v as QRStyle["cornerShape"] })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="square">Square</SelectItem>
              <SelectItem value="extra-rounded">Rounded</SelectItem>
              <SelectItem value="dot">Dot</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="logo">Logo (optional)</Label>
        <Input
          id="logo"
          type="file"
          accept="image/*"
          onChange={(e) => handleLogoUpload(e.target.files?.[0] ?? null)}
        />
        {style.logoDataUrl && (
          <button
            onClick={() => onChange({ ...style, logoDataUrl: undefined })}
            className="text-sm text-gray-500 underline"
          >
            Remove logo
          </button>
        )}
      </div>
    </div>
  );
}

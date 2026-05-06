"use client";

import { useEffect, useRef } from "react";
import QRCodeStyling, { Options } from "qr-code-styling";

export type QRStyle = {
  fgColor: string;
  bgColor: string;
  dotShape: "square" | "rounded" | "dots" | "classy" | "extra-rounded";
  cornerShape: "square" | "extra-rounded" | "dot";
  logoDataUrl?: string;
};

type QRPreviewProps = {
  data: string;
  style: QRStyle;
  size?: number;
};

export function QRPreview({ data, style, size = 320 }: QRPreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const qrRef = useRef<QRCodeStyling | null>(null);

  // Initialize the QR instance once, on mount
  useEffect(() => {
    const instance = new QRCodeStyling({
      width: size,
      height: size,
      type: "svg",
      data: data || " ",
      dotsOptions: { color: style.fgColor, type: style.dotShape },
      cornersSquareOptions: { color: style.fgColor, type: style.cornerShape },
      backgroundOptions: { color: style.bgColor },
      image: style.logoDataUrl,
      imageOptions: {
        crossOrigin: "anonymous",
        margin: 4,
        imageSize: 0.3,
      },
    });

    qrRef.current = instance;

    if (containerRef.current) {
      containerRef.current.innerHTML = "";
      instance.append(containerRef.current);
    }

    return () => {
      qrRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update when data or style changes
  useEffect(() => {
    if (!qrRef.current) return;
    const update: Partial<Options> = {
      data: data || " ",
      dotsOptions: { color: style.fgColor, type: style.dotShape },
      cornersSquareOptions: { color: style.fgColor, type: style.cornerShape },
      backgroundOptions: { color: style.bgColor },
      image: style.logoDataUrl,
    };
    qrRef.current.update(update);
  }, [data, style]);

  const download = (ext: "png" | "svg") => {
    qrRef.current?.download({ name: "qr-code", extension: ext });
  };

  const isEmpty = !data;

  return (
    <div className="flex flex-col items-center gap-4">
      <div
        className={`p-4 bg-white rounded-lg border border-gray-200 ${isEmpty ? "opacity-30" : ""}`}
        style={{ width: size + 32, height: size + 32 }}
      >
        <div ref={containerRef} />
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => download("png")}
          disabled={isEmpty}
          className="px-4 py-2 bg-gray-900 text-white rounded-md text-sm font-medium hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Download PNG
        </button>
        <button
          onClick={() => download("svg")}
          disabled={isEmpty}
          className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Download SVG
        </button>
      </div>
    </div>
  );
}

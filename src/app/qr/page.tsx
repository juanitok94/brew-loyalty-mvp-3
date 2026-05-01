"use client";

import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import { STAMPS_REQUIRED } from "@/lib/constants";
import { shopConfig } from "@/config/shop";

export default function QRPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [url, setUrl] = useState("");

  useEffect(() => {
    const baseUrl = window.location.origin;
    const target = `${baseUrl}/`;
    setUrl(target);
    if (canvasRef.current) {
      QRCode.toCanvas(canvasRef.current, target, {
        width: 280,
        margin: 2,
        color: {
          dark: shopConfig.colors.brandDark,
          light: "#FFFFFF",
        },
      });
    }
  }, []);

  function handlePrint() {
    window.print();
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--background)" }}>
      {/* Black header */}
      <header
        style={{
          background: shopConfig.colors.headerBg,
          padding: "28px 24px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "8px",
        }}
      >
        <img
          src={shopConfig.logoPath}
          alt={shopConfig.name}
          style={{ width: 72, height: 72, objectFit: "contain" }}
        />
        <h1 className="font-display text-2xl" style={{ color: shopConfig.colors.headerText }}>
          {shopConfig.name}
        </h1>
        <p className="text-sm" style={{ color: shopConfig.colors.headerTextMuted }}>
          {shopConfig.location}
        </p>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-6 py-10 print:py-4">
        <div className="w-full max-w-xs space-y-6 text-center">
          <div
            className="rounded-2xl p-6 inline-block mx-auto"
            style={{ background: "#fff", border: "1.5px solid var(--stamp-empty)" }}
          >
            <canvas ref={canvasRef} className="block" />
          </div>

          <div className="space-y-2">
            <p className="text-base font-semibold" style={{ color: "var(--brown-dark)" }}>
              Scan to join our loyalty program
            </p>
            <p className="text-sm" style={{ color: "var(--brown-text-muted)" }}>
              Buy {STAMPS_REQUIRED} drinks, earn a {shopConfig.rewardDescription}
            </p>
            <p className="text-xs" style={{ color: "var(--stamp-empty)" }}>
              No app download needed
            </p>
          </div>

          <button
            onClick={handlePrint}
            className="w-full py-3 rounded-xl font-semibold text-white text-base print:hidden"
            style={{ background: "var(--brown)" }}
          >
            Print QR code
          </button>

          {url && (
            <p className="text-xs break-all print:block" style={{ color: "var(--brown-text-muted)" }}>
              {url}
            </p>
          )}
        </div>
      </main>
    </div>
  );
}

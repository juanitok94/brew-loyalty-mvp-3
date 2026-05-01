"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { STAMPS_REQUIRED } from "@/lib/constants";
import { shopConfig } from "@/config/shop";

type CustomerData = {
  phone: string;
  stamps: number;
  lastVisit: string;
  redeemed: number;
};

const TOTAL = STAMPS_REQUIRED;

function StampCircle({ filled, index }: { filled: boolean; index: number }) {
  return (
    <div
      className={`w-12 h-12 rounded-full flex items-center justify-center text-xl transition-all ${
        filled ? "stamp-pop" : ""
      }`}
      style={{
        background: filled ? "var(--stamp-filled)" : "var(--stamp-empty)",
        color: filled ? "#fff" : "var(--brown-text-muted)",
        animationDelay: `${index * 60}ms`,
      }}
    >
      {filled ? "☕" : ""}
    </div>
  );
}

function CardContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const rawPhone = searchParams.get("phone") ?? "";

  const [data, setData] = useState<CustomerData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadCard(phone: string) {
    const response = await fetch(`/api/stamps?phone=${encodeURIComponent(phone)}`, {
      cache: "no-store",
    });
    const payload = await response.json();

    if (!response.ok) {
      throw new Error(payload?.error ?? "Failed to load card");
    }

    setData(payload);
    setError("");
  }

  useEffect(() => {
    if (!rawPhone) {
      router.replace("/");
      return;
    }

    let cancelled = false;

    const refreshCard = async () => {
      try {
        await loadCard(rawPhone);
        if (!cancelled) setLoading(false);
      } catch {
        if (!cancelled) {
          setError("Could not load your card. Please try again.");
          setLoading(false);
        }
      }
    };

    void refreshCard();
    const intervalId = window.setInterval(() => { void refreshCard(); }, 5000);

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
    };
  }, [rawPhone, router]);

  const isReady = data ? data.stamps >= TOTAL : false;
  const displayPhone = data
    ? data.phone.replace(/^\+1(\d{3})(\d{3})(\d{4})$/, "($1) $2-$3")
    : rawPhone.replace(/(\d{3})(\d{3})(\d{4})/, "($1) $2-$3");

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
        {displayPhone && (
          <p className="text-sm" style={{ color: shopConfig.colors.headerTextMuted }}>
            {displayPhone}
          </p>
        )}
      </header>

      {/* Page content */}
      <main className="flex-1 flex flex-col items-center px-6 py-8">
        {loading && (
          <div className="flex-1 flex items-center justify-center">
            <p style={{ color: "var(--brown-text-muted)" }}>Loading your card...</p>
          </div>
        )}

        {!loading && (error || !data) && (
          <div className="flex-1 flex flex-col items-center justify-center gap-4">
            <p className="text-red-600">{error || "No data found."}</p>
            <button
              onClick={() => router.push("/")}
              className="text-sm underline"
              style={{ color: "var(--brown-text)" }}
            >
              Go back
            </button>
          </div>
        )}

        {!loading && data && (
          <div className="w-full max-w-sm space-y-6">
            {/* Reward Banner */}
            {isReady ? (
              <div
                className="rounded-2xl p-5 text-center space-y-2 celebrate"
                style={{ background: "var(--brown)", color: "#fff" }}
              >
                <div className="text-4xl">🎉</div>
                <p className="text-xl font-semibold">
                  {shopConfig.rewardDescription.charAt(0).toUpperCase() + shopConfig.rewardDescription.slice(1)} ready!
                </p>
                <p className="text-sm opacity-90">Show this to your barista to redeem</p>
              </div>
            ) : (
              <div
                className="rounded-2xl p-4 text-center"
                style={{ background: "var(--cream)" }}
              >
                <p className="text-sm font-medium" style={{ color: "var(--brown-dark)" }}>
                  {TOTAL - data.stamps} more {TOTAL - data.stamps === 1 ? "drink" : "drinks"} until
                  your {shopConfig.rewardDescription}
                </p>
              </div>
            )}

            {/* Stamp Grid */}
            <div
              className="rounded-2xl p-6"
              style={{
                background: isReady ? shopConfig.colors.rewardBg : "#fff",
                border: "1.5px solid var(--stamp-empty)",
              }}
            >
              <div className="grid grid-cols-3 gap-3 justify-items-center">
                {Array.from({ length: TOTAL }).map((_, i) => (
                  <StampCircle key={i} filled={i < data.stamps} index={i} />
                ))}
              </div>
              <p className="text-center text-xs mt-4" style={{ color: "var(--brown-text-muted)" }}>
                {data.stamps} / {TOTAL} stamps
              </p>
            </div>

            {/* Stats */}
            <div className="flex gap-3">
              <div
                className="flex-1 rounded-xl p-3 text-center"
                style={{ background: "var(--cream)" }}
              >
                <p className="text-xl font-semibold" style={{ color: "var(--brown-text)" }}>
                  {data.stamps}
                </p>
                <p className="text-xs" style={{ color: "var(--brown-text-muted)" }}>
                  current stamps
                </p>
              </div>
              <div
                className="flex-1 rounded-xl p-3 text-center"
                style={{ background: "var(--cream)" }}
              >
                <p className="text-xl font-semibold" style={{ color: "var(--brown-text)" }}>
                  {data.redeemed}
                </p>
                <p className="text-xs" style={{ color: "var(--brown-text-muted)" }}>
                  {shopConfig.rewardDescription}s earned
                </p>
              </div>
            </div>

            <p className="text-center text-xs" style={{ color: "var(--stamp-empty)" }}>
              Last visit: {data.lastVisit}
            </p>

            <button
              onClick={() => router.push("/")}
              className="w-full text-sm underline"
              style={{ color: "var(--brown-text-muted)" }}
            >
              ← Back
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

export default function CardPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex flex-col" style={{ background: "var(--background)" }}>
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
          </header>
          <div className="flex-1 flex items-center justify-center">
            <p style={{ color: "var(--brown-text-muted)" }}>Loading...</p>
          </div>
        </div>
      }
    >
      <CardContent />
    </Suspense>
  );
}

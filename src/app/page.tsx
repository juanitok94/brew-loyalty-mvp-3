"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { STAMPS_REQUIRED } from "../lib/constants";
import { shopConfig } from "@/config/shop";

export default function HomePage() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [nameError, setNameError] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);

  function formatDisplay(digits: string) {
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value.replace(/\D/g, "").slice(0, 10);
    setPhone(formatDisplay(raw));
    setError("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (firstName.trim().length < 3) {
      setNameError("Name must be at least 3 characters.");
      return;
    }
    const digits = phone.replace(/\D/g, "");
    if (digits.length !== 10) {
      setError("Please enter a valid 10-digit US phone number.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/stamps", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: digits }),
      });
      if (!res.ok) throw new Error("Failed");
      router.push(`/card?phone=${encodeURIComponent(digits)}`);
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
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
        <p
          className="text-sm tracking-[0.2em] uppercase"
          style={{ color: shopConfig.colors.headerTextMuted }}
        >
          {shopConfig.tagline}
        </p>
      </header>

      {/* Page content */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-10">
        <div className="w-full max-w-sm space-y-8">
          {/* Card Teaser */}
          <div
            className="rounded-2xl p-6 text-center space-y-1"
            style={{ background: "var(--cream)" }}
          >
            <p className="text-sm font-medium" style={{ color: "var(--brown-text-muted)" }}>
              Buy {STAMPS_REQUIRED} drinks
            </p>
            <p className="text-2xl font-semibold" style={{ color: "var(--brown-text)" }}>
              Earn a {shopConfig.rewardDescription}
            </p>
            <p className="text-xs" style={{ color: "var(--brown-text-muted)" }}>
              No app download needed
            </p>
          </div>

          {/* Phone Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label
                htmlFor="firstName"
                className="block text-sm font-medium"
                style={{ color: "var(--foreground)" }}
              >
                Your name or nickname
              </label>
              <input
                id="firstName"
                type="text"
                placeholder="e.g. Sam, Jazz, or CoffeeKing (min 3 chars)"
                value={firstName}
                onChange={(e) => {
                  setFirstName(e.target.value);
                  setNameError("");
                }}
                className="w-full px-4 py-3 rounded-xl border text-base outline-none transition-all"
                style={{
                  borderColor: nameError ? "#dc2626" : "var(--stamp-empty)",
                  background: "#fff",
                  color: "var(--foreground)",
                }}
                autoFocus
              />
              {nameError && <p className="text-sm text-red-600">{nameError}</p>}
            </div>
            <div className="space-y-2">
              <label
                htmlFor="phone"
                className="block text-sm font-medium"
                style={{ color: "var(--foreground)" }}
              >
                Enter your phone number to see your card
              </label>
              <input
                id="phone"
                type="tel"
                inputMode="numeric"
                placeholder={shopConfig.phone}
                value={phone}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border text-base outline-none transition-all"
                style={{
                  borderColor: error ? "#dc2626" : "var(--stamp-empty)",
                  background: "#fff",
                  color: "var(--foreground)",
                }}
              />
              {error && <p className="text-sm text-red-600">{error}</p>}
            </div>
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
                className="mt-0.5 h-4 w-4 shrink-0 accent-[var(--brown)]"
              />
              <span className="text-sm" style={{ color: "var(--brown-text)" }}>
                I agree to the{" "}
                <a
                  href="/terms"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: "var(--brown-text)", textDecoration: "underline" }}
                >
                  Terms &amp; Conditions
                </a>
                . We only use your info to track your loyalty stamps.
              </span>
            </label>
            <button
              type="submit"
              disabled={!termsAccepted || loading}
              className="w-full py-3 rounded-xl font-semibold text-white text-base transition-opacity disabled:opacity-60"
              style={{ background: "var(--brown)" }}
            >
              {loading ? "Loading..." : "See my card"}
            </button>
            <p className="text-[14px] text-center mt-2" style={{ color: "var(--brown-text-muted)" }}>
              {shopConfig.finePrint}
            </p>
          </form>
        </div>
      </main>
    </div>
  );
}

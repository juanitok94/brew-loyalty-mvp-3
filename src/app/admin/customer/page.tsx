"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { STAMPS_REQUIRED } from "@/lib/constants";
import { shopConfig } from "@/config/shop";

type CustomerData = {
  phone: string;
  stamps: number;
  lastVisit: string;
  redeemed: number;
  name: string | null;
};

const TOTAL = STAMPS_REQUIRED;

function formatDisplay(digits: string) {
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}

export default function AdminCustomerPage() {
  const router = useRouter();
  const [token, setToken] = useState("");
  const [last4Input, setLast4Input] = useState("");
  const [phoneInput, setPhoneInput] = useState("");
  const [showFullInput, setShowFullInput] = useState(false);
  const [customer, setCustomer] = useState<CustomerData | null>(null);
  const [collisions, setCollisions] = useState<CustomerData[]>([]);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const last4Ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem("adminToken");
    if (!stored) {
      router.replace(`/admin${window.location.search}`);
      return;
    }
    setToken(stored);
  }, [router]);

  // Auto-focus the 4-digit input once token is ready
  useEffect(() => {
    if (token) last4Ref.current?.focus();
  }, [token]);

  function resetToIdle() {
    setCustomer(null);
    setCollisions([]);
    setLast4Input("");
    setPhoneInput("");
    setError("");
    setMessage("");
    setTimeout(() => last4Ref.current?.focus(), 50);
  }

  // --- Last-4 lookup (primary flow) ---
  const lookupByLast4 = useCallback(async (digits: string) => {
    setLoading(true);
    setError("");
    setMessage("");
    setCustomer(null);
    setCollisions([]);

    try {
      const res = await fetch("/api/admin/lookup-last4", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ last4: digits }),
      });

      if (res.status === 401) { router.replace(`/admin${window.location.search}`); return; }
      if (res.status === 404) {
        setError("No customer found. Use full number below to create one.");
        setShowFullInput(true);
        return;
      }

      const data: CustomerData[] = await res.json();
      if (data.length === 1) {
        setCustomer(data[0]);
      } else {
        setCollisions(data); // 2+ matches — show picker
      }
    } catch {
      setError("Lookup failed.");
    } finally {
      setLoading(false);
    }
  }, [token, router]);

  function handleLast4Change(e: React.ChangeEvent<HTMLInputElement>) {
    const digits = e.target.value.replace(/\D/g, "").slice(0, 4);
    setLast4Input(digits);
    setError("");
    setCustomer(null);
    setCollisions([]);
    if (digits.length === 4) {
      void lookupByLast4(digits); // auto-submit on 4th digit
    }
  }

  function handleLast4Submit(e: React.FormEvent) {
    e.preventDefault();
    if (last4Input.length === 4) void lookupByLast4(last4Input);
  }

  // --- Full phone fallback ---
  async function loadCustomerByDigits(digits: string) {
    if (digits.length !== 10) { setError("Enter a valid 10-digit number."); return; }
    setLoading(true);
    setError("");
    setMessage("");
    setCustomer(null);
    setCollisions([]);

    try {
      const res = await fetch("/api/admin/lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ phone: digits }),
      });

      if (res.status === 401) { router.replace(`/admin${window.location.search}`); return; }
      if (res.status === 404) {
        const createRes = await fetch("/api/stamps", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phone: digits }),
        });
        setCustomer(await createRes.json());
        setMessage("New customer created.");
      } else {
        setCustomer(await res.json());
      }
    } catch {
      setError("Lookup failed.");
    } finally {
      setLoading(false);
    }
  }

  function handlePhoneChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value.replace(/\D/g, "").slice(0, 10);
    setPhoneInput(formatDisplay(raw));
    setError("");
    setCustomer(null);
    setCollisions([]);
  }

  function handleFullLookup(e: React.FormEvent) {
    e.preventDefault();
    void loadCustomerByDigits(phoneInput.replace(/\D/g, ""));
  }

  // --- Stamp actions ---
  async function addStamp() {
    if (!customer) return;
    setActionLoading(true);
    setMessage("");
    try {
      const res = await fetch("/api/admin/stamp", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ phone: customer.phone.replace(/\D/g, "") }),
      });
      if (res.status === 401) { router.replace(`/admin${window.location.search}`); return; }
      const data = await res.json();
      setCustomer(data);
      setMessage(data.stamps >= TOTAL ? "Stamp added! Reward unlocked!" : "Stamp added!");
      // Reset to idle after 1200ms — re-focuses 4-digit input for next customer
      setTimeout(resetToIdle, 1200);
    } catch {
      setError("Failed to add stamp.");
    } finally {
      setActionLoading(false);
    }
  }

  async function removeStamp() {
    if (!customer) return;
    setActionLoading(true);
    setMessage("");
    try {
      const res = await fetch("/api/admin/remove-stamp", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ phone: customer.phone.replace(/\D/g, "") }),
      });
      if (res.status === 401) { router.replace(`/admin${window.location.search}`); return; }
      if (!res.ok) { setError((await res.json()).error ?? "Remove stamp failed."); return; }
      setCustomer(await res.json());
      setMessage("Stamp removed.");
    } catch {
      setError("Failed to remove stamp.");
    } finally {
      setActionLoading(false);
    }
  }

  async function redeemReward() {
    if (!customer) return;
    setActionLoading(true);
    setMessage("");
    try {
      const res = await fetch("/api/admin/redeem", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ phone: customer.phone.replace(/\D/g, "") }),
      });
      if (res.status === 401) { router.replace(`/admin${window.location.search}`); return; }
      if (!res.ok) { setError((await res.json()).error ?? "Redeem failed."); return; }
      setCustomer(await res.json());
      setMessage("Reward redeemed! Card reset to 0 stamps.");
    } catch {
      setError("Failed to redeem.");
    } finally {
      setActionLoading(false);
    }
  }

  const isReady = customer && customer.stamps >= TOTAL;
  const displayPhone = customer
    ? customer.phone.replace(/^\+1(\d{3})(\d{3})(\d{4})$/, "($1) $2-$3")
    : "";

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
          Staff dashboard
        </p>
      </header>

      <main className="flex-1 overflow-y-auto overflow-x-hidden flex flex-col items-center justify-start px-6 py-10">
        <div className="w-full max-w-sm space-y-6">

          {/* Logout */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => { sessionStorage.removeItem("adminToken"); router.push("/admin"); }}
              className="text-sm"
              style={{ color: "var(--brown-text-muted)" }}
            >
              ← Logout
            </button>
          </div>

          {/* Primary: last-4 input */}
          <form onSubmit={handleLast4Submit} className="space-y-3">
            <label
              className="block text-sm font-medium text-center"
              style={{ color: "var(--foreground)" }}
            >
              Enter Last 4 Digits of Loyal Customer Phone
            </label>
            <div className="flex gap-2 w-full min-w-0">
              <input
                ref={last4Ref}
                type="tel"
                inputMode="numeric"
                placeholder="Last 4 digits"
                value={last4Input}
                onChange={handleLast4Change}
                maxLength={4}
                disabled={loading}
                className="flex-1 min-w-0 px-4 py-4 rounded-xl border text-4xl text-center tracking-widest outline-none font-mono disabled:opacity-50"
                style={{
                  borderColor: error ? "#dc2626" : "var(--stamp-empty)",
                  background: "#fff",
                  color: "var(--foreground)",
                }}
              />
              <button
                type="submit"
                disabled={loading || last4Input.length !== 4}
                className="px-4 py-4 rounded-xl font-semibold text-white disabled:opacity-40"
                style={{ background: "var(--brown)" }}
              >
                {loading ? "…" : "Go"}
              </button>
            </div>

            {error && <p className="text-sm text-red-600 text-center">{error}</p>}
            {message && (
              <p className="text-sm font-medium text-center" style={{ color: "#16a34a" }}>
                {message}
              </p>
            )}
          </form>

          {/* Collision picker */}
          {collisions.length > 1 && (
            <div
              className="rounded-2xl p-4 space-y-2"
              style={{ background: "#fff", border: "1.5px solid var(--stamp-empty)" }}
            >
              <p className="text-sm font-medium" style={{ color: "var(--brown-text-muted)" }}>
                Multiple matches — tap the right customer:
              </p>
              {collisions.map((c) => {
                const last4 = c.phone.slice(-4);
                const label = c.name ? `${c.name} ••••${last4}` : `••••${last4}`;
                return (
                  <button
                    key={c.phone}
                    onClick={() => { setCustomer(c); setCollisions([]); }}
                    className="w-full text-left px-4 py-3 rounded-xl font-medium text-base"
                    style={{ background: "var(--cream)", color: "var(--brown-dark)" }}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          )}

          {/* Customer card */}
          {customer && (
            <div
              className="rounded-2xl p-5 space-y-5"
              style={{ background: "#fff", border: "1.5px solid var(--stamp-empty)" }}
            >
              {/* Customer info */}
              <div className="space-y-1">
                {customer.name && (
                  <p className="text-base font-semibold" style={{ color: "var(--brown-dark)" }}>
                    {customer.name}
                  </p>
                )}
                <p className="text-base font-semibold" style={{ color: "var(--brown-dark)" }}>
                  {displayPhone}
                </p>
                <p className="text-sm" style={{ color: "var(--brown-text-muted)" }}>
                  Last visit: {customer.lastVisit} · {customer.redeemed} {shopConfig.rewardDescription}s earned
                </p>
              </div>

              {/* Reward banner */}
              {isReady && (
                <div
                  className="rounded-xl p-3 text-center"
                  style={{ background: "var(--brown)", color: "#fff" }}
                >
                  <p className="font-semibold">🎉 {shopConfig.rewardDescription.charAt(0).toUpperCase() + shopConfig.rewardDescription.slice(1)} ready to redeem!</p>
                </div>
              )}

              {/* Stamp grid */}
              <div>
                <div className="grid grid-cols-3 gap-2">
                  {Array.from({ length: TOTAL }).map((_, i) => (
                    <div
                      key={i}
                      className="w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center text-base mx-auto"
                      style={{
                        background: i < customer.stamps ? "var(--stamp-filled)" : "var(--stamp-empty)",
                        color: i < customer.stamps ? "#fff" : "var(--brown-text-muted)",
                      }}
                    >
                      {i < customer.stamps ? "☕" : ""}
                    </div>
                  ))}
                </div>
                <p className="text-xs text-center mt-2" style={{ color: "var(--brown-text-muted)" }}>
                  {customer.stamps} / {TOTAL} stamps
                </p>
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-3">
                <div className="flex gap-3">
                  <button
                    onClick={addStamp}
                    disabled={actionLoading || customer.stamps >= TOTAL}
                    className="flex-1 py-3 rounded-xl font-semibold text-white text-sm disabled:opacity-40"
                    style={{ background: "var(--brown)" }}
                  >
                    {actionLoading ? "…" : "+ Add Stamp"}
                  </button>
                  <button
                    onClick={removeStamp}
                    disabled={actionLoading || customer.stamps === 0}
                    className="flex-1 py-3 rounded-xl font-semibold text-sm disabled:opacity-40"
                    style={{ background: "var(--cream)", color: "var(--brown-dark)" }}
                  >
                    {actionLoading ? "…" : "− Remove Stamp"}
                  </button>
                </div>
                {isReady && (
                  <button
                    onClick={redeemReward}
                    disabled={actionLoading}
                    className="w-full py-3 rounded-xl font-semibold text-sm disabled:opacity-40"
                    style={{ background: "var(--brown)", color: "#fff" }}
                  >
                    {actionLoading ? "…" : "Redeem Reward"}
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Full number fallback — hidden once a customer card is loaded */}
          {!customer && <div className="pt-2">
            <button
              type="button"
              onClick={() => setShowFullInput((v) => !v)}
              className="text-xs underline w-full text-center"
              style={{ color: "var(--brown-text-muted)" }}
            >
              {showFullInput ? "✕ Cancel" : "Use full number instead"}
            </button>
            {showFullInput && (
              <form onSubmit={handleFullLookup} className="mt-3 space-y-3">
                <div className="flex gap-2">
                  <input
                    type="tel"
                    inputMode="numeric"
                    placeholder={shopConfig.phone}
                    value={phoneInput}
                    onChange={handlePhoneChange}
                    className="flex-1 px-4 py-3 rounded-xl border text-base outline-none"
                    style={{
                      borderColor: "var(--stamp-empty)",
                      background: "#fff",
                      color: "var(--foreground)",
                    }}
                  />
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-3 rounded-xl font-semibold text-white disabled:opacity-60"
                    style={{ background: "var(--brown)" }}
                  >
                    {loading ? "…" : "Look Up"}
                  </button>
                </div>
              </form>
            )}
          </div>}

        </div>
      </main>
    </div>
  );
}

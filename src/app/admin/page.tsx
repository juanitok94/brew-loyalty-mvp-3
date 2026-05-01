"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { shopConfig } from "@/config/shop";

export default function AdminLoginPage() {
  const router = useRouter();
  const [status, setStatus] = useState<"checking" | "ok" | "denied">("checking");

  useEffect(() => {
    const token = new URLSearchParams(window.location.search).get("token");
    if (!token) {
      setStatus("denied");
      return;
    }

    // Verify token server-side before storing
    fetch("/api/admin/verify", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (res.ok) {
          sessionStorage.setItem("adminToken", token); // store verified token
          router.replace(`/admin/customer${window.location.search}`);
        } else {
          setStatus("denied");
        }
      })
      .catch(() => setStatus("denied"));
  }, [router]);

  if (status === "checking") {
    return (
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
          <p className="text-sm" style={{ color: shopConfig.colors.headerTextMuted }}>
            Staff access only
          </p>
        </header>
        <main className="flex-1 flex items-center justify-center">
          <p style={{ color: "var(--brown-text-muted)" }}>Verifying access…</p>
        </main>
      </div>
    );
  }

  return (
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
        <p className="text-sm" style={{ color: shopConfig.colors.headerTextMuted }}>
          Staff access only
        </p>
      </header>
      <main className="flex-1 flex items-center justify-center px-6">
        <p className="text-sm font-medium text-red-600">Access denied. Contact your manager for the login link.</p>
      </main>
    </div>
  );
}

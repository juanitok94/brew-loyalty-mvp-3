import Link from "next/link";
import { shopConfig } from "@/config/shop";

export default function TermsPage() {
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
        <p
          className="text-sm tracking-[0.2em] uppercase"
          style={{ color: shopConfig.colors.headerTextMuted }}
        >
          {shopConfig.tagline}
        </p>
      </header>

      <main className="flex-1 px-6 py-8 max-w-2xl mx-auto w-full">
        <Link
          href="/"
          className="inline-block text-sm font-medium mb-6"
          style={{ color: "var(--brown-text)" }}
        >
          ← Back
        </Link>

        <h2 className="text-2xl font-semibold mb-1" style={{ color: "var(--brown-text)" }}>
          Terms &amp; Conditions
        </h2>
        <p className="text-sm mb-8" style={{ color: "var(--brown-text-muted)" }}>
          {shopConfig.name} Loyalty Program
        </p>

        <div className="space-y-6 text-sm leading-relaxed" style={{ color: "var(--brown-text)" }}>
          <p style={{ color: "var(--brown-text-muted)" }}>
            <strong>Effective Date:</strong> May 2026 &nbsp;·&nbsp;{" "}
            <strong>Operator:</strong> Peachy Kean DevOps LLC &nbsp;·&nbsp;{" "}
            <strong>Venue:</strong> {shopConfig.name}, {shopConfig.location}
          </p>

          <section>
            <h3 className="font-semibold text-base mb-1">1. What We Collect</h3>
            <p>
              When you sign up, we collect your 10-digit US phone number and a name or nickname of
              at least 3 characters. We use the last 4 digits of your phone number combined with
              your nickname to identify your loyalty account.
            </p>
          </section>

          <section>
            <h3 className="font-semibold text-base mb-1">2. How We Use Your Information</h3>
            <p>
              Your phone number and nickname are used only to create and track your stamp card,
              identify your account in store, and issue your free drink reward. We do not use your
              information for advertising or marketing.
            </p>
          </section>

          <section>
            <h3 className="font-semibold text-base mb-1">3. Who Sees Your Information</h3>
            <p>
              Venue staff see last 4 digits + nickname to look up cards and add stamps. Peachy Kean
              DevOps LLC operates and maintains the platform. We do not sell, rent, or share your
              data with third parties.
            </p>
          </section>

          <section>
            <h3 className="font-semibold text-base mb-1">4. Data Storage</h3>
            <p>
              Stored securely in our database. No payment information is stored. Your loyalty
              account is not linked to any other accounts or services.
            </p>
          </section>

          <section>
            <h3 className="font-semibold text-base mb-1">5. SMS &amp; Communications</h3>
            <p>
              Signing up does not opt you into SMS marketing. We will not send promotional texts. If
              this changes, we will ask for explicit consent.
            </p>
          </section>

          <section>
            <h3 className="font-semibold text-base mb-1">6. How to Remove Your Account</h3>
            <p>
              Email{" "}
              <a
                href="mailto:john@peachykeandev.com"
                style={{ color: "var(--brown-text)", textDecoration: "underline" }}
              >
                john@peachykeandev.com
              </a>{" "}
              with subject "Delete My Loyalty Account". We will remove your record within 5 business
              days.
            </p>
          </section>

          <section>
            <h3 className="font-semibold text-base mb-1">7. Children&apos;s Privacy</h3>
            <p>This program is intended for customers 13 and older.</p>
          </section>

          <section>
            <h3 className="font-semibold text-base mb-1">8. Changes to These Terms</h3>
            <p>
              Current version always available at this page. Continued use after an update
              constitutes acceptance.
            </p>
          </section>

          <section>
            <h3 className="font-semibold text-base mb-1">9. Contact</h3>
            <p>
              Peachy Kean DevOps LLC, Asheville NC —{" "}
              <a
                href="mailto:john@peachykeandev.com"
                style={{ color: "var(--brown-text)", textDecoration: "underline" }}
              >
                john@peachykeandev.com
              </a>
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}

import { Oswald } from "next/font/google";

const oswald = Oswald({
  subsets: ["latin"],
  weight: ["500", "700"],
  variable: "--font-oswald",
});

export const metadata = {
  title: "TripsheetHQ — Trip Sheets, ACE/ACI Documents & Dispatch Messaging",
  description:
    "TripsheetHQ replaces paper trip logs and scattered texts with one dashboard. Digital trip sheets, ACE/ACI document delivery, and instant dispatch messaging for trucking fleets.",
  keywords: [
    "trip sheet software",
    "trucking dispatch app",
    "ACE ACI document delivery",
    "fleet messaging app",
    "trucking company software",
  ],
  openGraph: {
    title: "TripsheetHQ — Trip Sheets, Documents & Dispatch Messaging",
    description:
      "One dashboard for trip logs, ACE/ACI documents, and dispatch messages. Built for trucking fleets.",
    url: "https://tripsheethq.com",
    siteName: "TripsheetHQ",
    images: [{ url: "/images/messages-bg.jpg", width: 1200, height: 630 }],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "TripsheetHQ — Trip Sheets, Documents & Dispatch Messaging",
    description:
      "One dashboard for trip logs, ACE/ACI documents, and dispatch messages. Built for trucking fleets.",
    images: ["/images/messages-bg.jpg"],
  },
};

const features = [
  {
    label: "Trip sheets",
    title: "Digital trip logs, no paper",
    body: "Drivers log routes, miles, fuel, and expenses from their phone. Dispatch sees every trip the moment it's submitted.",
  },
  {
    label: "Documents",
    title: "ACE / ACI, delivered instantly",
    body: "Send border documents straight to a driver's phone. No printing, no glovebox folder, no missed crossing.",
  },
  {
    label: "Messaging",
    title: "One thread, not five text chains",
    body: "Dispatch and drivers message in the app, with a push notification the moment something's sent.",
  },
  {
    label: "Install",
    title: "Works like an app, no app store",
    body: "Drivers add it to their home screen in one tap. Updates roll out instantly, nothing to download or approve.",
  },
];

export default function Home() {
  return (
    <div className={oswald.variable} style={{ backgroundColor: "#0b1220" }}>
      {/* Nav */}
      <nav
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "1.25rem 1.5rem",
          maxWidth: "1200px",
          margin: "0 auto",
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-oswald)",
            fontWeight: 700,
            fontSize: "1.25rem",
            color: "#ffffff",
            letterSpacing: "0.02em",
          }}
        >
          TRIPSHEET<span style={{ color: "#f5c400" }}>HQ</span>
        </span>
        <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
          
            href="/login"
            style={{
              color: "#cbd5e1",
              fontSize: "0.9rem",
              fontWeight: 600,
              textDecoration: "none",
            }}
          >
            Log in
          </a>
          
            href="/signup"
            style={{
              backgroundColor: "#1a56db",
              color: "#ffffff",
              fontSize: "0.9rem",
              fontWeight: 600,
              textDecoration: "none",
              padding: "0.55rem 1.1rem",
              borderRadius: "6px",
            }}
          >
            Get started
          </a>
        </div>
      </nav>

      {/* Hero */}
      <section
        style={{
          position: "relative",
          backgroundImage: "url('/images/messages-bg.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          padding: "4rem 1.5rem 6rem",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(180deg, rgba(11,18,32,0.55) 0%, rgba(11,18,32,0.85) 100%)",
          }}
        />
        <div
          style={{
            position: "relative",
            maxWidth: "1200px",
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "1.1fr 0.9fr",
            gap: "2.5rem",
            alignItems: "center",
          }}
        >
          <div>
            <p
              style={{
                color: "#f5c400",
                fontSize: "0.8rem",
                fontWeight: 700,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                marginBottom: "1rem",
              }}
            >
              No paperwork · No missed messages · No app store
            </p>
            <h1
              style={{
                fontFamily: "var(--font-oswald)",
                fontWeight: 700,
                fontSize: "clamp(2.2rem, 5vw, 3.4rem)",
                lineHeight: 1.1,
                color: "#ffffff",
                marginBottom: "1.25rem",
                maxWidth: "620px",
              }}
            >
              Trip sheets, ACE/ACI docs, and dispatch messages — all in one place.
            </h1>
            <p
              style={{
                color: "#cbd5e1",
                fontSize: "1.1rem",
                lineHeight: 1.6,
                maxWidth: "520px",
                marginBottom: "2rem",
              }}
            >
              TripsheetHQ replaces paper logs and scattered texts with one
              dashboard your drivers and dispatchers actually use.
            </p>
            <div style={{ display: "flex", gap: "0.85rem", flexWrap: "wrap" }}>
              
                href="/signup"
                style={{
                  backgroundColor: "#1a56db",
                  color: "#ffffff",
                  fontWeight: 700,
                  fontSize: "1rem",
                  textDecoration: "none",
                  padding: "0.85rem 1.6rem",
                  borderRadius: "6px",
                }}
              >
                Start free
              </a>
              
                href="/login"
                style={{
                  backgroundColor: "rgba(255,255,255,0.08)",
                  border: "1px solid rgba(255,255,255,0.25)",
                  color: "#ffffff",
                  fontWeight: 700,
                  fontSize: "1rem",
                  textDecoration: "none",
                  padding: "0.85rem 1.6rem",
                  borderRadius: "6px",
                }}
              >
                Log in
              </a>
            </div>
          </div>

          {/* Signature element: trip sheet mockup card */}
          <div
            style={{
              backgroundColor: "rgba(255,255,255,0.97)",
              borderRadius: "10px",
              padding: "1.5rem",
              boxShadow: "0 20px 50px rgba(0,0,0,0.45)",
              transform: "rotate(-1.5deg)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                borderBottom: "2px dashed #d1d5db",
                paddingBottom: "0.75rem",
                marginBottom: "0.75rem",
              }}
            >
              <span
                style={{
                  fontFamily: "var(--font-oswald)",
                  fontWeight: 700,
                  fontSize: "0.85rem",
                  letterSpacing: "0.08em",
                  color: "#0b1220",
                }}
              >
                TRIP SHEET
              </span>
              <span
                style={{
                  fontSize: "0.7rem",
                  fontWeight: 700,
                  padding: "0.15rem 0.5rem",
                  borderRadius: "10px",
                  backgroundColor: "#e6f4ea",
                  color: "#1a7d36",
                }}
              >
                Submitted
              </span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
              <Row label="Driver" value="E. Obeng" />
              <Row label="Route" value="Brampton → Cambridge" />
              <Row label="Miles" value="331" />
              <Row label="Fuel" value="$142.60" />
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section style={{ padding: "5rem 1.5rem", maxWidth: "1200px", margin: "0 auto" }}>
        <h2
          style={{
            fontFamily: "var(--font-oswald)",
            fontWeight: 700,
            fontSize: "clamp(1.6rem, 3vw, 2.2rem)",
            color: "#ffffff",
            marginBottom: "3rem",
            maxWidth: "600px",
          }}
        >
          Everything dispatch and drivers need, nowhere else to check.
        </h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: "1.5rem",
          }}
        >
          {features.map((f) => (
            <div
              key={f.title}
              style={{
                backgroundColor: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "10px",
                padding: "1.5rem",
              }}
            >
              <span
                style={{
                  color: "#f5c400",
                  fontSize: "0.7rem",
                  fontWeight: 700,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                }}
              >
                {f.label}
              </span>
              <h3
                style={{
                  color: "#ffffff",
                  fontSize: "1.1rem",
                  fontWeight: 700,
                  margin: "0.5rem 0 0.5rem",
                }}
              >
                {f.title}
              </h3>
              <p style={{ color: "#94a3b8", fontSize: "0.9rem", lineHeight: 1.6 }}>
                {f.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA banner */}
      <section
        style={{
          backgroundColor: "#1a56db",
          padding: "3.5rem 1.5rem",
        }}
      >
        <div
          style={{
            maxWidth: "800px",
            margin: "0 auto",
            textAlign: "center",
          }}
        >
          <h2
            style={{
              fontFamily: "var(--font-oswald)",
              fontWeight: 700,
              fontSize: "clamp(1.5rem, 3vw, 2rem)",
              color: "#ffffff",
              marginBottom: "1rem",
            }}
          >
            Get your fleet off paper today.
          </h2>
          
            href="/signup"
            style={{
              display: "inline-block",
              backgroundColor: "#f5c400",
              color: "#0b1220",
              fontWeight: 700,
              fontSize: "1rem",
              textDecoration: "none",
              padding: "0.85rem 1.8rem",
              borderRadius: "6px",
              marginTop: "0.5rem",
            }}
          >
            Start free
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer
        style={{
          padding: "2rem 1.5rem",
          maxWidth: "1200px",
          margin: "0 auto",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "1rem",
        }}
      >
        <span style={{ color: "#64748b", fontSize: "0.85rem" }}>
          © {new Date().getFullYear()} TripsheetHQ.com
        </span>
        <div style={{ display: "flex", gap: "1.25rem" }}>
          <a href="/privacy" style={{ color: "#94a3b8", fontSize: "0.85rem", textDecoration: "none" }}>
            Privacy
          </a>
          <a href="/terms" style={{ color: "#94a3b8", fontSize: "0.85rem", textDecoration: "none" }}>
            Terms
          </a>
        </div>
      </footer>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem" }}>
      <span style={{ color: "#6b7280" }}>{label}</span>
      <span style={{ color: "#0b1220", fontWeight: 600 }}>{value}</span>
    </div>
  );
}
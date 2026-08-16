"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

const PLAN_NAMES = {
  price_1U596A3OTOyp0aV0oRZRiBgT: "Starter",
  price_1U599V3OTOyp0aV0GXNxlFj2: "Growth",
  price_1U59An3OTOyp0aV0JGOhtGXU: "Fleet",
};

const STATUS_LABELS = {
  trialing: { label: "Free Trial", color: "#1a56db", bg: "#dbeafe" },
  active: { label: "Active", color: "#1a7d36", bg: "#e6f4ea" },
  past_due: { label: "Payment Failed", color: "#b26a00", bg: "#fef3e0" },
  canceled: { label: "Cancelled", color: "#b91c1c", bg: "#fee2e2" },
};

export default function AdminBillingPage() {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [company, setCompany] = useState(null);
  const [portalLoading, setPortalLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push("/login");
        return;
      }

      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (!userDoc.exists() || userDoc.data().role !== "admin") {
        router.push("/dashboard");
        return;
      }

      const companyId = userDoc.data().companyId;
      setAuthorized(true);

      const companyDoc = await getDoc(doc(db, "companies", companyId));
      if (companyDoc.exists()) {
        setCompany({ id: companyDoc.id, ...companyDoc.data() });
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/login");
  };

  const handleManageBilling = async () => {
    setError("");
    setPortalLoading(true);

    try {
      const res = await fetch("/api/create-portal-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stripeCustomerId: company?.stripeCustomerId }),
      });

      const data = await res.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        setError(data.error || "Could not open billing portal.");
        setPortalLoading(false);
      }
    } catch (err) {
      setError("Could not open billing portal. Please try again.");
      setPortalLoading(false);
    }
  };

  const navButtonStyle = {
    padding: "0.5rem 1rem",
    backgroundColor: "#ffffff",
    border: "1px solid #ddd",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "0.85rem",
    fontWeight: "600",
    color: "#1a1a1a",
    whiteSpace: "nowrap",
  };

  if (loading || !authorized) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p>Loading...</p>
      </div>
    );
  }

  const hasSubscription = !!company?.stripeCustomerId;
  const statusInfo = STATUS_LABELS[company?.subscriptionStatus] || null;
  const planName = PLAN_NAMES[company?.planPriceId] || null;

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f5f5f5", padding: "1.5rem" }}>
      {/* Top nav bar: section links + logout */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "0.5rem",
          marginBottom: "1.5rem",
        }}
      >
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          <button style={navButtonStyle} onClick={() => router.push("/admin")}>
            Trips
          </button>
          <button style={navButtonStyle} onClick={() => router.push("/admin/documents")}>
            Documents
          </button>
          <button style={navButtonStyle} onClick={() => router.push("/admin/messages")}>
            Messages
          </button>
          <button style={navButtonStyle} onClick={() => router.push("/admin/branding")}>
            Branding
          </button>
          <button style={{ ...navButtonStyle, borderColor: "#1a56db", color: "#1a56db" }} onClick={() => router.push("/admin/billing")}>
            Billing
          </button>
        </div>
        <button
          onClick={handleLogout}
          style={{
            padding: "0.5rem 1rem",
            backgroundColor: "#ffffff",
            border: "1px solid #ddd",
            borderRadius: "6px",
            cursor: "pointer",
            fontSize: "0.85rem",
            fontWeight: "600",
            color: "#b91c1c",
          }}
        >
          Log Out
        </button>
      </div>

      <h1 style={{ fontSize: "1.5rem", fontWeight: "bold", marginBottom: "1.5rem", color: "#1a1a1a" }}>
        Billing & Subscription
      </h1>

      <div style={{ backgroundColor: "white", borderRadius: "8px", padding: "1.5rem", boxShadow: "0 2px 8px rgba(0,0,0,0.05)", maxWidth: "500px" }}>
        {!hasSubscription ? (
          <>
            <p style={{ fontSize: "0.95rem", color: "#333", marginBottom: "1.25rem" }}>
              You don&apos;t have an active plan yet. Choose a plan to start your 7-day free trial.
            </p>
            <button
              onClick={() => router.push("/pricing")}
              style={{
                width: "100%",
                padding: "0.75rem",
                backgroundColor: "#1a56db",
                color: "white",
                border: "none",
                borderRadius: "6px",
                fontSize: "1rem",
                fontWeight: "600",
                cursor: "pointer",
              }}
            >
              View Plans
            </button>
          </>
        ) : (
          <>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
              <div>
                <p style={{ fontSize: "0.85rem", color: "#666", marginBottom: "0.15rem" }}>Current Plan</p>
                <p style={{ fontSize: "1.2rem", fontWeight: "700", color: "#1a1a1a" }}>{planName || "—"}</p>
              </div>
              {statusInfo && (
                <span
                  style={{
                    fontSize: "0.8rem",
                    fontWeight: "600",
                    padding: "0.3rem 0.75rem",
                    borderRadius: "12px",
                    color: statusInfo.color,
                    backgroundColor: statusInfo.bg,
                  }}
                >
                  {statusInfo.label}
                </span>
              )}
            </div>

            {company?.subscriptionStatus === "trialing" && company?.trialEndsAt && (
              <p style={{ fontSize: "0.85rem", color: "#666", marginBottom: "1.25rem" }}>
                Trial ends {new Date(company.trialEndsAt).toLocaleDateString()}
              </p>
            )}

            {company?.currentPeriodEnd && company?.subscriptionStatus === "active" && (
              <p style={{ fontSize: "0.85rem", color: "#666", marginBottom: "1.25rem" }}>
                Next billing date: {new Date(company.currentPeriodEnd).toLocaleDateString()}
              </p>
            )}

            {error && <p style={{ color: "#d32f2f", fontSize: "0.9rem", marginBottom: "1rem" }}>{error}</p>}

            <button
              onClick={handleManageBilling}
              disabled={portalLoading}
              style={{
                width: "100%",
                padding: "0.75rem",
                backgroundColor: "#1a1a1a",
                color: "white",
                border: "none",
                borderRadius: "6px",
                fontSize: "1rem",
                fontWeight: "600",
                cursor: portalLoading ? "not-allowed" : "pointer",
              }}
            >
              {portalLoading ? "Opening..." : "Manage Billing / Cancel"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

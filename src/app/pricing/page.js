"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

const PLANS = [
  {
    id: "starter",
    name: "Starter",
    price: "$19",
    period: "CAD / month",
    description: "Up to 3 drivers",
    features: ["Up to 3 drivers", "Trip logging & fuel tracking", "Receipt uploads", "Basic support"],
    priceId: "price_1U596A3OTOyp0aV0oRZRiBgT",
  },
  {
    id: "growth",
    name: "Growth",
    price: "$39",
    period: "CAD / month",
    description: "Up to 10 drivers",
    features: ["Up to 10 drivers", "Everything in Starter", "ACI/ACE document upload", "Dispatch messaging", "Priority support"],
    priceId: "price_1U599V3OTOyp0aV0GXNxlFj2",
    highlighted: true,
  },
  {
    id: "fleet",
    name: "Fleet",
    price: "$79",
    period: "CAD / month",
    description: "Unlimited drivers",
    features: ["Unlimited drivers", "Everything in Growth", "Custom branding", "Priority support"],
    priceId: "price_1U59An3OTOyp0aV0JGOhtGXU",
  },
];

export default function PricingPage() {
  const router = useRouter();
  const [loadingPlan, setLoadingPlan] = useState(null);
  const [error, setError] = useState("");

  const handleSelectPlan = async (priceId, planId) => {
    setError("");
    setLoadingPlan(planId);

    onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push("/login");
        return;
      }

      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (!userDoc.exists() || userDoc.data().role !== "admin") {
        setError("Only company admins can manage billing. Please log in as an admin.");
        setLoadingPlan(null);
        return;
      }

      const companyId = userDoc.data().companyId;

      try {
        const res = await fetch("/api/create-checkout-session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ priceId, companyId, userId: user.uid }),
        });

        const data = await res.json();

        if (data.url) {
          window.location.href = data.url;
        } else {
          setError(data.error || "Something went wrong. Please try again.");
          setLoadingPlan(null);
        }
      } catch (err) {
        setError("Something went wrong. Please try again.");
        setLoadingPlan(null);
      }
    });
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f5f5f5", padding: "3rem 1.5rem" }}>
      <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
        <h1 style={{ fontSize: "2rem", fontWeight: "bold", textAlign: "center", color: "#1a1a1a", marginBottom: "0.5rem" }}>
          Simple, honest pricing
        </h1>
        <p style={{ textAlign: "center", color: "#666", fontSize: "1rem", marginBottom: "2.5rem" }}>
          Start with a 7-day free trial. No credit card charged until your trial ends.
        </p>

        {error && (
          <p style={{ textAlign: "center", color: "#d32f2f", fontSize: "0.9rem", marginBottom: "1.5rem" }}>
            {error}
          </p>
        )}

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: "1.5rem",
          }}
        >
          {PLANS.map((plan) => (
            <div
              key={plan.id}
              style={{
                backgroundColor: "white",
                borderRadius: "12px",
                padding: "2rem",
                border: plan.highlighted ? "2px solid #1a56db" : "1px solid #e5e7eb",
                boxShadow: plan.highlighted ? "0 8px 24px rgba(26,86,219,0.15)" : "0 2px 8px rgba(0,0,0,0.05)",
                position: "relative",
              }}
            >
              {plan.highlighted && (
                <span
                  style={{
                    position: "absolute",
                    top: "-12px",
                    left: "50%",
                    transform: "translateX(-50%)",
                    backgroundColor: "#1a56db",
                    color: "white",
                    fontSize: "0.75rem",
                    fontWeight: "700",
                    padding: "0.25rem 0.75rem",
                    borderRadius: "12px",
                  }}
                >
                  MOST POPULAR
                </span>
              )}

              <h2 style={{ fontSize: "1.3rem", fontWeight: "700", color: "#1a1a1a", marginBottom: "0.25rem" }}>
                {plan.name}
              </h2>
              <p style={{ fontSize: "0.9rem", color: "#666", marginBottom: "1rem" }}>{plan.description}</p>

              <div style={{ marginBottom: "1.5rem" }}>
                <span style={{ fontSize: "2.2rem", fontWeight: "800", color: "#1a1a1a" }}>{plan.price}</span>
                <span style={{ fontSize: "0.9rem", color: "#666" }}> {plan.period}</span>
              </div>

              <ul style={{ listStyle: "none", padding: 0, marginBottom: "2rem" }}>
                {plan.features.map((feature) => (
                  <li
                    key={feature}
                    style={{
                      fontSize: "0.9rem",
                      color: "#333",
                      marginBottom: "0.6rem",
                      display: "flex",
                      alignItems: "flex-start",
                      gap: "0.5rem",
                    }}
                  >
                    <span style={{ color: "#1a56db", fontWeight: "700" }}>✓</span>
                    {feature}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleSelectPlan(plan.priceId, plan.id)}
                disabled={loadingPlan !== null}
                style={{
                  width: "100%",
                  padding: "0.85rem",
                  backgroundColor: plan.highlighted ? "#1a56db" : "#1a1a1a",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "1rem",
                  fontWeight: "600",
                  cursor: loadingPlan !== null ? "not-allowed" : "pointer",
                  opacity: loadingPlan !== null && loadingPlan !== plan.id ? 0.5 : 1,
                }}
              >
                {loadingPlan === plan.id ? "Loading..." : "Start 7-Day Free Trial"}
              </button>
            </div>
          ))}
        </div>

        <p style={{ textAlign: "center", color: "#999", fontSize: "0.85rem", marginTop: "2rem" }}>
          Cancel anytime during your trial and you won&apos;t be charged.
        </p>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, onSnapshot } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

// Wrap any "create new" form (new trip, new time off request, message
// composer, document upload) with <BillingGate>...</BillingGate>.
// While the company's subscription is trialing/active, it renders the
// form as normal. Once it lapses, it swaps in a friendly explanation
// instead - the actual write is also blocked at the Firestore rules
// level, this is just so people see a clear message instead of a raw
// permission error. Updates live via onSnapshot, so it unlocks itself
// automatically the moment billing is fixed, no refresh needed.
export default function BillingGate({ children }) {
  const router = useRouter();
  const [status, setStatus] = useState("loading"); // loading | active | inactive
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    let unsubscribeCompany = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (unsubscribeCompany) {
        unsubscribeCompany();
        unsubscribeCompany = null;
      }
      if (!user) {
        setStatus("inactive");
        return;
      }

      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (!userDoc.exists()) {
        setStatus("inactive");
        return;
      }

      const userData = userDoc.data();
      setIsAdmin(userData.role === "admin");
      const companyId = userData.companyId;
      if (!companyId) {
        setStatus("inactive");
        return;
      }

      unsubscribeCompany = onSnapshot(doc(db, "companies", companyId), (snap) => {
        const subStatus = snap.exists() ? snap.data().subscriptionStatus : null;
        setStatus(subStatus === "trialing" || subStatus === "active" ? "active" : "inactive");
      });
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeCompany) unsubscribeCompany();
    };
  }, []);

  if (status === "loading") return null;

  if (status === "inactive") {
    return (
      <div
        style={{
          backgroundColor: "rgba(239,68,68,0.1)",
          border: "1px solid rgba(239,68,68,0.4)",
          borderRadius: "10px",
          padding: "1.25rem",
          textAlign: "center",
        }}
      >
        <p style={{ fontWeight: "700", color: "#b91c1c", marginBottom: "0.4rem" }}>
          Billing needs attention
        </p>
        <p style={{ fontSize: "0.9rem", color: "#444", marginBottom: isAdmin ? "1rem" : 0 }}>
          {isAdmin
            ? "Your company's subscription isn't active, so this is paused until billing is updated."
            : "Your company's subscription isn't active, so this is paused. Please ask your admin to update billing."}
        </p>
        {isAdmin && (
          <button
            onClick={() => router.push("/admin/billing")}
            style={{
              padding: "0.6rem 1.2rem",
              backgroundColor: "#b91c1c",
              color: "white",
              border: "none",
              borderRadius: "6px",
              fontSize: "0.9rem",
              fontWeight: "600",
              cursor: "pointer",
            }}
          >
            Go to Billing
          </button>
        )}
      </div>
    );
  }

  return <>{children}</>;
}

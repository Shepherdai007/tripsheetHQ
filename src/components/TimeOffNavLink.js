"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, collection, query, where, onSnapshot } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

// Drop-in replacement for the "Time Off" nav button used on every
// admin page. Listens in real time for any request still in
// "pending" status and shows a red dot on the button when there's
// at least one - so a new request flags itself no matter which
// admin page you're currently on.
export default function TimeOffNavLink({ router, active = false }) {
  const [hasPending, setHasPending] = useState(false);

  useEffect(() => {
    let unsubscribeRequests = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (unsubscribeRequests) {
        unsubscribeRequests();
        unsubscribeRequests = null;
      }
      if (!user) return;

      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (!userDoc.exists()) return;
      const companyId = userDoc.data().companyId;
      if (!companyId) return;

      const reqQuery = query(
        collection(db, "timeOffRequests"),
        where("companyId", "==", companyId),
        where("status", "==", "pending")
      );

      unsubscribeRequests = onSnapshot(reqQuery, (snap) => {
        setHasPending(!snap.empty);
      });
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeRequests) unsubscribeRequests();
    };
  }, []);

  return (
    <button
      onClick={() => router.push("/admin/time-off")}
      style={{
        position: "relative",
        padding: "0.5rem 1rem",
        backgroundColor: "rgba(255,255,255,0.85)",
        border: "none",
        borderRadius: "6px",
        cursor: "pointer",
        fontSize: "0.85rem",
        fontWeight: "600",
        color: active ? "#1a56db" : "#1a1a1a",
        whiteSpace: "nowrap",
      }}
    >
      Time Off
      {hasPending && (
        <span
          style={{
            position: "absolute",
            top: "-4px",
            right: "-4px",
            width: "11px",
            height: "11px",
            borderRadius: "50%",
            backgroundColor: "#ef4444",
            border: "2px solid white",
          }}
        />
      )}
    </button>
  );
}

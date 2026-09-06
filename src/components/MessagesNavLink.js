"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, collection, query, where, onSnapshot } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

// Drop-in replacement for the "Messages" nav button used on every
// admin page. Listens in real time for driver replies that haven't
// been read yet (adminReadAt missing) and shows a red dot on the
// button when there's at least one - so a new message flags itself
// no matter which admin page you're currently on.
export default function MessagesNavLink({ router, active = false }) {
  const [hasUnread, setHasUnread] = useState(false);

  useEffect(() => {
    let unsubscribeMessages = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (unsubscribeMessages) {
        unsubscribeMessages();
        unsubscribeMessages = null;
      }
      if (!user) return;

      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (!userDoc.exists()) return;
      const companyId = userDoc.data().companyId;
      if (!companyId) return;

      const msgQuery = query(
        collection(db, "messages"),
        where("companyId", "==", companyId),
        where("senderRole", "==", "driver")
      );

      unsubscribeMessages = onSnapshot(msgQuery, (snap) => {
        setHasUnread(snap.docs.some((d) => !d.data().adminReadAt));
      });
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeMessages) unsubscribeMessages();
    };
  }, []);

  return (
    <button
      onClick={() => router.push("/admin/messages")}
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
      Messages
      {hasUnread && (
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

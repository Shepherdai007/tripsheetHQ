"use client";

import { useEffect, useState } from "react";
import { getToken } from "firebase/messaging";
import { doc, updateDoc } from "firebase/firestore";
import { auth, db, getMessagingInstance } from "@/lib/firebase";

const VAPID_KEY = "BA7YmN8wqswX2G9RBU-61vluOJTZavDDpIpI2Dskzb1g4MKnDFbSfvO8x5m8E0I-ka23aoYcvi19p4gPaOHR4wE";

export default function NotificationPrompt() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const check = async () => {
      if (typeof window === "undefined" || !("Notification" in window)) return;
      if (Notification.permission === "default") {
        setVisible(true);
      }
    };
    check();
  }, []);

  const enableNotifications = async () => {
    setVisible(false);
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") return;

      const messaging = await getMessagingInstance();
      if (!messaging) return;

      const registration = await navigator.serviceWorker.register("/firebase-messaging-sw.js");

      const token = await getToken(messaging, {
        vapidKey: VAPID_KEY,
        serviceWorkerRegistration: registration,
      });

      if (token && auth.currentUser) {
        await updateDoc(doc(db, "users", auth.currentUser.uid), {
          fcmToken: token,
          fcmTokenUpdatedAt: new Date().toISOString(),
        });
      }
    } catch (err) {
      console.error("Notification setup failed:", err);
    }
  };

  const dismiss = () => setVisible(false);

  if (!visible) return null;

  return (
    <div style={{
      position: "fixed",
      bottom: 16,
      left: 16,
      right: 16,
      maxWidth: 420,
      margin: "0 auto",
      background: "#0b1220",
      color: "#fff",
      borderRadius: 12,
      padding: "14px 16px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 12,
      boxShadow: "0 8px 24px rgba(0,0,0,0.35)",
      zIndex: 9999,
    }}>
      <div>
        <div style={{ fontWeight: 600 }}>Turn on notifications</div>
        <div style={{ fontSize: 13, opacity: 0.8 }}>Get notified instantly when dispatch sends a message.</div>
      </div>
      <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
        <button onClick={dismiss} style={{ background: "transparent", color: "#fff", border: "none", padding: "8px 10px" }}>Not now</button>
        <button onClick={enableNotifications} style={{ background: "#f5c400", color: "#0b1220", fontWeight: 700, border: "none", borderRadius: 8, padding: "8px 14px" }}>Allow</button>
      </div>
    </div>
  );
}
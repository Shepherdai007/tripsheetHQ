"use client";
import { useEffect, useState } from "react";

export default function NotificationHelp() {
  const [status, setStatus] = useState(null); // "denied" | null
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || !("Notification" in window)) return;

    const wasDismissed = localStorage.getItem("notif-help-dismissed");
    if (wasDismissed) {
      setDismissed(true);
      return;
    }

    setStatus(Notification.permission);
  }, []);

  const dismiss = () => {
    localStorage.setItem("notif-help-dismissed", "1");
    setDismissed(true);
  };

  if (dismissed || status !== "denied") return null;

  return (
    <div
      style={{
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
        boxShadow: "0 8px 24px rgba(0,0,0,0.35)",
        zIndex: 9999,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 600, marginBottom: 6 }}>
            Notifications are turned off
          </div>
          <div style={{ fontSize: 13, opacity: 0.9, lineHeight: 1.5 }}>
            To get notified about messages, turn them back on:
            <ol style={{ margin: "6px 0 0", paddingLeft: 18 }}>
              <li>Open your phone's <strong>Settings</strong></li>
              <li>Go to <strong>Apps</strong> → <strong>TripsheetHQ</strong></li>
              <li>Tap <strong>Notifications</strong> → turn <strong>Allow</strong> on</li>
            </ol>
          </div>
        </div>
        <button
          onClick={dismiss}
          style={{ background: "transparent", color: "#fff", border: "none", fontSize: 18, lineHeight: 1, padding: 4, flexShrink: 0 }}
          aria-label="Dismiss"
        >
          ✕
        </button>
      </div>
    </div>
  );
}

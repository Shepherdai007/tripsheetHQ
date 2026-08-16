"use client";
import { useEffect, useState } from "react";

function isIos() {
  if (typeof window === "undefined") return false;
  return /iphone|ipad|ipod/.test(window.navigator.userAgent.toLowerCase());
}

function isInStandaloneMode() {
  if (typeof window === "undefined") return false;
  return (
    "standalone" in window.navigator && window.navigator.standalone
  );
}

export default function IosInstallPrompt() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const dismissed = localStorage.getItem("ios-install-dismissed");
    if (isIos() && !isInStandaloneMode() && !dismissed) {
      setVisible(true);
    }
  }, []);

  const dismiss = () => {
    localStorage.setItem("ios-install-dismissed", "1");
    setVisible(false);
  };

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
      gap: 12,
      boxShadow: "0 8px 24px rgba(0,0,0,0.35)",
      zIndex: 9999,
    }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 600, marginBottom: 4 }}>Install TripsheetHQ</div>
        <div style={{ fontSize: 13, opacity: 0.85, lineHeight: 1.4 }}>
          Tap the Share icon <span style={{ fontWeight: 700 }}>⬆️</span> below, then
          "Add to Home Screen".
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
  );
}
"use client";
import { useEffect, useState } from "react";

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setVisible(true);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  if (!visible) return null;

  const install = async () => {
    setVisible(false);
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
  };

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
        <div style={{ fontWeight: 600 }}>Install TripsheetHQ</div>
        <div style={{ fontSize: 13, opacity: 0.8 }}>Add it to your home screen for quick access.</div>
      </div>
      <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
        <button onClick={() => setVisible(false)} style={{ background: "transparent", color: "#fff", border: "none", padding: "8px 10px" }}>Later</button>
        <button onClick={install} style={{ background: "#f5c400", color: "#0b1220", fontWeight: 700, border: "none", borderRadius: 8, padding: "8px 14px" }}>Install</button>
      </div>
    </div>
  );
}
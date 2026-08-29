"use client";
import { useEffect, useState } from "react";

function isStandalone() {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia?.("(display-mode: standalone)").matches ||
    window.navigator.standalone === true
  );
}

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [visible, setVisible] = useState(false);
  const [fallbackVisible, setFallbackVisible] = useState(false);

  useEffect(() => {
    if (isStandalone()) return; // already installed - never show anything

    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setVisible(true);
    };
    window.addEventListener("beforeinstallprompt", handler);

    // If the native prompt hasn't fired after a few seconds, fall back
    // to a manual instructions banner - Chrome's engagement heuristics
    // can suppress the native event even for people who haven't
    // installed yet, so this makes sure nobody gets stuck with no
    // guidance at all.
    const fallbackTimer = setTimeout(() => {
      setDeferredPrompt((current) => {
        if (!current) {
          const dismissed = localStorage.getItem("install-fallback-dismissed");
          if (!dismissed) setFallbackVisible(true);
        }
        return current;
      });
    }, 4000);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
      clearTimeout(fallbackTimer);
    };
  }, []);

  const install = async () => {
    setVisible(false);
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
  };

  const dismissFallback = () => {
    localStorage.setItem("install-fallback-dismissed", "1");
    setFallbackVisible(false);
  };

  // Native one-tap install banner (preferred - shows when Chrome offers it)
  if (visible) {
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

  // Manual fallback banner - shown when the native prompt didn't fire,
  // with written steps so nobody is left without guidance.
  if (fallbackVisible) {
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
        boxShadow: "0 8px 24px rgba(0,0,0,0.35)",
        zIndex: 9999,
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 600, marginBottom: 6 }}>Install TripsheetHQ</div>
            <div style={{ fontSize: 13, opacity: 0.9, lineHeight: 1.5 }}>
              Tap the <strong>⋮</strong> menu (top right of Chrome), then
              <strong> "Install app"</strong> or <strong>"Add to Home screen"</strong>.
            </div>
          </div>
          <button
            onClick={dismissFallback}
            style={{ background: "transparent", color: "#fff", border: "none", fontSize: 18, lineHeight: 1, padding: 4, flexShrink: 0 }}
            aria-label="Dismiss"
          >
            ✕
          </button>
        </div>
      </div>
    );
  }

  return null;
}

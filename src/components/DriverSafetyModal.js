"use client";

import { useState, useEffect } from "react";

/**
 * DriverSafetyModal
 *
 * Shows a mandatory safety acknowledgment to drivers before they can use
 * the app. Similar to ELD (Electronic Logging Device) safety warnings.
 *
 * Usage: Drop this into your driver dashboard layout (e.g. src/app/dashboard/layout.js)
 * so it appears once per session (or once ever, depending on your preference below).
 *
 * It stores acknowledgment in localStorage so the driver isn't nagged every
 * single time they open the app - only once, unless you clear it.
 */

const SAFETY_ACK_KEY = "tripsheethq_safety_ack_session";

export default function DriverSafetyModal() {
  const [showModal, setShowModal] = useState(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    // sessionStorage clears when the browser/tab closes, so this pops up
    // again every time the driver logs back in - like ELD safety warnings.
    const alreadyAcknowledged = sessionStorage.getItem(SAFETY_ACK_KEY);
    if (!alreadyAcknowledged) {
      setShowModal(true);
    }
  }, []);

  const handleAcknowledge = () => {
    if (!checked) return;
    sessionStorage.setItem(SAFETY_ACK_KEY, "true");
    setShowModal(false);
  };

  if (!showModal) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(15, 23, 42, 0.75)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
        padding: "16px",
      }}
    >
      <div
        style={{
          backgroundColor: "#ffffff",
          borderRadius: "12px",
          maxWidth: "480px",
          width: "100%",
          padding: "28px",
          boxShadow: "0 10px 40px rgba(0,0,0,0.25)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            marginBottom: "16px",
          }}
        >
          <div
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "8px",
              backgroundColor: "#FEF3C7",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "20px",
              flexShrink: 0,
            }}
          >
            ⚠️
          </div>
          <h2
            style={{
              fontSize: "18px",
              fontWeight: 700,
              color: "#111827",
              margin: 0,
            }}
          >
            Driver Safety Notice
          </h2>
        </div>

        <p
          style={{
            fontSize: "14px",
            lineHeight: "1.6",
            color: "#374151",
            marginBottom: "12px",
          }}
        >
          <strong>Do not use this app while driving.</strong> TripSheetHQ is
          designed to be used only when your vehicle is safely parked or
          stopped.
        </p>

        <ul
          style={{
            fontSize: "14px",
            lineHeight: "1.6",
            color: "#374151",
            marginBottom: "16px",
            paddingLeft: "20px",
          }}
        >
          <li>Enter trip data, fuel, and expenses only when parked.</li>
          <li>Never interact with this app while your vehicle is in motion.</li>
          <li>
            Follow all applicable federal, provincial, and company policies
            regarding phone and device use while driving.
          </li>
        </ul>

        <p
          style={{
            fontSize: "12px",
            lineHeight: "1.5",
            color: "#6B7280",
            marginBottom: "20px",
          }}
        >
          By continuing, you acknowledge this notice and agree that you are
          solely responsible for using this app safely and in compliance
          with the law. TripSheetHQ and your employer are not responsible
          for any use of this app while a vehicle is in motion.
        </p>

        <label
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: "8px",
            fontSize: "13px",
            color: "#111827",
            marginBottom: "20px",
            cursor: "pointer",
          }}
        >
          <input
            type="checkbox"
            checked={checked}
            onChange={(e) => setChecked(e.target.checked)}
            style={{ marginTop: "2px" }}
          />
          I understand and will not use this app while driving.
        </label>

        <button
          onClick={handleAcknowledge}
          disabled={!checked}
          style={{
            width: "100%",
            padding: "12px",
            borderRadius: "8px",
            border: "none",
            backgroundColor: checked ? "#111827" : "#D1D5DB",
            color: "#ffffff",
            fontSize: "14px",
            fontWeight: 600,
            cursor: checked ? "pointer" : "not-allowed",
            transition: "background-color 0.15s ease",
          }}
        >
          I Acknowledge — Continue to App
        </button>
      </div>
    </div>
  );
}

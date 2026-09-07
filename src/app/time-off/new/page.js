"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { doc, getDoc, addDoc, collection } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import BillingGate from "@/components/BillingGate";

const LEAVE_TYPES = [
  { key: "sick", label: "Sick Days" },
  { key: "vacation", label: "Vacation Request" },
  { key: "drAppointment", label: "Dr. Appointment" },
  { key: "medicalLeave", label: "Medical Leave" },
  { key: "miscellaneous", label: "Miscellaneous" },
  { key: "caretakerLeave", label: "Caretaker Leave" },
  { key: "leave", label: "Leave" },
];

export default function TimeOffRequestPage() {
  const router = useRouter();
  const [leaveType, setLeaveType] = useState("vacation");
  const [datesRequested, setDatesRequested] = useState("");
  const [datesReturned, setDatesReturned] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!datesRequested || !datesReturned) {
      setError("Please fill in both requested dates.");
      return;
    }

    const user = auth.currentUser;
    if (!user) {
      router.push("/login");
      return;
    }

    setSubmitting(true);
    try {
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (!userDoc.exists()) {
        setError("Could not find your account. Please try again.");
        setSubmitting(false);
        return;
      }

      const userData = userDoc.data();

      await addDoc(collection(db, "timeOffRequests"), {
        driverId: user.uid,
        driverName: userData.name || "",
        companyId: userData.companyId || null,
        leaveType,
        datesRequested,
        datesReturned,
        notes: notes.trim(),
        status: "pending",
        paid: null,
        submittedAt: new Date().toISOString(),
      });

      setSuccess(true);
    } catch (err) {
      setError("Something went wrong submitting your request. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const inputStyle = {
    width: "100%",
    padding: "0.6rem",
    border: "1px solid #ccc",
    borderRadius: "6px",
    fontSize: "1rem",
    boxSizing: "border-box",
  };
  const labelStyle = { display: "block", marginBottom: "0.25rem", fontSize: "0.9rem", color: "#333", fontWeight: "500" };

  if (success) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundImage: "url('/images/billing-bg.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          backgroundAttachment: "fixed",
          padding: "1.5rem",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(180deg, rgba(10,15,25,0.55) 0%, rgba(10,15,25,0.75) 100%)",
          }}
        />
        <div
          style={{
            position: "relative",
            background: "rgba(255,255,255,0.14)",
            backdropFilter: "blur(18px)",
            WebkitBackdropFilter: "blur(18px)",
            border: "1px solid rgba(255,255,255,0.25)",
            padding: "2rem",
            borderRadius: "16px",
            boxShadow: "0 8px 32px rgba(0,0,0,0.35)",
            maxWidth: "420px",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>✅</div>
          <h1 style={{ fontSize: "1.3rem", fontWeight: "bold", marginBottom: "0.5rem", color: "#ffffff", textShadow: "0 1px 4px rgba(0,0,0,0.5)" }}>
            Request submitted
          </h1>
          <p style={{ fontSize: "0.9rem", color: "#f1f1f1", marginBottom: "1.5rem", textShadow: "0 1px 4px rgba(0,0,0,0.5)" }}>
            Your dispatcher will review your time off request. Remember: vacation requests need to be submitted at least 30 days in advance, and caregiver leave requires documentation from your doctor.
          </p>
          <button
            onClick={() => router.push("/dashboard")}
            style={{ width: "100%", padding: "0.75rem", backgroundColor: "#1a56db", color: "white", border: "none", borderRadius: "6px", fontSize: "1rem", fontWeight: "600", cursor: "pointer", boxShadow: "0 4px 14px rgba(26,86,219,0.5)" }}
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundImage: "url('/images/billing-bg.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "fixed",
        padding: "1.5rem",
        position: "relative",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(180deg, rgba(10,15,25,0.55) 0%, rgba(10,15,25,0.75) 100%)",
        }}
      />

      <div style={{ position: "relative", maxWidth: "500px", margin: "0 auto" }}>
        <button
          onClick={() => router.push("/dashboard")}
          style={{ background: "none", border: "none", color: "#bfdbfe", fontSize: "0.9rem", fontWeight: "600", cursor: "pointer", marginBottom: "1rem", padding: 0 }}
        >
          ← Back
        </button>

        <h1 style={{ fontSize: "1.5rem", fontWeight: "bold", marginBottom: "0.35rem", color: "#ffffff", textShadow: "0 1px 4px rgba(0,0,0,0.5)" }}>
          Days Off Request
        </h1>
        <p style={{ fontSize: "0.9rem", color: "#f1f1f1", marginBottom: "1.5rem", textShadow: "0 1px 4px rgba(0,0,0,0.5)" }}>
          Submit your request below. Your dispatcher will approve or deny it.
        </p>

        <div
          style={{
            background: "rgba(255,255,255,0.14)",
            backdropFilter: "blur(18px)",
            WebkitBackdropFilter: "blur(18px)",
            border: "1px solid rgba(255,255,255,0.25)",
            borderRadius: "16px",
            padding: "1.5rem",
            boxShadow: "0 8px 32px rgba(0,0,0,0.35)",
          }}
        >
          <BillingGate>
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: "1.25rem" }}>
                <label style={labelStyle}>Reason for Leave</label>
                <select value={leaveType} onChange={(e) => setLeaveType(e.target.value)} style={inputStyle}>
                  {LEAVE_TYPES.map((t) => (
                    <option key={t.key} value={t.key}>{t.label}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1.25rem" }}>
                <div>
                  <label style={labelStyle}>Date Requested</label>
                  <input type="date" value={datesRequested} onChange={(e) => setDatesRequested(e.target.value)} required style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Date Returning</label>
                  <input type="date" value={datesReturned} onChange={(e) => setDatesReturned(e.target.value)} required style={inputStyle} />
                </div>
              </div>

              <div style={{ marginBottom: "1.5rem" }}>
                <label style={labelStyle}>Notes (optional)</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  style={inputStyle}
                  placeholder="Any additional details for your dispatcher"
                />
              </div>

              <div style={{ backgroundColor: "#f0f5ff", border: "1px solid #dbeafe", borderRadius: "6px", padding: "0.85rem", marginBottom: "1.5rem" }}>
                <p style={{ fontSize: "0.8rem", color: "#1a3a8f", margin: 0, lineHeight: "1.5" }}>
                  Vacation requests need at least 30 days notice. Caregiver leave requires doctor documentation. Submit Dr. appointments as soon as they're booked.
                </p>
              </div>

              {error && <p style={{ color: "#d32f2f", fontSize: "0.9rem", marginBottom: "1rem" }}>{error}</p>}

              <button
                type="submit"
                disabled={submitting}
                style={{ width: "100%", padding: "0.75rem", backgroundColor: "#1a56db", color: "white", border: "none", borderRadius: "6px", fontSize: "1rem", fontWeight: "600", cursor: submitting ? "not-allowed" : "pointer" }}
              >
                {submitting ? "Submitting..." : "Submit Request"}
              </button>
            </form>
          </BillingGate>
        </div>
      </div>
    </div>
  );
}
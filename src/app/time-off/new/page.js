"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, addDoc, collection } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

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

    setSubmitting(true);

    onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push("/login");
        return;
      }

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
          status: "pending", // pending | approved | denied
          paid: null, // set by admin: true | false | null
          submittedAt: new Date().toISOString(),
        });

        setSuccess(true);
      } catch (err) {
        setError("Something went wrong submitting your request. Please try again.");
      } finally {
        setSubmitting(false);
      }
    });
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
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#f5f5f5", padding: "1.5rem" }}>
        <div style={{ backgroundColor: "white", padding: "2rem", borderRadius: "8px", boxShadow: "0 2px 8px rgba(0,0,0,0.1)", maxWidth: "420px", textAlign: "center" }}>
          <div style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>✅</div>
          <h1 style={{ fontSize: "1.3rem", fontWeight: "bold", marginBottom: "0.5rem", color: "#1a1a1a" }}>
            Request submitted
          </h1>
          <p style={{ fontSize: "0.9rem", color: "#666", marginBottom: "1.5rem" }}>
            Your dispatcher will review your time off request. Remember: vacation requests need to be submitted at least 30 days in advance, and caregiver leave requires documentation from your doctor.
          </p>
          <button
            onClick={() => router.push("/dashboard")}
            style={{ width: "100%", padding: "0.75rem", backgroundColor: "#1a56db", color: "white", border: "none", borderRadius: "6px", fontSize: "1rem", fontWeight: "600", cursor: "pointer" }}
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f5f5f5", padding: "1.5rem" }}>
      <div style={{ maxWidth: "500px", margin: "0 auto" }}>
        <button
          onClick={() => router.push("/dashboard")}
          style={{ background: "none", border: "none", color: "#1a56db", fontSize: "0.9rem", fontWeight: "600", cursor: "pointer", marginBottom: "1rem", padding: 0 }}
        >
          ← Back
        </button>

        <h1 style={{ fontSize: "1.5rem", fontWeight: "bold", marginBottom: "0.35rem", color: "#1a1a1a" }}>
          Days Off Request
        </h1>
        <p style={{ fontSize: "0.9rem", color: "#666", marginBottom: "1.5rem" }}>
          Submit your request below. Your dispatcher will approve or deny it.
        </p>

        <div style={{ backgroundColor: "white", borderRadius: "8px", padding: "1.5rem", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
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
        </div>
      </div>
    </div>
  );
}

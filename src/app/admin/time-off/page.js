"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc, updateDoc, collection, query, where, orderBy, getDocs } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

const LEAVE_LABELS = {
  sick: "Sick Days",
  vacation: "Vacation",
  drAppointment: "Dr. Appointment",
  medicalLeave: "Medical Leave",
  miscellaneous: "Miscellaneous",
  caretakerLeave: "Caretaker Leave",
  leave: "Leave",
};

export default function AdminTimeOffPage() {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState([]);
  const [myCompanyId, setMyCompanyId] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push("/login");
        return;
      }

      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (!userDoc.exists() || userDoc.data().role !== "admin") {
        router.push("/dashboard");
        return;
      }

      const companyId = userDoc.data().companyId;
      setMyCompanyId(companyId);
      setAuthorized(true);

      await loadRequests(companyId);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  const loadRequests = async (companyId) => {
    try {
      const q = query(
        collection(db, "timeOffRequests"),
        where("companyId", "==", companyId),
        orderBy("submittedAt", "desc")
      );
      const snap = await getDocs(q);
      setRequests(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    } catch (err) {
      console.error("Error loading time off requests:", err);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/login");
  };

  const updateStatus = async (requestId, status) => {
    setUpdatingId(requestId);
    try {
      await updateDoc(doc(db, "timeOffRequests", requestId), {
        status,
        reviewedAt: new Date().toISOString(),
      });
      await loadRequests(myCompanyId);
    } catch (err) {
      console.error("Error updating request:", err);
    } finally {
      setUpdatingId(null);
    }
  };

  const updatePaid = async (requestId, paid) => {
    setUpdatingId(requestId);
    try {
      await updateDoc(doc(db, "timeOffRequests", requestId), { paid });
      await loadRequests(myCompanyId);
    } catch (err) {
      console.error("Error updating paid status:", err);
    } finally {
      setUpdatingId(null);
    }
  };

  const navButtonStyle = {
    padding: "0.5rem 1rem",
    backgroundColor: "#ffffff",
    border: "1px solid #ddd",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "0.85rem",
    fontWeight: "600",
    color: "#1a1a1a",
    whiteSpace: "nowrap",
  };

  const statusStyle = {
    pending: { bg: "#fef3e0", color: "#b26a00" },
    approved: { bg: "#e6f4ea", color: "#1a7d36" },
    denied: { bg: "#fee2e2", color: "#b91c1c" },
  };

  if (loading || !authorized) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f5f5f5", padding: "1.5rem" }}>
      {/* Top nav bar: section links + logout */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "0.5rem",
          marginBottom: "1.5rem",
        }}
      >
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          <button style={navButtonStyle} onClick={() => router.push("/admin")}>
            Trips
          </button>
          <button style={navButtonStyle} onClick={() => router.push("/admin/documents")}>
            Documents
          </button>
          <button style={navButtonStyle} onClick={() => router.push("/admin/messages")}>
            Messages
          </button>
          <button style={{ ...navButtonStyle, borderColor: "#1a56db", color: "#1a56db" }} onClick={() => router.push("/admin/time-off")}>
            Time Off
          </button>
          <button style={navButtonStyle} onClick={() => router.push("/admin/branding")}>
            Branding
          </button>
          <button style={navButtonStyle} onClick={() => router.push("/admin/billing")}>
            Billing
          </button>
        </div>
        <button
          onClick={handleLogout}
          style={{
            padding: "0.5rem 1rem",
            backgroundColor: "#ffffff",
            border: "1px solid #ddd",
            borderRadius: "6px",
            cursor: "pointer",
            fontSize: "0.85rem",
            fontWeight: "600",
            color: "#b91c1c",
          }}
        >
          Log Out
        </button>
      </div>

      <h1 style={{ fontSize: "1.5rem", fontWeight: "bold", marginBottom: "1.5rem", color: "#1a1a1a" }}>
        Time Off Requests
      </h1>

      {requests.length === 0 ? (
        <div style={{ backgroundColor: "white", borderRadius: "8px", padding: "1.5rem", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
          <p style={{ color: "#666" }}>No time off requests yet.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {requests.map((req) => {
            const status = statusStyle[req.status] || statusStyle.pending;
            return (
              <div
                key={req.id}
                style={{
                  backgroundColor: "white",
                  borderRadius: "8px",
                  padding: "1.25rem",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "0.5rem", marginBottom: "0.75rem" }}>
                  <div>
                    <p style={{ fontSize: "1.05rem", fontWeight: "700", color: "#1a1a1a", marginBottom: "0.15rem" }}>
                      {req.driverName || "Unknown driver"}
                    </p>
                    <p style={{ fontSize: "0.85rem", color: "#666" }}>
                      {LEAVE_LABELS[req.leaveType] || req.leaveType} · {req.datesRequested} → {req.datesReturned}
                    </p>
                  </div>
                  <span
                    style={{
                      fontSize: "0.75rem",
                      fontWeight: "700",
                      padding: "0.25rem 0.7rem",
                      borderRadius: "12px",
                      textTransform: "capitalize",
                      backgroundColor: status.bg,
                      color: status.color,
                    }}
                  >
                    {req.status}
                  </span>
                </div>

                {req.notes && (
                  <p style={{ fontSize: "0.9rem", color: "#444", marginBottom: "0.75rem", backgroundColor: "#f8f9fa", padding: "0.6rem", borderRadius: "6px" }}>
                    {req.notes}
                  </p>
                )}

                <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", alignItems: "center" }}>
                  {req.status === "pending" ? (
                    <>
                      <button
                        onClick={() => updateStatus(req.id, "approved")}
                        disabled={updatingId === req.id}
                        style={{ padding: "0.5rem 1rem", backgroundColor: "#1a7d36", color: "white", border: "none", borderRadius: "6px", fontSize: "0.85rem", fontWeight: "600", cursor: "pointer" }}
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => updateStatus(req.id, "denied")}
                        disabled={updatingId === req.id}
                        style={{ padding: "0.5rem 1rem", backgroundColor: "#b91c1c", color: "white", border: "none", borderRadius: "6px", fontSize: "0.85rem", fontWeight: "600", cursor: "pointer" }}
                      >
                        Deny
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => updateStatus(req.id, "pending")}
                      disabled={updatingId === req.id}
                      style={{ padding: "0.5rem 1rem", backgroundColor: "#f0f0f0", color: "#333", border: "none", borderRadius: "6px", fontSize: "0.85rem", fontWeight: "600", cursor: "pointer" }}
                    >
                      Reset to Pending
                    </button>
                  )}

                  {req.status === "approved" && (
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginLeft: "0.5rem", paddingLeft: "0.5rem", borderLeft: "1px solid #eee" }}>
                      <span style={{ fontSize: "0.85rem", color: "#666" }}>Paid:</span>
                      <button
                        onClick={() => updatePaid(req.id, true)}
                        disabled={updatingId === req.id}
                        style={{
                          padding: "0.35rem 0.75rem",
                          backgroundColor: req.paid === true ? "#1a7d36" : "#f0f0f0",
                          color: req.paid === true ? "white" : "#333",
                          border: "none",
                          borderRadius: "6px",
                          fontSize: "0.8rem",
                          fontWeight: "600",
                          cursor: "pointer",
                        }}
                      >
                        Yes
                      </button>
                      <button
                        onClick={() => updatePaid(req.id, false)}
                        disabled={updatingId === req.id}
                        style={{
                          padding: "0.35rem 0.75rem",
                          backgroundColor: req.paid === false ? "#b91c1c" : "#f0f0f0",
                          color: req.paid === false ? "white" : "#333",
                          border: "none",
                          borderRadius: "6px",
                          fontSize: "0.8rem",
                          fontWeight: "600",
                          cursor: "pointer",
                        }}
                      >
                        No
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

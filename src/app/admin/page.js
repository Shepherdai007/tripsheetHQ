"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc, collection, query, where, orderBy, getDocs } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

export default function AdminPage() {
  const router = useRouter();
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);

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

      const myCompanyId = userDoc.data().companyId;
      setAuthorized(true);

      const tripsQuery = query(
        collection(db, "trips"),
        where("companyId", "==", myCompanyId),
        orderBy("createdAt", "desc")
      );
      const tripsSnap = await getDocs(tripsQuery);
      const tripsList = tripsSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setTrips(tripsList);

      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/login");
  };

  if (loading || !authorized) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p>Loading...</p>
      </div>
    );
  }

  const totalMilesAll = trips.reduce((sum, t) => sum + (t.totalMiles || 0), 0);
  const totalFuelAll = trips.reduce((sum, t) => sum + (t.totalFuelCost || 0), 0);
  const totalExpenseAll = trips.reduce((sum, t) => sum + (t.totalExpenseCost || 0), 0);

  const statCardStyle = {
    background: "rgba(255,255,255,0.14)",
    backdropFilter: "blur(18px)",
    WebkitBackdropFilter: "blur(18px)",
    border: "1px solid rgba(255,255,255,0.25)",
    borderRadius: "12px",
    padding: "1rem 1.5rem",
    boxShadow: "0 8px 32px rgba(0,0,0,0.35)",
  };

  const navButtonStyle = {
    padding: "0.5rem 1rem",
    backgroundColor: "rgba(255,255,255,0.85)",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "0.85rem",
    fontWeight: "600",
    color: "#1a1a1a",
    whiteSpace: "nowrap",
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundImage: "url('/images/admin-bg.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "fixed",
        padding: "1.5rem",
        position: "relative",
      }}
    >
      {/* darken the photo a touch so cards and text stay readable */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(180deg, rgba(10,15,25,0.55) 0%, rgba(10,15,25,0.7) 100%)",
        }}
      />

      <div style={{ position: "relative" }}>
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
            <button style={navButtonStyle} onClick={() => router.push("/admin/branding")}>
              Branding
            </button>
          </div>
          <button
            onClick={handleLogout}
            style={{
              padding: "0.5rem 1rem",
              backgroundColor: "rgba(255,255,255,0.85)",
              border: "none",
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

        <h1 style={{ fontSize: "1.5rem", fontWeight: "bold", marginBottom: "1.5rem", color: "#ffffff", textShadow: "0 2px 8px rgba(0,0,0,0.5)" }}>
          Admin — All Trips
        </h1>

        <div style={{ display: "flex", gap: "1rem", marginBottom: "1.5rem", flexWrap: "wrap" }}>
          <div style={statCardStyle}>
            <p style={{ fontSize: "0.8rem", color: "#e5e7eb" }}>Total Trips</p>
            <p style={{ fontSize: "1.4rem", fontWeight: "bold", color: "#ffffff" }}>{trips.length}</p>
          </div>
          <div style={statCardStyle}>
            <p style={{ fontSize: "0.8rem", color: "#e5e7eb" }}>Total Miles</p>
            <p style={{ fontSize: "1.4rem", fontWeight: "bold", color: "#ffffff" }}>{totalMilesAll.toFixed(0)}</p>
          </div>
          <div style={statCardStyle}>
            <p style={{ fontSize: "0.8rem", color: "#e5e7eb" }}>Total Fuel Cost</p>
            <p style={{ fontSize: "1.4rem", fontWeight: "bold", color: "#ffffff" }}>${totalFuelAll.toFixed(2)}</p>
          </div>
          <div style={statCardStyle}>
            <p style={{ fontSize: "0.8rem", color: "#e5e7eb" }}>Total Expenses</p>
            <p style={{ fontSize: "1.4rem", fontWeight: "bold", color: "#ffffff" }}>${totalExpenseAll.toFixed(2)}</p>
          </div>
        </div>

        <div
          style={{
            background: "rgba(255,255,255,0.14)",
            backdropFilter: "blur(18px)",
            WebkitBackdropFilter: "blur(18px)",
            border: "1px solid rgba(255,255,255,0.25)",
            borderRadius: "12px",
            padding: "1.5rem",
            boxShadow: "0 8px 32px rgba(0,0,0,0.35)",
            overflowX: "auto",
          }}
        >
          {trips.length === 0 ? (
            <p style={{ color: "#f1f1f1" }}>No trips submitted yet.</p>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "2px solid rgba(255,255,255,0.3)", textAlign: "left" }}>
                  <th style={{ padding: "0.75rem 0.5rem", fontSize: "0.85rem", color: "#e5e7eb" }}>Date</th>
                  <th style={{ padding: "0.75rem 0.5rem", fontSize: "0.85rem", color: "#e5e7eb" }}>Driver</th>
                  <th style={{ padding: "0.75rem 0.5rem", fontSize: "0.85rem", color: "#e5e7eb" }}>Route</th>
                  <th style={{ padding: "0.75rem 0.5rem", fontSize: "0.85rem", color: "#e5e7eb" }}>Miles</th>
                  <th style={{ padding: "0.75rem 0.5rem", fontSize: "0.85rem", color: "#e5e7eb" }}>Fuel</th>
                  <th style={{ padding: "0.75rem 0.5rem", fontSize: "0.85rem", color: "#e5e7eb" }}>Expenses</th>
                  <th style={{ padding: "0.75rem 0.5rem", fontSize: "0.85rem", color: "#e5e7eb" }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {trips.map((trip) => (
                  <tr
                    key={trip.id}
                    onClick={() => router.push(`/admin/trips/${trip.id}`)}
                    style={{ borderBottom: "1px solid rgba(255,255,255,0.15)", cursor: "pointer" }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.08)")}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                  >
                    <td style={{ padding: "0.75rem 0.5rem", fontSize: "0.9rem", color: "#ffffff" }}>{trip.date}</td>
                    <td style={{ padding: "0.75rem 0.5rem", fontSize: "0.9rem", color: "#ffffff" }}>{trip.driverName || "—"}</td>
                    <td style={{ padding: "0.75rem 0.5rem", fontSize: "0.9rem", color: "#ffffff" }}>
                      {trip.pickupCustomer || "—"} → {trip.deliveryCustomer || "—"}
                    </td>
                    <td style={{ padding: "0.75rem 0.5rem", fontSize: "0.9rem", color: "#ffffff" }}>{trip.totalMiles || "—"}</td>
                    <td style={{ padding: "0.75rem 0.5rem", fontSize: "0.9rem", color: "#ffffff" }}>${(trip.totalFuelCost || 0).toFixed(2)}</td>
                    <td style={{ padding: "0.75rem 0.5rem", fontSize: "0.9rem", color: "#ffffff" }}>${(trip.totalExpenseCost || 0).toFixed(2)}</td>
                    <td style={{ padding: "0.75rem 0.5rem", fontSize: "0.85rem" }}>
                      <span style={{ padding: "0.2rem 0.6rem", backgroundColor: "rgba(191,219,254,0.9)", color: "#1a3a8f", borderRadius: "12px", textTransform: "capitalize", fontWeight: "600" }}>
                        {trip.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
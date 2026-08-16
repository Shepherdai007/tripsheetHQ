"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

export default function AdminTripDetailPage() {
  const router = useRouter();
  const params = useParams();
  const tripId = params.id;

  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [trip, setTrip] = useState(null);

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

      setAuthorized(true);

      const tripDoc = await getDoc(doc(db, "trips", tripId));
      if (tripDoc.exists()) {
        setTrip({ id: tripDoc.id, ...tripDoc.data() });
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, [router, tripId]);

  const sectionStyle = { backgroundColor: "white", borderRadius: "8px", padding: "1.5rem", marginBottom: "1rem", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" };
  const labelStyle = { fontSize: "0.8rem", color: "#666", marginBottom: "0.15rem" };
  const valueStyle = { fontSize: "0.95rem", color: "#1a1a1a", marginBottom: "0.75rem" };

  if (loading || !authorized) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p>Loading...</p>
      </div>
    );
  }

  if (!trip) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p>Trip not found.</p>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f5f5f5" }}>
      {/* Hero banner */}
      <div
        style={{
          backgroundImage: "url('/images/trip-detail-banner.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          padding: "1.5rem",
          position: "relative",
          minHeight: "220px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(180deg, rgba(10,15,25,0.35) 0%, rgba(10,15,25,0.6) 100%)",
          }}
        />
        <div style={{ position: "relative" }}>
          <button
            onClick={() => router.push("/admin")}
            style={{ background: "none", border: "none", color: "#bfdbfe", fontSize: "0.9rem", fontWeight: "600", cursor: "pointer", marginBottom: "1rem", padding: 0, textShadow: "0 1px 4px rgba(0,0,0,0.5)" }}
          >
            ← Back to all trips
          </button>

          <h1 style={{ fontSize: "1.6rem", fontWeight: "bold", color: "#ffffff", textShadow: "0 2px 8px rgba(0,0,0,0.5)", margin: 0 }}>
            Trip Detail — {trip.date}
          </h1>
        </div>
      </div>

      <div style={{ padding: "1.5rem" }}>
        <div style={sectionStyle}>
          <h2 style={{ fontSize: "1rem", fontWeight: "600", marginBottom: "1rem", color: "#1a1a1a" }}>Trip Info</h2>
          <p style={labelStyle}>Driver</p>
          <p style={valueStyle}>{trip.driverName || "—"}</p>
          <p style={labelStyle}>Trailer # / Pro # / B/L #</p>
          <p style={valueStyle}>{trip.trailerNumber || "—"} / {trip.proNumber || "—"} / {trip.blNumber || "—"}</p>
          <p style={labelStyle}>Pickup</p>
          <p style={valueStyle}>{trip.pickupCustomer || "—"} ({trip.pickupCity || "—"})</p>
          <p style={labelStyle}>Delivery</p>
          <p style={valueStyle}>{trip.deliveryCustomer || "—"} ({trip.deliveryCity || "—"})</p>
          <p style={labelStyle}>Status</p>
          <p style={valueStyle}>
            <span style={{ padding: "0.2rem 0.6rem", backgroundColor: "#e8f0fe", color: "#1a56db", borderRadius: "12px", textTransform: "capitalize", fontSize: "0.85rem" }}>
              {trip.status}
            </span>
          </p>
        </div>

        <div style={sectionStyle}>
          <h2 style={{ fontSize: "1rem", fontWeight: "600", marginBottom: "1rem", color: "#1a1a1a" }}>Mileage</h2>
          <p style={labelStyle}>Start / End Odometer</p>
          <p style={valueStyle}>{trip.startOdometer ?? "—"} / {trip.endOdometer ?? "—"}</p>
          <p style={labelStyle}>Total Miles</p>
          <p style={valueStyle}>{trip.totalMiles ?? "—"}</p>
        </div>

        {trip.jurisdictionSummary && trip.jurisdictionSummary.length > 0 && (
          <div style={sectionStyle}>
            <h2 style={{ fontSize: "1rem", fontWeight: "600", marginBottom: "1rem", color: "#1a1a1a" }}>Jurisdiction Summary (IFTA)</h2>
            {trip.jurisdictionSummary.map((j, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "0.4rem 0", borderBottom: "1px solid #f0f0f0" }}>
                <span style={{ fontSize: "0.9rem" }}>{j.jurisdiction}</span>
                <span style={{ fontSize: "0.9rem", fontWeight: "600" }}>{j.miles} miles</span>
              </div>
            ))}
          </div>
        )}

        {trip.borderCrossings && trip.borderCrossings.length > 0 && (
          <div style={sectionStyle}>
            <h2 style={{ fontSize: "1rem", fontWeight: "600", marginBottom: "1rem", color: "#1a1a1a" }}>Border Crossings</h2>
            {trip.borderCrossings.map((c, i) => (
              <div key={i} style={{ padding: "0.5rem 0", borderBottom: "1px solid #f0f0f0", fontSize: "0.9rem" }}>
                {c.direction} → {c.jurisdiction} at odometer {c.odometer}
              </div>
            ))}
          </div>
        )}

        <div style={sectionStyle}>
          <h2 style={{ fontSize: "1rem", fontWeight: "600", marginBottom: "1rem", color: "#1a1a1a" }}>
            Fuel Purchases — Total: ${(trip.totalFuelCost || 0).toFixed(2)}
          </h2>
          {(!trip.fuelEntries || trip.fuelEntries.length === 0) ? (
            <p style={{ color: "#999", fontSize: "0.9rem" }}>None</p>
          ) : (
            trip.fuelEntries.map((f, i) => (
              <div key={i} style={{ padding: "0.75rem 0", borderBottom: "1px solid #f0f0f0" }}>
                <p style={{ fontSize: "0.9rem" }}>{f.location || "—"} | Qty: {f.quantity ?? "—"} | ${(f.cost || 0).toFixed(2)}</p>
                {f.receiptUrl && (
                  <a href={f.receiptUrl} target="_blank" rel="noopener noreferrer" style={{ color: "#1a56db", fontSize: "0.85rem", fontWeight: "600" }}>
                    View Receipt
                  </a>
                )}
              </div>
            ))
          )}
        </div>

        <div style={sectionStyle}>
          <h2 style={{ fontSize: "1rem", fontWeight: "600", marginBottom: "1rem", color: "#1a1a1a" }}>
            Expenses — Total: ${(trip.totalExpenseCost || 0).toFixed(2)}
          </h2>
          {(!trip.expenseEntries || trip.expenseEntries.length === 0) ? (
            <p style={{ color: "#999", fontSize: "0.9rem" }}>None</p>
          ) : (
            trip.expenseEntries.map((exp, i) => (
              <div key={i} style={{ padding: "0.75rem 0", borderBottom: "1px solid #f0f0f0" }}>
                <p style={{ fontSize: "0.9rem" }}>{exp.category} - {exp.description || ""} | ${(exp.amount || 0).toFixed(2)}</p>
                {exp.receiptUrl && (
                  <a href={exp.receiptUrl} target="_blank" rel="noopener noreferrer" style={{ color: "#1a56db", fontSize: "0.85rem", fontWeight: "600" }}>
                    View Receipt
                  </a>
                )}
              </div>
            ))
          )}
        </div>

        {trip.loadReceivedDocs && trip.loadReceivedDocs.length > 0 && (
          <div style={sectionStyle}>
            <h2 style={{ fontSize: "1rem", fontWeight: "600", marginBottom: "1rem", color: "#1a1a1a" }}>Load Received Paperwork</h2>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem" }}>
              {trip.loadReceivedDocs.map((docItem, i) => (
                <a key={i} href={docItem.fileUrl} target="_blank" rel="noopener noreferrer">
                  <img src={docItem.fileUrl} alt={docItem.fileName} style={{ width: "100px", height: "100px", objectFit: "cover", borderRadius: "4px", border: "1px solid #ccc" }} />
                </a>
              ))}
            </div>
          </div>
        )}

        {trip.loadDeliveredDocs && trip.loadDeliveredDocs.length > 0 && (
          <div style={sectionStyle}>
            <h2 style={{ fontSize: "1rem", fontWeight: "600", marginBottom: "1rem", color: "#1a1a1a" }}>Load Delivered Paperwork</h2>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem" }}>
              {trip.loadDeliveredDocs.map((docItem, i) => (
                <a key={i} href={docItem.fileUrl} target="_blank" rel="noopener noreferrer">
                  <img src={docItem.fileUrl} alt={docItem.fileName} style={{ width: "100px", height: "100px", objectFit: "cover", borderRadius: "4px", border: "1px solid #ccc" }} />
                </a>
              ))}
            </div>
          </div>
        )}

        {trip.notes && (
          <div style={sectionStyle}>
            <h2 style={{ fontSize: "1rem", fontWeight: "600", marginBottom: "1rem", color: "#1a1a1a" }}>Notes</h2>
            <p style={{ fontSize: "0.9rem", color: "#333" }}>{trip.notes}</p>
          </div>
        )}
      </div>
    </div>
  );
}
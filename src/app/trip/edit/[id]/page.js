"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

export default function EditTripPage() {
  const router = useRouter();
  const params = useParams();
  const tripId = params.id;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    date: "",
    trailerNumber: "",
    proNumber: "",
    blNumber: "",
    pickupCustomer: "",
    pickupCity: "",
    deliveryCustomer: "",
    deliveryCity: "",
    startOdometer: "",
    endOdometer: "",
    notes: "",
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push("/login");
        return;
      }

      const tripRef = doc(db, "trips", tripId);
      const tripSnap = await getDoc(tripRef);

      if (!tripSnap.exists() || tripSnap.data().driverId !== user.uid) {
        router.push("/dashboard");
        return;
      }

      const data = tripSnap.data();
      setForm({
        date: data.date || "",
        trailerNumber: data.trailerNumber || "",
        proNumber: data.proNumber || "",
        blNumber: data.blNumber || "",
        pickupCustomer: data.pickupCustomer || "",
        pickupCity: data.pickupCity || "",
        deliveryCustomer: data.deliveryCustomer || "",
        deliveryCity: data.deliveryCity || "",
        startOdometer: data.startOdometer ?? "",
        endOdometer: data.endOdometer ?? "",
        notes: data.notes || "",
      });

      setLoading(false);
    });

    return () => unsubscribe();
  }, [router, tripId]);

  const handleChange = (field) => (e) => {
    setForm({ ...form, [field]: e.target.value });
  };

  const totalMiles =
    form.startOdometer && form.endOdometer
      ? (parseFloat(form.endOdometer) - parseFloat(form.startOdometer)).toFixed(1)
      : null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (form.endOdometer && form.startOdometer && parseFloat(form.endOdometer) < parseFloat(form.startOdometer)) {
      setError("Ending odometer must be greater than starting odometer.");
      return;
    }

    setSaving(true);
    try {
      await updateDoc(doc(db, "trips", tripId), {
        date: form.date,
        trailerNumber: form.trailerNumber,
        proNumber: form.proNumber,
        blNumber: form.blNumber,
        pickupCustomer: form.pickupCustomer,
        pickupCity: form.pickupCity,
        deliveryCustomer: form.deliveryCustomer,
        deliveryCity: form.deliveryCity,
        startOdometer: form.startOdometer ? parseFloat(form.startOdometer) : null,
        endOdometer: form.endOdometer ? parseFloat(form.endOdometer) : null,
        totalMiles: totalMiles ? parseFloat(totalMiles) : null,
        notes: form.notes,
        updatedAt: new Date().toISOString(),
      });

      router.push("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const inputStyle = { width: "100%", padding: "0.6rem", border: "1px solid #ccc", borderRadius: "4px", fontSize: "1rem", boxSizing: "border-box" };
  const labelStyle = { display: "block", marginBottom: "0.25rem", fontSize: "0.9rem", color: "#333", fontWeight: "500" };
  const sectionStyle = { backgroundColor: "white", borderRadius: "8px", padding: "1.5rem", marginBottom: "1rem", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" };
  const rowStyle = { marginBottom: "1rem" };

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f5f5f5", padding: "1.5rem" }}>
      <h1 style={{ fontSize: "1.4rem", fontWeight: "bold", marginBottom: "1.5rem", color: "#1a1a1a" }}>
        Edit Trip Sheet
      </h1>

      <form onSubmit={handleSubmit}>
        <div style={sectionStyle}>
          <h2 style={{ fontSize: "1rem", fontWeight: "600", marginBottom: "1rem", color: "#1a1a1a" }}>Trip Info</h2>
          <div style={rowStyle}>
            <label style={labelStyle}>Date</label>
            <input type="date" value={form.date} onChange={handleChange("date")} required style={inputStyle} />
          </div>
          <div style={rowStyle}>
            <label style={labelStyle}>Trailer #</label>
            <input type="text" value={form.trailerNumber} onChange={handleChange("trailerNumber")} style={inputStyle} />
          </div>
          <div style={rowStyle}>
            <label style={labelStyle}>Pro #</label>
            <input type="text" value={form.proNumber} onChange={handleChange("proNumber")} style={inputStyle} />
          </div>
          <div style={rowStyle}>
            <label style={labelStyle}>B/L #</label>
            <input type="text" value={form.blNumber} onChange={handleChange("blNumber")} style={inputStyle} />
          </div>
        </div>

        <div style={sectionStyle}>
          <h2 style={{ fontSize: "1rem", fontWeight: "600", marginBottom: "1rem", color: "#1a1a1a" }}>Pickup</h2>
          <div style={rowStyle}>
            <label style={labelStyle}>Customer</label>
            <input type="text" value={form.pickupCustomer} onChange={handleChange("pickupCustomer")} style={inputStyle} />
          </div>
          <div style={rowStyle}>
            <label style={labelStyle}>City, State/Prov</label>
            <input type="text" value={form.pickupCity} onChange={handleChange("pickupCity")} style={inputStyle} />
          </div>
        </div>

        <div style={sectionStyle}>
          <h2 style={{ fontSize: "1rem", fontWeight: "600", marginBottom: "1rem", color: "#1a1a1a" }}>Delivery</h2>
          <div style={rowStyle}>
            <label style={labelStyle}>Customer</label>
            <input type="text" value={form.deliveryCustomer} onChange={handleChange("deliveryCustomer")} style={inputStyle} />
          </div>
          <div style={rowStyle}>
            <label style={labelStyle}>City, State/Prov</label>
            <input type="text" value={form.deliveryCity} onChange={handleChange("deliveryCity")} style={inputStyle} />
          </div>
        </div>

        <div style={sectionStyle}>
          <h2 style={{ fontSize: "1rem", fontWeight: "600", marginBottom: "1rem", color: "#1a1a1a" }}>Mileage</h2>
          <div style={rowStyle}>
            <label style={labelStyle}>Starting Odometer</label>
            <input type="number" value={form.startOdometer} onChange={handleChange("startOdometer")} style={inputStyle} />
          </div>
          <div style={rowStyle}>
            <label style={labelStyle}>Ending Odometer</label>
            <input type="number" value={form.endOdometer} onChange={handleChange("endOdometer")} style={inputStyle} />
          </div>
          {totalMiles && (
            <p style={{ fontSize: "0.95rem", color: "#1a56db", fontWeight: "600" }}>
              Total Miles: {totalMiles}
            </p>
          )}
        </div>

        <div style={sectionStyle}>
          <h2 style={{ fontSize: "1rem", fontWeight: "600", marginBottom: "1rem", color: "#1a1a1a" }}>Notes</h2>
          <textarea value={form.notes} onChange={handleChange("notes")} rows={3} style={inputStyle} />
        </div>

        {error && <p style={{ color: "#d32f2f", fontSize: "0.9rem", marginBottom: "1rem" }}>{error}</p>}

        <button
          type="submit"
          disabled={saving}
          style={{ width: "100%", padding: "0.9rem", backgroundColor: "#1a56db", color: "white", border: "none", borderRadius: "8px", fontSize: "1.05rem", fontWeight: "600", cursor: "pointer" }}
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </form>
    </div>
  );
}
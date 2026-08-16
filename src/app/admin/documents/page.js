"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc, collection, query, where, getDocs, addDoc } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { auth, db } from "@/lib/firebase";

export default function AdminDocumentsPage() {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [myCompanyId, setMyCompanyId] = useState(null);
  const [drivers, setDrivers] = useState([]);
  const [selectedDriver, setSelectedDriver] = useState("");
  const [docType, setDocType] = useState("ACE");
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

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

      const companyIdValue = userDoc.data().companyId;
      setMyCompanyId(companyIdValue);
      setAuthorized(true);

      const driversQuery = query(
        collection(db, "users"),
        where("role", "==", "driver"),
        where("companyId", "==", companyIdValue)
      );
      const driversSnap = await getDocs(driversQuery);
      const driversList = driversSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setDrivers(driversList);

      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/login");
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!selectedDriver || !file) {
      setError("Select a driver and choose a file.");
      return;
    }

    setUploading(true);
    try {
      const storage = getStorage();
      const fileRef = ref(storage, `aci-ace/${selectedDriver}/${Date.now()}_${file.name}`);
      await uploadBytes(fileRef, file);
      const fileUrl = await getDownloadURL(fileRef);

      const driverInfo = drivers.find((d) => d.id === selectedDriver);

      await addDoc(collection(db, "documents"), {
        driverId: selectedDriver,
        driverName: driverInfo?.name || "",
        companyId: myCompanyId,
        type: docType,
        fileName: file.name,
        fileUrl: fileUrl,
        createdAt: new Date().toISOString(),
      });

      setMessage(`${docType} document sent to ${driverInfo?.name || "driver"}.`);
      setFile(null);
      setSelectedDriver("");
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  const inputStyle = { width: "100%", padding: "0.6rem", border: "1px solid rgba(255,255,255,0.4)", borderRadius: "8px", fontSize: "1rem", boxSizing: "border-box", background: "rgba(255,255,255,0.9)", color: "#1a1a1a" };
  const labelStyle = { display: "block", marginBottom: "0.25rem", fontSize: "0.9rem", color: "#f1f1f1" };
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

  if (loading || !authorized) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p>Loading...</p>
      </div>
    );
  }

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
            <button style={{ ...navButtonStyle, color: "#1a56db" }} onClick={() => router.push("/admin/documents")}>
              Documents
            </button>
            <button style={navButtonStyle} onClick={() => router.push("/admin/messages")}>
              Messages
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
          Send ACI/ACE Document to Driver
        </h1>

        <div
          style={{
            background: "rgba(255,255,255,0.14)",
            backdropFilter: "blur(18px)",
            WebkitBackdropFilter: "blur(18px)",
            border: "1px solid rgba(255,255,255,0.25)",
            borderRadius: "12px",
            padding: "1.5rem",
            boxShadow: "0 8px 32px rgba(0,0,0,0.35)",
            maxWidth: "500px",
          }}
        >
          <form onSubmit={handleUpload}>
            <div style={{ marginBottom: "1rem" }}>
              <label style={labelStyle}>Driver</label>
              <select value={selectedDriver} onChange={(e) => setSelectedDriver(e.target.value)} style={inputStyle}>
                <option value="">Select a driver...</option>
                {drivers.map((driver) => (
                  <option key={driver.id} value={driver.id}>
                    {driver.name} ({driver.email})
                  </option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: "1rem" }}>
              <label style={labelStyle}>Document Type</label>
              <select value={docType} onChange={(e) => setDocType(e.target.value)} style={inputStyle}>
                <option>ACE</option>
                <option>ACI</option>
                <option>Other</option>
              </select>
            </div>

            <div style={{ marginBottom: "1.5rem" }}>
              <label style={labelStyle}>File (PDF or image)</label>
              <input
                type="file"
                accept="application/pdf,image/*"
                onChange={(e) => setFile(e.target.files[0])}
                className="file-upload-btn"
              />
            </div>

            {error && <p style={{ color: "#ffb4b4", fontSize: "0.9rem", marginBottom: "1rem", textShadow: "0 1px 4px rgba(0,0,0,0.5)" }}>{error}</p>}
            {message && <p style={{ color: "#9dffb0", fontSize: "0.9rem", marginBottom: "1rem", textShadow: "0 1px 4px rgba(0,0,0,0.5)" }}>{message}</p>}

            <button
              type="submit"
              disabled={uploading}
              style={{ width: "100%", padding: "0.75rem", backgroundColor: "#1a56db", color: "white", border: "none", borderRadius: "6px", fontSize: "1rem", fontWeight: "600", cursor: "pointer", boxShadow: "0 4px 14px rgba(26,86,219,0.5)" }}
            >
              {uploading ? "Uploading..." : "Send Document"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
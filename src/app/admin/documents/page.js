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

  const inputStyle = { width: "100%", padding: "0.6rem", border: "1px solid #ccc", borderRadius: "4px", fontSize: "1rem", boxSizing: "border-box" };
  const labelStyle = { display: "block", marginBottom: "0.25rem", fontSize: "0.9rem", color: "#333", fontWeight: "500" };
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
          <button style={navButtonStyle} onClick={() => router.push("/admin/branding")}>
            Branding
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
        Send ACI/ACE Document to Driver
      </h1>

      <div style={{ backgroundColor: "white", borderRadius: "8px", padding: "1.5rem", boxShadow: "0 2px 8px rgba(0,0,0,0.05)", maxWidth: "500px" }}>
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

          {error && <p style={{ color: "#d32f2f", fontSize: "0.9rem", marginBottom: "1rem" }}>{error}</p>}
          {message && <p style={{ color: "#1a7d36", fontSize: "0.9rem", marginBottom: "1rem" }}>{message}</p>}

          <button
            type="submit"
            disabled={uploading}
            style={{ width: "100%", padding: "0.75rem", backgroundColor: "#1a56db", color: "white", border: "none", borderRadius: "4px", fontSize: "1rem", fontWeight: "600", cursor: "pointer" }}
          >
            {uploading ? "Uploading..." : "Send Document"}
          </button>
        </form>
      </div>
    </div>
  );
}
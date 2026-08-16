"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { auth, db } from "@/lib/firebase";

export default function BrandingPage() {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [companyId, setCompanyId] = useState(null);
  const [companyName, setCompanyName] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [saving, setSaving] = useState(false);
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

      setAuthorized(true);

      setCompanyId(userDoc.data().companyId);
      const currentUserData = userDoc.data();
      if (currentUserData.companyId) {
        const companyDoc = await getDoc(doc(db, "companies", currentUserData.companyId));
        if (companyDoc.exists()) {
          setCompanyName(companyDoc.data().name || "");
          setLogoUrl(companyDoc.data().logoUrl || "");
        }
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  const handleLogoChange = (file) => {
    if (!file) return;
    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setSaving(true);

    try {
      let finalLogoUrl = logoUrl;

      if (logoFile) {
        const storage = getStorage();
        const fileRef = ref(storage, `company/logo_${Date.now()}_${logoFile.name}`);
        await uploadBytes(fileRef, logoFile);
        finalLogoUrl = await getDownloadURL(fileRef);
      }

      await setDoc(doc(db, "companies", companyId), {
        name: companyName,
        logoUrl: finalLogoUrl,
        updatedAt: new Date().toISOString(),
      }, { merge: true });

      setLogoUrl(finalLogoUrl);
      setMessage("Company branding saved.");
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const inputStyle = { width: "100%", padding: "0.6rem", border: "1px solid #ccc", borderRadius: "4px", fontSize: "1rem", boxSizing: "border-box" };
  const labelStyle = { display: "block", marginBottom: "0.25rem", fontSize: "0.9rem", color: "#333", fontWeight: "500" };

  if (loading || !authorized) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f5f5f5", padding: "1.5rem" }}>
      <h1 style={{ fontSize: "1.5rem", fontWeight: "bold", marginBottom: "1.5rem", color: "#1a1a1a" }}>
        Company Branding
      </h1>

      <div style={{ backgroundColor: "white", borderRadius: "8px", padding: "1.5rem", boxShadow: "0 2px 8px rgba(0,0,0,0.05)", maxWidth: "500px" }}>
        <form onSubmit={handleSave}>
          <div style={{ marginBottom: "1rem" }}>
            <label style={labelStyle}>Company Name</label>
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              style={inputStyle}
            />
          </div>

          <div style={{ marginBottom: "1.5rem" }}>
            <label style={labelStyle}>Company Logo</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleLogoChange(e.target.files[0])}
              className="file-upload-btn"
            />
            {(logoPreview || logoUrl) && (
              <img
                src={logoPreview || logoUrl}
                alt="Logo preview"
                style={{ marginTop: "0.75rem", maxWidth: "200px", maxHeight: "100px", borderRadius: "4px", border: "1px solid #ccc" }}
              />
            )}
          </div>

          {error && <p style={{ color: "#d32f2f", fontSize: "0.9rem", marginBottom: "1rem" }}>{error}</p>}
          {message && <p style={{ color: "#1a7d36", fontSize: "0.9rem", marginBottom: "1rem" }}>{message}</p>}

          <button
            type="submit"
            disabled={saving}
            style={{ width: "100%", padding: "0.75rem", backgroundColor: "#1a56db", color: "white", border: "none", borderRadius: "4px", fontSize: "1rem", fontWeight: "600", cursor: "pointer" }}
          >
            {saving ? "Saving..." : "Save Branding"}
          </button>
        </form>
      </div>
    </div>
  );
}
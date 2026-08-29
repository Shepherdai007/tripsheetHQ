"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, collection } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

function generateInviteCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export default function CompanySignupPage() {
  const router = useRouter();
  const [companyName, setCompanyName] = useState("");
  const [adminName, setAdminName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [createdCode, setCreatedCode] = useState(null); // holds the invite code once created
  const [copied, setCopied] = useState(false);

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      const companyRef = doc(collection(db, "companies"));
      const companyId = companyRef.id;
      const inviteCode = generateInviteCode();

      await setDoc(companyRef, {
        name: companyName,
        inviteCode: inviteCode,
        ownerId: user.uid,
        createdAt: new Date().toISOString(),
      });

      await setDoc(doc(db, "users", user.uid), {
        name: adminName,
        email: email,
        role: "admin",
        companyId: companyId,
        createdAt: new Date().toISOString(),
      });

      // Show the code before navigating away - this is the only time
      // it's shown automatically, so don't skip straight to /admin.
      setCreatedCode(inviteCode);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCode = async () => {
    if (!createdCode) return;
    try {
      await navigator.clipboard.writeText(createdCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      // Clipboard API can fail on some browsers/permissions - fail silently,
      // the code is still visible on screen to copy manually.
    }
  };

  const inputStyle = {
    width: "100%",
    padding: "0.6rem",
    border: "1px solid rgba(255,255,255,0.4)",
    borderRadius: "8px",
    fontSize: "1rem",
    boxSizing: "border-box",
    background: "rgba(255,255,255,0.9)",
    color: "#1a1a1a",
  };
  const labelStyle = { display: "block", marginBottom: "0.25rem", fontSize: "0.9rem", color: "#f1f1f1" };

  // Success screen: shown right after the company + admin account are created
  if (createdCode) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundImage: "url('/images/signup-bg.jpg')",
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
            background: "linear-gradient(180deg, rgba(10,15,25,0.45) 0%, rgba(10,15,25,0.65) 100%)",
          }}
        />
        <div
          style={{
            position: "relative",
            background: "rgba(255,255,255,0.14)",
            backdropFilter: "blur(18px)",
            WebkitBackdropFilter: "blur(18px)",
            border: "1px solid rgba(255,255,255,0.25)",
            padding: "2.25rem",
            borderRadius: "16px",
            boxShadow: "0 8px 32px rgba(0,0,0,0.35)",
            width: "100%",
            maxWidth: "420px",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>✅</div>
          <h1 style={{ fontSize: "1.4rem", fontWeight: "bold", marginBottom: "0.5rem", color: "#ffffff", textShadow: "0 2px 8px rgba(0,0,0,0.5)" }}>
            {companyName} is ready!
          </h1>
          <p style={{ fontSize: "0.9rem", color: "#f1f1f1", marginBottom: "1.5rem", textShadow: "0 1px 4px rgba(0,0,0,0.5)" }}>
            Share this invite code with your drivers so they can join. You can find it again anytime in your admin panel.
          </p>

          <div
            style={{
              backgroundColor: "rgba(255,255,255,0.9)",
              border: "2px dashed #1a56db",
              borderRadius: "8px",
              padding: "1.25rem",
              marginBottom: "1rem",
            }}
          >
            <p style={{ fontSize: "0.8rem", color: "#666", marginBottom: "0.35rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Company Invite Code
            </p>
            <p style={{ fontSize: "2rem", fontWeight: "800", color: "#1a56db", letterSpacing: "0.1em", marginBottom: "0" }}>
              {createdCode}
            </p>
          </div>

          <button
            onClick={handleCopyCode}
            style={{
              width: "100%",
              padding: "0.65rem",
              backgroundColor: copied ? "#e6f4ea" : "rgba(255,255,255,0.9)",
              color: copied ? "#1a7d36" : "#333",
              border: "none",
              borderRadius: "6px",
              fontSize: "0.9rem",
              fontWeight: "600",
              cursor: "pointer",
              marginBottom: "1rem",
            }}
          >
            {copied ? "Copied!" : "Copy Code"}
          </button>

          <button
            onClick={() => router.push("/admin")}
            style={{
              width: "100%",
              padding: "0.75rem",
              backgroundColor: "#1a56db",
              color: "white",
              border: "none",
              borderRadius: "8px",
              fontSize: "1rem",
              fontWeight: "600",
              cursor: "pointer",
              boxShadow: "0 4px 14px rgba(26,86,219,0.5)",
            }}
          >
            Continue to Admin Panel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundImage: "url('/images/signup-bg.jpg')",
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
          background: "linear-gradient(180deg, rgba(10,15,25,0.45) 0%, rgba(10,15,25,0.65) 100%)",
        }}
      />
      <div
        style={{
          position: "relative",
          background: "rgba(255,255,255,0.14)",
          backdropFilter: "blur(18px)",
          WebkitBackdropFilter: "blur(18px)",
          border: "1px solid rgba(255,255,255,0.25)",
          padding: "2.25rem",
          borderRadius: "16px",
          boxShadow: "0 8px 32px rgba(0,0,0,0.35)",
          width: "100%",
          maxWidth: "420px",
        }}
      >
        <h1 style={{ fontSize: "1.6rem", fontWeight: "bold", marginBottom: "0.35rem", color: "#ffffff", textShadow: "0 2px 8px rgba(0,0,0,0.5)" }}>
          Set up your company
        </h1>
        <p style={{ fontSize: "0.9rem", color: "#f1f1f1", marginBottom: "1.5rem", textShadow: "0 1px 4px rgba(0,0,0,0.5)" }}>
          You&apos;ll get a unique invite code to share with your drivers.
        </p>

        <form onSubmit={handleSignup}>
          <div style={{ marginBottom: "1rem" }}>
            <label style={labelStyle}>Company Name</label>
            <input type="text" value={companyName} onChange={(e) => setCompanyName(e.target.value)} required style={inputStyle} />
          </div>

          <div style={{ marginBottom: "1rem" }}>
            <label style={labelStyle}>Your Full Name</label>
            <input type="text" value={adminName} onChange={(e) => setAdminName(e.target.value)} required style={inputStyle} />
          </div>

          <div style={{ marginBottom: "1rem" }}>
            <label style={labelStyle}>Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required style={inputStyle} />
          </div>

          <div style={{ marginBottom: "1.5rem" }}>
            <label style={labelStyle}>Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} style={inputStyle} />
          </div>

          {error && <p style={{ color: "#ffb4b4", fontSize: "0.9rem", marginBottom: "1rem", textShadow: "0 1px 4px rgba(0,0,0,0.5)" }}>{error}</p>}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "0.75rem",
              backgroundColor: "#1a56db",
              color: "white",
              border: "none",
              borderRadius: "8px",
              fontSize: "1rem",
              fontWeight: "600",
              cursor: "pointer",
              boxShadow: "0 4px 14px rgba(26,86,219,0.5)",
            }}
          >
            {loading ? "Setting up..." : "Create Company"}
          </button>
        </form>
      </div>
    </div>
  );
}
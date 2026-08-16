"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, collection, query, where, getDocs } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const codeQuery = query(
        collection(db, "companies"),
        where("inviteCode", "==", inviteCode.trim().toUpperCase())
      );
      const codeSnap = await getDocs(codeQuery);

      if (codeSnap.empty) {
        setError("Invalid invite code. Check with your dispatcher.");
        setLoading(false);
        return;
      }

      const companyDoc = codeSnap.docs[0];
      const companyId = companyDoc.id;

      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await setDoc(doc(db, "users", user.uid), {
        name: name,
        email: email,
        role: "driver",
        companyId: companyId,
        createdAt: new Date().toISOString(),
      });

      router.push("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
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
      {/* darken the photo a touch so the glass card and text stay readable */}
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
          maxWidth: "400px",
        }}
      >
        <h1
          style={{
            fontSize: "1.6rem",
            fontWeight: "bold",
            marginBottom: "1.5rem",
            color: "#ffffff",
            textShadow: "0 2px 8px rgba(0,0,0,0.5)",
          }}
        >
          Join your company on TripSheetHQ
        </h1>

        <form onSubmit={handleSignup}>
          <div style={{ marginBottom: "1rem" }}>
            <label style={labelStyle}>Company Invite Code</label>
            <input
              type="text"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value)}
              required
              placeholder="e.g. ABC123"
              style={{ ...inputStyle, textTransform: "uppercase" }}
            />
          </div>

          <div style={{ marginBottom: "1rem" }}>
            <label style={labelStyle}>Full Name</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} required style={inputStyle} />
          </div>

          <div style={{ marginBottom: "1rem" }}>
            <label style={labelStyle}>Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required style={inputStyle} />
          </div>

          <div style={{ marginBottom: "1.5rem" }}>
            <label style={labelStyle}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              style={inputStyle}
            />
          </div>

          {error && (
            <p style={{ color: "#ffb4b4", fontSize: "0.9rem", marginBottom: "1rem", textShadow: "0 1px 4px rgba(0,0,0,0.5)" }}>
              {error}
            </p>
          )}

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
            {loading ? "Joining..." : "Join Company"}
          </button>
        </form>

        <p style={{ textAlign: "center", marginTop: "1.5rem", fontSize: "0.9rem", color: "#f1f1f1", textShadow: "0 1px 4px rgba(0,0,0,0.5)" }}>
          Setting up a new company?{" "}
          <Link href="/signup/company" style={{ color: "#bfdbfe", fontWeight: "600", textDecoration: "none" }}>
            Create one here
          </Link>
        </p>
      </div>
    </div>
  );
}

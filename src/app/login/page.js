"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signInWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
import { auth } from "@/lib/firebase";

export default function LoginPage() {
  const router = useRouter();

  // Branding is shown per-company after login now, not on the shared login screen.

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resetMessage, setResetMessage] = useState("");
  const [resetLoading, setResetLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setResetMessage("");
    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/dashboard");
    } catch (err) {
      setError("Incorrect email or password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    setError("");
    setResetMessage("");

    if (!email) {
      setError("Enter your email above first, then click 'Forgot password'.");
      return;
    }

    setResetLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      setResetMessage("Password reset email sent. Check your inbox.");
    } catch (err) {
      setError("Could not send reset email. Check that the email is correct.");
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundImage: "url('/images/login-bg.jpg')",
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
          Log in to TripSheetHQ
        </h1>

        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: "1rem" }}>
            <label style={{ display: "block", marginBottom: "0.25rem", fontSize: "0.9rem", color: "#f1f1f1" }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                width: "100%",
                padding: "0.6rem",
                border: "1px solid rgba(255,255,255,0.4)",
                borderRadius: "8px",
                fontSize: "1rem",
                boxSizing: "border-box",
                background: "rgba(255,255,255,0.9)",
                color: "#1a1a1a",
              }}
            />
          </div>

          <div style={{ marginBottom: "0.5rem" }}>
            <label style={{ display: "block", marginBottom: "0.25rem", fontSize: "0.9rem", color: "#f1f1f1" }}>
              Password
            </label>
            <div style={{ position: "relative" }}>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{
                  width: "100%",
                  padding: "0.6rem",
                  paddingRight: "3.5rem",
                  border: "1px solid rgba(255,255,255,0.4)",
                  borderRadius: "8px",
                  fontSize: "1rem",
                  boxSizing: "border-box",
                  background: "rgba(255,255,255,0.9)",
                  color: "#1a1a1a",
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: "absolute",
                  right: "0.6rem",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  color: "#1a56db",
                  fontSize: "0.85rem",
                  cursor: "pointer",
                  fontWeight: "600",
                }}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          <div style={{ marginBottom: "1.5rem", textAlign: "right" }}>
            <button
              type="button"
              onClick={handleForgotPassword}
              disabled={resetLoading}
              style={{
                background: "none",
                border: "none",
                color: "#bfdbfe",
                fontSize: "0.85rem",
                cursor: "pointer",
                padding: 0,
                textShadow: "0 1px 4px rgba(0,0,0,0.5)",
              }}
            >
              {resetLoading ? "Sending..." : "Forgot password?"}
            </button>
          </div>

          {error && (
            <p style={{ color: "#ffb4b4", fontSize: "0.9rem", marginBottom: "1rem", textShadow: "0 1px 4px rgba(0,0,0,0.5)" }}>
              {error}
            </p>
          )}

          {resetMessage && (
            <p style={{ color: "#9dffb0", fontSize: "0.9rem", marginBottom: "1rem", textShadow: "0 1px 4px rgba(0,0,0,0.5)" }}>
              {resetMessage}
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
            {loading ? "Logging in..." : "Log In"}
          </button>
        </form>

        <p style={{ textAlign: "center", marginTop: "1.5rem", fontSize: "0.9rem", color: "#f1f1f1", textShadow: "0 1px 4px rgba(0,0,0,0.5)" }}>
          Don&apos;t have an account?{" "}
          <Link href="/signup" style={{ color: "#bfdbfe", fontWeight: "600", textDecoration: "none" }}>
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}

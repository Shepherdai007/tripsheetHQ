"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc, collection, query, where, getDocs, addDoc, orderBy, updateDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import MessagesNavLink from "@/components/MessagesNavLink";
import TimeOffNavLink from "@/components/TimeOffNavLink";

export default function AdminMessagesPage() {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [myCompanyId, setMyCompanyId] = useState(null);
  const [drivers, setDrivers] = useState([]);
  const [selectedDriver, setSelectedDriver] = useState("");
  const [messageText, setMessageText] = useState("");
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [sentMessages, setSentMessages] = useState([]);
  const composerRef = useRef(null);
  const textareaRef = useRef(null);

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

      await loadSentMessages(companyIdValue);

      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/login");
  };

  const loadSentMessages = async (companyIdParam) => {
    try {
      const cId = companyIdParam || myCompanyId;
      const msgQuery = query(
        collection(db, "messages"),
        where("companyId", "==", cId),
        orderBy("createdAt", "desc")
      );
      const msgSnap = await getDocs(msgQuery);
      const msgList = msgSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setSentMessages(msgList);
    } catch (err) {
      console.error("Error loading messages:", err);
    }
  };

  // Clicking "New" on a driver's reply jumps you to the composer with
  // that driver preselected, and marks their unread replies as seen -
  // the red flag stays up until you actually act on it, not just on
  // page view, so it doesn't disappear before you notice it.
  const handleReplyClick = async (driverId) => {
    setSelectedDriver(driverId);
    composerRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    textareaRef.current?.focus();

    const unseen = sentMessages.filter(
      (m) => m.driverId === driverId && m.senderRole === "driver" && !m.adminReadAt
    );
    if (unseen.length === 0) return;
    const now = new Date().toISOString();
    setSentMessages((prev) =>
      prev.map((m) => (unseen.find((u) => u.id === m.id) ? { ...m, adminReadAt: now } : m))
    );
    try {
      await Promise.all(unseen.map((m) => updateDoc(doc(db, "messages", m.id), { adminReadAt: now })));
    } catch (err) {
      console.error("Error marking messages read:", err);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!selectedDriver || !messageText.trim()) {
      setError("Select a driver and write a message.");
      return;
    }

    setSending(true);
    try {
      const driverInfo = drivers.find((d) => d.id === selectedDriver);

      await addDoc(collection(db, "messages"), {
        driverId: selectedDriver,
        driverName: driverInfo?.name || "",
        companyId: myCompanyId,
        text: messageText.trim(),
        senderRole: "admin",
        createdAt: new Date().toISOString(),
      });

      // Push a notification to the driver's device if they've enabled them.
      // This is best-effort - if it fails (no token, device unreachable, etc.)
      // the message itself has already been saved, so we don't block on it.
      if (driverInfo?.fcmToken) {
        try {
          await fetch("/api/send-notification", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              token: driverInfo.fcmToken,
              title: "New message",
              body: messageText.trim(),
            }),
          });
        } catch (notifyErr) {
          console.error("Push notification failed:", notifyErr);
        }
      }

      setMessage(`Message sent to ${driverInfo?.name || "driver"}.`);
      setMessageText("");
      setSelectedDriver("");
      await loadSentMessages();
    } catch (err) {
      setError(err.message);
    } finally {
      setSending(false);
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
            <button style={navButtonStyle} onClick={() => router.push("/admin/documents")}>
              Documents
            </button>
            <MessagesNavLink router={router} active={true} />
            <TimeOffNavLink router={router} active={false} />
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
          Message a Driver
        </h1>

        <div
          ref={composerRef}
          style={{
            background: "rgba(255,255,255,0.14)",
            backdropFilter: "blur(18px)",
            WebkitBackdropFilter: "blur(18px)",
            border: "1px solid rgba(255,255,255,0.25)",
            borderRadius: "12px",
            padding: "1.5rem",
            boxShadow: "0 8px 32px rgba(0,0,0,0.35)",
            maxWidth: "500px",
            marginBottom: "1.5rem",
          }}
        >
          <form onSubmit={handleSend}>
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

            <div style={{ marginBottom: "1.5rem" }}>
              <label style={labelStyle}>Message</label>
              <textarea
                ref={textareaRef}
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                rows={4}
                style={inputStyle}
                placeholder="e.g. Pickup delayed 2 hours, new ETA 4pm"
              />
            </div>

            {error && <p style={{ color: "#ffb4b4", fontSize: "0.9rem", marginBottom: "1rem", textShadow: "0 1px 4px rgba(0,0,0,0.5)" }}>{error}</p>}
            {message && <p style={{ color: "#9dffb0", fontSize: "0.9rem", marginBottom: "1rem", textShadow: "0 1px 4px rgba(0,0,0,0.5)" }}>{message}</p>}

            <button
              type="submit"
              disabled={sending}
              style={{ width: "100%", padding: "0.75rem", backgroundColor: "#1a56db", color: "white", border: "none", borderRadius: "6px", fontSize: "1rem", fontWeight: "600", cursor: "pointer", boxShadow: "0 4px 14px rgba(26,86,219,0.5)" }}
            >
              {sending ? "Sending..." : "Send Message"}
            </button>
          </form>
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
            maxWidth: "500px",
          }}
        >
          <h2 style={{ fontSize: "1rem", fontWeight: "600", marginBottom: "1rem", color: "#ffffff", textShadow: "0 1px 4px rgba(0,0,0,0.5)", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            Recent Messages
            {sentMessages.some((m) => m.senderRole === "driver" && !m.adminReadAt) && (
              <span style={{ width: "10px", height: "10px", borderRadius: "50%", backgroundColor: "#ef4444", display: "inline-block" }} />
            )}
          </h2>
          {sentMessages.length === 0 ? (
            <p style={{ color: "#f1f1f1", fontSize: "0.9rem" }}>No messages sent yet.</p>
          ) : (
            sentMessages.map((msg) => {
              const fromDriver = msg.senderRole === "driver";
              const unread = fromDriver && !msg.adminReadAt;
              return (
              <div
                key={msg.id}
                style={{
                  padding: "0.75rem 0.75rem",
                  marginBottom: "0.25rem",
                  borderBottom: "1px solid rgba(255,255,255,0.25)",
                  borderLeft: unread ? "4px solid #ef4444" : "4px solid transparent",
                  backgroundColor: unread ? "rgba(239,68,68,0.12)" : "transparent",
                  borderRadius: "6px",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <p style={{ fontSize: "0.85rem", fontWeight: "600", color: "#ffffff", textShadow: "0 1px 4px rgba(0,0,0,0.5)" }}>{msg.driverName}</p>
                  {fromDriver ? (
                    <button
                      onClick={() => handleReplyClick(msg.driverId)}
                      style={{
                        fontSize: "0.75rem",
                        padding: "0.15rem 0.6rem",
                        borderRadius: "10px",
                        border: "none",
                        cursor: "pointer",
                        backgroundColor: unread ? "#ef4444" : "#dbeafe",
                        color: unread ? "#ffffff" : "#1a56db",
                        fontWeight: "700",
                      }}
                    >
                      {unread ? "New — Reply" : "Reply"}
                    </button>
                  ) : (
                    <span style={{ fontSize: "0.75rem", padding: "0.15rem 0.5rem", borderRadius: "10px", backgroundColor: msg.readAt ? "#e6f4ea" : "#fef3e0", color: msg.readAt ? "#1a7d36" : "#b26a00", fontWeight: "600" }}>
                      {msg.readAt ? "Read" : "Delivered"}
                    </span>
                  )}
                </div>
                <p style={{ fontSize: "0.9rem", color: "#f1f1f1", textShadow: "0 1px 4px rgba(0,0,0,0.5)", fontWeight: unread ? "600" : "400" }}>
                  {msg.text}
                </p>
              </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
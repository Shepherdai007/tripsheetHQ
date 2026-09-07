"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, deleteDoc, updateDoc, addDoc, collection, query, where, getDocs } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import BillingGate from "@/components/BillingGate";

export default function MessagesPage() {
  const router = useRouter();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [myName, setMyName] = useState("");
  const [myCompanyId, setMyCompanyId] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const loadMessages = async (userId) => {
    const msgQuery = query(collection(db, "messages"), where("driverId", "==", userId));
    const msgSnap = await getDocs(msgQuery);
    const msgList = msgSnap.docs
      .map((d) => ({ id: d.id, ...d.data() }))
      .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    setMessages(msgList);

    // Only mark messages from dispatch as read - a driver's own sent
    // replies don't need a "readAt" (that field tracks whether the
    // driver has seen dispatch's message, not the other way around).
    const unread = msgList.filter((m) => m.senderRole !== "driver" && !m.readAt);
    for (const msg of unread) {
      await updateDoc(doc(db, "messages", msg.id), { readAt: new Date().toISOString() });
    }
    if (unread.length > 0) {
      setMessages((prev) =>
        prev.map((m) => (unread.find((u) => u.id === m.id) ? { ...m, readAt: new Date().toISOString() } : m))
      );
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push("/login");
        return;
      }
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (userDoc.exists()) {
        setMyName(userDoc.data().name || "");
        setMyCompanyId(userDoc.data().companyId || null);
      }
      await loadMessages(user.uid);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [router]);

  const handleDelete = async (msgId) => {
    const confirmed = window.confirm("Delete this message?");
    if (!confirmed) return;
    await deleteDoc(doc(db, "messages", msgId));
    setMessages(messages.filter((m) => m.id !== msgId));
  };

  const handleClearHistory = async () => {
    const confirmed = window.confirm("Delete your entire message history with dispatch? This can't be undone.");
    if (!confirmed || !auth.currentUser) return;

    try {
      await Promise.all(messages.map((msg) => deleteDoc(doc(db, "messages", msg.id))));
      setMessages([]);
    } catch (err) {
      setError(err.message);
    }
  };

  const notifyAdmins = async (companyIdValue, text) => {
    try {
      const adminsQuery = query(
        collection(db, "users"),
        where("role", "==", "admin"),
        where("companyId", "==", companyIdValue)
      );
      const adminsSnap = await getDocs(adminsQuery);
      const admins = adminsSnap.docs.map((d) => d.data());

      await Promise.all(
        admins
          .filter((a) => a.fcmToken)
          .map((a) =>
            fetch("/api/send-notification", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                token: a.fcmToken,
                title: `Message from ${myName || "driver"}`,
                body: text,
              }),
            }).catch((err) => console.error("Push notification failed:", err))
          )
      );
    } catch (err) {
      console.error("Error notifying admins:", err);
    }
  };

  const handleReplySend = async (e) => {
    e.preventDefault();
    setError("");

    if (!replyText.trim() || !auth.currentUser) return;

    setSending(true);
    try {
      const text = replyText.trim();

      await addDoc(collection(db, "messages"), {
        driverId: auth.currentUser.uid,
        driverName: myName,
        companyId: myCompanyId,
        text,
        senderRole: "driver",
        createdAt: new Date().toISOString(),
      });

      setReplyText("");
      await loadMessages(auth.currentUser.uid);

      if (myCompanyId) {
        await notifyAdmins(myCompanyId, text);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  };

  const formatDateTime = (isoString) => {
    if (!isoString) return "";
    const d = new Date(isoString);
    return d.toLocaleDateString(undefined, { month: "short", day: "numeric" }) + " · " +
      d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
  };

  if (loading) {
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
        backgroundImage: "url('/images/driver-messages-bg.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
        position: "relative",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundColor: "rgba(0,0,0,0.45)",
        }}
      />

      <div style={{ position: "relative", zIndex: 1, padding: "1.5rem" }}>
        <button
          onClick={() => router.push("/dashboard")}
          style={{
            background: "none",
            border: "none",
            color: "#93c5fd",
            fontSize: "0.9rem",
            fontWeight: "600",
            cursor: "pointer",
            marginBottom: "1rem",
            padding: 0,
            textShadow: "0 1px 4px rgba(0,0,0,0.6)",
          }}
        >
          ← Back to dashboard
        </button>

        <h1
          style={{
            fontSize: "1.6rem",
            fontWeight: "bold",
            marginBottom: "1.5rem",
            color: "#ffffff",
            textShadow: "0 2px 8px rgba(0,0,0,0.6)",
          }}
        >
          Messages
        </h1>

        {messages.length > 0 && (
          <button
            onClick={handleClearHistory}
            style={{
              background: "none",
              border: "1px solid rgba(255,107,107,0.6)",
              color: "#ff6b6b",
              fontSize: "0.8rem",
              fontWeight: "600",
              cursor: "pointer",
              padding: "0.35rem 0.7rem",
              borderRadius: "6px",
              marginBottom: "1rem",
            }}
          >
            Clear History
          </button>
        )}

        {messages.length === 0 ? (
          <div
            style={{
              backgroundColor: "rgba(20,20,20,0.55)",
              backdropFilter: "blur(6px)",
              borderRadius: "8px",
              padding: "1.5rem",
              boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
              border: "1px solid rgba(255,255,255,0.15)",
            }}
          >
            <p style={{ color: "#ddd" }}>No messages yet.</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginBottom: "1.5rem" }}>
            {messages.map((msg) => {
              const fromDriver = msg.senderRole === "driver";
              return (
              <div
                key={msg.id}
                style={{
                  backgroundColor: fromDriver ? "rgba(37,99,235,0.35)" : "rgba(20,20,20,0.55)",
                  backdropFilter: "blur(6px)",
                  borderRadius: "8px",
                  padding: "1rem 1.25rem",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
                  border: "1px solid rgba(255,255,255,0.15)",
                  borderLeft: fromDriver || msg.readAt ? "4px solid transparent" : "4px solid #60a5fa",
                  marginLeft: fromDriver ? "1.5rem" : 0,
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.5rem" }}>
                  <span style={{ fontSize: "0.8rem", color: "#ccc" }}>
                    {fromDriver ? "You" : "Dispatch"} · {formatDateTime(msg.createdAt)}
                  </span>
                  <button
                    onClick={() => handleDelete(msg.id)}
                    style={{ background: "none", border: "none", color: "#ff6b6b", fontSize: "0.8rem", fontWeight: "600", cursor: "pointer", padding: 0 }}
                  >
                    Delete
                  </button>
                </div>
                <p style={{ fontSize: "0.95rem", color: "#ffffff", fontWeight: !fromDriver && !msg.readAt ? "600" : "400" }}>
                  {msg.text}
                </p>
                {msg.fileUrl && (
                  <a
                    href={msg.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: "inline-block",
                      marginTop: "0.6rem",
                      fontSize: "0.85rem",
                      color: "#93c5fd",
                      fontWeight: "600",
                      textDecoration: "underline",
                    }}
                  >
                    📎 {msg.fileName || "View attachment"}
                  </a>
                )}
              </div>
              );
            })}
          </div>
        )}

        <BillingGate>
        <form
          onSubmit={handleReplySend}
          style={{
            backgroundColor: "rgba(20,20,20,0.55)",
            backdropFilter: "blur(6px)",
            borderRadius: "8px",
            padding: "1rem 1.25rem",
            boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
            border: "1px solid rgba(255,255,255,0.15)",
          }}
        >
          <label style={{ display: "block", marginBottom: "0.4rem", fontSize: "0.85rem", color: "#ddd" }}>
            Reply to dispatch
          </label>
          <textarea
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            rows={3}
            placeholder="Type a message..."
            style={{
              width: "100%",
              padding: "0.6rem",
              border: "1px solid rgba(255,255,255,0.3)",
              borderRadius: "8px",
              fontSize: "0.95rem",
              boxSizing: "border-box",
              background: "rgba(255,255,255,0.92)",
              color: "#1a1a1a",
              marginBottom: "0.75rem",
              resize: "vertical",
            }}
          />
          {error && <p style={{ color: "#ff9b9b", fontSize: "0.85rem", marginBottom: "0.75rem" }}>{error}</p>}
          <button
            type="submit"
            disabled={sending || !replyText.trim()}
            style={{
              width: "100%",
              padding: "0.7rem",
              backgroundColor: "#2563eb",
              color: "white",
              border: "none",
              borderRadius: "6px",
              fontSize: "0.95rem",
              fontWeight: "600",
              cursor: sending ? "default" : "pointer",
              opacity: sending || !replyText.trim() ? 0.7 : 1,
            }}
          >
            {sending ? "Sending..." : "Send"}
          </button>
        </form>
        </BillingGate>
      </div>
    </div>
  );
}
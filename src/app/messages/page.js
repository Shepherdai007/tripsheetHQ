"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, deleteDoc, updateDoc, addDoc, collection, query, where, getDocs } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

export default function MessagesPage() {
  const router = useRouter();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [companyId, setCompanyId] = useState(null);
  const [driverName, setDriverName] = useState("");
  const [replyText, setReplyText] = useState("");
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState("");

  const loadMessages = async (userId) => {
    const msgQuery = query(collection(db, "messages"), where("driverId", "==", userId));
    const msgSnap = await getDocs(msgQuery);
    const msgList = msgSnap.docs
      .map((d) => ({ id: d.id, ...d.data() }))
      .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    setMessages(msgList);

    // Only auto-mark admin-sent messages as read on open. Docs written before
    // senderRole existed have no senderRole field, so treat missing senderRole
    // as "admin" for backwards compatibility. Never mark the driver's own
    // replies as read here.
    const unread = msgList.filter((m) => !m.readAt && m.senderRole !== "driver");
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
        setCompanyId(userDoc.data().companyId || null);
        setDriverName(userDoc.data().name || "");
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

  const handleSendReply = async (e) => {
    e.preventDefault();
    setSendError("");

    const text = replyText.trim();
    if (!text) return;

    const user = auth.currentUser;
    if (!user) return;

    setSending(true);
    try {
      const newMsgData = {
        driverId: user.uid,
        driverName,
        companyId,
        text,
        createdAt: new Date().toISOString(),
        senderRole: "driver",
      };
      const docRef = await addDoc(collection(db, "messages"), newMsgData);
      setMessages((prev) => [...prev, { id: docRef.id, ...newMsgData }]);
      setReplyText("");
    } catch (err) {
      setSendError(err.message);
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

      <div style={{ position: "relative", zIndex: 1, padding: "1.5rem", display: "flex", flexDirection: "column", minHeight: "100vh" }}>
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

        <div style={{ flex: 1, overflowY: "auto", marginBottom: "1rem" }}>
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
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {messages.map((msg) => {
                const isMine = msg.senderRole === "driver";
                return (
                  <div
                    key={msg.id}
                    style={{
                      alignSelf: isMine ? "flex-end" : "flex-start",
                      maxWidth: "85%",
                      backgroundColor: isMine ? "rgba(26,86,219,0.55)" : "rgba(20,20,20,0.55)",
                      backdropFilter: "blur(6px)",
                      borderRadius: "8px",
                      padding: "1rem 1.25rem",
                      boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
                      border: "1px solid rgba(255,255,255,0.15)",
                      borderLeft: !isMine ? (msg.readAt ? "4px solid transparent" : "4px solid #60a5fa") : "none",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.5rem", gap: "1rem" }}>
                      <span style={{ fontSize: "0.8rem", color: "#ccc" }}>
                        {isMine ? "You" : "Dispatch"} · {formatDateTime(msg.createdAt)}
                      </span>
                      <button
                        onClick={() => handleDelete(msg.id)}
                        style={{ background: "none", border: "none", color: "#ff6b6b", fontSize: "0.8rem", fontWeight: "600", cursor: "pointer", padding: 0 }}
                      >
                        Delete
                      </button>
                    </div>
                    <p style={{ fontSize: "0.95rem", color: "#ffffff", fontWeight: !isMine && !msg.readAt ? "600" : "400" }}>
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
        </div>

        <form
          onSubmit={handleSendReply}
          style={{
            display: "flex",
            gap: "0.5rem",
            backgroundColor: "rgba(20,20,20,0.55)",
            backdropFilter: "blur(6px)",
            borderRadius: "8px",
            padding: "0.75rem",
            border: "1px solid rgba(255,255,255,0.15)",
          }}
        >
          <input
            type="text"
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder="Type a reply..."
            style={{
              flex: 1,
              padding: "0.6rem 0.75rem",
              borderRadius: "6px",
              border: "1px solid rgba(255,255,255,0.3)",
              background: "rgba(255,255,255,0.9)",
              color: "#1a1a1a",
              fontSize: "0.95rem",
            }}
          />
          <button
            type="submit"
            disabled={sending || !replyText.trim()}
            style={{
              padding: "0.6rem 1.25rem",
              backgroundColor: "#1a56db",
              color: "white",
              border: "none",
              borderRadius: "6px",
              fontSize: "0.95rem",
              fontWeight: "600",
              cursor: sending || !replyText.trim() ? "default" : "pointer",
              opacity: sending || !replyText.trim() ? 0.6 : 1,
            }}
          >
            {sending ? "..." : "Send"}
          </button>
        </form>
        {sendError && <p style={{ color: "#ffb4b4", fontSize: "0.85rem", marginTop: "0.5rem" }}>{sendError}</p>}
      </div>
    </div>
  );
}
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { doc, deleteDoc, updateDoc, collection, query, where, getDocs } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

export default function MessagesPage() {
  const router = useRouter();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadMessages = async (userId) => {
    const msgQuery = query(collection(db, "messages"), where("driverId", "==", userId));
    const msgSnap = await getDocs(msgQuery);
    const msgList = msgSnap.docs
      .map((d) => ({ id: d.id, ...d.data() }))
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    setMessages(msgList);

    const unread = msgList.filter((m) => !m.readAt);
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
    <div style={{ minHeight: "100vh", backgroundColor: "#f5f5f5", padding: "1.5rem" }}>
      <button
        onClick={() => router.push("/dashboard")}
        style={{ background: "none", border: "none", color: "#1a56db", fontSize: "0.9rem", fontWeight: "600", cursor: "pointer", marginBottom: "1rem", padding: 0 }}
      >
        ← Back to dashboard
      </button>

      <h1 style={{ fontSize: "1.4rem", fontWeight: "bold", marginBottom: "1.5rem", color: "#1a1a1a" }}>
        Messages
      </h1>

      {messages.length === 0 ? (
        <div style={{ backgroundColor: "white", borderRadius: "8px", padding: "1.5rem", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
          <p style={{ color: "#666" }}>No messages yet.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {messages.map((msg) => (
            <div
              key={msg.id}
              style={{
                backgroundColor: "white",
                borderRadius: "8px",
                padding: "1rem 1.25rem",
                boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                borderLeft: msg.readAt ? "4px solid transparent" : "4px solid #1a56db",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.5rem" }}>
                <span style={{ fontSize: "0.8rem", color: "#999" }}>{formatDateTime(msg.createdAt)}</span>
                <button
                  onClick={() => handleDelete(msg.id)}
                  style={{ background: "none", border: "none", color: "#d32f2f", fontSize: "0.8rem", fontWeight: "600", cursor: "pointer", padding: 0 }}
                >
                  Delete
                </button>
              </div>
              <p style={{ fontSize: "0.95rem", color: "#1a1a1a", fontWeight: msg.readAt ? "400" : "600" }}>
                {msg.text}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc, collection, query, where, getDocs, addDoc, orderBy } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { auth, db } from "@/lib/firebase";

export default function AdminMessagesPage() {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [myCompanyId, setMyCompanyId] = useState(null);
  const [drivers, setDrivers] = useState([]);
  const [selectedDriver, setSelectedDriver] = useState("");
  const [messageText, setMessageText] = useState("");
  const [attachedFile, setAttachedFile] = useState(null);
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [sentMessages, setSentMessages] = useState([]);

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

      let fileUrl = "";
      let fileName = "";

      if (attachedFile) {
        const storage = getStorage();
        const fileRef = ref(storage, `message-attachments/${selectedDriver}/${Date.now()}_${attachedFile.name}`);
        await uploadBytes(fileRef, attachedFile);
        fileUrl = await getDownloadURL(fileRef);
        fileName = attachedFile.name;
      }

      await addDoc(collection(db, "messages"), {
        driverId: selectedDriver,
        driverName: driverInfo?.name || "",
        companyId: myCompanyId,
        text: messageText.trim(),
        fileUrl: fileUrl,
        fileName: fileName,
        createdAt: new Date().toISOString(),
      });

      setMessage(`Message sent to ${driverInfo?.name || "driver"}.`);
      setMessageText("");
      setSelectedDriver("");
      setAttachedFile(null);
      await loadSentMessages();
    } catch (err) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  };

  const inputStyle = {
    width: "100%",
    padding: "0.6rem",
    border: "1px solid rgba(255,255,255,0.3)",
    borderRadius: "4px",
    fontSize: "1rem",
    boxSizing: "border-box",
    backgroundColor: "rgba(255,255,255,0.9)",
  };
  const labelStyle = {
    display: "block",
    marginBottom: "0.25rem",
    fontSize: "0.9rem",
    color: "#f0f0f0",
    fontWeight: "500",
  };
  const navButtonStyle = {
    padding: "0.5rem 1rem",
    backgroundColor: "rgba(255,255,255,0.9)",
    border: "1px solid rgba(255,255,255,0.4)",
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
        backgroundImage: "url('/images/messages-bg.jpg')",
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
              backgroundColor: "rgba(255,255,255,0.9)",
              border: "1px solid rgba(255,255,255,0.4)",
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

        <h1
          style={{
            fontSize: "1.75rem",
            fontWeight: "bold",
            marginBottom: "1.5rem",
            color: "#ffffff",
            textShadow: "0 2px 8px rgba(0,0,0,0.6)",
          }}
        >
          Message a Driver
        </h1>

        <div
          style={{
            backgroundColor: "rgba(20,20,20,0.55)",
            backdropFilter: "blur(6px)",
            borderRadius: "8px",
            padding: "1.5rem",
            boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
            maxWidth: "500px",
            marginBottom: "1.5rem",
            border: "1px solid rgba(255,255,255,0.15)",
          }}
        >
          <form onSubmit={handleSend}>
            <div style={{ marginBottom: "1rem" }}>
              <label style={labelStyle}>Driver</label>
              <select
                value={selectedDriver}
                onChange={(e) => setSelectedDriver(e.target.value)}
                style={inputStyle}
              >
                <option value="">Select a driver...</option>
                {drivers.map((driver) => (
                  <option key={driver.id} value={driver.id}>
                    {driver.name} ({driver.email})
                  </option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: "1rem" }}>
              <label style={labelStyle}>Message</label>
              <textarea
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                rows={4}
                style={inputStyle}
                placeholder="e.g. Pickup delayed 2 hours, new ETA 4pm"
              />
            </div>

            <div style={{ marginBottom: "1.5rem" }}>
              <label style={labelStyle}>Attach a file (optional)</label>
              <input
                type="file"
                onChange={(e) => setAttachedFile(e.target.files[0])}
                className="file-upload-btn"
              />
              {attachedFile && (
                <p style={{ fontSize: "0.8rem", color: "#ddd", marginTop: "0.4rem" }}>
                  Selected: {attachedFile.name}
                </p>
              )}
            </div>

            {error && <p style={{ color: "#ff6b6b", fontSize: "0.9rem", marginBottom: "1rem" }}>{error}</p>}
            {message && <p style={{ color: "#4ade80", fontSize: "0.9rem", marginBottom: "1rem" }}>{message}</p>}

            <button
              type="submit"
              disabled={sending}
              style={{
                width: "100%",
                padding: "0.75rem",
                backgroundColor: "#1a56db",
                color: "white",
                border: "none",
                borderRadius: "4px",
                fontSize: "1rem",
                fontWeight: "600",
                cursor: "pointer",
              }}
            >
              {sending ? "Sending..." : "Send Message"}
            </button>
          </form>
        </div>

        <div
          style={{
            backgroundColor: "rgba(20,20,20,0.55)",
            backdropFilter: "blur(6px)",
            borderRadius: "8px",
            padding: "1.5rem",
            boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
            maxWidth: "500px",
            border: "1px solid rgba(255,255,255,0.15)",
          }}
        >
          <h2 style={{ fontSize: "1rem", fontWeight: "600", marginBottom: "1rem", color: "#ffffff" }}>
            Recent Messages
          </h2>
          {sentMessages.length === 0 ? (
            <p style={{ color: "#ddd", fontSize: "0.9rem" }}>No messages sent yet.</p>
          ) : (
            sentMessages.map((msg) => (
              <div
                key={msg.id}
                style={{
                  padding: "0.75rem 0",
                  borderBottom: "1px solid rgba(255,255,255,0.15)",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <p style={{ fontSize: "0.85rem", fontWeight: "600", color: "#ffffff" }}>{msg.driverName}</p>
                  <span
                    style={{
                      fontSize: "0.75rem",
                      padding: "0.15rem 0.5rem",
                      borderRadius: "10px",
                      backgroundColor: msg.readAt ? "#e6f4ea" : "#fef3e0",
                      color: msg.readAt ? "#1a7d36" : "#b26a00",
                      fontWeight: "600",
                    }}
                  >
                    {msg.readAt ? "Read" : "Delivered"}
                  </span>
                </div>
                <p style={{ fontSize: "0.9rem", color: "#eee" }}>{msg.text}</p>
                {msg.fileUrl && (
                  <a
                    href={msg.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ fontSize: "0.8rem", color: "#93c5fd", textDecoration: "underline" }}
                  >
                    📎 {msg.fileName || "Attachment"}
                  </a>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc, deleteDoc, collection, query, where, orderBy, getDocs } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

export default function DashboardPage() {
  const router = useRouter();
  const [userData, setUserData] = useState(null);
  const [trips, setTrips] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [messages, setMessages] = useState([]);
  const [companyLogo, setCompanyLogo] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push("/login");
        return;
      }

      const docRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setUserData(docSnap.data());
      }

      try {
        const userData = docSnap.exists() ? docSnap.data() : null;
        if (userData?.companyId) {
          const companyDoc = await getDoc(doc(db, "companies", userData.companyId));
          if (companyDoc.exists()) {
            setCompanyLogo(companyDoc.data().logoUrl || "");
            setCompanyName(companyDoc.data().name || "");
          }
        }
      } catch (err) {
        console.error("Error loading branding:", err);
      }

      try {
        const tripsQuery = query(
          collection(db, "trips"),
          where("driverId", "==", user.uid),
          orderBy("createdAt", "desc")
        );
        const tripsSnap = await getDocs(tripsQuery);
        const tripsList = tripsSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setTrips(tripsList);
      } catch (err) {
        console.error("Error loading trips:", err);
      }

      try {
        const docsQuery = query(
          collection(db, "documents"),
          where("driverId", "==", user.uid)
        );
        const docsSnap = await getDocs(docsQuery);
        const docsList = docsSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setDocuments(docsList);
      } catch (err) {
        console.error("Error loading documents:", err);
      }

      try {
        const msgQuery = query(
          collection(db, "messages"),
          where("driverId", "==", user.uid)
        );
        const msgSnap = await getDocs(msgQuery);
        const msgList = msgSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setMessages(msgList);
      } catch (err) {
        console.error("Error loading messages:", err);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/login");
  };

  const handleDeleteTrip = async (tripId) => {
    const confirmed = window.confirm("Delete this trip? This cannot be undone.");
    if (!confirmed) return;

    await deleteDoc(doc(db, "trips", tripId));
    setTrips(trips.filter((t) => t.id !== tripId));
  };

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f5f5f5" }}>
      {/* Top section: plain background, unchanged */}
      <div style={{ padding: "1.5rem 1.5rem 0 1.5rem" }}>
        <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: "0.75rem", marginBottom: "0.5rem" }}>
          <button
            onClick={() => router.push("/messages")}
            style={{ position: "relative", padding: "0.5rem 0.75rem", backgroundColor: "#eee", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "1.1rem" }}
            aria-label="Messages"
          >
            💬
            {messages.filter((m) => !m.readAt).length > 0 && (
              <span style={{ position: "absolute", top: "-4px", right: "-4px", backgroundColor: "#d32f2f", color: "white", borderRadius: "50%", width: "18px", height: "18px", fontSize: "0.7rem", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "700" }}>
                {messages.filter((m) => !m.readAt).length}
              </span>
            )}
          </button>
          <button
            onClick={handleLogout}
            style={{ padding: "0.5rem 1rem", backgroundColor: "#eee", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "0.9rem" }}
          >
            Log Out
          </button>
        </div>

        {companyLogo && (
          <div style={{ display: "flex", justifyContent: "center", marginBottom: "0.5rem" }}>
            <img
              src={companyLogo}
              alt={companyName || "Company logo"}
              style={{ maxHeight: "160px", maxWidth: "500px", width: "100%", objectFit: "contain" }}
            />
          </div>
        )}

        {companyName && (
          <p style={{ textAlign: "center", fontSize: "1rem", color: "#666", fontWeight: "500", marginTop: 0, marginBottom: "1rem" }}>
            {companyName}
          </p>
        )}

        <h1 style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#1a1a1a", textAlign: "center", marginBottom: "2rem" }}>
          Good day, {userData?.name || "Driver"}
        </h1>

        <Link href="/trip/new" style={{ display: "block", width: "100%", padding: "1.25rem", backgroundColor: "#1a56db", color: "white", border: "none", borderRadius: "8px", fontSize: "1.1rem", fontWeight: "600", cursor: "pointer", marginBottom: "0", textAlign: "center", textDecoration: "none", boxSizing: "border-box" }}>
          + Start New Trip
        </Link>
      </div>

      {/* Background image section: starts right under the button, runs to bottom of page */}
      <div
        style={{
          backgroundImage: "url('/images/dashboard-bg.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          paddingTop: "2rem",
          paddingBottom: "3rem",
          paddingLeft: "1.5rem",
          paddingRight: "1.5rem",
          marginTop: "2rem",
          position: "relative",
        }}
      >
        {/* darken the photo a touch so the glass cards stay readable */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(180deg, rgba(10,15,25,0.55) 0%, rgba(10,15,25,0.7) 100%)",
          }}
        />

        <div style={{ position: "relative", maxWidth: "900px", margin: "0 auto" }}>
          {documents.length > 0 && (
            <div
              style={{
                background: "rgba(255,255,255,0.14)",
                backdropFilter: "blur(18px)",
                WebkitBackdropFilter: "blur(18px)",
                border: "1px solid rgba(255,255,255,0.25)",
                borderRadius: "12px",
                padding: "1.5rem",
                boxShadow: "0 8px 32px rgba(0,0,0,0.35)",
                marginBottom: "2rem",
              }}
            >
              <h2 style={{ fontSize: "1.1rem", fontWeight: "600", marginBottom: "1rem", color: "#ffffff", textShadow: "0 1px 4px rgba(0,0,0,0.5)" }}>
                Documents from Dispatch
              </h2>
              {documents.map((docItem) => (
                <div key={docItem.id} style={{ padding: "0.75rem 0", borderBottom: "1px solid rgba(255,255,255,0.25)" }}>
                  <a
                    href={docItem.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: "#bfdbfe", textDecoration: "none", fontWeight: "600", fontSize: "0.95rem" }}
                  >
                    {docItem.type}: {docItem.fileName}
                  </a>
                </div>
              ))}
            </div>
          )}

          <div
            style={{
              background: "rgba(255,255,255,0.14)",
              backdropFilter: "blur(18px)",
              WebkitBackdropFilter: "blur(18px)",
              border: "1px solid rgba(255,255,255,0.25)",
              borderRadius: "12px",
              padding: "1.5rem",
              boxShadow: "0 8px 32px rgba(0,0,0,0.35)",
            }}
          >
            <h2 style={{ fontSize: "1.1rem", fontWeight: "600", marginBottom: "1rem", color: "#ffffff", textShadow: "0 1px 4px rgba(0,0,0,0.5)" }}>
              Trip History
            </h2>

            {trips.length === 0 ? (
              <p style={{ color: "#f1f1f1" }}>No trips submitted yet.</p>
            ) : (
              <div>
                {trips.map((trip) => (
                  <div
                    key={trip.id}
                    style={{ padding: "1rem 0", borderBottom: "1px solid rgba(255,255,255,0.25)" }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.35rem" }}>
                      <span style={{ fontWeight: "600", color: "#ffffff", textShadow: "0 1px 4px rgba(0,0,0,0.5)" }}>{trip.date}</span>
                      <span style={{ fontSize: "0.8rem", padding: "0.2rem 0.6rem", backgroundColor: "rgba(191,219,254,0.9)", color: "#1a3a8f", borderRadius: "12px", textTransform: "capitalize", fontWeight: "600" }}>
                        {trip.status}
                      </span>
                    </div>
                    <p style={{ fontSize: "0.9rem", color: "#f1f1f1", marginBottom: "0.15rem", textShadow: "0 1px 4px rgba(0,0,0,0.5)" }}>
                      {trip.pickupCustomer || "—"} ({trip.pickupCity || "—"}) → {trip.deliveryCustomer || "—"} ({trip.deliveryCity || "—"})
                    </p>
                    {trip.totalMiles && (
                      <p style={{ fontSize: "0.85rem", color: "#dfe4ea", marginBottom: "0.5rem", textShadow: "0 1px 4px rgba(0,0,0,0.5)" }}>
                        {trip.totalMiles} miles
                      </p>
                    )}
                    <div style={{ display: "flex", gap: "1rem" }}>
                      <Link href={`/trip/edit/${trip.id}`} style={{ fontSize: "0.85rem", color: "#bfdbfe", textDecoration: "none", fontWeight: "600" }}>
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDeleteTrip(trip.id)}
                        style={{ fontSize: "0.85rem", color: "#ffb4b4", background: "none", border: "none", cursor: "pointer", fontWeight: "600", padding: 0 }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
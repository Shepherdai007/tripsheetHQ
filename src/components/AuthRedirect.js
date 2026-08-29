"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

/**
 * AuthRedirect
 *
 * Silently checks if someone opening the landing page is already
 * logged in. If so, skip the marketing page entirely and send them
 * straight to their dashboard (driver) or admin panel (admin) -
 * this is what makes reopening the installed app feel like it
 * "remembers" you instead of always showing the landing/login page.
 *
 * Renders nothing - it's just a background check.
 */
export default function AuthRedirect() {
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) return; // not logged in - stay on the landing page

      try {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists() && userDoc.data().role === "admin") {
          router.replace("/admin");
        } else {
          router.replace("/dashboard");
        }
      } catch (err) {
        console.error("AuthRedirect: failed to check role", err);
      }
    });

    return () => unsubscribe();
  }, [router]);

  return null;
}

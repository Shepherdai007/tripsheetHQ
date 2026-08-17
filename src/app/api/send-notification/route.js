import { NextResponse } from "next/server";
import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getMessaging } from "firebase-admin/messaging";

function getFormattedPrivateKey() {
  const key = process.env.FIREBASE_PRIVATE_KEY || "";
  // If the key contains literal backslash-n sequences, convert them to real newlines.
  // If it already has real newlines, this does nothing and passes through unchanged.
  return key.includes("\\n") ? key.replace(/\\n/g, "\n") : key;
}

if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: getFormattedPrivateKey(),
    }),
  });
}

export async function POST(req) {
  try {
    const { token, title, body } = await req.json();

    if (!token || !title || !body) {
      return NextResponse.json({ error: "Missing token, title, or body." }, { status: 400 });
    }

    await getMessaging().send({
      token,
      notification: { title, body },
      webpush: {
        notification: {
          icon: "/android-chrome-192x192.png",
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Push send error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
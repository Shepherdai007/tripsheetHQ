import { NextResponse } from "next/server";

export async function GET() {
  const key = process.env.FIREBASE_PRIVATE_KEY || "";
  return NextResponse.json({
    length: key.length,
    startsWithDashes: key.startsWith("-----BEGIN"),
    endsWithDashes: key.trim().endsWith("-----END PRIVATE KEY-----") || key.trim().endsWith('-----END PRIVATE KEY-----"'),
    first30: key.slice(0, 30),
    last30: key.slice(-30),
    containsLiteralBackslashN: key.includes("\\n"),
    containsRealNewline: key.includes("\n"),
    lineCount: key.split("\n").length,
  });
}
import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(request) {
  try {
    const { stripeCustomerId } = await request.json();

    if (!stripeCustomerId) {
      return NextResponse.json({ error: "No billing account found for this company yet." }, { status: 400 });
    }

    const origin = request.headers.get("origin") || "https://tripsheet-hq.vercel.app";

    const session = await stripe.billingPortal.sessions.create({
      customer: stripeCustomerId,
      return_url: `${origin}/admin`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("Stripe portal session error:", err);
    return NextResponse.json({ error: "Could not open billing portal. Please try again." }, { status: 500 });
  }
}

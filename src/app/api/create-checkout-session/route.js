import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(request) {
  try {
    const { priceId, companyId, userId } = await request.json();

    if (!priceId || !companyId || !userId) {
      return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
    }

    const origin = request.headers.get("origin") || "https://tripsheet-hq.vercel.app";

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      subscription_data: {
        trial_period_days: 7,
        metadata: {
          companyId,
          userId,
        },
      },
      metadata: {
        companyId,
        userId,
      },
      success_url: `${origin}/admin?checkout=success`,
      cancel_url: `${origin}/pricing?checkout=cancelled`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("Stripe checkout session error:", err);
    return NextResponse.json({ error: "Could not start checkout. Please try again." }, { status: 500 });
  }
}

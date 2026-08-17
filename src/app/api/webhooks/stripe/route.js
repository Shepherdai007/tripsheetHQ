import { NextResponse } from "next/server";
import Stripe from "stripe";
import { adminDb } from "@/lib/firebase-admin";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(request) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  let event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error("Webhook signature verification failed:", err.message);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        const companyId = session.metadata?.companyId;

        if (companyId) {
          // Fetch the subscription right away so we have the plan price ID
          // and trial end date immediately, instead of waiting for a
          // separate customer.subscription.updated event to arrive.
          const subscription = await stripe.subscriptions.retrieve(session.subscription);

          await adminDb.collection("companies").doc(companyId).update({
            stripeCustomerId: session.customer,
            stripeSubscriptionId: session.subscription,
            subscriptionStatus: subscription.status,
            planPriceId: subscription.items?.data?.[0]?.price?.id || null,
            trialEndsAt: subscription.trial_end
              ? new Date(subscription.trial_end * 1000).toISOString()
              : null,
            currentPeriodEnd: subscription.current_period_end
              ? new Date(subscription.current_period_end * 1000).toISOString()
              : null,
            updatedAt: new Date().toISOString(),
          });
        }
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object;
        const companyId = subscription.metadata?.companyId;

        if (companyId) {
          await adminDb.collection("companies").doc(companyId).update({
            subscriptionStatus: subscription.status, // trialing, active, past_due, canceled, etc.
            trialEndsAt: subscription.trial_end
              ? new Date(subscription.trial_end * 1000).toISOString()
              : null,
            currentPeriodEnd: subscription.current_period_end
              ? new Date(subscription.current_period_end * 1000).toISOString()
              : null,
            planPriceId: subscription.items?.data?.[0]?.price?.id || null,
            updatedAt: new Date().toISOString(),
          });
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object;
        const companyId = subscription.metadata?.companyId;

        if (companyId) {
          await adminDb.collection("companies").doc(companyId).update({
            subscriptionStatus: "canceled",
            updatedAt: new Date().toISOString(),
          });
        }
        break;
      }

      default:
        // Unhandled event types are fine to ignore.
        break;
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("Webhook handler error:", err);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }
}
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  if (!prisma) {
    return NextResponse.json({ error: "DB not available" }, { status: 503 });
  }

  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  if (!sig || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event;
  try {
    event = getStripe().webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as {
      metadata?: { userId?: string };
      customer?: string;
      subscription?: string;
    };
    const userId = session.metadata?.userId;
    if (userId) {
      await prisma.user.update({
        where: { id: userId },
        data: {
          isPremium: true,
          stripeCustomerId: session.customer as string,
          stripeSubId: session.subscription as string,
        },
      });
    }
  }

  if (event.type === "customer.subscription.deleted") {
    const sub = event.data.object as { id: string };
    await prisma.user.updateMany({
      where: { stripeSubId: sub.id },
      data: { isPremium: false, stripeSubId: null },
    });
  }

  return NextResponse.json({ received: true });
}

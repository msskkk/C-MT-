export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getStripe, PRICE_ID } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  if (!prisma) {
    return NextResponse.json({ error: "DB not available" }, { status: 503 });
  }

  try {
    const { getServerSession } = await import("next-auth");
    const { authOptions } = await import("@/lib/auth");
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (!PRICE_ID) {
      return NextResponse.json(
        { error: "Stripe not configured. Set STRIPE_SECRET_KEY and STRIPE_PRICE_ID." },
        { status: 500 }
      );
    }

    const origin = req.headers.get("origin") || "http://localhost:3000";

    const checkoutSession = await getStripe().checkout.sessions.create({
      mode: "subscription",
      customer_email: user.email,
      line_items: [{ price: PRICE_ID, quantity: 1 }],
      success_url: `${origin}?upgraded=1`,
      cancel_url: `${origin}?cancelled=1`,
      metadata: { userId: user.id },
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

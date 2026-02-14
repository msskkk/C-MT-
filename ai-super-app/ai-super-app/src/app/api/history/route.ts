export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET: Fetch user's history
export async function GET() {
  if (!prisma) {
    return NextResponse.json({ history: [] });
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
      return NextResponse.json({ history: [] });
    }

    const history = await prisma.history.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return NextResponse.json({ history });
  } catch {
    return NextResponse.json({ history: [] });
  }
}

// POST: Save a result to history
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

    const { bundleId, toolId, input, output, locale } = await req.json();

    const entry = await prisma.history.create({
      data: {
        userId: user.id,
        bundleId,
        toolId,
        input,
        output: JSON.stringify(output),
        locale: locale || "ja",
      },
    });

    return NextResponse.json({ id: entry.id });
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

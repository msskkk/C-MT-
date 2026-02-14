import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    if (!prisma) {
      return NextResponse.json(
        { error: "データベースに接続できません" },
        { status: 500 }
      );
    }

    const { email, password, name } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "メールアドレスとパスワードは必須です" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "パスワードは6文字以上にしてください" },
        { status: 400 }
      );
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { error: "このメールアドレスは既に登録されています" },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        name: name || email.split("@")[0],
        password: hashedPassword,
      },
    });

    return NextResponse.json(
      { message: "アカウントを作成しました", userId: user.id },
      { status: 201 }
    );
  } catch {
    return NextResponse.json(
      { error: "アカウント作成に失敗しました" },
      { status: 500 }
    );
  }
}

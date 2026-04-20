import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { PrismaDb } from "@/lib/prismaDB";
import { signupSchema } from "@/lib/validations";
import { authRateLimit } from "@/lib/arcjet";

export async function POST(req: NextRequest) {
  try {
    // ── Arcjet Rate Limiting ──────────────────────────────────────────────
    const decision = await authRateLimit.protect(req);
    if (decision.isDenied()) {
      return NextResponse.json(
        { error: "Too many signup attempts. Please try again later." },
        { status: 429 }
      );
    }

    // ── Parse & Validate Input ────────────────────────────────────────────
    const body = await req.json();
    const parsed = signupSchema.safeParse(body);

    if (!parsed.success) {
      const errors = parsed.error.flatten().fieldErrors;
      return NextResponse.json(
        { error: "Validation failed", details: errors },
        { status: 400 }
      );
    }

    const { email, password, username } = parsed.data;

    // ── Check if user already exists ──────────────────────────────────────
    const existingUser = await PrismaDb.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 }
      );
    }

    // ── Hash password & create user ───────────────────────────────────────
    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await PrismaDb.user.create({
      data: {
        email,
        username,
        name: username,
        password: hashedPassword,
      },
    });

    // ── Create default financial account for the user ─────────────────────
    await PrismaDb.financialAccount.create({
      data: {
        name: "Main Account",
        type: "SAVINGS",
        balance: 0,
        isDefault: true,
        icon: "💰",
        color: "#6366f1",
        userId: user.id,
      },
    });

    return NextResponse.json(
      {
        message: "Account created successfully",
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}

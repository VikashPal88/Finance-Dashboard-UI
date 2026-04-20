import { auth } from "@/lib/auth";
import z from "zod";
import { NextResponse } from "next/server";
import { PrismaDb } from "@/lib/prismaDB";

const serializeAccount = (account: any) => ({
    ...account,
    balance: Number(account.balance),
    monthlyBudget: Number(account.monthlyBudget),
});

const CreateAccountSchema = z.object({
    name: z.string().min(1, "Account name is required"),
    balance: z
        .union([z.number().nonnegative(), z.string()])
        .transform((val) => (typeof val === "string" ? Number(val) : val))
        .refine((val) => !isNaN(val) && val >= 0, "Balance must be a valid positive number")
        .transform((val) => Number(val.toFixed(2))),
    monthlyBudget: z
        .union([z.number().nonnegative(), z.string()])
        .optional()
        .default(0)
        .transform((val) => (typeof val === "string" ? Number(val) : val))
        .refine((val) => val >= 0, "Budget must be zero or positive"),
    isDefault: z.boolean().optional().default(false),
    icon: z.string().optional().default("💰"),
    type: z.string().optional(),
    color: z
        .string()
        .regex(/^#[0-9A-Fa-f]{6}$/, "Color must be a valid hex code like #6366f1")
        .optional()
        .default("#6366f1"),
});

export async function GET(req: Request) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const accounts = await PrismaDb.financialAccount.findMany({
            where: { userId: session.user.id },
            orderBy: { createdAt: "desc" },
        });

        return NextResponse.json(accounts.map(serializeAccount));
    } catch (error) {
        console.error("[ACCOUNTS_GET]", error);
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const json = await req.json();
        const data = CreateAccountSchema.parse(json);

        // Enforce only one default account
        if (data.isDefault) {
            await PrismaDb.financialAccount.updateMany({
                where: { userId: session.user.id, isDefault: true },
                data: { isDefault: false },
            });
        }

        // Prisma enum validation requires matching values (defaulting to CURRENT if unprovided)
        const accountType: any = data.type || "CURRENT";

        const account = await PrismaDb.financialAccount.create({
            data: {
                ...data,
                type: accountType,
                userId: session.user.id,
            },
        });

        return NextResponse.json(serializeAccount(account));
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: error.issues }, { status: 400 });
        }
        console.error("[ACCOUNTS_POST]", error);
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
}

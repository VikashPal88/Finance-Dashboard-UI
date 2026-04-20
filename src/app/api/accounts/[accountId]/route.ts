import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { PrismaDb } from "@/lib/prismaDB";
import { z } from "zod";

const serializeAccount = (account: any) => ({
    ...account,
    balance: Number(account.balance),
    monthlyBudget: Number(account.monthlyBudget),
    ...(account.transactions && {
        transactions: account.transactions.map((t: any) => ({
            ...t,
            amount: Number(t.amount)
        }))
    })
});

const UpdateAccountSchema = z.object({
    name: z.string().min(1, "Account name is required").optional(),
    balance: z
        .union([z.number().nonnegative(), z.string()])
        .transform((val) => (typeof val === "string" ? Number(val) : val))
        .refine((val) => !isNaN(val) && val >= 0, "Balance must be a valid positive number")
        .transform((val) => Number(val.toFixed(2)))
        .optional(),
    monthlyBudget: z
        .union([z.number().nonnegative(), z.string()])
        .transform((val) => (typeof val === "string" ? Number(val) : val))
        .refine((val) => val >= 0, "Budget must be zero or positive")
        .optional(),
    isDefault: z.boolean().optional(),
    icon: z.string().optional(),
    type: z.enum(["CURRENT", "SAVINGS"]).optional(),
    color: z
        .string()
        .regex(/^#[0-9A-Fa-f]{6}$/, "Color must be a valid hex code like #6366f1")
        .optional(),
});

export async function GET(
    req: Request,
    context: { params: Promise<{ accountId: string }> }
) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { accountId } = await context.params;

        const account = await PrismaDb.financialAccount.findUnique({
            where: {
                id: accountId,
                userId: session.user.id,
            },
            include: {
                transactions: {
                    orderBy: { date: "desc" },
                    take: 50,
                },
            },
        });

        if (!account) {
            return NextResponse.json({ error: "Account not found" }, { status: 404 });
        }

        return NextResponse.json(serializeAccount(account));
    } catch (error) {
        console.error("[ACCOUNT_GET]", error);
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
}

export async function PUT(
    req: Request,
    context: { params: Promise<{ accountId: string }> }
) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { accountId } = await context.params;
        const json = await req.json();
        const data = UpdateAccountSchema.parse(json);

        // Check if account exists and belongs to user
        const existingAccount = await PrismaDb.financialAccount.findUnique({
            where: {
                id: accountId,
                userId: session.user.id,
            },
        });

        if (!existingAccount) {
            return NextResponse.json({ error: "Account not found" }, { status: 404 });
        }

        // Handle default account logic
        if (data.isDefault) {
            await PrismaDb.financialAccount.updateMany({
                where: { userId: session.user.id, isDefault: true },
                data: { isDefault: false },
            });
        }

        const updatedAccount = await PrismaDb.financialAccount.update({
            where: {
                id: accountId,
                userId: session.user.id,
            },
            data,
        });

        return NextResponse.json(serializeAccount(updatedAccount));
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: error.issues }, { status: 400 });
        }
        console.error("[ACCOUNT_PUT]", error);
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
}

export async function DELETE(
    req: Request,
    context: { params: Promise<{ accountId: string }> }
) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { accountId } = await context.params;

        const existingAccount = await PrismaDb.financialAccount.findUnique({
            where: {
                id: accountId,
                userId: session.user.id,
            },
        });

        if (!existingAccount) {
            return NextResponse.json({ error: "Account not found" }, { status: 404 });
        }

        await PrismaDb.financialAccount.delete({
            where: {
                id: accountId,
                userId: session.user.id,
            },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("[ACCOUNT_DELETE]", error);
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
}
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { PrismaDb } from "@/lib/prismaDB";

const serializeDecimal = (obj: any) => {
    const serialized: any = { ...obj };
    if (obj?.balance != null) serialized.balance = Number(obj.balance);
    if (obj?.amount != null) serialized.amount = Number(obj.amount);
    return serialized;
};

/**
 * GET /api/transactions/[transactionId]
 * Get a single transaction by ID
 */
export async function GET(
    req: Request,
    context: { params: Promise<{ transactionId: string }> }
) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { transactionId } = await context.params;

        const transaction = await PrismaDb.transaction.findUnique({
            where: {
                id: transactionId,
                userId: session.user.id,
            },
        });

        if (!transaction) {
            return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
        }

        return NextResponse.json(serializeDecimal(transaction));
    } catch (error) {
        console.error("[TRANSACTION_GET]", error);
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
}

/**
 * PUT /api/transactions/[transactionId]
 * Update a single transaction
 */
export async function PUT(
    req: Request,
    context: { params: Promise<{ transactionId: string }> }
) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { transactionId } = await context.params;
        const body = await req.json();

        // Find existing transaction
        const existing = await PrismaDb.transaction.findUnique({
            where: {
                id: transactionId,
                userId: session.user.id,
            },
        });

        if (!existing) {
            return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
        }

        // Calculate balance adjustments
        const oldImpact = existing.type === "EXPENSE" ? -Number(existing.amount) : Number(existing.amount);
        const newType = body.type || existing.type;
        const newAmount = body.amount != null ? Number(body.amount) : Number(existing.amount);
        const newImpact = newType === "EXPENSE" ? -newAmount : newAmount;
        const balanceChange = newImpact - oldImpact;

        const accountId = body.accountId || existing.accountId;

        const updatedTransaction = await PrismaDb.$transaction(async (tx) => {
            const updated = await tx.transaction.update({
                where: { id: transactionId },
                data: body,
            });

            // Update account balance
            if (balanceChange !== 0) {
                await tx.financialAccount.update({
                    where: { id: accountId },
                    data: { balance: { increment: balanceChange } },
                });
            }

            return updated;
        });

        return NextResponse.json(serializeDecimal(updatedTransaction));
    } catch (error) {
        console.error("[TRANSACTION_PUT]", error);
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
}

/**
 * DELETE /api/transactions/[transactionId]
 * Delete a single transaction and reverse its balance impact
 */
export async function DELETE(
    req: Request,
    context: { params: Promise<{ transactionId: string }> }
) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { transactionId } = await context.params;

        const transaction = await PrismaDb.transaction.findUnique({
            where: {
                id: transactionId,
                userId: session.user.id,
            },
        });

        if (!transaction) {
            return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
        }

        // Reverse the balance impact
        const originalImpact = transaction.type === "EXPENSE"
            ? -Number(transaction.amount)
            : Number(transaction.amount);
        const reversalAmount = -originalImpact;

        await PrismaDb.$transaction(async (tx) => {
            await tx.transaction.delete({
                where: { id: transactionId },
            });

            await tx.financialAccount.update({
                where: { id: transaction.accountId },
                data: { balance: { increment: reversalAmount } },
            });
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("[TRANSACTION_DELETE]", error);
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
}

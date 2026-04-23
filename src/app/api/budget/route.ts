import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { PrismaDb } from "@/lib/prismaDB";

/**
 * GET /api/budget
 * Returns the user's global budget and per-account budgets with spending data
 */
export async function GET() {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Get user's global budget
        const budget = await PrismaDb.budget.findUnique({
            where: { userId: session.user.id },
        });

        // Get all accounts with their monthly budget and this month's spending
        const currentMonth = new Date().toISOString().substring(0, 7);
        const accounts = await PrismaDb.financialAccount.findMany({
            where: { userId: session.user.id },
            include: {
                transactions: {
                    where: {
                        type: "EXPENSE",
                        date: {
                            gte: new Date(`${currentMonth}-01`),
                        },
                    },
                },
            },
        });

        const accountBudgets = accounts.map((a) => {
            const spent = a.transactions.reduce(
                (sum, t) => sum + Number(t.amount),
                0
            );
            return {
                id: a.id,
                name: a.name,
                icon: a.icon,
                monthlyBudget: Number(a.monthlyBudget),
                spent,
                percentage: Number(a.monthlyBudget) > 0
                    ? (spent / Number(a.monthlyBudget)) * 100
                    : 0,
            };
        });

        // Total across all accounts
        const totalBudget = budget
            ? Number(budget.amount)
            : accounts.reduce((sum, a) => sum + Number(a.monthlyBudget), 0);
        const totalSpent = accountBudgets.reduce((sum, a) => sum + a.spent, 0);

        return NextResponse.json({
            success: true,
            data: {
                globalBudget: budget ? Number(budget.amount) : null,
                totalBudget,
                totalSpent,
                percentage: totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0,
                accounts: accountBudgets,
            },
        });
    } catch (error) {
        console.error("[BUDGET_GET]", error);
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
}

/**
 * PUT /api/budget
 * Update/Create the user's global budget
 */
export async function PUT(req: Request) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { amount } = await req.json();

        if (typeof amount !== "number" || amount < 0) {
            return NextResponse.json(
                { error: "Invalid budget amount" },
                { status: 400 }
            );
        }

        const budget = await PrismaDb.budget.upsert({
            where: { userId: session.user.id },
            update: { amount },
            create: {
                amount,
                userId: session.user.id,
            },
        });

        return NextResponse.json({
            success: true,
            data: {
                id: budget.id,
                amount: Number(budget.amount),
            },
        });
    } catch (error) {
        console.error("[BUDGET_PUT]", error);
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
}

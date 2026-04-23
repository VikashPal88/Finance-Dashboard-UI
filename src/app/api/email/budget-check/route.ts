import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { PrismaDb } from "@/lib/prismaDB";
import { sendBudgetAlertEmail } from "@/lib/email";

/**
 * POST /api/email/budget-check
 * Check all user accounts for budget alerts and send email if >= 90%
 * Called after every transaction creation
 */
export async function POST() {
    try {
        const session = await auth();
        if (!session?.user?.id || !session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const currentMonth = new Date().toISOString().substring(0, 7);
        const startOfMonth = new Date(`${currentMonth}-01`);

        // Get all accounts with budgets
        const accounts = await PrismaDb.financialAccount.findMany({
            where: {
                userId: session.user.id,
                monthlyBudget: { gt: 0 },
            },
            include: {
                transactions: {
                    where: {
                        type: "EXPENSE",
                        date: { gte: startOfMonth },
                    },
                    orderBy: { date: "desc" },
                },
            },
        });

        const user = await PrismaDb.user.findUnique({
            where: { id: session.user.id },
            select: { name: true, email: true },
        });

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        const alertsSent: string[] = [];

        for (const account of accounts) {
            const budget = Number(account.monthlyBudget);
            const spent = account.transactions.reduce(
                (sum, t) => sum + Number(t.amount),
                0
            );
            const percentage = (spent / budget) * 100;

            // Only send alert if >= 90%
            if (percentage < 90) continue;

            // Check if we already sent an alert this month for this account
            if (account.budgetAlertSent) {
                const alertMonth = new Date(account.budgetAlertSent)
                    .toISOString()
                    .substring(0, 7);
                if (alertMonth === currentMonth) {
                    // Already sent alert this month - skip unless now exceeded (and was only warning before)
                    const prevPercentage = percentage; // We can't know the old %, so we skip duplicates
                    continue;
                }
            }

            // Build category breakdown for this account's expenses
            const categoryMap: Record<string, number> = {};
            account.transactions.forEach((t) => {
                categoryMap[t.category] = (categoryMap[t.category] || 0) + Number(t.amount);
            });
            const topCategories = Object.entries(categoryMap)
                .map(([category, amount]) => ({
                    category,
                    amount,
                    percentage: spent > 0 ? (amount / spent) * 100 : 0,
                }))
                .sort((a, b) => b.amount - a.amount);

            // Recent transactions
            const recentTransactions = account.transactions.slice(0, 5).map((t) => ({
                description: t.description || "Transaction",
                amount: Number(t.amount),
                date: new Date(t.date).toLocaleDateString("en-IN"),
                category: t.category,
            }));

            // Send email
            const emailResult = await sendBudgetAlertEmail({
                userName: user.name || "User",
                userEmail: user.email,
                accountName: account.name,
                budgetAmount: budget,
                spentAmount: spent,
                percentage,
                topCategories,
                recentTransactions,
            });

            if (emailResult.success) {
                // Mark alert as sent for this month
                await PrismaDb.financialAccount.update({
                    where: { id: account.id },
                    data: { budgetAlertSent: new Date() },
                });
                alertsSent.push(account.name);
            }
        }

        return NextResponse.json({
            success: true,
            alertsSent,
            message:
                alertsSent.length > 0
                    ? `Budget alerts sent for: ${alertsSent.join(", ")}`
                    : "No budget alerts needed",
        });
    } catch (error) {
        console.error("[BUDGET_CHECK]", error);
        return NextResponse.json(
            { error: "Failed to check budgets" },
            { status: 500 }
        );
    }
}

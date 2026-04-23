import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { PrismaDb } from "@/lib/prismaDB";
import { generateFinancialInsights } from "@/lib/gemini";

export async function GET() {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        if (!process.env.GEMINI_API_KEY) {
            return NextResponse.json(
                { error: "Gemini API key not configured" },
                { status: 503 }
            );
        }

        // Fetch user's financial data
        const accounts = await PrismaDb.financialAccount.findMany({
            where: { userId: session.user.id },
            include: {
                transactions: {
                    orderBy: { date: "desc" },
                    take: 200,
                },
            },
        });

        const allTransactions = accounts.flatMap((a) =>
            a.transactions.map((t) => ({
                ...t,
                amount: Number(t.amount),
                accountName: a.name,
            }))
        );

        // Calculate totals
        const totalIncome = allTransactions
            .filter((t) => t.type === "INCOME")
            .reduce((s, t) => s + t.amount, 0);
        const totalExpenses = allTransactions
            .filter((t) => t.type === "EXPENSE")
            .reduce((s, t) => s + t.amount, 0);
        const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0;

        // Category breakdown
        const categoryMap: Record<string, number> = {};
        allTransactions
            .filter((t) => t.type === "EXPENSE")
            .forEach((t) => {
                categoryMap[t.category] = (categoryMap[t.category] || 0) + t.amount;
            });
        const categoryBreakdown = Object.entries(categoryMap)
            .map(([category, amount]) => ({
                category,
                amount,
                percentage: totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0,
            }))
            .sort((a, b) => b.amount - a.amount);

        // Monthly trend (last 6 months)
        const monthlyMap: Record<string, { income: number; expenses: number }> = {};
        allTransactions.forEach((t) => {
            const month = new Date(t.date).toISOString().substring(0, 7);
            if (!monthlyMap[month]) monthlyMap[month] = { income: 0, expenses: 0 };
            if (t.type === "INCOME") monthlyMap[month].income += t.amount;
            else monthlyMap[month].expenses += t.amount;
        });
        const monthlyTrend = Object.entries(monthlyMap)
            .sort((a, b) => a[0].localeCompare(b[0]))
            .slice(-6)
            .map(([month, data]) => ({ month, ...data }));

        // Account budgets
        const currentMonth = new Date().toISOString().substring(0, 7);
        const accountBudgets = accounts
            .filter((a) => Number(a.monthlyBudget) > 0)
            .map((a) => {
                const spent = a.transactions
                    .filter(
                        (t) =>
                            t.type === "EXPENSE" &&
                            new Date(t.date).toISOString().substring(0, 7) === currentMonth
                    )
                    .reduce((s, t) => s + Number(t.amount), 0);
                return {
                    name: a.name,
                    budget: Number(a.monthlyBudget),
                    spent,
                };
            });

        // Top merchants/descriptions
        const merchantMap: Record<string, { amount: number; count: number }> = {};
        allTransactions
            .filter((t) => t.type === "EXPENSE" && t.description)
            .forEach((t) => {
                const name = t.description || "Unknown";
                if (!merchantMap[name]) merchantMap[name] = { amount: 0, count: 0 };
                merchantMap[name].amount += t.amount;
                merchantMap[name].count += 1;
            });
        const topMerchants = Object.entries(merchantMap)
            .map(([name, data]) => ({ name, ...data }))
            .sort((a, b) => b.amount - a.amount)
            .slice(0, 10);

        // Generate AI insights
        const insights = await generateFinancialInsights({
            totalIncome,
            totalExpenses,
            savingsRate,
            categoryBreakdown,
            monthlyTrend,
            accountBudgets,
            topMerchants,
        });

        return NextResponse.json({
            success: true,
            data: insights,
        });
    } catch (error: any) {
        console.error("[AI_INSIGHTS]", error);

        // Handle specific Gemini API errors
        const errorMsg = error?.message || error?.toString() || "";
        const status = error?.status || 500;

        if (status === 429 || errorMsg.includes("429") || errorMsg.includes("Too Many Requests") || errorMsg.includes("quota")) {
            return NextResponse.json(
                { error: "AI rate limit reached. Please wait a moment and try again." },
                { status: 429 }
            );
        }

        if (status === 400 || errorMsg.includes("API_KEY") || errorMsg.includes("API key")) {
            return NextResponse.json(
                { error: "Invalid Gemini API key. Please check your GEMINI_API_KEY in .env" },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { error: "Failed to generate insights. Please try again." },
            { status: 500 }
        );
    }
}

import { auth } from "@/lib/auth";
import { PrismaDb } from "@/lib/prismaDB";
import { NextResponse } from "next/server";

// Helper to serialize Decimal / Float fields
const serializeData = (data: any) => {
    if (!data) return data;
    return JSON.parse(
        JSON.stringify(data, (_, value) =>
            typeof value === "number" && !Number.isInteger(value)
                ? Number(value.toFixed(2))
                : value
        )
    );
};

export async function GET() {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const userData = await PrismaDb.user.findUnique({
            where: { id: session.user.id },
            select: {
                id: true,
                name: true,
                email: true,
                // Add any other user fields you need
                financialAccounts: {
                    include: {
                        transactions: {
                            orderBy: { date: "desc" }, // newest first
                            // take: 100   // ← UNCOMMENT if you have 1000s of transactions
                        }
                    },
                    orderBy: { isDefault: "desc" }  // default account first
                }
            }
        })

        if (!userData) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        const serialized = serializeData(userData);

        return NextResponse.json({
            success: true,
            data: serialized,
        });

    } catch (error) {
        console.error("Dashboard fetch error:", error);
        return NextResponse.json(
            { error: "Failed to fetch dashboard data" },
            { status: 500 }
        );
    }
}
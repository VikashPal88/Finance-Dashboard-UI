import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { PrismaDb } from "@/lib/prismaDB";
import { z } from "zod";
import { DEFAULT_CATEGORIES, CategoryItem } from "@/lib/categories";

const CreateCategorySchema = z.object({
    name: z.string().min(1, "Category name is required").max(50),
    type: z.enum(["income", "expense"]),
    color: z
        .string()
        .regex(/^#[0-9A-Fa-f]{6}$/, "Color must be a valid hex code")
        .optional()
        .default("#6b7280"),
});

/**
 * GET /api/categories
 * Returns all categories: default app categories + user's custom categories merged.
 * Query param: ?type=income|expense (optional filter)
 */
export async function GET(req: Request) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const typeFilter = searchParams.get("type"); // "income" | "expense" | null

        // Fetch user's custom categories from DB
        const userCategories = await PrismaDb.category.findMany({
            where: { userId: session.user.id },
            orderBy: { createdAt: "asc" },
        });

        // Convert DB records to CategoryItem format
        const customItems: CategoryItem[] = userCategories.map((c) => ({
            id: c.id,
            name: c.name,
            type: c.type.toLowerCase() as "income" | "expense",
            color: c.color,
            isDefault: false,
        }));

        // Merge defaults + custom (skip duplicates by name+type)
        let allCategories = [...DEFAULT_CATEGORIES];
        const existingKeys = new Set(allCategories.map((c) => `${c.name}::${c.type}`));

        for (const cat of customItems) {
            const key = `${cat.name}::${cat.type}`;
            if (!existingKeys.has(key)) {
                allCategories.push(cat);
                existingKeys.add(key);
            }
        }

        // Apply type filter if provided
        if (typeFilter === "income" || typeFilter === "expense") {
            allCategories = allCategories.filter((c) => c.type === typeFilter);
        }

        return NextResponse.json(allCategories);
    } catch (error) {
        console.error("[CATEGORIES_GET]", error);
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
}

/**
 * POST /api/categories
 * Create a new custom category for the user.
 */
export async function POST(req: Request) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const json = await req.json();
        const data = CreateCategorySchema.parse(json);

        // Check for duplicates (including default category names)
        const allDefaultNames = DEFAULT_CATEGORIES
            .filter((c) => c.type === data.type)
            .map((c) => c.name.toLowerCase());

        if (allDefaultNames.includes(data.name.toLowerCase())) {
            return NextResponse.json(
                { error: "A default category with this name already exists" },
                { status: 409 }
            );
        }

        // Check for user-created duplicate
        const existing = await PrismaDb.category.findFirst({
            where: {
                userId: session.user.id,
                name: { equals: data.name, mode: "insensitive" },
                type: data.type.toUpperCase() as any,
            },
        });

        if (existing) {
            return NextResponse.json(
                { error: "You already have a category with this name" },
                { status: 409 }
            );
        }

        const category = await PrismaDb.category.create({
            data: {
                name: data.name,
                type: data.type.toUpperCase() as any,
                color: data.color,
                userId: session.user.id,
            },
        });

        const result: CategoryItem = {
            id: category.id,
            name: category.name,
            type: category.type.toLowerCase() as "income" | "expense",
            color: category.color,
            isDefault: false,
        };

        return NextResponse.json(result, { status: 201 });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: error.issues }, { status: 400 });
        }
        console.error("[CATEGORIES_POST]", error);
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
}

/**
 * DELETE /api/categories
 * Delete a custom category. Body: { id: string }
 * Default categories cannot be deleted.
 */
export async function DELETE(req: Request) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await req.json();

        if (!id || typeof id !== "string") {
            return NextResponse.json({ error: "Category ID is required" }, { status: 400 });
        }

        // Prevent deletion of default categories
        if (id.startsWith("default-")) {
            return NextResponse.json(
                { error: "Default categories cannot be deleted" },
                { status: 403 }
            );
        }

        // Verify ownership
        const category = await PrismaDb.category.findUnique({
            where: { id, userId: session.user.id },
        });

        if (!category) {
            return NextResponse.json({ error: "Category not found" }, { status: 404 });
        }

        await PrismaDb.category.delete({
            where: { id },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("[CATEGORIES_DELETE]", error);
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
}

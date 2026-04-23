import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { parseReceiptImage } from "@/lib/gemini";

export async function POST(req: Request) {
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

        const formData = await req.formData();
        const file = formData.get("receipt") as File;

        if (!file) {
            return NextResponse.json(
                { error: "No receipt image provided" },
                { status: 400 }
            );
        }

        // Validate file type
        const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/heic"];
        if (!allowedTypes.includes(file.type)) {
            return NextResponse.json(
                { error: "Invalid file type. Please upload JPEG, PNG, or WebP" },
                { status: 400 }
            );
        }

        // Validate file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
            return NextResponse.json(
                { error: "File too large. Maximum 10MB" },
                { status: 400 }
            );
        }

        // Convert to base64
        const buffer = Buffer.from(await file.arrayBuffer());
        const base64 = buffer.toString("base64");

        // Parse with Gemini
        const result = await parseReceiptImage(base64, file.type);

        return NextResponse.json({
            success: true,
            data: result,
        });
    } catch (error) {
        console.error("[SCAN_RECEIPT]", error);
        return NextResponse.json(
            { error: "Failed to parse receipt" },
            { status: 500 }
        );
    }
}

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { parseStatement } from "@/lib/gemini";

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

        const contentType = req.headers.get("content-type") || "";

        let result;

        if (contentType.includes("multipart/form-data")) {
            // Handle file upload (image or CSV)
            const formData = await req.formData();
            const file = formData.get("statement") as File;

            if (!file) {
                return NextResponse.json(
                    { error: "No file provided" },
                    { status: 400 }
                );
            }

            if (file.size > 15 * 1024 * 1024) {
                return NextResponse.json(
                    { error: "File too large. Maximum 15MB" },
                    { status: 400 }
                );
            }

            const isImage = file.type.startsWith("image/");
            const buffer = Buffer.from(await file.arrayBuffer());

            if (isImage) {
                const base64 = buffer.toString("base64");
                result = await parseStatement("", true, base64, file.type);
            } else {
                // CSV or text file
                const text = buffer.toString("utf-8");
                result = await parseStatement(text, false);
            }
        } else {
            // Handle raw text/CSV content
            const { content } = await req.json();
            if (!content) {
                return NextResponse.json(
                    { error: "No content provided" },
                    { status: 400 }
                );
            }
            result = await parseStatement(content, false);
        }

        return NextResponse.json({
            success: true,
            data: result,
        });
    } catch (error) {
        console.error("[PARSE_STATEMENT]", error);
        return NextResponse.json(
            { error: "Failed to parse statement" },
            { status: 500 }
        );
    }
}

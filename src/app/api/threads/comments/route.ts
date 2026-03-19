import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

// POST: Reply to an existing thread
export async function POST(req: Request) {
    try {
        const session = await auth();
        // @ts-ignore - bypassing strict NextAuth types
        const userId = session?.user?.id;

        if (!userId) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const body = await req.json();
        const { threadId, content } = body;

        if (!threadId || !content) {
            return new NextResponse("Missing required fields", { status: 400 });
        }

        const comment = await prisma.comment.create({
            data: {
                threadId,
                content,
                userId: userId
            },
            include: {
                user: { select: { name: true, image: true, email: true } }
            }
        });

        return NextResponse.json(comment);
    } catch (error) {
        console.error("[COMMENTS_POST]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
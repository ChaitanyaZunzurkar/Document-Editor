import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; // Adjust this import to your Prisma client location
import { auth } from "@/auth";

// GET: Fetch all active threads for a document
export async function GET(req: Request) {
    try {
        const session = await auth();
        if (!session?.user) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const documentId = searchParams.get("documentId");

        if (!documentId) {
            return new NextResponse("Missing documentId", { status: 400 });
        }

        const threads = await prisma.thread.findMany({
            where: { 
                documentId: documentId,
                resolved: false 
            },
            include: {
                comments: {
                    include: { 
                        user: { select: { name: true, image: true, email: true } } 
                    },
                    orderBy: { createdAt: 'asc' }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json(threads);
    } catch (error) {
        console.error("[THREADS_GET]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

// POST: Start a new thread (Highlight + First Comment)
export async function POST(req: Request) {
    try {
        const session = await auth();
        // @ts-ignore - bypassing strict NextAuth types
        const userId = session?.user?.id;

        if (!userId) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const body = await req.json();
        const { documentId, quote, initialComment } = body;

        if (!documentId || !initialComment) {
            return new NextResponse("Missing required fields", { status: 400 });
        }

        const thread = await prisma.thread.create({
            data: {
                documentId,
                quote,
                comments: {
                    create: {
                        content: initialComment,
                        userId: userId
                    }
                }
            },
            include: {
                comments: {
                    include: { user: { select: { name: true, image: true, email: true } } }
                }
            }
        });

        return NextResponse.json(thread);
    } catch (error) {
        console.error("[THREADS_POST]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

// PATCH: Resolve a thread
export async function PATCH(req: Request) {
    try {
        const session = await auth();
        if (!session?.user) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const body = await req.json();
        const { threadId, resolved } = body;

        if (!threadId) {
            return new NextResponse("Missing threadId", { status: 400 });
        }

        const thread = await prisma.thread.update({
            where: { id: threadId },
            data: { resolved }
        });

        return NextResponse.json(thread);
    } catch (error) {
        console.error("[THREADS_PATCH]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
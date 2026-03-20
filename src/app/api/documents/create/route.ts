// src/app/api/documents/route.ts
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
    const session = await auth();

    if(!session?.user?.id) {
        return new NextResponse("Unauthorized", { status: 401 })
    }

    try {
        const { title, content } = await req.json();
        const initialData = Buffer.from(content || "");

        const document = await prisma.document.create({
            data: {
                title: title || "Untitled Document",
                ownerId: session.user.id,
                content: initialData,
            }
        })

        return NextResponse.json(document)
    } catch(error) {
        console.error("Failed to create document:", error);
        return new NextResponse("Internal Error", { status: 500 })
    }
}
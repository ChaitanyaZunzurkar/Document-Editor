import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function PATCH(req: Request) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const body = await req.json();
        const { documentId, isPublic } = body;

        if (!documentId) {
            return new NextResponse("Missing document ID", { status: 400 });
        }

        const existingDoc = await prisma.document.findUnique({
            where: { id: documentId },
            select: { ownerId: true }
        });

        if (existingDoc?.ownerId !== session.user.id) {
            return new NextResponse("Only the owner can change access settings", { status: 403 });
        }

        const updatedDocument = await prisma.document.update({
            where: { id: documentId },
            data: { isPublic }
        });

        return NextResponse.json(updatedDocument);
    } catch (error) {
        console.error("[DOCUMENT_ACCESS_PATCH]", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
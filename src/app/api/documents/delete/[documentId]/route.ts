import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ documentId: string }> }
) {
    try {
        const session = await auth();
        const { documentId } = await params;

        if (!session?.user?.id) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        // 1. Fetch just the ownerId to check permissions without loading the whole document
        const document = await prisma.document.findUnique({
            where: { id: documentId },
            select: { ownerId: true }
        });

        // 2. Handle cases where the document is already deleted or doesn't exist
        if (!document) {
            return new NextResponse("Document not found", { status: 404 });
        }

        // 3. RESOLVE TODO: Explicitly block anyone who isn't the owner
        if (document.ownerId !== session.user.id) {
            return new NextResponse("Forbidden: Only the document owner can delete this", { status: 403 });
        }

        // 4. Safe to delete using the unique ID
        await prisma.document.delete({
            where: { id: documentId }
        });

        return new NextResponse(null, { status: 204 });
        
    } catch (error: any) {
        console.error("Delete failed:", error);
        return new NextResponse("Failed to delete document", { status: 500 });
    }
}
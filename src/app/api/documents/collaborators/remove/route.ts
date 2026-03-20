import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function DELETE(req: Request) {
    try {
        const session = await auth();
        const { documentId, userIdToRemove } = await req.json();

        if (!session?.user?.id) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        if (!documentId || !userIdToRemove) {
            return new NextResponse("Missing required fields", { status: 400 });
        }

        // 1. Verify the person making the request is the actual OWNER of the document
        const document = await prisma.document.findUnique({
            where: {
                id: documentId,
                ownerId: session.user.id
            }
        });

        if (!document) {
            return new NextResponse("Unauthorized or Document Not Found", { status: 403 });
        }

        // 2. Prevent the owner from deleting themselves
        if (userIdToRemove === session.user.id) {
            return new NextResponse("Cannot remove the document owner", { status: 400 });
        }

        // 3. Delete the collaborator
        await prisma.collaborator.delete({
            where: {
                documentId_userId: {
                    documentId: documentId,
                    userId: userIdToRemove,
                }
            }
        });

        // 4. Fetch and return the updated document data
        const updatedDocument = await prisma.document.findUnique({
            where: { id: documentId },
            include: {
                collaborators: {
                    include: {
                        user: { select: { name: true, email: true, image: true } }
                    }
                }
            }
        });

        return NextResponse.json(updatedDocument);

    } catch (error) {
        console.error("Fail to remove collaborator", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
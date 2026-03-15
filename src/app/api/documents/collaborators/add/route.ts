import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

interface Collaborator {
    userId: string,
    role: string
}

export async function POST(req: Request) {
    try {
        const session = await auth();
        const { documentId, collaborators } = await req.json();

        if (!session?.user?.id) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const updatedDocument = await prisma.document.update({
            where: {
                id: documentId,
                ownerId: session.user.id 
            },
            data: {
                collaborators: {
                    upsert: collaborators.map((c: Collaborator) => ({
                        where: {
                            documentId_userId: {
                                documentId: documentId,
                                userId: c.userId,
                            }
                        },
                        update: { role: c.role }, 
                        create: { userId: c.userId, role: c.role } 
                    }))
                }
            },
            include: {
                collaborators: true
            }
        });

        return NextResponse.json(updatedDocument);

    } catch (error) {
        console.error("Fail to update collaborators", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const session = await auth();
        const { documentId, emails, role } = await req.json();

        if (!session?.user?.id) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        if (!emails || !Array.isArray(emails) || emails.length === 0) {
            return new NextResponse("No emails provided", { status: 400 });
        }

        const users = await prisma.user.findMany({
            where: {
                email: { in: emails }
            },
            select: {
                id: true,
                email: true
            }
        });

        if (users.length === 0) {
            return new NextResponse("None of the provided users exist", { status: 404 });
        }

        const updatedDocument = await prisma.document.update({
            where: {
                id: documentId,
                ownerId: session.user.id 
            },
            data: {
                collaborators: {
                    upsert: users.map((user) => ({
                        where: {
                            documentId_userId: {
                                documentId: documentId,
                                userId: user.id,
                            }
                        },
                        update: { role: role }, 
                        create: { userId: user.id, role: role } 
                    }))
                }
            },
            include: {
                collaborators: {
                    include: {
                        user: {
                            select: {
                                name: true,
                                email: true,
                                image: true
                            }
                        }
                    }
                }
            }
        });

        return NextResponse.json(updatedDocument);

    } catch (error) {
        console.error("Fail to update collaborators", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
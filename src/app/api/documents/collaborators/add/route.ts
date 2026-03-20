import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { sendInviteEmails } from "@/lib/services/email"; 

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

        // 1. Find the users in the database
        const users = await prisma.user.findMany({
            where: { email: { in: emails } },
            select: { id: true, email: true }
        });

        if (users.length === 0) {
            return new NextResponse("None of the provided users exist", { status: 404 });
        }

        // 2. Update the Document Collaborators in PostgreSQL
        const updatedDocument = await prisma.document.update({
            where: {
                id: documentId,
                ownerId: session.user.id 
            },
            data: {
                collaborators: {
                    upsert: users.map((user) => ({
                        where: {
                            documentId_userId: { documentId, userId: user.id }
                        },
                        update: { role: role }, 
                        create: { userId: user.id, role: role } 
                    }))
                }
            },
            include: {
                collaborators: {
                    include: {
                        user: { select: { name: true, email: true, image: true } }
                    }
                }
            }
        });
        
        // Get secure inviter data from the server session
        const inviterName = session.user.name || "A collaborator";
        const inviterEmail = session.user.email || "";
        const documentTitle = updatedDocument.title || "Shared Document"; 

        // Extract just the valid emails that we actually found in the DB
        const validEmailsToNotify = users.map(u => u.email).filter(Boolean) as string[];

        // Call your new isolated email service
        try { 
            await sendInviteEmails(
                documentId,
                validEmailsToNotify,
                role,
                inviterName,
                inviterEmail,
                documentTitle
            );

            console.log("Backend Workinh properly")
        } catch (error) {
            console.log("Fail to send the inviation email.", error)
        }

        // 4. Return the fresh DB data to the frontend
        return NextResponse.json(updatedDocument);

    } catch (error) {
        console.error("Fail to update collaborators", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
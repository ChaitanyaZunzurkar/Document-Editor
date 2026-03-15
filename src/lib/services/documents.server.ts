import 'server-only';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

export const getDocumentByIdServer = async (id: string) => {
    const session = await auth();
    
    console.log("Session user ID:", session?.user?.id);
    console.log("Document ID:", id);
    
    if (!session?.user?.id) {
        console.log("No session found — returning null");
        return null;
    }

    const document = await prisma.document.findUnique({
        where: {
            id,
            ownerId: session.user.id
        }
    });

    console.log("Found document:", document);

    return document;
};
import 'server-only';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

export const getDocumentByIdServer = async (id: string) => {
    const session = await auth();
    if (!session?.user?.id) return null;

    return await prisma.document.findFirst({
        where: {
            id,
            OR: [
                { ownerId: session.user.id },       
                { collaborators: {
                    some: { userId: session.user.id }
                }}
            ]
        },
        include: {
            owner: true,
            collaborators: {
                include: {
                    user: true
                }
            }
        }
    });
};
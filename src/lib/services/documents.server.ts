import 'server-only';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

export const getDocumentByIdServer = async (id: string) => {
    const session = await auth();
    const userId = session?.user?.id;

    return await prisma.document.findFirst({
        where: {
            id,
            OR: [
                { isPublic: true },
                ...(userId ? [
                    { ownerId: userId },       
                    { collaborators: {
                        some: { userId: userId }
                    }}
                ] : [])
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
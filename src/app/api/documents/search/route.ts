import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
    try {
        const limit = 5;
        const session = await auth();
        const { searchParams } = new URL(req.url);
        const title = searchParams.get("title") || "";

        if (!session?.user?.id) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        if (!title.trim()) {
            return NextResponse.json([]);
        }

        const documents = await prisma.document.findMany({
            where: {
                AND: [
                    {
                        OR: [
                            { ownerId: session.user.id },
                            {
                                collaborators: {
                                    some: { userId: session.user.id }
                                }
                            }
                        ],
                    },
                    {
                        title: {
                            contains: title,
                            mode: 'insensitive'
                        },
                    }
                ],
            }, 
            take: limit,
            orderBy: { updatedAt: "desc" },
            select: {
                id: true,
                title: true,
                owner: {
                    select: { name: true }
                }
            }
        }); 

        return NextResponse.json(documents);
    } catch (error) {
        console.error("Fail to search documents", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
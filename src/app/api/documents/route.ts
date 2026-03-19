import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return new NextResponse("Unauthorized", { status: 401 })
        }

        const { searchParams } = new URL(req.url)
        const skip = parseInt(searchParams.get("skip") || "0")
        const take = parseInt(searchParams.get("take") || "10")

        const documents = await prisma.document.findMany({
            where: {
                OR: [
                    { ownerId: session.user.id },
                    {
                        collaborators: {
                            some: {
                                userId: session.user.id
                            }
                        }
                    }
                ],
            },
            orderBy: {
                updatedAt: "desc"
            },
            include: {
                owner: true,        
                collaborators: true 
            },
            take: take,
            skip: skip
        })

        return NextResponse.json(documents)

    } catch (error) {
        console.error("[DOCUMENTS_GET_ERROR]", error);
        return new NextResponse("Internal Server Error", { status: 500 })
    }
}
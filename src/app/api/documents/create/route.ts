import { auth } from "@/auth"
import  { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
    const session = await auth();

    if(!session?.user?.id) {
        return new NextResponse("Unauthorized", { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const skip = parseInt(searchParams.get("skip") || "0")
    const take = parseInt(searchParams.get("take") || "10")

    const documents = await prisma.document.findMany({
        where: {
            ownerId: session?.user?.id,
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
}

export async function POST(req: Request) {
    const session = await auth();

    if(!session?.user?.id) {
        return new NextResponse("Unauthorized", { status: 401 })
    }

    try {
        const { title } = await req.json();
        const initialData = Buffer.from("");

        const document = await prisma.document.create({
            data: {
                title: title || "Untitled Document",
                ownerId: session?.user?.id,
                content: initialData,
            }
        })

        return NextResponse.json(document)
    } catch(error) {
        return new NextResponse("Internal Error", { status: 500 })
    }
}
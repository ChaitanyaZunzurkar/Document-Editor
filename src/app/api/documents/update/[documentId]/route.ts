import { auth } from "@/auth"
import  { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"


// update title of the document 
export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ documentId: string }> }
) {
    const session = await auth();
    const { documentId } = await params
    const { title } = await req.json()

    if(!session?.user?.id) {
        return new NextResponse("Unauthorized", { status: 401 })
    }

    if (!title || title.trim().length === 0) {
        return new NextResponse("Title is required", { status: 400 });
    }

    try {
        const updatedDocs = await prisma.document.update({
            where: {
                id: documentId,
                ownerId: session?.user?.id
            },
            data: {
                title: title
            }
        })

        return NextResponse.json(updatedDocs)
    } catch (error: any) {
        console.log(error, "update failed")
        return new NextResponse("Fail to update document", { status: 500 });
    }
}


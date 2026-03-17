import { auth } from "@/auth"
import  { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

// TODO: Prevent Editors and Viewer from deleteing the document only owner should be able to delete the document 
export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ documentId: string }> }
) {
    const session = await auth();
    const { documentId } = await params

    if(!session?.user?.id) {
        return new NextResponse("Unauthorized", { status: 401 })
    }

    try {
        await prisma.document.deleteMany({
            where: {
                ownerId: session?.user?.id,
                id: documentId
            }
        })

        return new NextResponse(null, { status: 204 });
    } catch (error: any) {
        console.log(error, "delete failed")
        return new NextResponse("Fail to delete document", { status: 500 });
    }
}
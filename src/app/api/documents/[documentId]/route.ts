import { auth } from "@/auth"
import  { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function PATCH(
    req: Request,
    { params } : { params : Promise<{ documentId: string }>}
) {
    const session = await auth();
    
    if(!session?.user?.id) {
        return new NextResponse("Unauthorized", { status: 401 })
    }
    const { documentId } = await params;

    const { title, content } = await req.json();

    const document = await prisma.document.update({
        where: {
            id: documentId,
            ownerId: session?.user?.id
        },
        data: { 
            title, 
            content: content ? Buffer.from(content, "utf-8") : undefined,
        }
    })

    return NextResponse.json(document)
}

import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ documentId: string }> } 
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { documentId } = await params;

    const document = await prisma.document.findUnique({
      where: {
        id: documentId,
        OR: [
          { ownerId: session.user.id },
          {
            collaborators: {
              some: { userId: session.user.id }
            }
          }
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

    if (!document) {
      return new NextResponse("Not found or unauthorized", { status: 404 });
    }

    return NextResponse.json(document);

  } catch (error) {
    console.error("[DOCUMENT_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
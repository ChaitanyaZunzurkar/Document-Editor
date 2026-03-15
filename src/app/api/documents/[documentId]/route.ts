import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ documentId: string }> } 
) {
  const session = await auth();

  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { documentId } = await params;

  const document = await prisma.document.findUnique({
    where: {
      id: documentId,
      ownerId: session.user.id
    }
  });

  if (!document) {
    return new NextResponse("Document not found", { status: 404 });
  }

  return NextResponse.json(document);
}

export async function PATCH(
  req: Request,
  { params }: { params: { documentId: string } }
) {
  const session = await auth();

  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { title, content } = await req.json();

  const document = await prisma.document.update({
    where: {
      id: params.documentId,
      ownerId: session.user.id
    },
    data: {
      title,
      content: content ? Buffer.from(content, "utf-8") : undefined
    }
  });

  return NextResponse.json(document);
}
import { Editor } from './editor'
import { Navbar } from './navbar'
import { Toolbar } from './Toolbar'
import { redirect } from "next/navigation";
import { getDocumentByIdServer } from '@/lib/services/documents.server';
import { auth } from '@/auth';

interface DocumentIdProps {
  params: Promise<{ documentId: string }>;
}

const DocumentPage = async ({ params }: DocumentIdProps) => {
  const { documentId } = await params;
  const session = await auth();

  const document = await getDocumentByIdServer(documentId);

  if (!document) {
    redirect("/");
  }

  const htmlContent = document.content ? new TextDecoder().decode(document.content) : "";

  return (
    <div className="min-h-screen bg-[#FAFBFD]">
      <div className="flex flex-col fixed top-0 left-0 right-0 z-10 bg-[#FAFBFD] print:hidden">
        <Navbar initialData={document} />
        <Toolbar />
      </div>

      <div className="pt-[114px] print:pt-0">
        <div className="w-full"> 
           <Editor 
              documentId={documentId}
              userName={session?.user?.name || "Guest"}
              userId={(session?.user as any)?.id || "anonymous"}
              initialContent={htmlContent}
            />
        </div>
      </div>
    </div>
  )
}

export default DocumentPage;
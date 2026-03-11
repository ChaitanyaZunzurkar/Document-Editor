import { DocumentList } from "@/components/ui/document-list"
import { Navbar } from "./navbar"
import { TemplateGallery } from "./TemplateGallery"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

async function getInitialDocuments(userId: string) {
  return await prisma.document.findMany({
    where: { ownerId: userId },
    take: 10,
    skip: 0,
    orderBy: { updatedAt: "desc"}
  })
}

const Home = async () => {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/api/auth/sign-in"); 
  }

  const initialDocuments = await getInitialDocuments(session?.user?.id); 

  return (
    <div className="flex flex-col min-h-screen">
      <div className="fixed top-0 left-0 right-0 z-10 h-16 bg-white">
        <Navbar />
      </div>
      <div className="mt-16">
          <TemplateGallery />
      </div>
      <div className="max-w-screen-xl mx-auto w-full px-16 py-6">
        <DocumentList initialDocuments={initialDocuments} />
      </div>
    </div>
  )
}

export default Home

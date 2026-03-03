"use client";

import { Editor } from './editor'
import { Navbar } from './navbar'
import { Toolbar } from './Toolbar'

interface DocumentIdProps {
  params: Promise<{ documentId: string }>;
}

const DocumentPage = async ({ params }: DocumentIdProps) => {
  // Destructure the documentId from params
  const { documentId } = await params;

  return (
    <div className="min-h-screen bg-[#FAFBFD]">
      <div className="flex flex-col fixed top-0 left-0 right-0 z-10 bg-[#FAFBFD] print:hidden">
        <Navbar />
        <Toolbar />
      </div>

      <div className="pt-[114px] print:pt-0">
        <div className="mx-auto max-w-5xl"> 
           <Editor />
        </div>
      </div>
    </div>
  )
}

export default DocumentPage
import { Editor } from './editor'

interface DocumentId {
  params : Promise<{ documentId :string }>
}

const DocumentPage = async ({ params } : DocumentId) => {
  const documentId = (await (params)).documentId
  return (
    <div className='min-h-screen bg-[#FAFBFD]'>
      <Editor />
    </div>
  )
}

export default DocumentPage
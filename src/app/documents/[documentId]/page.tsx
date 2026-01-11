import { Editor } from './editor'
import { Toolbar } from './Toolbar'

interface DocumentId {
  params : Promise<{ documentId :string }>
}

const DocumentPage = async ({ params } : DocumentId) => {
  const documentId = (await (params)).documentId
  return (
    <div className='min-h-screen bg-[#FAFBFD]'>
      <Toolbar />
      <Editor />
    </div>
  )
}

export default DocumentPage
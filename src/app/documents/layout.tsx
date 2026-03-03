interface DocumentNode {
  children: React.ReactNode
}

const DocumentLayout = ({ children }: DocumentNode) => {
  return <>{children}</>
}

export default DocumentLayout
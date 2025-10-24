interface DocumentNode {
    children : Readonly<React.ReactNode>
}

const DocumentLayout = ({children} : DocumentNode) => {
    return ( 
        <html>
            <body>
                {children}
            </body>
        </html>
     );
}
 
export default DocumentLayout;
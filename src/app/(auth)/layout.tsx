interface AuthNode {
    children : Readonly<React.ReactNode>
}

const AuthLayout = ({children} : AuthNode) => {
    return ( 
        <>
            {children}
        </>
     );
}
 
export default AuthLayout;
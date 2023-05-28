import Header from "./header/header"


function Layout({ children }){
  return( 
  <>
    <Header />
    {children}
  </>
  )
}

export default Layout

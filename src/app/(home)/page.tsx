import { Navbar } from "./navbar"

const Home = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <div className="fixed top-0 left-0 right-0 z-10 h-16 bg-white">
        <Navbar />
      </div>
    </div>
  )
}

export default Home
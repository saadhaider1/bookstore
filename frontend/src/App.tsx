import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import Hero from './components/Hero'
import AuthorSpotlight from './components/AuthorSpotlight'
import RecommendedBooks from './components/RecommendedBooks'
import Categories from './components/Categories'
import SplashScreen from './components/SplashScreen'
import Shop from './pages/Shop'
import Ebook from './pages/Ebook'
import About from './pages/About'
import Wishlist from './pages/Wishlist'
import MyCart from './pages/MyCart'
import SearchPage from './pages/SearchPage'
import UserProfile from './pages/UserProfile'
import Login from './pages/Login'
import Signup from './pages/Signup'
import BookDetails from './pages/BookDetails'
import MockCheckout from './pages/MockCheckout'

function PageWrapper({ children }: { children: React.ReactNode }) {
  return <div className="page-fade-in">{children}</div>
}

function Home() {
  return (
    <>
      <Hero />
      <AuthorSpotlight />
      <RecommendedBooks />
      <Categories />
    </>
  )
}

function App() {
  const [showSplash, setShowSplash] = useState(true)

  return (
    <>
      {showSplash && <SplashScreen onComplete={() => setShowSplash(false)} />}
      <Router>
        <div className={`min-h-screen bg-gray-50 ${showSplash ? 'hidden' : ''}`}>
          <Header />
          <Routes>
            <Route path="/" element={<PageWrapper><Home /></PageWrapper>} />
            <Route path="/shop" element={<PageWrapper><Shop /></PageWrapper>} />
            <Route path="/ebook" element={<PageWrapper><Ebook /></PageWrapper>} />
            <Route path="/about" element={<PageWrapper><About /></PageWrapper>} />
            <Route path="/wishlist" element={<PageWrapper><Wishlist /></PageWrapper>} />
            <Route path="/cart" element={<PageWrapper><MyCart /></PageWrapper>} />
            <Route path="/search" element={<PageWrapper><SearchPage /></PageWrapper>} />
            <Route path="/profile" element={<PageWrapper><UserProfile /></PageWrapper>} />
            <Route path="/login" element={<PageWrapper><Login /></PageWrapper>} />
            <Route path="/signup" element={<PageWrapper><Signup /></PageWrapper>} />
            <Route path="/book/:id" element={<PageWrapper><BookDetails /></PageWrapper>} />
            <Route path="/payment" element={<PageWrapper><MockCheckout /></PageWrapper>} />
          </Routes>
        </div>
      </Router>
    </>
  )
}

export default App

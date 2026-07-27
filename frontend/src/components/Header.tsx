import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Search, User, ShoppingCart, Heart } from 'lucide-react'

export default function Header() {
  const [cartCount, setCartCount] = useState(0)

  const fetchCartCount = () => {
    const token = localStorage.getItem('token')
    if (!token) {
      setCartCount(0)
      return
    }
    fetch('/api/cart', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.ok ? res.json() : [])
      .then(data => {
        if (Array.isArray(data)) {
          const count = data.reduce((sum: number, item: any) => sum + item.quantity, 0)
          setCartCount(count)
        }
      })
      .catch(console.error)
  }

  useEffect(() => {
    fetchCartCount()
    window.addEventListener('cartUpdated', fetchCartCount)
    // Also listen for login/logout (can trigger cartUpdated too)
    return () => window.removeEventListener('cartUpdated', fetchCartCount)
  }, [])

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex-shrink-0">
            <h1 className="text-2xl font-bold text-primary">Paper Haven</h1>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center nav-container py-2 relative">
            <Link to="/" className="text-gray-700 hover:text-primary transition-colors font-semibold nav-home">
              Home
            </Link>
            <div className="nav-reveal-wrapper space-x-6 pl-6">
              <Link to="/shop" className="text-gray-700 hover:text-primary transition-colors font-medium nav-reveal-link">Shop</Link>
              <Link to="/ebook" className="text-gray-700 hover:text-primary transition-colors font-medium nav-reveal-link">E-book</Link>
              <Link to="/about" className="text-gray-700 hover:text-primary transition-colors font-medium nav-reveal-link">About</Link>
              <Link to="/wishlist" className="text-gray-700 hover:text-primary transition-colors font-medium nav-reveal-link">Wishlist</Link>
              <Link to="/cart" className="text-gray-700 hover:text-primary transition-colors font-medium nav-reveal-link">My cart</Link>
            </div>
            
            <style>{`
              .nav-container {
                display: flex;
                align-items: center;
              }
              
              .nav-home {
                position: relative;
                z-index: 10;
              }

              .nav-reveal-wrapper {
                display: flex;
                align-items: center;
                overflow: hidden;
                max-width: 0;
                opacity: 0;
                transition: max-width 0.4s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s ease-out;
              }

              .nav-container:hover .nav-reveal-wrapper {
                max-width: 600px;
                opacity: 1;
              }

              .nav-reveal-link {
                transform: translateX(-15px);
                opacity: 0;
                transition: transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.3s ease-out;
                white-space: nowrap;
              }

              .nav-container:hover .nav-reveal-link {
                transform: translateX(0);
                opacity: 1;
              }

              /* Stagger delays on hover */
              .nav-container:hover .nav-reveal-link:nth-child(1) { transition-delay: 0.04s; }
              .nav-container:hover .nav-reveal-link:nth-child(2) { transition-delay: 0.08s; }
              .nav-container:hover .nav-reveal-link:nth-child(3) { transition-delay: 0.12s; }
              .nav-container:hover .nav-reveal-link:nth-child(4) { transition-delay: 0.16s; }
              .nav-container:hover .nav-reveal-link:nth-child(5) { transition-delay: 0.20s; }
            `}</style>
          </nav>

          {/* Utility Icons */}
          <div className="flex items-center space-x-4">
            <Link to="/search" className="p-2 text-gray-600 hover:text-primary transition-colors">
              <Search size={20} />
            </Link>
            <span className="text-sm text-gray-600">EN</span>
            <Link to="/profile" className="p-2 text-gray-600 hover:text-primary transition-colors">
              <User size={20} />
            </Link>
            <Link to="/wishlist" className="p-2 text-gray-600 hover:text-primary transition-colors relative">
              <Heart size={20} />
            </Link>
            <Link to="/cart" className="p-2 text-gray-600 hover:text-primary transition-colors relative">
              <ShoppingCart size={20} />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>
    </header>
  )
}

import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Heart, ShoppingCart, Trash2 } from 'lucide-react'

interface Book {
  id: number
  title: string
  author: string
  image: string
  rating: number
  price: number
}

export default function Wishlist() {
  const navigate = useNavigate()
  const [wishlist, setWishlist] = useState<Book[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      navigate('/login')
      return
    }

    fetch('/api/wishlist', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then(res => {
        if (!res.ok) throw new Error('Unauthenticated')
        return res.json()
      })
      .then(data => {
        const formatted = data.map((item: any) => ({
          id: item.book_id,
          title: item.title,
          author: item.author,
          image: item.image,
          rating: item.rating,
          price: item.price
        }))
        setWishlist(formatted)
        setLoading(false)
      })
      .catch(err => {
        console.error('Error fetching wishlist:', err)
        setLoading(false)
      })
  }, [navigate])

  const removeFromWishlist = (id: number) => {
    const token = localStorage.getItem('token')
    if (!token) return

    fetch(`/api/wishlist/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then(res => {
        if (res.ok) {
          setWishlist(prev => prev.filter(book => book.id !== id))
        }
      })
      .catch(err => {
        console.error('Error removing from wishlist:', err)
      })
  }

  const handleAddToCart = (bookId: number) => {
    const token = localStorage.getItem('token')
    if (!token) {
      alert('Please login to add items to cart')
      return
    }

    fetch('/api/cart', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ bookId, quantity: 1 })
    })
      .then(res => {
        if (!res.ok) throw new Error('Failed to add to cart')
        window.dispatchEvent(new Event('cartUpdated'))
        alert('Added to cart!')
      })
      .catch(err => {
        console.error('Error adding to cart:', err)
      })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading wishlist...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            <Heart size={28} className="text-red-500 fill-current" />
            <h1 className="text-3xl font-bold text-gray-900">My Wishlist</h1>
          </div>
          <span className="text-gray-600">{wishlist.length} items</span>
        </div>

        {wishlist.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <Heart size={64} className="text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Your wishlist is empty</h2>
            <p className="text-gray-600 mb-6">Start adding books you love to your wishlist</p>
            <Link to="/shop" className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary/90 transition-colors inline-block">
              Browse Books
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {wishlist.map((book) => (
              <div key={book.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative">
                  <img
                    src={book.image}
                    alt={book.title}
                    className="w-full h-64 object-cover"
                  />
                  <button
                    onClick={() => removeFromWishlist(book.id)}
                    className="absolute top-3 right-3 bg-white p-2 rounded-full shadow-md hover:bg-red-50 transition-colors"
                  >
                    <Trash2 size={18} className="text-red-500" />
                  </button>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-1">{book.title}</h3>
                  <p className="text-sm text-gray-600 mb-2">By: {book.author}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-primary">${book.price}</span>
                    <button
                      onClick={() => handleAddToCart(book.id)}
                      className="flex items-center space-x-1 bg-primary text-white px-3 py-2 rounded-lg hover:bg-primary/90 transition-colors text-sm"
                    >
                      <ShoppingCart size={16} />
                      <span>Add</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

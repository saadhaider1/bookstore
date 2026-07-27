import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ShoppingCart, Heart, Star, ArrowLeft, BookOpen } from 'lucide-react'

interface Book {
  id: number
  title: string
  author: string
  image: string
  rating: number
  price: number
  category: string
  description: string
}

export default function BookDetails() {
  const { id } = useParams<{ id: string }>()
  const [book, setBook] = useState<Book | null>(null)
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [isInWishlist, setIsInWishlist] = useState(false)

  useEffect(() => {
    fetch(`/api/books/${id}`)
      .then(res => res.json())
      .then(data => {
        setBook(data)
        setLoading(false)
      })
      .catch(err => {
        console.error('Error fetching book:', err)
        setLoading(false)
      })
  }, [id])

  const handleAddToCart = () => {
    const token = localStorage.getItem('token')
    if (!token) {
      alert('Please login to add items to cart')
      return
    }

    fetch('/api/cart', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ bookId: parseInt(id || '0'), quantity }),
    })
      .then(() => {
        window.dispatchEvent(new Event('cartUpdated'))
        alert('Added to cart!')
      })
      .catch(err => {
        console.error('Error adding to cart:', err)
      })
  }

  const handleToggleWishlist = () => {
    const token = localStorage.getItem('token')
    if (!token) {
      alert('Please login to add items to wishlist')
      return
    }

    if (isInWishlist) {
      fetch(`/api/wishlist/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
        .then(() => {
          setIsInWishlist(false)
          alert('Removed from wishlist')
        })
        .catch(err => {
          console.error('Error removing from wishlist:', err)
        })
    } else {
      fetch('/api/wishlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ bookId: parseInt(id || '0') }),
      })
        .then(() => {
          setIsInWishlist(true)
          alert('Added to wishlist!')
        })
        .catch(err => {
          console.error('Error adding to wishlist:', err)
        })
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20 flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    )
  }

  if (!book) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20 flex items-center justify-center">
        <div className="text-gray-600">Book not found</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Link to="/shop" className="inline-flex items-center space-x-2 text-gray-600 hover:text-primary mb-6">
          <ArrowLeft size={20} />
          <span>Back to Shop</span>
        </Link>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Book Image */}
          <div className="bg-white rounded-2xl shadow-lg p-8 flex items-center justify-center">
            <img
              src={book.image}
              alt={book.title}
              className="max-w-md w-full h-auto rounded-lg shadow-md"
            />
          </div>

          {/* Book Details */}
          <div className="space-y-6">
            <div>
              <span className="inline-block bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium mb-3">
                {book.category}
              </span>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">{book.title}</h1>
              <p className="text-xl text-gray-600">By {book.author}</p>
            </div>

            {/* Rating */}
            <div className="flex items-center space-x-2">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={20}
                    className={i < Math.floor(book.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}
                  />
                ))}
              </div>
              <span className="text-gray-600">{book.rating} out of 5</span>
            </div>

            {/* Price */}
            <div className="text-4xl font-bold text-primary">${book.price}</div>

            {/* Description */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">About this book</h3>
              <p className="text-gray-600 leading-relaxed">{book.description}</p>
            </div>

            {/* Quantity Selector */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition-colors"
                >
                  -
                </button>
                <span className="text-xl font-semibold w-12 text-center">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-10 h-10 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition-colors"
                >
                  +
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-4">
              <button
                onClick={handleAddToCart}
                className="flex-1 bg-primary text-white py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors flex items-center justify-center space-x-2"
              >
                <ShoppingCart size={20} />
                <span>Add to Cart</span>
              </button>
              <button
                onClick={handleToggleWishlist}
                className={`w-14 h-14 rounded-lg border-2 flex items-center justify-center transition-colors ${
                  isInWishlist
                    ? 'border-red-500 text-red-500 bg-red-50'
                    : 'border-gray-300 text-gray-600 hover:border-red-500 hover:text-red-500'
                }`}
              >
                <Heart size={24} className={isInWishlist ? 'fill-current' : ''} />
              </button>
            </div>

            {/* Additional Info */}
            <div className="border-t pt-6 space-y-4">
              <div className="flex items-center space-x-3">
                <BookOpen size={20} className="text-primary" />
                <div>
                  <p className="text-sm text-gray-600">Category</p>
                  <p className="font-semibold text-gray-900">{book.category}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Star size={20} className="text-primary" />
                <div>
                  <p className="text-sm text-gray-600">Rating</p>
                  <p className="font-semibold text-gray-900">{book.rating} / 5</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

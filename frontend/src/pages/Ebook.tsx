import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Download, Star, BookOpen } from 'lucide-react'

interface Book {
  id: number
  title: string
  author: string
  image: string
  rating: number
  price: number
  category: string
}

export default function Ebook() {
  const [books, setBooks] = useState<Book[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/books')
      .then(res => res.json())
      .then(data => {
        setBooks(data)
        setLoading(false)
      })
      .catch(err => {
        console.error('Error fetching books:', err)
        setLoading(false)
      })
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">E-Books Collection</h1>
          <p className="text-lg text-gray-600">Discover our digital library and read anywhere, anytime</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {books.map((book) => (
            <Link key={book.id} to={`/book/${book.id}`} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
              <div className="relative">
                <img
                  src={book.image}
                  alt={book.title}
                  className="w-full h-48 object-cover"
                />
                <div className="absolute top-3 right-3 bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                  Digital
                </div>
              </div>
              <div className="p-6">
                <div className="flex items-center space-x-2 mb-3">
                  <BookOpen size={20} className="text-primary" />
                  <span className="text-sm text-gray-600">{book.category}</span>
                </div>
                <h3 className="font-bold text-xl text-gray-900 mb-2">{book.title}</h3>
                <p className="text-sm text-gray-600 mb-3">By: {book.author}</p>
                <div className="flex items-center mb-4">
                  <Star size={16} className="text-yellow-400 fill-current" />
                  <span className="text-sm text-gray-600 ml-1">{book.rating}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-primary">${book.price}</span>
                  <button 
                    onClick={(e) => {
                      e.preventDefault();
                      const token = localStorage.getItem('token');
                      if (!token) {
                        alert('Please login to add items to cart');
                        return;
                      }
                      fetch('/api/cart', {
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json',
                          'Authorization': `Bearer ${token}`,
                        },
                        body: JSON.stringify({ bookId: book.id, quantity: 1 }),
                      })
                        .then(() => {
                          window.dispatchEvent(new Event('cartUpdated'));
                          alert('Added to cart!');
                        })
                        .catch(err => console.error('Error adding to cart:', err));
                    }}
                    className="flex items-center space-x-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
                  >
                    <Download size={18} />
                    <span>Download</span>
                  </button>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}

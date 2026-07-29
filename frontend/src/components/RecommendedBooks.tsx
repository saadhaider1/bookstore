import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { ShoppingCart, Star } from 'lucide-react'
import { api } from '../config/api'

interface Book {
  id: number
  title: string
  author: string
  image: string
  rating: number
  price: number
}

export default function RecommendedBooks() {
  const [books, setBooks] = useState<Book[]>([])
  const [loading, setLoading] = useState(true)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    api.get('/api/books')
      .then(data => {
        if (Array.isArray(data)) {
          setBooks(data.slice(3, 7))
        } else {
          setBooks([])
        }
        setLoading(false)
      })
      .catch(err => {
        console.error('Error fetching books:', err)
        setLoading(false)
      })
  }, [])

  useEffect(() => {
    if (!loading && containerRef.current) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-bubble-pop')
            observer.unobserve(entry.target)
          }
        })
      }, { threshold: 0.1, rootMargin: '50px' })

      const cards = containerRef.current.querySelectorAll('.book-card')
      cards.forEach((card) => observer.observe(card))

      return () => observer.disconnect()
    }
  }, [loading, books])

  if (loading) {
    return (
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-gray-600">Loading...</div>
          </div>
        </div>
      </section>
    )
  }
  return (
    <section className="py-12 bg-gray-50 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Recommended For You</h2>
          <Link to="/shop" className="text-primary hover:text-primary/80 transition-colors">See all</Link>
        </div>

        <div ref={containerRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {books.map((book, index) => (
            <Link 
              key={book.id} 
              to={`/book/${book.id}`} 
              className="book-card opacity-0 bg-white rounded-xl shadow-md overflow-hidden hover-card-trigger cursor-pointer group"
              style={{ animationDelay: `${index * 150}ms` }}
            >
              <div className="relative overflow-hidden">
                <img
                  src={book.image}
                  alt={book.title}
                  className="w-full h-64 object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-primary transition-colors">{book.title}</h3>
                <p className="text-sm text-gray-600 mb-2">By: {book.author}</p>
                <div className="flex items-center mb-3">
                  <Star size={16} className="text-yellow-400 fill-current" />
                  <span className="text-sm text-gray-600 ml-1">{book.rating}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-primary">${book.price}</span>
                  <button 
                    onClick={(e) => {
                      e.preventDefault();
                      const token = localStorage.getItem('token');
                      if (!token) {
                        alert('Please login to add items to cart');
                        return;
                      }
                      api.post('/api/cart', { bookId: book.id, quantity: 1 }, token)
                        .then(() => {
                          window.dispatchEvent(new Event('cartUpdated'));
                          alert('Added to cart!');
                        })
                        .catch(err => console.error('Error adding to cart:', err));
                    }}
                    className="flex items-center space-x-1 bg-primary text-white px-3 py-2 rounded-lg hover:bg-primary/90 transition-colors text-sm btn-active-scale"
                  >
                    <ShoppingCart size={16} />
                    <span>Add</span>
                  </button>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

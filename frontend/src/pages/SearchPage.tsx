import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Search, X } from 'lucide-react'

interface Book {
  id: number
  title: string
  author: string
  image: string
  rating: number
  price: number
  category: string
}

export default function SearchPage() {
  const [query, setQuery] = useState('')
  const [books, setBooks] = useState<Book[]>([])
  const [filteredBooks, setFilteredBooks] = useState<Book[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/books')
      .then(res => res.json())
      .then(data => {
        setBooks(data)
        setFilteredBooks(data)
        setLoading(false)
      })
      .catch(err => {
        console.error('Error fetching books:', err)
        setLoading(false)
      })
  }, [])

  useEffect(() => {
    if (query.trim() === '') {
      setFilteredBooks(books)
    } else {
      const lowerQuery = query.toLowerCase()
      const filtered = books.filter(book =>
        book.title.toLowerCase().includes(lowerQuery) ||
        book.author.toLowerCase().includes(lowerQuery) ||
        book.category.toLowerCase().includes(lowerQuery)
      )
      setFilteredBooks(filtered)
    }
  }, [query, books])

  const clearSearch = () => {
    setQuery('')
  }

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
        {/* Search Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Search Books</h1>
          
          {/* Search Input */}
          <div className="relative max-w-2xl">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by title, author, or category..."
              className="w-full pl-12 pr-12 py-4 rounded-xl border-2 border-gray-200 focus:border-primary focus:outline-none text-lg"
            />
            <Search size={24} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            {query && (
              <button
                onClick={clearSearch}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={24} />
              </button>
            )}
          </div>
        </div>

        {/* Results */}
        <div>
          <p className="text-gray-600 mb-6">
            {filteredBooks.length} {filteredBooks.length === 1 ? 'result' : 'results'} found
          </p>

          {filteredBooks.length === 0 ? (
            <div className="bg-white rounded-xl shadow-md p-12 text-center">
              <Search size={64} className="text-gray-300 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">No results found</h2>
              <p className="text-gray-600">Try adjusting your search terms</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredBooks.map((book) => (
                <Link key={book.id} to={`/book/${book.id}`} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
                  <img
                    src={book.image}
                    alt={book.title}
                    className="w-full h-64 object-cover"
                  />
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-1">{book.title}</h3>
                    <p className="text-sm text-gray-600 mb-2">By: {book.author}</p>
                    <p className="text-xs text-primary mb-2">{book.category}</p>
                    <p className="text-lg font-bold text-primary">${book.price}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

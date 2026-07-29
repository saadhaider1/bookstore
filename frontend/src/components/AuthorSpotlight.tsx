import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { api } from '../config/api'

interface Author {
  id: number
  name: string
  avatar: string
}

export default function AuthorSpotlight() {
  const [authors, setAuthors] = useState<Author[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/api/authors')
      .then(data => {
        if (Array.isArray(data)) {
          setAuthors(data)
        } else {
          setAuthors([])
        }
        setLoading(false)
      })
      .catch(err => {
        console.error('Error fetching authors:', err)
        setLoading(false)
      })
  }, [])

  if (loading) {
    return (
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center h-32">
            <div className="text-gray-600">Loading...</div>
          </div>
        </div>
      </section>
    )
  }
  return (
    <section className="py-8 md:py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6 md:mb-8">
          <h2 className="text-xl md:text-2xl font-bold text-gray-900">Latest from Authors</h2>
          <div className="flex space-x-2">
            <button className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors">
              <ChevronLeft size={20} className="w-4 h-4 md:w-5 md:h-5" />
            </button>
            <button className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors">
              <ChevronRight size={20} className="w-4 h-4 md:w-5 md:h-5" />
            </button>
          </div>
        </div>

        <div className="flex space-x-4 md:space-x-6 overflow-x-auto pb-4">
          {authors.map((author) => (
            <div key={author.id} className="flex-shrink-0 text-center group cursor-pointer">
              <img
                src={author.avatar}
                alt={author.name}
                className="w-16 h-16 md:w-20 md:h-20 rounded-full mx-auto mb-2 md:mb-3 object-cover border-4 border-primary transition-all duration-300 group-hover:scale-105 group-hover:border-pink-500"
              />
              <p className="text-xs md:text-sm font-medium text-gray-900 group-hover:text-primary transition-colors">{author.name}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

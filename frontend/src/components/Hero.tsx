import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { api } from '../config/api'

interface Book {
  id: number
  title: string
  author: string
  image: string
}

export default function Hero() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [featuredBooks, setFeaturedBooks] = useState<Book[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/api/books')
      .then(data => {
        if (Array.isArray(data)) {
          setFeaturedBooks(data.slice(0, 3))
        } else {
          setFeaturedBooks([])
        }
        setLoading(false)
      })
      .catch(err => {
        console.error('Error fetching books:', err)
        setLoading(false)
      })
  }, [])

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % featuredBooks.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + featuredBooks.length) % featuredBooks.length)
  }

  if (loading) {
    return (
      <section className="bg-gradient-to-r from-amber-50 to-orange-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-gray-600">Loading...</div>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="bg-gradient-to-r from-amber-50 to-orange-50 py-8 md:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
          {/* Text Content */}
          <div className="space-y-4 md:space-y-6 animate-slide-fade-up order-2 md:order-1">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900">Find Your Next Book</h2>
            <p className="text-sm md:text-base lg:text-lg text-gray-600">
              Discover a world where every page brings a new adventure. At Paper Haven, we curate a diverse collection of books.
            </p>
            <Link to="/shop" className="bg-primary text-white px-6 py-3 md:px-8 rounded-lg font-semibold hover:bg-primary/90 transition-colors inline-block text-center btn-active-scale w-full md:w-auto">
              Explore Now
            </Link>
          </div>

          {/* Featured Books Carousel */}
          <div className="relative order-1 md:order-2">
            {featuredBooks.length > 0 ? (
              <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
                <div className="flex items-center justify-center mb-4 md:mb-6">
                  <img
                    src={featuredBooks[currentSlide].image}
                    alt={featuredBooks[currentSlide].title}
                    className="w-32 h-44 md:w-48 md:h-64 object-cover rounded-lg shadow-md animate-float"
                  />
                </div>
                <div className="text-center">
                  <h3 className="text-lg md:text-xl font-bold text-gray-900">{featuredBooks[currentSlide].title}</h3>
                  <p className="text-sm md:text-base text-gray-600">{featuredBooks[currentSlide].author}</p>
                </div>
                
                {/* Navigation Buttons */}
                <button
                  onClick={prevSlide}
                  className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-white rounded-full shadow-md hover:bg-gray-100 transition-colors"
                >
                  <ChevronLeft size={24} className="w-5 h-5 md:w-6 md:h-6" />
                </button>
                <button
                  onClick={nextSlide}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-white rounded-full shadow-md hover:bg-gray-100 transition-colors"
                >
                  <ChevronRight size={24} className="w-5 h-5 md:w-6 md:h-6" />
                </button>

                {/* Pagination Dots */}
                <div className="flex justify-center space-x-2 mt-4">
                  {featuredBooks.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentSlide(index)}
                      className={`w-2 h-2 rounded-full transition-colors ${
                        index === currentSlide ? 'bg-primary' : 'bg-gray-300'
                      }`}
                    />
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 flex items-center justify-center h-48 md:h-64">
                <p className="text-sm md:text-base text-gray-600">No featured books available at the moment.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

import { useState, useEffect } from 'react'
import { BookOpen, Heart, Briefcase, Sparkles } from 'lucide-react'
import { api } from '../config/api'

interface Category {
  id: number
  name: string
  count: number
}

const iconMap: Record<string, any> = {
  'Fiction': BookOpen,
  'Romance': Heart,
  'Business': Briefcase,
  'Self Help': Sparkles,
  'Science': BookOpen,
  'History': BookOpen,
}

export default function Categories() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/api/categories')
      .then(data => {
        if (Array.isArray(data)) {
          setCategories(data)
        } else {
          setCategories([])
        }
        setLoading(false)
      })
      .catch(err => {
        console.error('Error fetching categories:', err)
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
          <h2 className="text-xl md:text-2xl font-bold text-gray-900">Category</h2>
          <a href="#" className="text-primary hover:text-primary/80 transition-colors text-sm md:text-base">See all</a>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
          {categories.map((category) => {
            const Icon = iconMap[category.name] || BookOpen
            return (
              <div
                key={category.id}
                className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-4 md:p-6 text-center hover-card-trigger cursor-pointer group"
              >
                <div className="bg-white rounded-full w-12 h-12 md:w-16 md:h-16 flex items-center justify-center mx-auto mb-2 md:mb-3 shadow-sm transition-all duration-300 group-hover:bg-primary group-hover:text-white">
                  <Icon size={24} className="text-primary transition-transform duration-500 group-hover:rotate-12 group-hover:scale-110 group-hover:text-white w-5 h-5 md:w-6 md:h-6" />
                </div>
                <h3 className="text-xs md:text-sm font-semibold text-gray-900 mb-1 group-hover:text-primary transition-colors">{category.name}</h3>
                <p className="text-xs md:text-sm text-gray-600">{category.count} books</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

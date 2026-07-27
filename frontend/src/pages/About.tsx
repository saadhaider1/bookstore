import { BookOpen, Heart, Users, Award } from 'lucide-react'

export default function About() {
  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">About Paper Haven</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Your trusted destination for discovering, exploring, and enjoying the world of literature
          </p>
        </div>

        {/* Mission Section */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-12">
          <div className="flex items-start space-x-4">
            <div className="bg-primary/10 p-4 rounded-full">
              <BookOpen size={32} className="text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">Our Mission</h2>
              <p className="text-gray-600 leading-relaxed">
                At Paper Haven, we believe that every book has the power to transform lives. Our mission is to connect readers with stories that inspire, educate, and entertain. We curate a diverse collection of books across all genres, ensuring there's something for everyone.
              </p>
            </div>
          </div>
        </div>

        {/* Values Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <div className="bg-white rounded-xl shadow-md p-6 text-center">
            <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart size={32} className="text-primary" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Passion for Reading</h3>
            <p className="text-gray-600">We love books and are dedicated to spreading the joy of reading to everyone.</p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 text-center">
            <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users size={32} className="text-primary" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Community First</h3>
            <p className="text-gray-600">Building a community of readers who share, discuss, and grow together.</p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 text-center">
            <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Award size={32} className="text-primary" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Quality Selection</h3>
            <p className="text-gray-600">Carefully curated collection of the best books from renowned authors.</p>
          </div>
        </div>

        {/* Story Section */}
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Story</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            Paper Haven was born from a simple idea: to create a space where book lovers could discover their next great read. What started as a small bookstore has grown into a comprehensive platform offering both physical and digital books.
          </p>
          <p className="text-gray-700 leading-relaxed mb-4">
            Today, we serve thousands of readers worldwide, offering personalized recommendations, author spotlights, and a curated selection that spans every genre imaginable. Our team of passionate readers works tirelessly to ensure that every visit to Paper Haven is a delightful experience.
          </p>
          <p className="text-gray-700 leading-relaxed">
            Whether you're looking for the latest bestseller, a timeless classic, or a hidden gem, Paper Haven is your haven for all things literary.
          </p>
        </div>

        {/* Contact Section */}
        <div className="mt-12 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Get in Touch</h2>
          <p className="text-gray-600 mb-6">Have questions or suggestions? We'd love to hear from you.</p>
          <button className="bg-primary text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors">
            Contact Us
          </button>
        </div>
      </div>
    </div>
  )
}

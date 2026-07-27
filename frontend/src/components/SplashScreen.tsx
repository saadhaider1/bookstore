import { useState, useEffect } from 'react'

export default function SplashScreen({ onComplete }: { onComplete: () => void }) {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false)
      setTimeout(onComplete, 500)
    }, 3500)

    return () => clearTimeout(timer)
  }, [onComplete])

  return (
    <div className={`fixed inset-0 bg-gradient-to-br from-amber-50 to-orange-100 z-50 flex items-center justify-center transition-opacity duration-500 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
      <div className="text-center">
        {/* Book Animation */}
        <div className="relative w-32 h-40 mx-auto mb-8">
          {/* Book Cover Left */}
          <div className="absolute inset-0 bg-primary rounded-l-lg transform origin-left animate-book-open-left">
            <div className="absolute inset-0 bg-gradient-to-r from-amber-800 to-amber-700 rounded-l-lg flex items-center justify-center">
              <span className="text-white font-bold text-2xl transform -rotate-90 whitespace-nowrap">Paper Haven</span>
            </div>
          </div>
          
          {/* Book Pages */}
          <div className="absolute inset-0 ml-4">
            <div className="relative w-full h-full">
              {/* Page 1 */}
              <div className="absolute inset-0 bg-white rounded-r shadow-lg animate-page-turn-1 origin-left">
                <div className="w-full h-full bg-gradient-to-r from-gray-50 to-white rounded-r border-l-2 border-gray-200"></div>
              </div>
              
              {/* Page 2 */}
              <div className="absolute inset-0 bg-white rounded-r shadow-lg animate-page-turn-2 origin-left">
                <div className="w-full h-full bg-gradient-to-r from-gray-50 to-white rounded-r border-l-2 border-gray-200"></div>
              </div>
              
              {/* Page 3 */}
              <div className="absolute inset-0 bg-white rounded-r shadow-lg animate-page-turn-3 origin-left">
                <div className="w-full h-full bg-gradient-to-r from-gray-50 to-white rounded-r border-l-2 border-gray-200"></div>
              </div>
            </div>
          </div>
          
          {/* Book Spine */}
          <div className="absolute left-0 top-0 bottom-0 w-4 bg-amber-900 rounded-l"></div>
        </div>

        {/* Logo Text */}
        <h1 className="text-4xl font-bold text-primary animate-fade-in-up">Paper Haven</h1>
        <p className="text-gray-600 mt-2 animate-fade-in-up-delayed">Discover Your Next Adventure</p>
      </div>

      <style>{`
        @keyframes bookOpenLeft {
          0% {
            transform: rotateY(0deg);
          }
          100% {
            transform: rotateY(-45deg);
          }
        }

        @keyframes pageTurn {
          0% {
            transform: rotateY(0deg);
            opacity: 1;
          }
          50% {
            transform: rotateY(-90deg);
            opacity: 0.8;
          }
          100% {
            transform: rotateY(-180deg);
            opacity: 0;
          }
        }

        @keyframes fadeInUp {
          0% {
            opacity: 0;
            transform: translateY(20px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-book-open-left {
          animation: bookOpenLeft 1.5s ease-out forwards;
        }

        .animate-page-turn-1 {
          animation: pageTurn 1s ease-in-out 0.5s forwards;
        }

        .animate-page-turn-2 {
          animation: pageTurn 1s ease-in-out 1s forwards;
        }

        .animate-page-turn-3 {
          animation: pageTurn 1s ease-in-out 1.5s forwards;
        }

        .animate-fade-in-up {
          animation: fadeInUp 0.8s ease-out 0.3s forwards;
          opacity: 0;
        }

        .animate-fade-in-up-delayed {
          animation: fadeInUp 0.8s ease-out 0.6s forwards;
          opacity: 0;
        }
      `}</style>
    </div>
  )
}

import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { CheckCircle, ShoppingBag, Home } from 'lucide-react'

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [verifying, setVerifying] = useState(true)
  const [verified, setVerified] = useState(false)

  useEffect(() => {
    const sessionId = searchParams.get('session_id')
    if (!sessionId) {
      navigate('/cart')
      return
    }

    const verifyPayment = async () => {
      const token = localStorage.getItem('token')
      if (!token) {
        setVerifying(false)
        setVerified(false)
        return
      }

      try {
        const response = await fetch(`/api/verify-payment/${sessionId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        })

        const data = await response.json()
        setVerified(data.success)
      } catch (err) {
        console.error('Verification error:', err)
        setVerified(false)
      } finally {
        setVerifying(false)
      }
    }

    verifyPayment()
  }, [searchParams, navigate])

  if (verifying) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20 flex items-center justify-center">
        <div className="text-gray-600">Verifying payment...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
          <div className="mb-8">
            {verified ? (
              <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle size={48} className="text-green-500" />
              </div>
            ) : (
              <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle size={48} className="text-red-500" />
              </div>
            )}
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            {verified ? 'Payment Successful!' : 'Payment Verification Failed'}
          </h1>

          <p className="text-gray-600 mb-8">
            {verified 
              ? 'Thank you for your purchase! Your order has been confirmed and will be shipped soon.'
              : 'There was an issue verifying your payment. Please contact support if you believe this is an error.'
            }
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/orders')}
              className="flex items-center justify-center space-x-2 bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors"
            >
              <ShoppingBag size={20} />
              <span>View Orders</span>
            </button>
            <button
              onClick={() => navigate('/')}
              className="flex items-center justify-center space-x-2 border-2 border-primary text-primary px-6 py-3 rounded-lg font-semibold hover:bg-primary/10 transition-colors"
            >
              <Home size={20} />
              <span>Back to Home</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

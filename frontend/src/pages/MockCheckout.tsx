import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { CreditCard, ShieldCheck, Lock, AlertCircle, ArrowLeft } from 'lucide-react'

export default function MockCheckout() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const sessionId = searchParams.get('session_id') || `mock_session_${Date.now()}`
  const total = parseFloat(searchParams.get('total') || '0')

  const [cardNumber, setCardNumber] = useState('')
  const [expiry, setExpiry] = useState('')
  const [cvc, setCvc] = useState('')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    // Try to pre-fill email and name from logged in user
    const userData = localStorage.getItem('user')
    if (userData) {
      try {
        const parsed = JSON.parse(userData)
        if (parsed.email) setEmail(parsed.email)
        if (parsed.name) setName(parsed.name)
      } catch (e) {
        // ignore
      }
    }
  }, [])

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '')
    const formatted = value.match(/.{1,4}/g)?.join(' ') || value
    setCardNumber(formatted.slice(0, 19))
  }

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '')
    if (value.length > 2) {
      setExpiry(`${value.slice(0, 2)}/${value.slice(2, 4)}`)
    } else {
      setExpiry(value)
    }
  }

  const handleCvcChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '')
    setCvc(value.slice(0, 4))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (cardNumber.replace(/\s/g, '').length < 16) {
      setError('Please enter a valid 16-digit card number.')
      return
    }
    if (expiry.length < 5) {
      setError('Please enter a valid expiry date (MM/YY).')
      return
    }
    if (cvc.length < 3) {
      setError('Please enter a valid CVC.')
      return
    }

    setProcessing(true)

    // Simulate Stripe payment processing delay
    setTimeout(() => {
      setProcessing(false)
      navigate(`/payment-success?session_id=${sessionId}`)
    }, 2000)
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex items-center justify-center p-4 pt-24 font-sans">
      <div className="max-w-4xl w-full grid md:grid-cols-5 gap-8 bg-slate-800 rounded-3xl overflow-hidden shadow-2xl border border-slate-700">
        
        {/* Left Side: Order summary */}
        <div className="md:col-span-2 bg-gradient-to-br from-indigo-900 to-slate-900 p-8 flex flex-col justify-between border-r border-slate-700">
          <div>
            <button 
              onClick={() => navigate('/cart')}
              className="flex items-center space-x-2 text-slate-400 hover:text-slate-100 transition-colors mb-8"
            >
              <ArrowLeft size={18} />
              <span>Back to Cart</span>
            </button>

            <div className="flex items-center space-x-2 mb-6">
              <span className="bg-indigo-600 text-white p-2 rounded-xl">
                <CreditCard size={20} />
              </span>
              <h2 className="text-xl font-bold tracking-wide">Paper Haven</h2>
            </div>
            
            <p className="text-slate-400 text-sm">Amount to pay</p>
            <p className="text-4xl font-extrabold text-white mt-1">${total.toFixed(2)}</p>

            <div className="mt-8 border-t border-slate-700/50 pt-6 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Order Ref</span>
                <span className="font-mono text-slate-300">{sessionId.slice(0, 18)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Payment Gateway</span>
                <span className="text-indigo-400 font-semibold">Stripe (Simulated)</span>
              </div>
            </div>
          </div>

          <div className="mt-12 space-y-4">
            <div className="flex items-center space-x-2 text-xs text-slate-400">
              <Lock size={14} className="text-indigo-400" />
              <span>Secured by 256-bit SSL encryption</span>
            </div>
            <div className="flex items-center space-x-2 text-xs text-slate-400">
              <ShieldCheck size={14} className="text-indigo-400" />
              <span>PCI-DSS Compliant Gateway</span>
            </div>
          </div>
        </div>

        {/* Right Side: Credit Card Form */}
        <div className="md:col-span-3 p-8 flex flex-col justify-center">
          <h3 className="text-2xl font-bold text-white mb-6">Pay with Card</h3>
          
          {error && (
            <div className="bg-red-950/50 border border-red-500/50 text-red-200 px-4 py-3 rounded-xl mb-6 flex items-start space-x-2 text-sm">
              <AlertCircle size={20} className="text-red-400 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Address */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="reader@example.com"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors"
                required
              />
            </div>

            {/* Card Information */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Card Information</label>
              <div className="bg-slate-900 border border-slate-700 rounded-xl overflow-hidden divide-y divide-slate-700">
                
                {/* Card Number */}
                <div className="relative">
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={handleCardNumberChange}
                    placeholder="4242 4242 4242 4242"
                    className="w-full bg-transparent px-4 py-3.5 text-white placeholder-slate-500 focus:outline-none"
                    required
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center space-x-2 text-slate-400">
                    <span className="text-xs uppercase tracking-widest text-indigo-400 font-mono font-bold">Visa / MC</span>
                  </div>
                </div>

                {/* Expiry and CVC */}
                <div className="grid grid-cols-2 divide-x divide-slate-700">
                  <input
                    type="text"
                    value={expiry}
                    onChange={handleExpiryChange}
                    placeholder="MM / YY"
                    className="bg-transparent px-4 py-3.5 text-white placeholder-slate-500 focus:outline-none"
                    required
                  />
                  <input
                    type="text"
                    value={cvc}
                    onChange={handleCvcChange}
                    placeholder="CVC"
                    className="bg-transparent px-4 py-3.5 text-white placeholder-slate-500 focus:outline-none"
                    required
                  />
                </div>

              </div>
            </div>

            {/* Cardholder Name */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Name on Card</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Alice Reader"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors"
                required
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={processing}
              className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-indigo-500 active:bg-indigo-700 transition-all flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-600/20"
            >
              {processing ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Processing Payment...</span>
                </>
              ) : (
                <span>Pay ${total.toFixed(2)}</span>
              )}
            </button>
          </form>

          {/* Secure disclaimer */}
          <p className="text-center text-[10px] text-slate-500 mt-6 leading-relaxed">
            This is a secure mock payment window simulating Stripe Checkout. Do not enter real credit card numbers except test card numbers like 4242 4242 4242 4242.
          </p>
        </div>

      </div>
    </div>
  )
}

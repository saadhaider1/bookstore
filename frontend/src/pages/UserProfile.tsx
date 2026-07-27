import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { User, Mail, Phone, MapPin, Edit, LogOut, BookOpen, Heart, ShoppingBag } from 'lucide-react'

interface UserProfileData {
  name: string
  email: string
  phone: string
  address: string
  bio: string
  avatar?: string
}

interface OrderData {
  id: number
  total: number
  status: string
  created_at: string
  item_count: number
}

export default function UserProfile() {
  const navigate = useNavigate()
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<UserProfileData>({
    name: '',
    email: '',
    phone: '',
    address: '',
    bio: '',
    avatar: ''
  })
  const [originalUser, setOriginalUser] = useState<UserProfileData>({
    name: '',
    email: '',
    phone: '',
    address: '',
    bio: '',
    avatar: ''
  })
  const [wishlistCount, setWishlistCount] = useState(0)
  const [orders, setOrders] = useState<OrderData[]>([])

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      navigate('/login')
      return
    }

    setLoading(true)

    // 1. Fetch user profile
    const fetchProfile = fetch('/api/user/profile', {
      headers: { 'Authorization': `Bearer ${token}` }
    }).then(res => {
      if (!res.ok) throw new Error('Unauthenticated')
      return res.json()
    })

    // 2. Fetch wishlist
    const fetchWishlist = fetch('/api/wishlist', {
      headers: { 'Authorization': `Bearer ${token}` }
    }).then(res => res.ok ? res.json() : [])

    // 3. Fetch orders
    const fetchOrders = fetch('/api/orders', {
      headers: { 'Authorization': `Bearer ${token}` }
    }).then(res => res.ok ? res.json() : [])

    Promise.all([fetchProfile, fetchWishlist, fetchOrders])
      .then(([profileData, wishlistData, ordersData]) => {
        const u = {
          name: profileData.name || '',
          email: profileData.email || '',
          phone: profileData.phone || '',
          address: profileData.address || '',
          bio: profileData.bio || '',
          avatar: profileData.avatar || ''
        }
        setUser(u)
        setOriginalUser(u)
        setWishlistCount(wishlistData.length || 0)
        setOrders(ordersData || [])
        setLoading(false)
      })
      .catch(err => {
        console.error('Error fetching profile data:', err)
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        navigate('/login')
      })
  }, [navigate])

  const handleSave = () => {
    const token = localStorage.getItem('token')
    if (!token) return

    fetch('/api/user/profile', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(user)
    })
      .then(res => {
        if (!res.ok) throw new Error('Failed to update profile')
        return res.json()
      })
      .then(data => {
        const u = {
          name: data.user.name || '',
          email: data.user.email || '',
          phone: data.user.phone || '',
          address: data.user.address || '',
          bio: data.user.bio || '',
          avatar: data.user.avatar || ''
        }
        setUser(u)
        setOriginalUser(u)
        localStorage.setItem('user', JSON.stringify(data.user))
        setIsEditing(false)
        alert('Profile updated successfully!')
      })
      .catch(err => {
        console.error('Error updating profile:', err)
        alert('Error updating profile. Please try again.')
      })
  }

  const handleCancel = () => {
    setUser(originalUser)
    setIsEditing(false)
  }

  const handleLogout = () => {
    localStorage.removeItem('user')
    localStorage.removeItem('token')
    navigate('/login')
  }

  const booksReadCount = orders
    .filter(o => o.status === 'Paid')
    .reduce((acc, o) => acc + (o.item_count || 0), 0)

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20 flex items-center justify-center">
        <div className="text-gray-600">Loading profile...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">My Profile</h1>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-md p-6 text-center">
              <div className="w-32 h-32 bg-gradient-to-br from-primary to-secondary rounded-full mx-auto mb-4 flex items-center justify-center overflow-hidden">
                {user.avatar ? (
                  <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  <User size={64} className="text-white" />
                )}
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{user.name}</h2>
              <p className="text-gray-600 mb-4">{user.email}</p>
              
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="w-full bg-primary text-white py-2 rounded-lg hover:bg-primary/90 transition-colors mb-3 flex items-center justify-center space-x-2"
              >
                <Edit size={18} />
                <span>{isEditing ? 'Cancel' : 'Edit Profile'}</span>
              </button>
              
              <button onClick={handleLogout} className="w-full border-2 border-red-500 text-red-500 py-2 rounded-lg hover:bg-red-50 transition-colors flex items-center justify-center space-x-2">
                <LogOut size={18} />
                <span>Logout</span>
              </button>
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-xl shadow-md p-6 mt-6">
              <h3 className="font-bold text-gray-900 mb-4">Quick Stats</h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="bg-primary/10 p-2 rounded-full">
                    <BookOpen size={20} className="text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Books Purchased</p>
                    <p className="text-sm text-gray-600">{booksReadCount} books</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="bg-primary/10 p-2 rounded-full">
                    <Heart size={20} className="text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Wishlist</p>
                    <p className="text-sm text-gray-600">{wishlistCount} books</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="bg-primary/10 p-2 rounded-full">
                    <ShoppingBag size={20} className="text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Orders</p>
                    <p className="text-sm text-gray-600">{orders.length} orders</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Profile Details */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Personal Information</h3>
              
              {isEditing ? (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                    <input
                      type="text"
                      value={user.name}
                      onChange={(e) => setUser({ ...user, name: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Avatar Image URL</label>
                    <input
                      type="url"
                      value={user.avatar || ''}
                      onChange={(e) => setUser({ ...user, avatar: e.target.value })}
                      placeholder="https://example.com/avatar.jpg"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <input
                      type="email"
                      value={user.email}
                      disabled
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                    <input
                      type="tel"
                      value={user.phone}
                      onChange={(e) => setUser({ ...user, phone: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                    <textarea
                      value={user.address}
                      onChange={(e) => setUser({ ...user, address: e.target.value })}
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                    <textarea
                      value={user.bio}
                      onChange={(e) => setUser({ ...user, bio: e.target.value })}
                      rows={4}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                  
                  <div className="flex space-x-4">
                    <button
                      onClick={handleSave}
                      className="flex-1 bg-primary text-white py-2 rounded-lg hover:bg-primary/90 transition-colors"
                    >
                      Save Changes
                    </button>
                    <button
                      onClick={handleCancel}
                      className="flex-1 border-2 border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <div className="bg-primary/10 p-2 rounded-full">
                      <User size={20} className="text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Full Name</p>
                      <p className="font-semibold text-gray-900">{user.name || 'Not Provided'}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4">
                    <div className="bg-primary/10 p-2 rounded-full">
                      <Mail size={20} className="text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Email</p>
                      <p className="font-semibold text-gray-900">{user.email}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4">
                    <div className="bg-primary/10 p-2 rounded-full">
                      <Phone size={20} className="text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Phone</p>
                      <p className="font-semibold text-gray-900">{user.phone || 'Not Provided'}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4">
                    <div className="bg-primary/10 p-2 rounded-full">
                      <MapPin size={20} className="text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Address</p>
                      <p className="font-semibold text-gray-900">{user.address || 'Not Provided'}</p>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Bio</p>
                    <p className="text-gray-900">{user.bio || 'No bio written yet.'}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Recent Orders */}
            <div className="bg-white rounded-xl shadow-md p-6 mt-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Recent Orders</h3>
              {orders.length === 0 ? (
                <p className="text-gray-500">No orders found.</p>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div key={order.id} className="border-b pb-4 last:border-b-0 last:pb-0">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold text-gray-900">Order #{order.id}</p>
                          <p className="text-sm text-gray-600">
                            {order.item_count} {order.item_count === 1 ? 'item' : 'items'} • ${order.total.toFixed(2)}
                          </p>
                        </div>
                        <span className={`text-sm font-semibold ${
                          order.status === 'Paid' 
                            ? 'text-green-600' 
                            : order.status === 'Processing' 
                            ? 'text-yellow-600' 
                            : 'text-gray-600'
                        }`}>
                          {order.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 mt-2">
                        {new Date(order.created_at).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

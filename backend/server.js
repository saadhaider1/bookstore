const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config();

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const stripeSecretKey = process.env.STRIPE_SECRET_KEY || '';
const hasRealStripe = stripeSecretKey && !stripeSecretKey.includes('your_stripe_secret_key_here');
const stripe = hasRealStripe ? require('stripe')(stripeSecretKey) : null;
const db = require('./database');

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

// Middleware
app.use(cors({
  origin: ['https://bookstore-f3a9.vercel.app', 'http://localhost:5173'],
  credentials: true
}));
app.use(express.json());

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    await db.pool.query('SELECT 1');
    res.json({ status: 'ok' });
  } catch (err) {
    console.error('Health check failed:', err.message);
    res.status(500).json({ status: 'error', error: err.message });
  }
});

// Authentication Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'Paper Haven API is running' });
});

// Books Routes
app.get('/api/books', async (req, res) => {
  try {
    const books = await db.prepare('SELECT * FROM books').all();
    res.json(books);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Database error' });
  }
});

app.get('/api/books/:id', async (req, res) => {
  try {
    const book = await db.prepare('SELECT * FROM books WHERE id = ?').get(req.params.id);
    if (book) {
      res.json(book);
    } else {
      res.status(404).json({ message: 'Book not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Database error' });
  }
});

// Authors Routes
app.get('/api/authors', async (req, res) => {
  try {
    const authors = await db.prepare('SELECT * FROM authors').all();
    res.json(authors);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Database error' });
  }
});

// Categories Routes
app.get('/api/categories', async (req, res) => {
  try {
    const categories = await db.prepare('SELECT * FROM categories').all();
    res.json(categories);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Database error' });
  }
});

// User Registration
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, phone, address, bio } = req.body;

    // Check if user already exists
    const existingUser = await db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user
    const insertUser = db.prepare(`
      INSERT INTO users (name, email, password, phone, address, bio, avatar)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    const result = await insertUser.run(name, email, hashedPassword, phone || null, address || null, bio || null, req.body.avatar || null);

    // Get created user
    const user = await db.prepare('SELECT id, name, email, phone, address, bio, avatar FROM users WHERE id = ?').get(result.lastInsertRowid);

    res.status(201).json({ message: 'User created successfully', user });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// User Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Verify password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Return user data without password
    const { password: _, ...userWithoutPassword } = user;

    res.json({
      message: 'Login successful',
      token,
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// Get User Profile (Protected)
app.get('/api/user/profile', authenticateToken, async (req, res) => {
  try {
    const user = await db.prepare('SELECT id, name, email, phone, address, bio, avatar FROM users WHERE id = ?').get(req.user.userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ message: 'Server error fetching profile' });
  }
});

// Update User Profile (Protected)
app.put('/api/user/profile', authenticateToken, async (req, res) => {
  try {
    const { name, phone, address, bio, avatar } = req.body;

    const updateUser = db.prepare(`
      UPDATE users
      SET name = ?, phone = ?, address = ?, bio = ?, avatar = ?
      WHERE id = ?
    `);

    await updateUser.run(name, phone || null, address || null, bio || null, avatar || null, req.user.userId);

    const user = await db.prepare('SELECT id, name, email, phone, address, bio, avatar FROM users WHERE id = ?').get(req.user.userId);

    res.json({ message: 'Profile updated successfully', user });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error updating profile' });
  }
});

// Add to Wishlist (Protected)
app.post('/api/wishlist', authenticateToken, async (req, res) => {
  try {
    const { bookId } = req.body;

    const insertWishlist = db.prepare(`
      INSERT OR IGNORE INTO wishlist (user_id, book_id)
      VALUES (?, ?)
    `);

    await insertWishlist.run(req.user.userId, bookId);

    res.json({ message: 'Added to wishlist' });
  } catch (error) {
    console.error('Wishlist error:', error);
    res.status(500).json({ message: 'Server error adding to wishlist' });
  }
});

// Get Wishlist (Protected)
app.get('/api/wishlist', authenticateToken, async (req, res) => {
  try {
    const wishlist = await db.prepare(`
      SELECT w.*, b.title, b.author, b.image, b.price, b.rating
      FROM wishlist w
      JOIN books b ON w.book_id = b.id
      WHERE w.user_id = ?
    `).all(req.user.userId);

    res.json(wishlist);
  } catch (error) {
    console.error('Get wishlist error:', error);
    res.status(500).json({ message: 'Server error fetching wishlist' });
  }
});

// Remove from Wishlist (Protected)
app.delete('/api/wishlist/:bookId', authenticateToken, async (req, res) => {
  try {
    const deleteWishlist = db.prepare(`
      DELETE FROM wishlist
      WHERE user_id = ? AND book_id = ?
    `);

    await deleteWishlist.run(req.user.userId, req.params.bookId);

    res.json({ message: 'Removed from wishlist' });
  } catch (error) {
    console.error('Remove wishlist error:', error);
    res.status(500).json({ message: 'Server error removing from wishlist' });
  }
});

// Add to Cart (Protected)
app.post('/api/cart', authenticateToken, async (req, res) => {
  try {
    const { bookId, quantity } = req.body;

    const insertCart = db.prepare(`
      INSERT INTO cart (user_id, book_id, quantity)
      VALUES (?, ?, ?)
      ON CONFLICT(user_id, book_id) DO UPDATE SET quantity = cart.quantity + EXCLUDED.quantity
    `);

    await insertCart.run(req.user.userId, bookId, quantity);

    res.json({ message: 'Added to cart' });
  } catch (error) {
    console.error('Cart error:', error);
    res.status(500).json({ message: 'Server error adding to cart' });
  }
});

// Get Cart (Protected)
app.get('/api/cart', authenticateToken, async (req, res) => {
  try {
    const cart = await db.prepare(`
      SELECT c.*, b.title, b.author, b.image, b.price
      FROM cart c
      JOIN books b ON c.book_id = b.id
      WHERE c.user_id = ?
    `).all(req.user.userId);

    res.json(cart);
  } catch (error) {
    console.error('Get cart error:', error);
    res.status(500).json({ message: 'Server error fetching cart' });
  }
});

// Update Cart Item (Protected)
app.put('/api/cart/:bookId', authenticateToken, async (req, res) => {
  try {
    const { quantity } = req.body;

    if (quantity <= 0) {
      const deleteCart = db.prepare(`
        DELETE FROM cart
        WHERE user_id = ? AND book_id = ?
      `);
      await deleteCart.run(req.user.userId, req.params.bookId);
    } else {
      const updateCart = db.prepare(`
        UPDATE cart
        SET quantity = ?
        WHERE user_id = ? AND book_id = ?
      `);
      await updateCart.run(quantity, req.user.userId, req.params.bookId);
    }

    res.json({ message: 'Cart updated' });
  } catch (error) {
    console.error('Update cart error:', error);
    res.status(500).json({ message: 'Server error updating cart' });
  }
});

// Remove from Cart (Protected)
app.delete('/api/cart/:bookId', authenticateToken, async (req, res) => {
  try {
    const deleteCart = db.prepare(`
      DELETE FROM cart
      WHERE user_id = ? AND book_id = ?
    `);

    await deleteCart.run(req.user.userId, req.params.bookId);

    res.json({ message: 'Removed from cart' });
  } catch (error) {
    console.error('Remove cart error:', error);
    res.status(500).json({ message: 'Server error removing from cart' });
  }
});

// Stripe Checkout Session (Protected)
app.post('/api/create-checkout-session', authenticateToken, async (req, res) => {
  try {
    const cartItems = await db.prepare(`
      SELECT c.*, b.title, b.price
      FROM cart c
      JOIN books b ON c.book_id = b.id
      WHERE c.user_id = ?
    `).all(req.user.userId);

    if (cartItems.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }

    // Create order record
    const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const insertOrder = db.prepare(`
      INSERT INTO orders (user_id, total, status)
      VALUES (?, ?, 'Processing')
    `);
    const orderResult = await insertOrder.run(req.user.userId, total);

    // Add order items
    const insertOrderItem = db.prepare(`
      INSERT INTO order_items (order_id, book_id, quantity, price)
      VALUES (?, ?, ?, ?)
    `);

    for (const item of cartItems) {
      await insertOrderItem.run(orderResult.lastInsertRowid, item.book_id, item.quantity, item.price);
    }

    // Clear cart
    const clearCart = db.prepare('DELETE FROM cart WHERE user_id = ?');
    await clearCart.run(req.user.userId);

    if (stripe) {
      const lineItems = cartItems.map(item => ({
        price_data: {
          currency: 'usd',
          product_data: {
            name: item.title,
          },
          unit_amount: Math.round(item.price * 100), // Convert to cents
        },
        quantity: item.quantity,
      }));

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: lineItems,
        mode: 'payment',
        success_url: `${FRONTEND_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${FRONTEND_URL}/payment-cancelled`,
        metadata: {
          userId: req.user.userId,
        },
      });

      res.json({ url: session.url });
    } else {
      // Mock flow if no Stripe key is configured
      console.log('Stripe not configured. Using mock payment checkout flow.');
      const mockSessionId = `mock_session_${Date.now()}`;
      res.json({ url: `${FRONTEND_URL}/payment?session_id=${mockSessionId}&total=${total}` });
    }
  } catch (error) {
    console.error('Stripe checkout error:', error);
    res.status(500).json({ message: 'Error creating checkout session' });
  }
});

// Verify Payment Session
app.get('/api/verify-payment/:sessionId', authenticateToken, async (req, res) => {
  try {
    const { sessionId } = req.params;

    if (sessionId.startsWith('mock_session_')) {
      // Update order status for mock payment
      const updateOrder = db.prepare(`
        UPDATE orders
        SET status = 'Paid'
        WHERE user_id = ? AND status = 'Processing'
      `);
      await updateOrder.run(req.user.userId);

      return res.json({ success: true, status: 'paid' });
    }

    if (!stripe) {
      return res.status(400).json({ message: 'Stripe not configured to verify payment' });
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status === 'paid') {
      // Update order status
      const updateOrder = db.prepare(`
        UPDATE orders
        SET status = 'Paid'
        WHERE user_id = ? AND status = 'Processing'
      `);
      await updateOrder.run(req.user.userId);

      res.json({ success: true, status: 'paid' });
    } else {
      res.json({ success: false, status: session.payment_status });
    }
  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({ message: 'Error verifying payment' });
  }
});

// Get Orders (Protected)
app.get('/api/orders', authenticateToken, async (req, res) => {
  try {
    const orders = await db.prepare(`
      SELECT o.*, 
        (SELECT COUNT(*) FROM order_items WHERE order_id = o.id) as item_count
      FROM orders o
      WHERE o.user_id = ?
      ORDER BY o.created_at DESC
    `).all(req.user.userId);

    res.json(orders);
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ message: 'Server error fetching orders' });
  }
});

// Get Order Details (Protected)
app.get('/api/orders/:orderId', authenticateToken, async (req, res) => {
  try {
    const order = await db.prepare(`
      SELECT * FROM orders
      WHERE id = ? AND user_id = ?
    `).get(req.params.orderId, req.user.userId);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const orderItems = await db.prepare(`
      SELECT oi.*, b.title, b.author, b.image
      FROM order_items oi
      JOIN books b ON oi.book_id = b.id
      WHERE oi.order_id = ?
    `).all(req.params.orderId);

    res.json({ ...order, items: orderItems });
  } catch (error) {
    console.error('Get order details error:', error);
    res.status(500).json({ message: 'Server error fetching order details' });
  }
});

if (require.main === module) {
  app.listen(PORT, async () => {
    console.log(`Server is running on port ${PORT}`);
    try {
      await db.pool.query('SELECT 1');
      console.log('[Database] Connected to Supabase PostgreSQL successfully!');
    } catch (err) {
      console.error('[Database] Connection failed:', err.message);
    }
  });
}

module.exports = app;

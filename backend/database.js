const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.warn('Warning: DATABASE_URL is not set. Database operations will fail.');
}

const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false },
  connectionTimeoutMillis: 10000,
  idleTimeoutMillis: 30000,
  max: 10
});

// Test connection on startup
pool.query('SELECT 1')
  .then(() => console.log('[Database] Connected to Supabase PostgreSQL successfully!'))
  .catch(err => console.error('[Database] Connection failed:', err.message));

// Auto-migrate tables on start
async function autoMigrate() {
  if (!connectionString) return;
  try {
    const client = await pool.connect();
    try {
      console.log('[Database] Checking tables...');
      await client.query(`
        CREATE TABLE IF NOT EXISTS users (
          id SERIAL PRIMARY KEY,
          name TEXT NOT NULL,
          email TEXT UNIQUE NOT NULL,
          password TEXT NOT NULL,
          phone TEXT,
          address TEXT,
          bio TEXT,
          avatar TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        CREATE TABLE IF NOT EXISTS books (
          id SERIAL PRIMARY KEY,
          title TEXT NOT NULL,
          author TEXT NOT NULL,
          image TEXT,
          rating REAL DEFAULT 0,
          price REAL NOT NULL,
          category TEXT NOT NULL,
          description TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        CREATE TABLE IF NOT EXISTS authors (
          id SERIAL PRIMARY KEY,
          name TEXT NOT NULL,
          avatar TEXT,
          bio TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        CREATE TABLE IF NOT EXISTS categories (
          id SERIAL PRIMARY KEY,
          name TEXT UNIQUE NOT NULL,
          count INTEGER DEFAULT 0,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        CREATE TABLE IF NOT EXISTS wishlist (
          id SERIAL PRIMARY KEY,
          user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          book_id INTEGER NOT NULL REFERENCES books(id) ON DELETE CASCADE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(user_id, book_id)
        );
        CREATE TABLE IF NOT EXISTS cart (
          id SERIAL PRIMARY KEY,
          user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          book_id INTEGER NOT NULL REFERENCES books(id) ON DELETE CASCADE,
          quantity INTEGER DEFAULT 1,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(user_id, book_id)
        );
        CREATE TABLE IF NOT EXISTS orders (
          id SERIAL PRIMARY KEY,
          user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          total REAL NOT NULL,
          status TEXT DEFAULT 'Processing',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        CREATE TABLE IF NOT EXISTS order_items (
          id SERIAL PRIMARY KEY,
          order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
          book_id INTEGER NOT NULL REFERENCES books(id),
          quantity INTEGER NOT NULL,
          price REAL NOT NULL
        );
      `);
      console.log('[Database] Tables checked/created.');

      // Check if seeded
      const { rows } = await client.query('SELECT COUNT(*) as count FROM books');
      if (parseInt(rows[0].count) === 0) {
        console.log('[Database] Seeding initial data...');
        const books = [
          { title: 'Atomic Habits', author: 'James Clear', image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=300&h=400&fit=crop', rating: 4.8, price: 32, category: 'Self Help', description: 'An Easy & Proven Way to Build Good Habits & Break Bad Ones' },
          { title: 'The Psychology of Money', author: 'Morgan Housel', image: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=300&h=400&fit=crop', rating: 4.7, price: 35, category: 'Business', description: 'Timeless lessons on wealth, greed, and happiness' },
          { title: 'The Almanack Of Naval Ravikant', author: 'Eric Jorgenson', image: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=300&h=400&fit=crop', rating: 4.9, price: 35, category: 'Business', description: 'A guide to wealth and happiness' },
          { title: 'Deep Work', author: 'Cal Newport', image: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=300&h=400&fit=crop', rating: 4.6, price: 28, category: 'Self Help', description: 'Rules for Focused Success in a Distracted World' },
          { title: 'Thinking, Fast and Slow', author: 'Daniel Kahneman', image: 'https://images.unsplash.com/photo-1541963463532-d68292c34b19?w=300&h=400&fit=crop', rating: 4.5, price: 30, category: 'Science', description: 'Explores the two systems that drive the way we think' },
          { title: 'Sapiens', author: 'Yuval Noah Harari', image: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=300&h=400&fit=crop', rating: 4.7, price: 33, category: 'History', description: 'A Brief History of Humankind' },
          { title: 'The Great Gatsby', author: 'F. Scott Fitzgerald', image: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=300&h=400&fit=crop', rating: 4.4, price: 25, category: 'Fiction', description: 'A classic American novel' },
          { title: '1984', author: 'George Orwell', image: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=300&h=400&fit=crop', rating: 4.6, price: 27, category: 'Fiction', description: 'A dystopian social science fiction novel' }
        ];
        for (const book of books) {
          await client.query(
            'INSERT INTO books (title, author, image, rating, price, category, description) VALUES ($1, $2, $3, $4, $5, $6, $7)',
            [book.title, book.author, book.image, book.rating, book.price, book.category, book.description]
          );
        }
        const authors = [
          { name: 'James Clear', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop', bio: 'Author of Atomic Habits' },
          { name: 'Morgan Housel', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop', bio: 'Financial writer and investor' },
          { name: 'Yuval Noah Harari', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop', bio: 'Historian and author' },
          { name: 'George Orwell', avatar: 'https://images.unsplash.com/photo-1463453091185-61582044d556?w=100&h=100&fit=crop', bio: 'English novelist and essayist' }
        ];
        for (const author of authors) {
          await client.query('INSERT INTO authors (name, avatar, bio) VALUES ($1, $2, $3)', [author.name, author.avatar, author.bio]);
        }
        const categories = [
          { name: 'Fiction', count: 2 }, { name: 'Romance', count: 0 }, { name: 'Business', count: 2 },
          { name: 'Self Help', count: 2 }, { name: 'Science', count: 1 }, { name: 'History', count: 1 }
        ];
        for (const cat of categories) {
          await client.query('INSERT INTO categories (name, count) VALUES ($1, $2) ON CONFLICT (name) DO NOTHING', [cat.name, cat.count]);
        }
        const hashedPassword = bcrypt.hashSync('password123', 10);
        await client.query(
          'INSERT INTO users (name, email, password, phone, address, bio) VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT (email) DO NOTHING',
          ['John Doe', 'johndoe123@gmail.com', hashedPassword, '+1 234 567 8900', '123 Book Street, Reading City, RC 12345', 'Avid reader and book collector.']
        );
        console.log('[Database] Database seeded successfully!');
      } else {
        console.log('[Database] Database already seeded.');
      }
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('[Database] Migration/seeding error:', error.message);
  }
}

autoMigrate();

module.exports = {
  pool,
  query: (text, params) => pool.query(text, params),
  prepare: (sql) => {
    let pgSql = sql;
    let index = 1;
    pgSql = pgSql.replace(/\?/g, () => `$${index++}`);

    // Handle SQLite-specific syntax
    if (sql.match(/INSERT OR IGNORE INTO/i)) {
      pgSql = pgSql.replace(/INSERT OR IGNORE INTO/gi, 'INSERT INTO');
      if (sql.match(/wishlist/i)) pgSql += ' ON CONFLICT (user_id, book_id) DO NOTHING';
      else if (sql.match(/cart/i)) pgSql += ' ON CONFLICT (user_id, book_id) DO NOTHING';
      else if (sql.match(/users/i)) pgSql += ' ON CONFLICT (email) DO NOTHING';
    }

    // Handle cart upsert
    if (sql.includes('ON CONFLICT(user_id, book_id) DO UPDATE SET quantity = quantity + ?')) {
      pgSql = pgSql.replace(
        /ON CONFLICT\(user_id, book_id\) DO UPDATE SET quantity = quantity \+ \$\d+/i,
        'ON CONFLICT(user_id, book_id) DO UPDATE SET quantity = cart.quantity + EXCLUDED.quantity'
      );
    }

    // Add RETURNING id for inserts
    if (pgSql.trim().toUpperCase().startsWith('INSERT') && !pgSql.toUpperCase().includes('RETURNING')) {
      pgSql += ' RETURNING id';
    }

    return {
      all: async (...params) => {
        const res = await pool.query(pgSql, params.flat());
        return res.rows;
      },
      get: async (...params) => {
        const res = await pool.query(pgSql, params.flat());
        return res.rows[0] || null;
      },
      run: async (...params) => {
        const res = await pool.query(pgSql, params.flat());
        return { lastInsertRowid: res.rows[0]?.id || null };
      }
    };
  }
};

module.exports.healthCheck = async () => {
  return pool.query('SELECT 1');
};

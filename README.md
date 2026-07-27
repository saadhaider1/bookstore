# Paper Haven - Bookstore Application

A modern bookstore application with React frontend and Node.js/Express backend.

## Project Structure

```
book-store/
├── frontend/          # React + Vite frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── Header.tsx
│   │   │   ├── Hero.tsx
│   │   │   ├── AuthorSpotlight.tsx
│   │   │   ├── RecommendedBooks.tsx
│   │   │   └── Categories.tsx
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css
│   ├── package.json
│   └── vite.config.ts
└── backend/           # Node.js + Express backend
    ├── server.js
    ├── package.json
    └── .env
```

## Features

- Modern, responsive UI with TailwindCSS
- Hero section with featured books carousel
- Author spotlight section
- Recommended books grid
- Category browsing
- Shopping cart functionality
- RESTful API backend

## Getting Started

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The frontend will run on `http://localhost:5173`

### Backend Setup

```bash
cd backend
npm install
npm start
```

The backend will run on `http://localhost:5000`

## API Endpoints

- `GET /` - API status
- `GET /api/books` - Get all books
- `GET /api/books/:id` - Get specific book
- `GET /api/authors` - Get all authors
- `GET /api/categories` - Get all categories

## Tech Stack

### Frontend
- React 18
- TypeScript
- Vite
- TailwindCSS
- Lucide React (icons)

### Backend
- Node.js
- Express.js
- CORS

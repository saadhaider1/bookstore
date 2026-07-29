# Vercel Deployment Guide

This project is a monorepo with separate frontend and backend applications. You need to deploy them as separate Vercel projects.

## Prerequisites

- Vercel account (free tier works)
- Git repository with your code pushed
- Supabase PostgreSQL database (for backend)

## Step 1: Deploy Backend

1. **Push your code to Git** (GitHub, GitLab, or Bitbucket)

2. **Create a new Vercel project for backend:**
   - Go to [vercel.com](https://vercel.com)
   - Click "Add New Project"
   - Import your repository
   - **Important**: Set "Root Directory" to `backend`
   - Click "Deploy"

3. **Configure Environment Variables:**
   - Go to your project Settings → Environment Variables
   - Add the following variables:
     ```
     DATABASE_URL=your_supabase_postgresql_connection_string
     JWT_SECRET=your_random_secret_key
     STRIPE_SECRET_KEY=your_stripe_secret_key (optional)
     FRONTEND_URL=your_frontend_vercel_url
     ```

4. **Redeploy** after adding environment variables

5. **Copy your backend URL** (e.g., `https://your-backend.vercel.app`)

## Step 2: Deploy Frontend

1. **Create a new Vercel project for frontend:**
   - Go to [vercel.com](https://vercel.com)
   - Click "Add New Project"
   - Import the same repository
   - **Important**: Set "Root Directory" to `frontend`
   - Click "Deploy"

2. **Configure Environment Variables:**
   - Go to your project Settings → Environment Variables
   - Add:
     ```
     VITE_API_URL=https://your-backend.vercel.app
     ```

3. **Redeploy** after adding environment variables

## Step 3: Update Backend CORS (if needed)

If you encounter CORS errors, update the backend CORS configuration in `backend/server.js`:

```javascript
app.use(cors({
  origin: ['https://your-frontend.vercel.app', 'http://localhost:5173'],
  credentials: true
}));
```

## Troubleshooting

### 404 Error on Deployment

The 404 error you're seeing is likely because:
1. The root directory wasn't set correctly in Vercel
2. The build configuration is wrong
3. The output directory doesn't match

**Solution:** Make sure you set the correct Root Directory when deploying:
- For backend: `backend`
- For frontend: `frontend`

### Build Failures

If the build fails:
1. Check that all dependencies are in `package.json`
2. Ensure the build script exists in `package.json`
3. Check Vercel build logs for specific errors

### API Connection Issues

If the frontend can't connect to the backend:
1. Verify `VITE_API_URL` is set correctly in frontend environment variables
2. Check that backend is deployed and accessible
3. Verify CORS settings on backend
4. Check browser console for specific error messages

## Local Development

To test locally before deploying:

**Backend:**
```bash
cd backend
npm install
npm start
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

The frontend will run on `http://localhost:5173` and backend on `http://localhost:5000`.

## Database Setup

This project uses PostgreSQL (via Supabase). To set up:

1. Create a free Supabase account at [supabase.com](https://supabase.com)
2. Create a new project
3. Go to Settings → Database
4. Copy the "Connection String" (URI format)
5. Use this as your `DATABASE_URL` environment variable

The database will auto-migrate tables on first deployment.

## Current Configuration

- **Backend**: Express.js with PostgreSQL
- **Frontend**: React + Vite with TypeScript
- **Deployment**: Separate Vercel projects for frontend and backend
- **Database**: Supabase PostgreSQL

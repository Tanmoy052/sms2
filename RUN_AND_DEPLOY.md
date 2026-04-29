# Run Locally & Deploy to Vercel

## Prerequisites

- Node.js `>=18` (recommend `18+` or `20+`)
- `npm` installed
- MongoDB database (local or cloud like MongoDB Atlas)
- Project files in the root directory `d:\Download\Projects\studentmanagementsystem2`

## MongoDB Setup

1. **For Local Development:**
   - Install MongoDB Community Server from https://www.mongodb.com/try/download/community
   - Start MongoDB service (default port 27017)
   - The app will connect to `mongodb://localhost:27017/sms`

2. **For Production (Vercel + MongoDB Atlas):**
   - Create a free account at https://www.mongodb.com/atlas
   - Create a new cluster and database
   - Get your connection string from Atlas (use `mongodb+srv://` format)
   - Add this environment variable in Vercel:
     - `MONGODB_URI`: Your MongoDB connection string (should include database name, e.g., `mongodb+srv://user:pass@cluster.mongodb.net/sms?retryWrites=true&w=majority`)

3. **Environment Variables:**
   Create a `.env.local` file in the project root:

   ```
   MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/sms?retryWrites=true&w=majority
   ```

   - The database name (`sms`) is included in the URI
   - For local development, use: `MONGODB_URI=mongodb://localhost:27017/sms`

## Run Locally (Development)

1. Open a terminal in the project root
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the dev server:
   ```bash
   npm run dev
   ```
4. Open in browser:
   - `http://localhost:3000`

## Run Locally (Production)

1. Build the app:
   ```bash
   npm run build
   ```
2. Start the production server:
   ```bash
   npm run start
   ```
3. Open in browser:
   - `http://localhost:3000`
4. If port `3000` is in use, run on another port:

   ```bash
   npm run start -- -p 3001
   ```

   - Then open `http://localhost:3001`

## Quick Test (Demo Logins)

- Admin: `admin` / `admin123`
- Teacher: `amit.kumar` / `teacher123`
- Student: roll number like `34900122001` / any password

## Deploy to Vercel (Easy — Dashboard)

1. Push the project to a Git provider (GitHub, GitLab, Bitbucket)
2. Go to `https://vercel.com` and log in
3. Click `New Project` → `Import` your repository
4. Vercel auto-detects Next.js
   - Build command: `npm run build`
   - Output directory: `.next`
   - Install command: `npm install`
5. **Add Environment Variables:**
   - Go to Project Settings → Environment Variables
   - Add `MONGODB_URI` with your MongoDB Atlas connection string (see MongoDB Setup section)
6. Click `Deploy`
7. Open the provided URL (e.g., `https://your-project.vercel.app`)

Notes:

- A `vercel.json` is already included; defaults are compatible
- Environment variables are required for MongoDB connection (see below)

## Deploy to Vercel (CLI)

1. Install Vercel CLI (or use `npx`):
   ```bash
   npx vercel
   ```
2. Follow the prompts to link the project
3. Deploy a production build:
   ```bash
   npx vercel --prod
   ```
4. Open the deployment URL printed in the terminal

## Troubleshooting

- If you see `'next' is not recognized`, run `npm install` in the project root
- If port `3000` is busy, use `npm run start -- -p 3001`
- Use Node.js `>=18` to avoid toolchain issues

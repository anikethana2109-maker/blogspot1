# Luminex Blog — Share Your Ideas ✨

Luminex Blog is a modern, full-stack blogging platform. It is split into an **Express.js API Backend** powered by **Prisma & SQLite**, and a **React 19 + Vite 6 Frontend** featuring a glassmorphic dark theme, rich transitions, and a fully responsive interface.

---

## 🚀 Key Features

*   **User Authentication**: JWT-based user sign-up, sign-in, and sign-out.
*   **Post Management**: Full CRUD operations for creating, reading, updating, and deleting blog posts.
*   **Search**: Full-text client/server search to search blog titles, content, or authors.
*   **Interactive Comments**: Add, view, edit, and delete comments on individual posts.
*   **User Profiles**: Dedicated author pages listing bio details, custom avatars, and posts.
*   **Admin Dashboard**: Interactive dashboard with platform metrics, user listing, role manipulation (`user` ↔ `admin`), and moderate delete privileges for any post or comment.
*   **Image Uploads**: Native drag-and-drop cover image and user avatar upload.
*   **Glassmorphic Design**: Futuristic, premium dark design using CSS variables, custom typography (Inter font), and responsive layout styling.

---

## 📁 Project Structure

```text
blog/
├── backend/                  # Node.js + Express API
│   ├── prisma/               # Prisma Database Schema & Seed Config
│   ├── src/
│   │   ├── routes/           # API Route Definitions
│   │   ├── middleware/       # Auth guards, Multer upload, Errors
│   │   └── index.js          # Server Entry Point
│   ├── uploads/              # Local storage folder for image uploads
│   └── package.json
│
└── frontend/                 # Vite + React Client
    ├── src/
    │   ├── api/              # Axios configuration & interceptors
    │   ├── components/       # Custom reusable layouts (Navbar, Card, Upload)
    │   ├── context/          # Auth Context State management
    │   ├── pages/            # Application Views (Home, Post, Login, Dashboard)
    │   ├── App.jsx           # Frontend Routes setup
    │   └── index.css         # Custom premium CSS theme design system
    ├── vercel.json           # Client routing configuration
    └── package.json
```

---

## 🛠️ Local Development Setup

Follow these steps to run both the frontend and backend servers locally on your machine.

### Prerequisites
*   Node.js (v18 or higher recommended)
*   npm or yarn

---

### Step 1: Configure & Run the Backend

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install the backend dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `backend/` directory:
   ```env
   PORT=3001
   DATABASE_URL="file:./dev.db"
   JWT_SECRET="your-super-secret-jwt-key"
   ```
4. Run Prisma database migrations to initialize your SQLite database:
   ```bash
   npx prisma migrate dev --name init
   ```
5. Seed the database with mock accounts (an admin user and regular users with sample blog posts):
   ```bash
   npx prisma db seed
   ```
6. Start the local API server:
   ```bash
   npm run dev
   ```
   The backend will now be running on [http://localhost:3001](http://localhost:3001).

   *Default Seed Credentials:*
   - **Admin User**: `admin@blog.com` / `admin123`
   - **Test User 1**: `jane@example.com` / `user123`
   - **Test User 2**: `john@example.com` / `user123`

---

### Step 2: Configure & Run the Frontend

1. Navigate to the frontend directory:
   ```bash
   cd ../frontend
   ```
2. Install frontend dependencies:
   ```bash
   npm install
   ```
3. Start the Vite React development server:
   ```bash
   npm run dev
   ```
   The frontend will now be running on [http://localhost:5173](http://localhost:5173).

---

## 🌐 API Route Documentation (22 Endpoints)

All server routes are prefixed with `/api`.

| Route | Method | Authentication | Description |
|---|---|---|---|
| `/api/auth/register` | `POST` | Public | Registers a new account |
| `/api/auth/login` | `POST` | Public | Authenticates credentials; returns token |
| `/api/auth/logout` | `POST` | User | Invalidate session (client-side) |
| `/api/auth/me` | `GET` | User | Fetch active authenticated profile |
| `/api/users/:id` | `GET` | Public | Fetch user info |
| `/api/users/:id` | `PUT` | User (Owner) | Edit user name, bio, and avatar |
| `/api/users/:id/posts` | `GET` | Public | Get all blog posts from specific author |
| `/api/posts` | `GET` | Public | Fetch posts (paginated, query/tag search) |
| `/api/posts/:id` | `GET` | Public | Single post details and comments |
| `/api/posts` | `POST` | User | Create a new blog post |
| `/api/posts/:id` | `PUT` | User (Author) | Edit custom post details |
| `/api/posts/:id` | `DELETE` | User (Author)/Admin | Delete a post |
| `/api/posts/search?q=` | `GET` | Public | Fast text search on titles and content |
| `/api/posts/:postId/comments` | `GET` | Public | Get all comments under a post |
| `/api/posts/:postId/comments` | `POST` | User | Add a comment to a post |
| `/api/comments/:id` | `PUT` | User (Author) | Edit comment content |
| `/api/comments/:id` | `DELETE` | User (Author)/Admin | Delete comment |
| `/api/admin/stats` | `GET` | Admin | Retrieve user and post counts |
| `/api/admin/users` | `GET` | Admin | Fetch all registered users list |
| `/api/admin/users/:id/role` | `PUT` | Admin | Alter roles (`user` <-> `admin`) |
| `/api/admin/users/:id` | `DELETE` | Admin | Delete a user from the platform |
| `/api/admin/posts/:id` | `DELETE` | Admin | Moderation force-delete any post |
| `/api/admin/comments/:id` | `DELETE` | Admin | Moderation force-delete any comment |
| `/api/uploads/image` | `POST` | User | Upload image, returns public URL path |

---

## ☁️ Deployment Instructions

### 1. Deploying Frontend to Vercel
1. Log in to your [Vercel Dashboard](https://vercel.com).
2. Click **Add New Project** and connect your GitHub repository (`blogspot1`).
3. Set the **Root Directory** settings option to `frontend`.
4. Leave the Build Command as `npm run build` and Output Directory as `dist`.
5. Under **Environment Variables**, add:
   - `VITE_API_BASE_URL`: The URL of your deployed backend API (e.g., `https://your-backend.onrender.com/api`).
6. Click **Deploy**. Vercel will build your application and host it. Our included `vercel.json` file handles routing automatically to prevent refreshing 404s.

### 2. Deploying Backend to Cloud Hosts (Render, Railway, Fly.io)
Since Vercel runs ephemeral serverless instances, hosting the Express backend with SQLite directly on Vercel is not recommended. Instead, host your backend on Render, Railway, or Fly.io:

1. **Switch Database to PostgreSQL/MySQL (Production)**:
   In `backend/prisma/schema.prisma`, update the database provider to your choice of hosted database (such as PostgreSQL via Supabase/Neon):
   ```prisma
   datasource db {
     provider = "postgresql" // originally sqlite
     url      = env("DATABASE_URL")
   }
   ```
2. **Setup DB Connection**: Create a hosted database on Supabase or Neon and copy its connection string.
3. **Deploy Backend Directory**: Setup a Web Service connected to the `backend` subdirectory.
4. **Environment Variables**: Provide these variables in your deployment dashboard:
   - `PORT`: `3001` or dynamic ports
   - `DATABASE_URL`: Your hosted DB connection string
   - `JWT_SECRET`: A secure key
5. **Build and Start Commands**:
   - Build: `npm install && npx prisma migrate deploy`
   - Start: `npm start` (make sure a `start` command in `package.json` points to `node src/index.js`).

### 3. Deploying Full-Stack to Vercel (Monorepo with experimentalServices)
This workspace is configured with a root `vercel.json` containing Vercel's new `experimentalServices` setup, enabling deployment of both the frontend React client and the backend Express server under the same project/domain:
* **Frontend Service** maps to `/`
* **Backend Service** maps to `/_/backend`

To configure:
1. Connect your repository in Vercel.
2. Vercel will automatically read the root `vercel.json` and provision two services.
3. Switch your database in `backend/prisma/schema.prisma` to `postgresql` (as serverless functions do not persist SQLite local files).
4. Add environment variables to the project (e.g. `DATABASE_URL`, `JWT_SECRET`, etc.).


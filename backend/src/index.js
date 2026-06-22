require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const postRoutes = require('./routes/post.routes');
const commentRoutes = require('./routes/comment.routes');
const adminRoutes = require('./routes/admin.routes');
const uploadRoutes = require('./routes/upload.routes');
const { errorHandler } = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 3001;

// --------------- Middleware ---------------
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Serve uploaded images as static files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
app.use('/_/backend/uploads', express.static(path.join(__dirname, '../uploads')));

// --------------- Routes ---------------
const apiRouter = express.Router();
apiRouter.use('/auth', authRoutes);
apiRouter.use('/users', userRoutes);
apiRouter.use('/posts', postRoutes);
apiRouter.use('/', commentRoutes);        // Handles /api/posts/:postId/comments AND /api/comments/:id
apiRouter.use('/admin', adminRoutes);
apiRouter.use('/uploads', uploadRoutes);

// Health check
apiRouter.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 404 handler for unmatched API routes
apiRouter.use('*', (req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Mount the API router
app.use('/api', apiRouter);
app.use('/_/backend/api', apiRouter);

// Centralized error handler
app.use(errorHandler);

// --------------- Start Server ---------------
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log('');
    console.log(`🚀 Blog API running on http://localhost:${PORT}`);
    console.log(`📖 Health check:   http://localhost:${PORT}/api/health`);
    console.log(`📁 Uploads served: http://localhost:${PORT}/uploads/`);
    console.log('');
  });
}

module.exports = app;

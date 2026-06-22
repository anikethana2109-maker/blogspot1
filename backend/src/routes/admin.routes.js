const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticate, requireAdmin } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// All admin routes require authentication + admin role
router.use(authenticate, requireAdmin);

// ─── GET /api/admin/stats ───────────────────────────────────────────────────
// Dashboard statistics
router.get('/stats', async (_req, res, next) => {
  try {
    const [userCount, postCount, commentCount, recentUsers, recentPosts] = await Promise.all([
      prisma.user.count(),
      prisma.post.count(),
      prisma.comment.count(),
      prisma.user.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: { id: true, name: true, email: true, role: true, createdAt: true }
      }),
      prisma.post.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          author: { select: { id: true, name: true } },
          _count: { select: { comments: true } }
        }
      })
    ]);

    res.json({
      userCount,
      postCount,
      commentCount,
      recentUsers,
      recentPosts
    });
  } catch (error) {
    next(error);
  }
});

// ─── GET /api/admin/users ───────────────────────────────────────────────────
// List all users
router.get('/users', async (_req, res, next) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        _count: { select: { posts: true, comments: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(users);
  } catch (error) {
    next(error);
  }
});

// ─── PUT /api/admin/users/:id/role ──────────────────────────────────────────
// Change a user's role
router.put('/users/:id/role', async (req, res, next) => {
  try {
    const { role } = req.body;
    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({ error: 'Role must be "user" or "admin"' });
    }

    const userId = parseInt(req.params.id);
    const user = await prisma.user.update({
      where: { id: userId },
      data: { role },
      select: { id: true, name: true, email: true, role: true }
    });

    res.json(user);
  } catch (error) {
    next(error);
  }
});

// ─── DELETE /api/admin/users/:id ────────────────────────────────────────────
// Delete a user (cannot delete yourself)
router.delete('/users/:id', async (req, res, next) => {
  try {
    const userId = parseInt(req.params.id);
    if (userId === req.user.id) {
      return res.status(400).json({ error: 'You cannot delete your own account from the admin panel' });
    }

    await prisma.user.delete({ where: { id: userId } });
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    next(error);
  }
});

// ─── DELETE /api/admin/posts/:id ────────────────────────────────────────────
// Admin delete any post
router.delete('/posts/:id', async (req, res, next) => {
  try {
    await prisma.post.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    next(error);
  }
});

// ─── DELETE /api/admin/comments/:id ─────────────────────────────────────────
// Admin delete any comment
router.delete('/comments/:id', async (req, res, next) => {
  try {
    await prisma.comment.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

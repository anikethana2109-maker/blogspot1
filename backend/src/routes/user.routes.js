const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticate } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// ─── GET /api/users/:id ─────────────────────────────────────────────────────
router.get('/:id', async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: parseInt(req.params.id) },
      select: {
        id: true,
        name: true,
        bio: true,
        avatar: true,
        role: true,
        createdAt: true,
        _count: { select: { posts: true, comments: true } }
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    next(error);
  }
});

// ─── PUT /api/users/:id ─────────────────────────────────────────────────────
router.put('/:id', authenticate, async (req, res, next) => {
  try {
    const userId = parseInt(req.params.id);
    if (req.user.id !== userId) {
      return res.status(403).json({ error: 'You can only update your own profile' });
    }

    const { name, bio, avatar } = req.body;
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(name && { name }),
        ...(bio !== undefined && { bio }),
        ...(avatar !== undefined && { avatar })
      },
      select: {
        id: true,
        name: true,
        email: true,
        bio: true,
        avatar: true,
        role: true
      }
    });

    res.json(user);
  } catch (error) {
    next(error);
  }
});

// ─── GET /api/users/:id/posts ───────────────────────────────────────────────
router.get('/:id/posts', async (req, res, next) => {
  try {
    const userId = parseInt(req.params.id);

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const posts = await prisma.post.findMany({
      where: { authorId: userId, published: true },
      include: {
        author: { select: { id: true, name: true, avatar: true } },
        _count: { select: { comments: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(posts);
  } catch (error) {
    next(error);
  }
});

module.exports = router;

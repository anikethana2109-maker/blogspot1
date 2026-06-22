const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticate } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// ─── GET /api/posts ─────────────────────────────────────────────────────────
// List all published posts with pagination
router.get('/', async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 10));
    const skip = (page - 1) * limit;

    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where: { published: true },
        include: {
          author: { select: { id: true, name: true, avatar: true } },
          _count: { select: { comments: true } }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.post.count({ where: { published: true } })
    ]);

    res.json({
      posts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
});

// ─── GET /api/posts/search?q= ──────────────────────────────────────────────
// Full-text search on title and content
router.get('/search', async (req, res, next) => {
  try {
    const { q } = req.query;
    if (!q || q.trim().length === 0) {
      return res.status(400).json({ error: 'Search query is required' });
    }

    const searchTerm = q.trim();
    const posts = await prisma.post.findMany({
      where: {
        published: true,
        OR: [
          { title: { contains: searchTerm } },
          { content: { contains: searchTerm } },
          { excerpt: { contains: searchTerm } }
        ]
      },
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

// ─── GET /api/posts/:id ────────────────────────────────────────────────────
// Get a single post with author and comments
router.get('/:id', async (req, res, next) => {
  try {
    const post = await prisma.post.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        author: { select: { id: true, name: true, avatar: true, bio: true } },
        comments: {
          include: {
            author: { select: { id: true, name: true, avatar: true } }
          },
          orderBy: { createdAt: 'desc' }
        },
        _count: { select: { comments: true } }
      }
    });

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    res.json(post);
  } catch (error) {
    next(error);
  }
});

// ─── POST /api/posts ────────────────────────────────────────────────────────
// Create a new post (authenticated)
router.post('/', authenticate, async (req, res, next) => {
  try {
    const { title, content, excerpt, coverImage, published } = req.body;

    if (!title || !content) {
      return res.status(400).json({ error: 'Title and content are required' });
    }

    const post = await prisma.post.create({
      data: {
        title,
        content,
        excerpt: excerpt || content.substring(0, 200).replace(/[#*`\n]/g, '').trim() + '...',
        coverImage: coverImage || null,
        published: published !== undefined ? published : true,
        authorId: req.user.id
      },
      include: {
        author: { select: { id: true, name: true, avatar: true } }
      }
    });

    res.status(201).json(post);
  } catch (error) {
    next(error);
  }
});

// ─── PUT /api/posts/:id ────────────────────────────────────────────────────
// Update a post (author or admin only)
router.put('/:id', authenticate, async (req, res, next) => {
  try {
    const postId = parseInt(req.params.id);
    const post = await prisma.post.findUnique({ where: { id: postId } });

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    if (post.authorId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to edit this post' });
    }

    const { title, content, excerpt, coverImage, published } = req.body;
    const updated = await prisma.post.update({
      where: { id: postId },
      data: {
        ...(title !== undefined && { title }),
        ...(content !== undefined && { content }),
        ...(excerpt !== undefined && { excerpt }),
        ...(coverImage !== undefined && { coverImage }),
        ...(published !== undefined && { published })
      },
      include: {
        author: { select: { id: true, name: true, avatar: true } }
      }
    });

    res.json(updated);
  } catch (error) {
    next(error);
  }
});

// ─── DELETE /api/posts/:id ──────────────────────────────────────────────────
// Delete a post (author or admin only)
router.delete('/:id', authenticate, async (req, res, next) => {
  try {
    const postId = parseInt(req.params.id);
    const post = await prisma.post.findUnique({ where: { id: postId } });

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    if (post.authorId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to delete this post' });
    }

    await prisma.post.delete({ where: { id: postId } });
    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

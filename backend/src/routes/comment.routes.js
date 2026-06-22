const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticate } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// ─── GET /api/posts/:postId/comments ────────────────────────────────────────
// Get all comments on a post
router.get('/posts/:postId/comments', async (req, res, next) => {
  try {
    const postId = parseInt(req.params.postId);

    const post = await prisma.post.findUnique({ where: { id: postId } });
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const comments = await prisma.comment.findMany({
      where: { postId },
      include: {
        author: { select: { id: true, name: true, avatar: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(comments);
  } catch (error) {
    next(error);
  }
});

// ─── POST /api/posts/:postId/comments ───────────────────────────────────────
// Add a comment to a post (authenticated)
router.post('/posts/:postId/comments', authenticate, async (req, res, next) => {
  try {
    const postId = parseInt(req.params.postId);
    const { content } = req.body;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({ error: 'Comment content is required' });
    }

    const post = await prisma.post.findUnique({ where: { id: postId } });
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const comment = await prisma.comment.create({
      data: {
        content: content.trim(),
        authorId: req.user.id,
        postId
      },
      include: {
        author: { select: { id: true, name: true, avatar: true } }
      }
    });

    res.status(201).json(comment);
  } catch (error) {
    next(error);
  }
});

// ─── PUT /api/comments/:id ──────────────────────────────────────────────────
// Edit a comment (author only)
router.put('/comments/:id', authenticate, async (req, res, next) => {
  try {
    const commentId = parseInt(req.params.id);
    const comment = await prisma.comment.findUnique({ where: { id: commentId } });

    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    if (comment.authorId !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to edit this comment' });
    }

    const { content } = req.body;
    if (!content || content.trim().length === 0) {
      return res.status(400).json({ error: 'Comment content is required' });
    }

    const updated = await prisma.comment.update({
      where: { id: commentId },
      data: { content: content.trim() },
      include: {
        author: { select: { id: true, name: true, avatar: true } }
      }
    });

    res.json(updated);
  } catch (error) {
    next(error);
  }
});

// ─── DELETE /api/comments/:id ───────────────────────────────────────────────
// Delete a comment (author or admin)
router.delete('/comments/:id', authenticate, async (req, res, next) => {
  try {
    const commentId = parseInt(req.params.id);
    const comment = await prisma.comment.findUnique({ where: { id: commentId } });

    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    if (comment.authorId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to delete this comment' });
    }

    await prisma.comment.delete({ where: { id: commentId } });
    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

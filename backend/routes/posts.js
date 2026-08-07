const express = require('express');
const db = require('../db');
const { requireAuth, optionalAuth } = require('../middleware/auth');

const router = express.Router();

function serializePost(row, viewerId) {
  const likeCount = db.prepare('SELECT COUNT(*) c FROM likes WHERE post_id = ?').get(row.id).c;
  const commentCount = db.prepare('SELECT COUNT(*) c FROM comments WHERE post_id = ?').get(row.id).c;
  const likedByViewer = viewerId
    ? !!db.prepare('SELECT 1 FROM likes WHERE post_id = ? AND user_id = ?').get(row.id, viewerId)
    : false;

  return {
    id: row.id,
    content: row.content,
    createdAt: row.created_at,
    author: {
      id: row.user_id,
      username: row.username,
      displayName: row.display_name,
      avatarColor: row.avatar_color,
    },
    likeCount,
    commentCount,
    likedByViewer,
  };
}

// GET /api/posts - global feed, newest first
router.get('/', optionalAuth, (req, res) => {
  const rows = db.prepare(`
    SELECT posts.*, users.username, users.display_name, users.avatar_color
    FROM posts JOIN users ON users.id = posts.user_id
    ORDER BY posts.created_at DESC, posts.id DESC
    LIMIT 100
  `).all();
  res.json({ posts: rows.map((r) => serializePost(r, req.userId)) });
});

// POST /api/posts - create a post
router.post('/', requireAuth, (req, res) => {
  const { content } = req.body;
  if (!content || !content.trim()) {
    return res.status(400).json({ error: 'Post content cannot be empty' });
  }
  if (content.length > 500) {
    return res.status(400).json({ error: 'Post content must be 500 characters or fewer' });
  }

  const result = db.prepare('INSERT INTO posts (user_id, content) VALUES (?, ?)').run(req.userId, content.trim());
  const row = db.prepare(`
    SELECT posts.*, users.username, users.display_name, users.avatar_color
    FROM posts JOIN users ON users.id = posts.user_id WHERE posts.id = ?
  `).get(result.lastInsertRowid);

  res.status(201).json({ post: serializePost(row, req.userId) });
});

// DELETE /api/posts/:id - delete own post
router.delete('/:id', requireAuth, (req, res) => {
  const post = db.prepare('SELECT * FROM posts WHERE id = ?').get(req.params.id);
  if (!post) return res.status(404).json({ error: 'Post not found' });
  if (post.user_id !== req.userId) return res.status(403).json({ error: 'You can only delete your own posts' });

  db.prepare('DELETE FROM posts WHERE id = ?').run(post.id);
  res.json({ success: true });
});

// POST /api/posts/:id/like - like a post
router.post('/:id/like', requireAuth, (req, res) => {
  const post = db.prepare('SELECT id FROM posts WHERE id = ?').get(req.params.id);
  if (!post) return res.status(404).json({ error: 'Post not found' });

  try {
    db.prepare('INSERT INTO likes (post_id, user_id) VALUES (?, ?)').run(post.id, req.userId);
  } catch (err) {
    // already liked, ignore (unique constraint)
  }
  const likeCount = db.prepare('SELECT COUNT(*) c FROM likes WHERE post_id = ?').get(post.id).c;
  res.json({ likeCount, likedByViewer: true });
});

// DELETE /api/posts/:id/like - unlike a post
router.delete('/:id/like', requireAuth, (req, res) => {
  db.prepare('DELETE FROM likes WHERE post_id = ? AND user_id = ?').run(req.params.id, req.userId);
  const likeCount = db.prepare('SELECT COUNT(*) c FROM likes WHERE post_id = ?').get(req.params.id).c;
  res.json({ likeCount, likedByViewer: false });
});

// GET /api/posts/:id/comments
router.get('/:id/comments', (req, res) => {
  const rows = db.prepare(`
    SELECT comments.*, users.username, users.display_name, users.avatar_color
    FROM comments JOIN users ON users.id = comments.user_id
    WHERE post_id = ? ORDER BY comments.created_at ASC
  `).all(req.params.id);

  res.json({
    comments: rows.map((r) => ({
      id: r.id,
      content: r.content,
      createdAt: r.created_at,
      author: { id: r.user_id, username: r.username, displayName: r.display_name, avatarColor: r.avatar_color },
    })),
  });
});

// POST /api/posts/:id/comments - add a comment
router.post('/:id/comments', requireAuth, (req, res) => {
  const post = db.prepare('SELECT id FROM posts WHERE id = ?').get(req.params.id);
  if (!post) return res.status(404).json({ error: 'Post not found' });

  const { content } = req.body;
  if (!content || !content.trim()) {
    return res.status(400).json({ error: 'Comment content cannot be empty' });
  }

  const result = db.prepare('INSERT INTO comments (post_id, user_id, content) VALUES (?, ?, ?)').run(post.id, req.userId, content.trim());
  const row = db.prepare(`
    SELECT comments.*, users.username, users.display_name, users.avatar_color
    FROM comments JOIN users ON users.id = comments.user_id WHERE comments.id = ?
  `).get(result.lastInsertRowid);

  res.status(201).json({
    comment: {
      id: row.id,
      content: row.content,
      createdAt: row.created_at,
      author: { id: row.user_id, username: row.username, displayName: row.display_name, avatarColor: row.avatar_color },
    },
  });
});

module.exports = router;

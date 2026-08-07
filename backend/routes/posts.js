const express = require('express');
const { pool } = require('../db');
const { requireAuth, optionalAuth } = require('../middleware/auth');

const router = express.Router();

async function serializePost(row, viewerId) {
  const likeCount = await pool.query('SELECT COUNT(*) c FROM likes WHERE post_id = $1', [row.id]);
  const commentCount = await pool.query('SELECT COUNT(*) c FROM comments WHERE post_id = $1', [row.id]);
  const likedByViewer = viewerId
    ? (await pool.query('SELECT 1 FROM likes WHERE post_id = $1 AND user_id = $2', [row.id, viewerId])).rows.length > 0
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
    likeCount: parseInt(likeCount.rows[0].c, 10),
    commentCount: parseInt(commentCount.rows[0].c, 10),
    likedByViewer,
  };
}

// GET /api/posts - global feed, newest first
router.get('/', optionalAuth, async (req, res) => {
  const { rows } = await pool.query(`
    SELECT posts.*, users.username, users.display_name, users.avatar_color
    FROM posts JOIN users ON users.id = posts.user_id
    ORDER BY posts.created_at DESC, posts.id DESC
    LIMIT 100
  `);
  const posts = await Promise.all(rows.map((r) => serializePost(r, req.userId)));
  res.json({ posts });
});

// POST /api/posts - create a post
router.post('/', requireAuth, async (req, res) => {
  const { content } = req.body;
  if (!content || !content.trim()) {
    return res.status(400).json({ error: 'Post content cannot be empty' });
  }
  if (content.length > 500) {
    return res.status(400).json({ error: 'Post content must be 500 characters or fewer' });
  }

  const inserted = await pool.query('INSERT INTO posts (user_id, content) VALUES ($1, $2) RETURNING id', [
    req.userId,
    content.trim(),
  ]);
  const { rows } = await pool.query(
    `SELECT posts.*, users.username, users.display_name, users.avatar_color
     FROM posts JOIN users ON users.id = posts.user_id WHERE posts.id = $1`,
    [inserted.rows[0].id]
  );

  const post = await serializePost(rows[0], req.userId);
  res.status(201).json({ post });
});

// DELETE /api/posts/:id - delete own post
router.delete('/:id', requireAuth, async (req, res) => {
  const { rows } = await pool.query('SELECT * FROM posts WHERE id = $1', [req.params.id]);
  const post = rows[0];
  if (!post) return res.status(404).json({ error: 'Post not found' });
  if (post.user_id !== req.userId) return res.status(403).json({ error: 'You can only delete your own posts' });

  await pool.query('DELETE FROM posts WHERE id = $1', [post.id]);
  res.json({ success: true });
});

// POST /api/posts/:id/like - like a post
router.post('/:id/like', requireAuth, async (req, res) => {
  const { rows } = await pool.query('SELECT id FROM posts WHERE id = $1', [req.params.id]);
  const post = rows[0];
  if (!post) return res.status(404).json({ error: 'Post not found' });

  try {
    await pool.query('INSERT INTO likes (post_id, user_id) VALUES ($1, $2)', [post.id, req.userId]);
  } catch (err) {
    if (err.code !== '23505') throw err; // already liked, ignore
  }
  const countResult = await pool.query('SELECT COUNT(*) c FROM likes WHERE post_id = $1', [post.id]);
  res.json({ likeCount: parseInt(countResult.rows[0].c, 10), likedByViewer: true });
});

// DELETE /api/posts/:id/like - unlike a post
router.delete('/:id/like', requireAuth, async (req, res) => {
  await pool.query('DELETE FROM likes WHERE post_id = $1 AND user_id = $2', [req.params.id, req.userId]);
  const countResult = await pool.query('SELECT COUNT(*) c FROM likes WHERE post_id = $1', [req.params.id]);
  res.json({ likeCount: parseInt(countResult.rows[0].c, 10), likedByViewer: false });
});

// GET /api/posts/:id/comments
router.get('/:id/comments', async (req, res) => {
  const { rows } = await pool.query(
    `SELECT comments.*, users.username, users.display_name, users.avatar_color
     FROM comments JOIN users ON users.id = comments.user_id
     WHERE post_id = $1 ORDER BY comments.created_at ASC`,
    [req.params.id]
  );

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
router.post('/:id/comments', requireAuth, async (req, res) => {
  const { rows: postRows } = await pool.query('SELECT id FROM posts WHERE id = $1', [req.params.id]);
  if (!postRows[0]) return res.status(404).json({ error: 'Post not found' });

  const { content } = req.body;
  if (!content || !content.trim()) {
    return res.status(400).json({ error: 'Comment content cannot be empty' });
  }

  const inserted = await pool.query(
    'INSERT INTO comments (post_id, user_id, content) VALUES ($1, $2, $3) RETURNING id',
    [req.params.id, req.userId, content.trim()]
  );
  const { rows } = await pool.query(
    `SELECT comments.*, users.username, users.display_name, users.avatar_color
     FROM comments JOIN users ON users.id = comments.user_id WHERE comments.id = $1`,
    [inserted.rows[0].id]
  );
  const row = rows[0];

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

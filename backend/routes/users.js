const express = require('express');
const { pool } = require('../db');
const { requireAuth, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// GET /api/users/suggestions - a few accounts the viewer doesn't already follow
router.get('/suggestions', requireAuth, async (req, res) => {
  const limit = Math.min(parseInt(req.query.limit, 10) || 5, 20);
  const { rows } = await pool.query(
    `SELECT id, username, display_name, bio, avatar_color
     FROM users
     WHERE id != $1
       AND id NOT IN (SELECT following_id FROM follows WHERE follower_id = $1)
     ORDER BY RANDOM()
     LIMIT $2`,
    [req.userId, limit]
  );
  res.json({ users: rows });
});

// GET /api/users/:username - public profile
router.get('/:username', optionalAuth, async (req, res) => {
  const { rows: userRows } = await pool.query(
    'SELECT id, username, email, display_name, bio, avatar_color, created_at FROM users WHERE username = $1',
    [req.params.username]
  );
  const user = userRows[0];
  if (!user) return res.status(404).json({ error: 'User not found' });

  const { rows: postRows } = await pool.query(
    `SELECT posts.*, users.username, users.display_name, users.avatar_color
     FROM posts JOIN users ON users.id = posts.user_id
     WHERE user_id = $1 ORDER BY posts.created_at DESC`,
    [user.id]
  );

  const posts = await Promise.all(
    postRows.map(async (row) => {
      const likeCount = await pool.query('SELECT COUNT(*) c FROM likes WHERE post_id = $1', [row.id]);
      const commentCount = await pool.query('SELECT COUNT(*) c FROM comments WHERE post_id = $1', [row.id]);
      return {
        id: row.id,
        content: row.content,
        image: row.image_data,
        createdAt: row.created_at,
        likeCount: parseInt(likeCount.rows[0].c, 10),
        commentCount: parseInt(commentCount.rows[0].c, 10),
      };
    })
  );

  const followerCount = await pool.query('SELECT COUNT(*) c FROM follows WHERE following_id = $1', [user.id]);
  const followingCount = await pool.query('SELECT COUNT(*) c FROM follows WHERE follower_id = $1', [user.id]);
  const isFollowedByViewer = req.userId
    ? (await pool.query('SELECT 1 FROM follows WHERE follower_id = $1 AND following_id = $2', [req.userId, user.id]))
        .rows.length > 0
    : false;

  res.json({
    user: {
      ...user,
      followerCount: parseInt(followerCount.rows[0].c, 10),
      followingCount: parseInt(followingCount.rows[0].c, 10),
      isFollowedByViewer,
    },
    posts,
  });
});

// PUT /api/users/me - update own profile
router.put('/me', requireAuth, async (req, res) => {
  const { displayName, bio } = req.body;
  await pool.query(
    'UPDATE users SET display_name = COALESCE($1, display_name), bio = COALESCE($2, bio) WHERE id = $3',
    [displayName, bio, req.userId]
  );
  const { rows } = await pool.query(
    'SELECT id, username, email, display_name, bio, avatar_color, created_at FROM users WHERE id = $1',
    [req.userId]
  );
  res.json({ user: rows[0] });
});

// POST /api/users/:username/follow
router.post('/:username/follow', requireAuth, async (req, res) => {
  const { rows } = await pool.query('SELECT id FROM users WHERE username = $1', [req.params.username]);
  const target = rows[0];
  if (!target) return res.status(404).json({ error: 'User not found' });
  if (target.id === req.userId) return res.status(400).json({ error: "You can't follow yourself" });

  try {
    await pool.query('INSERT INTO follows (follower_id, following_id) VALUES ($1, $2)', [req.userId, target.id]);
  } catch (err) {
    if (err.code !== '23505') throw err; // already following, ignore
  }
  res.json({ following: true });
});

// DELETE /api/users/:username/follow
router.delete('/:username/follow', requireAuth, async (req, res) => {
  const { rows } = await pool.query('SELECT id FROM users WHERE username = $1', [req.params.username]);
  const target = rows[0];
  if (!target) return res.status(404).json({ error: 'User not found' });

  await pool.query('DELETE FROM follows WHERE follower_id = $1 AND following_id = $2', [req.userId, target.id]);
  res.json({ following: false });
});

module.exports = router;

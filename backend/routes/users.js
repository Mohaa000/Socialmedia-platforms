const express = require('express');
const db = require('../db');
const { requireAuth, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// GET /api/users/:username - public profile
router.get('/:username', optionalAuth, (req, res) => {
  const user = db.prepare('SELECT id, username, email, display_name, bio, avatar_color, created_at FROM users WHERE username = ?').get(req.params.username);
  if (!user) return res.status(404).json({ error: 'User not found' });

  const posts = db.prepare(`
    SELECT posts.*, users.username, users.display_name, users.avatar_color
    FROM posts JOIN users ON users.id = posts.user_id
    WHERE user_id = ? ORDER BY posts.created_at DESC
  `).all(user.id).map((row) => ({
    id: row.id,
    content: row.content,
    createdAt: row.created_at,
    likeCount: db.prepare('SELECT COUNT(*) c FROM likes WHERE post_id = ?').get(row.id).c,
    commentCount: db.prepare('SELECT COUNT(*) c FROM comments WHERE post_id = ?').get(row.id).c,
  }));

  const followerCount = db.prepare('SELECT COUNT(*) c FROM follows WHERE following_id = ?').get(user.id).c;
  const followingCount = db.prepare('SELECT COUNT(*) c FROM follows WHERE follower_id = ?').get(user.id).c;
  const isFollowedByViewer = req.userId
    ? !!db.prepare('SELECT 1 FROM follows WHERE follower_id = ? AND following_id = ?').get(req.userId, user.id)
    : false;

  res.json({ user: { ...user, followerCount, followingCount, isFollowedByViewer }, posts });
});

// PUT /api/users/me - update own profile
router.put('/me', requireAuth, (req, res) => {
  const { displayName, bio } = req.body;
  db.prepare('UPDATE users SET display_name = COALESCE(?, display_name), bio = COALESCE(?, bio) WHERE id = ?')
    .run(displayName, bio, req.userId);
  const user = db.prepare('SELECT id, username, email, display_name, bio, avatar_color, created_at FROM users WHERE id = ?').get(req.userId);
  res.json({ user });
});

// POST /api/users/:username/follow
router.post('/:username/follow', requireAuth, (req, res) => {
  const target = db.prepare('SELECT id FROM users WHERE username = ?').get(req.params.username);
  if (!target) return res.status(404).json({ error: 'User not found' });
  if (target.id === req.userId) return res.status(400).json({ error: "You can't follow yourself" });

  try {
    db.prepare('INSERT INTO follows (follower_id, following_id) VALUES (?, ?)').run(req.userId, target.id);
  } catch (err) {
    // already following, ignore
  }
  res.json({ following: true });
});

// DELETE /api/users/:username/follow
router.delete('/:username/follow', requireAuth, (req, res) => {
  const target = db.prepare('SELECT id FROM users WHERE username = ?').get(req.params.username);
  if (!target) return res.status(404).json({ error: 'User not found' });

  db.prepare('DELETE FROM follows WHERE follower_id = ? AND following_id = ?').run(req.userId, target.id);
  res.json({ following: false });
});

module.exports = router;

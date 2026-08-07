require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const { initSchema } = require('./db');
const authRoutes = require('./routes/auth');
const postsRoutes = require('./routes/posts');
const usersRoutes = require('./routes/users');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/posts', postsRoutes);
app.use('/api/users', usersRoutes);

app.get('/api/health', (req, res) => res.json({ status: 'ok', time: new Date().toISOString() }));

// Serve the built React frontend (frontend/dist) in production
const frontendDist = path.join(__dirname, '..', 'frontend', 'dist');
app.use(express.static(frontendDist));
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api/')) return next();
  res.sendFile(path.join(frontendDist, 'index.html'), (err) => {
    if (err) res.status(404).send('Frontend not built yet. Run `npm run build` in /frontend.');
  });
});

// Generic error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

initSchema()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`CampusLink server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Failed to initialize database schema', err);
    process.exit(1);
  });

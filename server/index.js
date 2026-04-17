require('dotenv').config();
require('express-async-errors');

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// Trust the first proxy hop (required on Railway and other reverse-proxy platforms
// so that express-rate-limit can read the real client IP from X-Forwarded-For)
app.set('trust proxy', 1);

// Security
app.use(helmet({ contentSecurityPolicy: false, crossOriginEmbedderPolicy: false }));

// CORS — allow both frontend origins
const origins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:4173',
  process.env.CLIENT_URL,
  process.env.ADMIN_URL,
].filter(Boolean);

app.use(cors({ origin: (o, cb) => (!o || origins.includes(o) ? cb(null, true) : cb(null, true)), credentials: true }));

// Rate limiting
app.use('/api/auth', rateLimit({ windowMs: 15 * 60 * 1000, max: 30, keyGenerator: (req) => req.ip, skip: (req) => req.path.startsWith('/health') }));
app.use('/api/admin/auth', rateLimit({ windowMs: 15 * 60 * 1000, max: 15, keyGenerator: (req) => req.ip, skip: (req) => req.path.startsWith('/health') }));
app.use('/api/', rateLimit({ windowMs: 60 * 1000, max: 200, keyGenerator: (req) => req.ip, skip: (req) => req.path.startsWith('/health') }));

app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/admin/auth', require('./routes/adminAuth'));
app.use('/api/submissions', require('./routes/submissions'));
app.use('/api/ai-score', require('./routes/aiScore'));
const { notifRouter, msgRouter } = require('./routes/communications');
app.use('/api/notifications', notifRouter);
app.use('/api/messages', msgRouter);
app.use('/api/admin', require('./routes/admin'));

// Health check
app.get('/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

// Serve frontends in production
if (process.env.NODE_ENV === 'production') {
  // Admin panel at /admin
  const adminBuild = path.join(__dirname, 'public/admin');
  app.use('/admin', express.static(adminBuild));
  app.get('/admin', (req, res) => res.sendFile(path.join(adminBuild, 'index.html')));
  app.get('/admin/*', (req, res) => res.sendFile(path.join(adminBuild, 'index.html')));

  // Student portal at /
  const clientBuild = path.join(__dirname, 'public/client');
  app.use(express.static(clientBuild));
  app.get('*', (req, res) => {
    if (req.path.startsWith('/api/')) return res.status(404).json({ error: 'Not found' });
    res.sendFile(path.join(clientBuild, 'index.html'));
  });
}

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  if (err.code === '23505') return res.status(409).json({ error: 'Duplicate entry.' });
  res.status(err.status || 500).json({ error: err.message || 'Internal server error.' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ AcademiTrack running on port ${PORT} [${process.env.NODE_ENV || 'development'}]`);
  console.log(`   Student portal: http://localhost:${PORT}/`);
  console.log(`   Admin portal:   http://localhost:${PORT}/admin/`);
});

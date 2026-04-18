require('dotenv').config();
require('express-async-errors');

const express   = require('express');
const cors      = require('cors');
const helmet    = require('helmet');
const rateLimit = require('express-rate-limit');
const path      = require('path');
const fs        = require('fs');

const app  = express();
const PORT = process.env.PORT || 5000;

app.use(helmet({ contentSecurityPolicy: false, crossOriginEmbedderPolicy: false, crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({ origin: true, credentials: true }));
app.use('/api/auth',       rateLimit({ windowMs: 15*60*1000, max: 30,  message: { error: 'Too many requests.' } }));
app.use('/api/admin/auth', rateLimit({ windowMs: 15*60*1000, max: 15,  message: { error: 'Too many login attempts.' } }));
app.use('/api/',           rateLimit({ windowMs:    60*1000, max: 300, message: { error: 'Rate limit exceeded.' } }));
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth',          require('./routes/auth'));
app.use('/api/admin/auth',    require('./routes/adminAuth'));
app.use('/api/submissions',   require('./routes/submissions'));
app.use('/api/ai-score',      require('./routes/aiScore'));
app.use('/api/admin',         require('./routes/admin'));
const { notifRouter, msgRouter } = require('./routes/communications');
app.use('/api/notifications', notifRouter);
app.use('/api/messages',      msgRouter);

app.get('/health', (_req, res) => res.json({
  status: 'ok', timestamp: new Date().toISOString(), env: process.env.NODE_ENV || 'development'
}));

if (process.env.NODE_ENV === 'production') {
  const clientBuild = path.join(__dirname, 'public', 'client');
  const adminBuild  = path.join(__dirname, 'public', 'admin');
  const clientIndex = path.join(clientBuild, 'index.html');
  const adminIndex  = path.join(adminBuild,  'index.html');

  console.log(`Client build: ${fs.existsSync(clientIndex) ? 'FOUND' : 'MISSING'}`);
  console.log(`Admin  build: ${fs.existsSync(adminIndex)  ? 'FOUND' : 'MISSING'}`);

  app.use('/admin', express.static(adminBuild, { index: 'index.html' }));
  app.get('/admin',   (_req, res) => res.sendFile(adminIndex));
  app.get('/admin/*', (_req, res) => res.sendFile(adminIndex));

  app.use(express.static(clientBuild, { index: false }));
  app.get('/', (_req, res) => res.sendFile(clientIndex));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api/') || req.path.startsWith('/admin/')) return next();
    res.sendFile(clientIndex);
  });
}

app.use((err, _req, res, _next) => {
  console.error('[ERROR]', err.message);
  if (err.code === '23505') return res.status(409).json({ error: 'Duplicate entry.' });
  if (err.code === '23503') return res.status(400).json({ error: 'Referenced record not found.' });
  if (err.code === '22P02') return res.status(400).json({ error: 'Invalid ID format.' });
  res.status(err.status || 500).json({ error: err.message || 'Internal server error.' });
});

// ── Auto-seed admin on every startup ──────────────────────
async function ensureAdminExists() {
  try {
    const bcrypt = require('bcryptjs');
    const { query } = require('./db');
    const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'academitrack_admin';
    const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Admin@Academi2025';
    const hash = await bcrypt.hash(ADMIN_PASSWORD, 12);
    await query(
      `INSERT INTO moderators (name, username, email, password_hash, role)
       VALUES ($1, $2, $3, $4, 'Super Admin')
       ON CONFLICT (username) DO UPDATE
         SET password_hash = EXCLUDED.password_hash,
             role = 'Super Admin',
             is_active = TRUE`,
      ['System Administrator', ADMIN_USERNAME, 'admin@academitrack.edu', hash]
    );
    console.log(`✅  Admin seeded — username: "${ADMIN_USERNAME}" password: "${ADMIN_PASSWORD}"`);
  } catch (e) {
    console.error('⚠️  Admin seed skipped (DB not ready):', e.message);
  }
}

app.listen(PORT, '0.0.0.0', async () => {
  console.log(`\n✅  AcademiTrack on port ${PORT} [${process.env.NODE_ENV || 'development'}]`);
  console.log(`    Student portal: http://localhost:${PORT}/`);
  console.log(`    Admin portal:   http://localhost:${PORT}/admin/\n`);
  await ensureAdminExists();
});

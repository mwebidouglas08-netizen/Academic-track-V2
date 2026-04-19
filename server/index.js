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

// ── Security ────────────────────────────────────────────────
app.use(helmet({
  contentSecurityPolicy:     false,
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

// ── CORS ────────────────────────────────────────────────────
app.use(cors({ origin: true, credentials: true }));

// ── Rate limiting ───────────────────────────────────────────
app.use('/api/auth',       rateLimit({ windowMs: 15 * 60 * 1000, max: 30,  message: { error: 'Too many requests.' } }));
app.use('/api/admin/auth', rateLimit({ windowMs: 15 * 60 * 1000, max: 15,  message: { error: 'Too many login attempts.' } }));
app.use('/api/',           rateLimit({ windowMs:      60 * 1000, max: 300, message: { error: 'Rate limit exceeded.' } }));

// ── Body parsing ────────────────────────────────────────────
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true }));

// ── API routes ──────────────────────────────────────────────
app.use('/api/auth',          require('./routes/auth'));
app.use('/api/admin/auth',    require('./routes/adminAuth'));
app.use('/api/submissions',   require('./routes/submissions'));
app.use('/api/ai-score',      require('./routes/aiScore'));
app.use('/api/admin',         require('./routes/admin'));

const { notifRouter, msgRouter } = require('./routes/communications');
app.use('/api/notifications', notifRouter);
app.use('/api/messages',      msgRouter);

// ── Health check ────────────────────────────────────────────
app.get('/health', (_req, res) => res.json({
  status: 'ok', timestamp: new Date().toISOString(), env: process.env.NODE_ENV || 'development',
}));

// ── Serve built frontends in production ─────────────────────
if (process.env.NODE_ENV === 'production') {
  const clientBuild = path.join(__dirname, 'public', 'client');
  const adminBuild  = path.join(__dirname, 'public', 'admin');
  const clientIndex = path.join(clientBuild, 'index.html');
  const adminIndex  = path.join(adminBuild,  'index.html');

  console.log(`Client build: ${fs.existsSync(clientIndex) ? 'FOUND ✅' : 'MISSING ❌'}`);
  console.log(`Admin  build: ${fs.existsSync(adminIndex)  ? 'FOUND ✅' : 'MISSING ❌'}`);

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

// ── Global error handler ────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error('[ERROR]', err.message);
  if (err.code === '23505') return res.status(409).json({ error: 'Duplicate entry.' });
  if (err.code === '23503') return res.status(400).json({ error: 'Referenced record not found.' });
  if (err.code === '22P02') return res.status(400).json({ error: 'Invalid ID format.' });
  res.status(err.status || 500).json({ error: err.message || 'Internal server error.' });
});

// ── Seed admin with retry ───────────────────────────────────
// Retries up to 5 times every 3 seconds so it works on Railway
// cold boots when PostgreSQL needs a moment to accept connections.
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function ensureAdmin(attempt = 1) {
  const MAX = 5;
  try {
    const bcrypt     = require('bcryptjs');
    const { query }  = require('./db');

    const username = process.env.ADMIN_USERNAME || 'academitrack_admin';
    const password = process.env.ADMIN_PASSWORD || 'Admin@Academi2025';

    // bcrypt.hash runs at runtime — produces a CORRECT hash every time
    const hash = await bcrypt.hash(password, 12);

    await query(
      `INSERT INTO moderators (name, username, email, password_hash, role, is_active)
       VALUES ($1, $2, $3, $4, 'Super Admin', TRUE)
       ON CONFLICT (username) DO UPDATE
         SET password_hash = EXCLUDED.password_hash,
             name          = EXCLUDED.name,
             role          = 'Super Admin',
             is_active     = TRUE`,
      ['System Administrator', username, 'admin@academitrack.edu', hash]
    );

    console.log(`\n🔑  Admin seeded (attempt ${attempt}/${MAX})`);
    console.log(`    Username : ${username}`);
    console.log(`    Password : ${password}`);
    console.log(`    Portal   : /admin/\n`);

  } catch (err) {
    console.warn(`⚠️  Admin seed attempt ${attempt}/${MAX} failed: ${err.message}`);
    if (attempt < MAX) {
      console.log(`    Retrying in 3s…`);
      await sleep(3000);
      await ensureAdmin(attempt + 1);
    } else {
      console.error('❌  Admin seed failed after all retries. Check DATABASE_URL and run schema.sql.');
    }
  }
}

// ── Start ───────────────────────────────────────────────────
app.listen(PORT, '0.0.0.0', async () => {
  console.log(`\n✅  AcademiTrack on port ${PORT} [${process.env.NODE_ENV || 'development'}]`);
  console.log(`    Student : http://localhost:${PORT}/`);
  console.log(`    Admin   : http://localhost:${PORT}/admin/`);
  await ensureAdmin();
});

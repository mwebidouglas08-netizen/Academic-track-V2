const router = require('express').Router();
const bcrypt = require('bcryptjs');
const { query } = require('../db');
const { signToken, authAdmin } = require('../middleware/auth');

// POST /api/admin/auth/login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password required.' });
  }

  let r;
  try {
    r = await query(
      'SELECT id,name,username,email,role,is_active,password_hash FROM moderators WHERE username=$1',
      [username.trim().toLowerCase()]
    );
  } catch (dbErr) {
    console.error('DB error during admin login:', dbErr.message);
    return res.status(500).json({ error: 'Database error. The moderators table may not exist yet. Run schema.sql in Railway.' });
  }

  if (!r.rows.length) {
    return res.status(401).json({ error: 'Invalid credentials.' });
  }

  const mod = r.rows[0];
  if (!mod.is_active) {
    return res.status(403).json({ error: 'Account deactivated.' });
  }

  const valid = await bcrypt.compare(password, mod.password_hash);
  if (!valid) {
    return res.status(401).json({ error: 'Invalid credentials.' });
  }

  const { password_hash, ...safe } = mod;
  const token = signToken({ id: mod.id, role: 'admin', modRole: mod.role });
  res.json({ token, moderator: safe });
});

// GET /api/admin/auth/me
router.get('/me', authAdmin, async (req, res) => {
  const r = await query(
    'SELECT id,name,username,email,role,created_at FROM moderators WHERE id=$1',
    [req.admin.id]
  );
  if (!r.rows.length) return res.status(404).json({ error: 'Not found' });
  res.json(r.rows[0]);
});

// GET /api/admin/auth/debug  — shows DB state, REMOVE after fixing
router.get('/debug', async (req, res) => {
  try {
    const tables = await query(`
      SELECT table_name FROM information_schema.tables
      WHERE table_schema = 'public'
    `);
    const tableNames = tables.rows.map(r => r.table_name);

    if (!tableNames.includes('moderators')) {
      return res.json({
        status: 'ERROR',
        message: 'moderators table does not exist. Run schema.sql in Railway PostgreSQL Query tab.',
        tables: tableNames,
      });
    }

    const mods = await query('SELECT id, username, role, is_active, created_at FROM moderators');
    res.json({
      status: 'OK',
      tables: tableNames,
      moderators: mods.rows,
      moderator_count: mods.rowCount,
      hint: 'If moderators is empty, the server seed failed. Check ADMIN_USERNAME and ADMIN_PASSWORD env vars.',
    });
  } catch (err) {
    res.status(500).json({ status: 'DB_ERROR', message: err.message });
  }
});

module.exports = router;

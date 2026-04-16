const router = require('express').Router();
const bcrypt = require('bcryptjs');
const { query } = require('../db');
const { signToken, authAdmin } = require('../middleware/auth');

// POST /api/admin/auth/login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'Username and password required.' });

  const r = await query(
    'SELECT id,name,username,email,role,is_active,password_hash FROM moderators WHERE username=$1',
    [username.trim().toLowerCase()]
  );
  if (!r.rows.length) return res.status(401).json({ error: 'Invalid credentials.' });
  const mod = r.rows[0];
  if (!mod.is_active) return res.status(403).json({ error: 'Account deactivated.' });
  const valid = await bcrypt.compare(password, mod.password_hash);
  if (!valid) return res.status(401).json({ error: 'Invalid credentials.' });

  const { password_hash, ...safe } = mod;
  const token = signToken({ id: mod.id, role: 'admin', modRole: mod.role });
  res.json({ token, moderator: safe });
});

// GET /api/admin/auth/me
router.get('/me', authAdmin, async (req, res) => {
  const r = await query(
    'SELECT id,name,username,email,role,created_at FROM moderators WHERE id=$1',
    [req.admin.id]);
  if (!r.rows.length) return res.status(404).json({ error: 'Not found' });
  res.json(r.rows[0]);
});

module.exports = router;

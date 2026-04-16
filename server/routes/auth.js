const router = require('express').Router();
const bcrypt = require('bcryptjs');
const { query } = require('../db');
const { signToken, authStudent } = require('../middleware/auth');

// POST /api/auth/register
router.post('/register', async (req, res) => {
  const { firstName, lastName, regNumber, phone, email, academicLevel, department, researchTopic, password } = req.body;
  if (!firstName || !lastName || !regNumber || !phone || !email || !academicLevel || !department || !password)
    return res.status(400).json({ error: 'All required fields must be filled.' });
  if (password.length < 6)
    return res.status(400).json({ error: 'Password must be at least 6 characters.' });

  const existing = await query('SELECT id FROM students WHERE reg_number=$1 OR email=$2',
    [regNumber.trim().toUpperCase(), email.trim().toLowerCase()]);
  if (existing.rows.length)
    return res.status(409).json({ error: 'Registration number or email already in use.' });

  const hash = await bcrypt.hash(password, 12);
  const r = await query(
    `INSERT INTO students (first_name,last_name,reg_number,phone,email,academic_level,department,research_topic,password_hash)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
     RETURNING id,first_name,last_name,reg_number,email,phone,academic_level,department,research_topic,created_at`,
    [firstName.trim(), lastName.trim(), regNumber.trim().toUpperCase(), phone.trim(),
     email.trim().toLowerCase(), academicLevel, department.trim(), researchTopic?.trim() || null, hash]
  );
  const student = r.rows[0];
  const token = signToken({ id: student.id, role: 'student' });
  res.status(201).json({ token, student });
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { regNumber, password } = req.body;
  if (!regNumber || !password)
    return res.status(400).json({ error: 'Registration number and password are required.' });

  const r = await query(
    `SELECT id,first_name,last_name,reg_number,email,phone,academic_level,department,research_topic,password_hash,is_active,created_at
     FROM students WHERE reg_number=$1`,
    [regNumber.trim().toUpperCase()]
  );
  if (!r.rows.length) return res.status(401).json({ error: 'Invalid credentials.' });
  const s = r.rows[0];
  if (!s.is_active) return res.status(403).json({ error: 'Your account has been deactivated. Contact your moderator.' });
  const valid = await bcrypt.compare(password, s.password_hash);
  if (!valid) return res.status(401).json({ error: 'Invalid credentials.' });

  const { password_hash, ...student } = s;
  const token = signToken({ id: student.id, role: 'student' });
  res.json({ token, student });
});

// GET /api/auth/me
router.get('/me', authStudent, async (req, res) => {
  const r = await query(
    `SELECT id,first_name,last_name,reg_number,email,phone,academic_level,department,research_topic,created_at
     FROM students WHERE id=$1`, [req.user.id]);
  if (!r.rows.length) return res.status(404).json({ error: 'Not found' });
  res.json(r.rows[0]);
});

module.exports = router;

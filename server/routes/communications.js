const router = require('express').Router();
const { query } = require('../db');
const { authStudent } = require('../middleware/auth');

// ── Notifications ─────────────────────────────────────────
const notifRouter = require('express').Router();

notifRouter.get('/', authStudent, async (req, res) => {
  const r = await query(
    `SELECT n.*, m.name AS sender_name FROM notifications n
     LEFT JOIN moderators m ON m.id = n.sent_by
     WHERE n.recipient_type='all' OR n.recipient_id=$1
     ORDER BY n.created_at DESC`, [req.user.id]);
  res.json(r.rows);
});

notifRouter.patch('/:id/read', authStudent, async (req, res) => {
  await query(
    `UPDATE notifications SET is_read=true WHERE id=$1 AND (recipient_type='all' OR recipient_id=$2)`,
    [req.params.id, req.user.id]);
  res.json({ success: true });
});

// ── Messages ──────────────────────────────────────────────
const msgRouter = require('express').Router();

msgRouter.get('/', authStudent, async (req, res) => {
  const r = await query(
    `SELECT m.*, mod.name AS replied_by_name FROM messages m
     LEFT JOIN moderators mod ON mod.id = m.replied_by
     WHERE m.student_id=$1 ORDER BY m.created_at DESC`, [req.user.id]);
  res.json(r.rows);
});

msgRouter.post('/', authStudent, async (req, res) => {
  const { subject, body } = req.body;
  if (!subject || !body) return res.status(400).json({ error: 'Subject and body are required.' });
  const r = await query(
    `INSERT INTO messages (student_id,subject,body) VALUES ($1,$2,$3) RETURNING *`,
    [req.user.id, subject.trim(), body.trim()]);
  res.status(201).json(r.rows[0]);
});

module.exports = { notifRouter, msgRouter };

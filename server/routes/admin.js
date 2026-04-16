const router = require('express').Router();
const bcrypt = require('bcryptjs');
const { query } = require('../db');
const { authAdmin } = require('../middleware/auth');

// ── Stats ─────────────────────────────────────────────────
router.get('/stats', authAdmin, async (req, res) => {
  const [students, subs, approved, msgs, notifs, pending] = await Promise.all([
    query('SELECT COUNT(*)::int AS count FROM students WHERE is_active=true'),
    query('SELECT COUNT(*)::int AS count FROM submissions'),
    query("SELECT COUNT(*)::int AS count FROM submissions WHERE status='Approved'"),
    query('SELECT COUNT(*)::int AS count FROM messages WHERE reply IS NULL'),
    query('SELECT COUNT(*)::int AS count FROM notifications'),
    query("SELECT COUNT(*)::int AS count FROM submissions WHERE status='Submitted'"),
  ]);
  res.json({
    students: students.rows[0].count,
    submissions: subs.rows[0].count,
    approved: approved.rows[0].count,
    pendingMessages: msgs.rows[0].count,
    notifications: notifs.rows[0].count,
    pendingReview: pending.rows[0].count,
  });
});

// ── Students ──────────────────────────────────────────────
router.get('/students', authAdmin, async (req, res) => {
  const r = await query(
    `SELECT s.*, COUNT(sub.id)::int AS submission_count
     FROM students s LEFT JOIN submissions sub ON sub.student_id=s.id
     GROUP BY s.id ORDER BY s.created_at DESC`);
  res.json(r.rows);
});

router.post('/students', authAdmin, async (req, res) => {
  const { firstName, lastName, regNumber, phone, email, academicLevel, department, researchTopic, password } = req.body;
  if (!firstName || !lastName || !regNumber || !phone || !email || !academicLevel || !department || !password)
    return res.status(400).json({ error: 'All required fields must be filled.' });

  const existing = await query('SELECT id FROM students WHERE reg_number=$1 OR email=$2',
    [regNumber.trim().toUpperCase(), email.trim().toLowerCase()]);
  if (existing.rows.length) return res.status(409).json({ error: 'Reg number or email already exists.' });

  const hash = await bcrypt.hash(password, 12);
  const r = await query(
    `INSERT INTO students (first_name,last_name,reg_number,phone,email,academic_level,department,research_topic,password_hash)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
     RETURNING id,first_name,last_name,reg_number,email,phone,academic_level,department,research_topic,created_at`,
    [firstName.trim(), lastName.trim(), regNumber.trim().toUpperCase(), phone.trim(),
     email.trim().toLowerCase(), academicLevel, department.trim(), researchTopic?.trim() || null, hash]);
  res.status(201).json(r.rows[0]);
});

router.patch('/students/:id', authAdmin, async (req, res) => {
  const { isActive } = req.body;
  const r = await query('UPDATE students SET is_active=$1 WHERE id=$2 RETURNING id,first_name,last_name,is_active',
    [isActive, req.params.id]);
  if (!r.rows.length) return res.status(404).json({ error: 'Student not found' });
  res.json(r.rows[0]);
});

router.delete('/students/:id', authAdmin, async (req, res) => {
  await query('DELETE FROM students WHERE id=$1', [req.params.id]);
  res.json({ success: true });
});

// ── Submissions ───────────────────────────────────────────
router.get('/submissions', authAdmin, async (req, res) => {
  const r = await query(
    `SELECT sub.*,
       s.first_name, s.last_name, s.reg_number, s.academic_level, s.department,
       COALESCE(json_agg(h ORDER BY h.changed_at ASC) FILTER (WHERE h.id IS NOT NULL),'[]') AS history
     FROM submissions sub
     JOIN students s ON s.id=sub.student_id
     LEFT JOIN submission_history h ON h.submission_id=sub.id
     GROUP BY sub.id,s.first_name,s.last_name,s.reg_number,s.academic_level,s.department
     ORDER BY sub.submitted_at DESC`);
  res.json(r.rows);
});

router.patch('/submissions/:id', authAdmin, async (req, res) => {
  const { action, manualScore, moderatorNotes, advanceToLevel } = req.body;
  const sub = await query('SELECT * FROM submissions WHERE id=$1', [req.params.id]);
  if (!sub.rows.length) return res.status(404).json({ error: 'Submission not found.' });
  const current = sub.rows[0];
  const levels = ['Department', 'School Faculty', 'Postgraduate Board'];

  let newStatus = current.status, newLevel = current.current_level, histNote = moderatorNotes || '';

  if (action === 'approve') { newStatus = 'Approved'; histNote = histNote || 'Approved by moderator'; }
  else if (action === 'reject') { newStatus = 'Rejected'; histNote = histNote || 'Rejected by moderator'; }
  else if (action === 'advance') {
    const idx = levels.indexOf(current.current_level);
    if (idx >= levels.length - 1) return res.status(400).json({ error: 'Already at highest level.' });
    newLevel = advanceToLevel || levels[idx + 1];
    newStatus = 'Submitted';
    histNote = histNote || `Advanced to ${newLevel}`;
  } else return res.status(400).json({ error: 'Invalid action.' });

  const updated = await query(
    `UPDATE submissions SET status=$1,current_level=$2,manual_score=$3,moderator_notes=$4,updated_at=NOW()
     WHERE id=$5 RETURNING *`,
    [newStatus, newLevel, manualScore ?? current.manual_score, moderatorNotes ?? current.moderator_notes, req.params.id]);

  await query(
    `UPDATE submission_history SET status=$1,notes=$2
     WHERE id=(SELECT id FROM submission_history WHERE submission_id=$3 ORDER BY changed_at DESC LIMIT 1)`,
    [newStatus, histNote, req.params.id]);

  if (action === 'advance') {
    await query(
      `INSERT INTO submission_history (submission_id,level,status,notes,changed_by) VALUES ($1,$2,'Submitted',$3,$4)`,
      [req.params.id, newLevel, `Advanced to ${newLevel}`, req.admin.id]);
  }
  res.json(updated.rows[0]);
});

// ── Notifications ─────────────────────────────────────────
router.get('/notifications', authAdmin, async (req, res) => {
  const r = await query(
    `SELECT n.*, m.name AS sender_name,
       CASE WHEN n.recipient_type='student' THEN
         (SELECT concat(first_name,' ',last_name) FROM students WHERE id=n.recipient_id)
       ELSE NULL END AS recipient_name
     FROM notifications n LEFT JOIN moderators m ON m.id=n.sent_by
     ORDER BY n.created_at DESC`);
  res.json(r.rows);
});

router.post('/notifications', authAdmin, async (req, res) => {
  const { recipientType, recipientId, title, message } = req.body;
  if (!title || !message) return res.status(400).json({ error: 'Title and message required.' });
  const r = await query(
    `INSERT INTO notifications (sent_by,recipient_type,recipient_id,title,message)
     VALUES ($1,$2,$3,$4,$5) RETURNING *`,
    [req.admin.id, recipientType || 'all', recipientType === 'student' ? recipientId : null, title.trim(), message.trim()]);
  res.status(201).json(r.rows[0]);
});

// ── Messages ──────────────────────────────────────────────
router.get('/messages', authAdmin, async (req, res) => {
  const r = await query(
    `SELECT m.*, s.first_name, s.last_name, s.reg_number, mod.name AS replied_by_name
     FROM messages m JOIN students s ON s.id=m.student_id
     LEFT JOIN moderators mod ON mod.id=m.replied_by
     ORDER BY m.created_at DESC`);
  res.json(r.rows);
});

router.post('/messages/:id/reply', authAdmin, async (req, res) => {
  const { reply } = req.body;
  if (!reply) return res.status(400).json({ error: 'Reply text required.' });
  const r = await query(
    `UPDATE messages SET reply=$1,replied_by=$2,replied_at=NOW() WHERE id=$3 RETURNING *`,
    [reply.trim(), req.admin.id, req.params.id]);
  if (!r.rows.length) return res.status(404).json({ error: 'Message not found.' });
  res.json(r.rows[0]);
});

// ── Moderators ────────────────────────────────────────────
router.get('/moderators', authAdmin, async (req, res) => {
  const r = await query('SELECT id,name,username,email,role,is_active,created_at FROM moderators ORDER BY created_at DESC');
  res.json(r.rows);
});

router.post('/moderators', authAdmin, async (req, res) => {
  if (req.admin.modRole !== 'Super Admin')
    return res.status(403).json({ error: 'Only Super Admin can add moderators.' });
  const { name, username, email, password, role } = req.body;
  if (!name || !username || !email || !password) return res.status(400).json({ error: 'All fields required.' });
  const existing = await query('SELECT id FROM moderators WHERE username=$1 OR email=$2', [username, email]);
  if (existing.rows.length) return res.status(409).json({ error: 'Username or email already exists.' });
  const hash = await bcrypt.hash(password, 12);
  const r = await query(
    `INSERT INTO moderators (name,username,email,password_hash,role) VALUES ($1,$2,$3,$4,$5)
     RETURNING id,name,username,email,role`,
    [name.trim(), username.trim().toLowerCase(), email.trim().toLowerCase(), hash, role || 'Moderator']);
  res.status(201).json(r.rows[0]);
});

router.delete('/moderators/:id', authAdmin, async (req, res) => {
  if (req.admin.modRole !== 'Super Admin') return res.status(403).json({ error: 'Super Admin only.' });
  if (req.params.id === req.admin.id) return res.status(400).json({ error: 'Cannot delete yourself.' });
  await query('DELETE FROM moderators WHERE id=$1', [req.params.id]);
  res.json({ success: true });
});

module.exports = router;

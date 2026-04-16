const router = require('express').Router();
const { query } = require('../db');
const { authStudent } = require('../middleware/auth');

router.get('/', authStudent, async (req, res) => {
  const r = await query(
    `SELECT s.*, COALESCE(json_agg(h ORDER BY h.changed_at ASC) FILTER (WHERE h.id IS NOT NULL), '[]') AS history
     FROM submissions s
     LEFT JOIN submission_history h ON h.submission_id = s.id
     WHERE s.student_id = $1 GROUP BY s.id ORDER BY s.submitted_at DESC`,
    [req.user.id]);
  res.json(r.rows);
});

router.post('/', authStudent, async (req, res) => {
  const { type, title, content, currentLevel, aiScore, aiFeedback } = req.body;
  if (!type || !title || !content || !currentLevel)
    return res.status(400).json({ error: 'type, title, content and currentLevel are required.' });

  const validTypes = ['Proposal', 'Results', 'Presentation', 'Publication'];
  const validLevels = ['Department', 'School Faculty', 'Postgraduate Board'];
  if (!validTypes.includes(type)) return res.status(400).json({ error: 'Invalid type.' });
  if (!validLevels.includes(currentLevel)) return res.status(400).json({ error: 'Invalid level.' });

  const sub = await query(
    `INSERT INTO submissions (student_id,type,title,content,current_level,status,ai_score,ai_feedback)
     VALUES ($1,$2,$3,$4,$5,'Submitted',$6,$7) RETURNING *`,
    [req.user.id, type, title.trim(), content.trim(), currentLevel, aiScore || 0, aiFeedback || null]);

  await query(
    `INSERT INTO submission_history (submission_id,level,status,notes) VALUES ($1,$2,'Submitted','Initial submission')`,
    [sub.rows[0].id, currentLevel]);

  res.status(201).json(sub.rows[0]);
});

router.get('/:id', authStudent, async (req, res) => {
  const r = await query(
    `SELECT s.*, COALESCE(json_agg(h ORDER BY h.changed_at ASC) FILTER (WHERE h.id IS NOT NULL), '[]') AS history
     FROM submissions s LEFT JOIN submission_history h ON h.submission_id = s.id
     WHERE s.id=$1 AND s.student_id=$2 GROUP BY s.id`,
    [req.params.id, req.user.id]);
  if (!r.rows.length) return res.status(404).json({ error: 'Not found' });
  res.json(r.rows[0]);
});

module.exports = router;

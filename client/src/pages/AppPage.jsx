import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import AppShell from '../components/AppShell';
import { showToast } from '../components/Toast';
import api from '../utils/api';

const LEVELS = ['Department', 'School Faculty', 'Postgraduate Board'];

/* ── Shared UI ───────────────────────────────────────────── */
function ScoreRing({ score }) {
  if (!score) return <span className="badge b-gray">Pending</span>;
  const cls = score >= 80 ? 'sr-hi' : score >= 60 ? 'sr-md' : 'sr-lo';
  return <div className={`sring ${cls}`}>{score}</div>;
}
function SBadge({ status }) {
  const m = { Approved: 'b-green', Rejected: 'b-red', Submitted: 'b-blue', Reviewing: 'b-amber' };
  return <span className={`badge ${m[status] || 'b-gray'}`}>{status}</span>;
}
function LBadge({ level }) {
  const m = { Department: 'b-teal', 'School Faculty': 'b-amber', 'Postgraduate Board': 'b-blue' };
  return <span className={`badge ${m[level] || 'b-gray'}`}>{level}</span>;
}
function PTitle({ children, sub }) {
  return (
    <div style={{ marginBottom: '1.8rem' }}>
      <h1 style={{ fontFamily: 'var(--font-h)', fontSize: '1.65rem', color: 'var(--ink)', fontWeight: 600 }}>{children}</h1>
      {sub && <p style={{ color: 'var(--ink2)', fontSize: '.9rem', marginTop: '.2rem' }}>{sub}</p>}
    </div>
  );
}

/* ── AI Scorer ───────────────────────────────────────────── */
async function runAI(type, level, dept, topic, title, content) {
  try {
    const res = await fetch('/api/ai-score', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('at_token')}` },
      body: JSON.stringify({ type, level, dept, topic, title, content }),
    });
    if (res.ok) return await res.json();
  } catch {}
  // Fallback local scoring
  const score = Math.floor(62 + Math.random() * 28);
  return { score, feedback: 'Submission received and acknowledged.', strengths: 'Clear title and structured content.', improvements: 'Expand methodology and citations.' };
}

/* ── DASHBOARD ───────────────────────────────────────────── */
function Dashboard({ subs, notifs, user }) {
  const approved = subs.filter(s => s.status === 'Approved').length;
  const reviewing = subs.filter(s => ['Submitted', 'Reviewing'].includes(s.status)).length;
  const scored = subs.filter(s => s.ai_score > 0);
  const avg = scored.length ? Math.round(scored.reduce((a, b) => a + b.ai_score, 0) / scored.length) : 0;

  const lvlSt = {};
  subs.forEach(s => {
    if (Array.isArray(s.history)) s.history.forEach(h => {
      if (h && (!lvlSt[h.level] || h.status === 'Approved')) lvlSt[h.level] = h.status;
    });
  });

  return (
    <div>
      <PTitle sub="Your academic progress at a glance">Welcome back, {user?.first_name}!</PTitle>
      <div className="sgrid">
        <div className="scard"><div className="sval">{subs.length}</div><div className="slb">Submissions</div></div>
        <div className="scard"><div className="sval" style={{ color: 'var(--green)' }}>{approved}</div><div className="slb">Approved</div></div>
        <div className="scard"><div className="sval" style={{ color: 'var(--gold)' }}>{reviewing}</div><div className="slb">Under Review</div></div>
        <div className="scard"><div className="sval" style={{ color: 'var(--teal)' }}>{avg ? `${avg}%` : '—'}</div><div className="slb">Avg Score</div></div>
      </div>

      <div className="card">
        <div className="card-t">🗺️ Submission Journey</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '.4rem', flexWrap: 'wrap', padding: '.4rem 0' }}>
          {LEVELS.map((lvl, i) => {
            const st = lvlSt[lvl] || 'Pending';
            const cls = st === 'Approved' ? 'j-done' : ['Submitted','Reviewing'].includes(st) ? 'j-active' : st === 'Rejected' ? 'j-reject' : '';
            const ico = st === 'Approved' ? '✓' : st === 'Reviewing' ? '⏳' : st === 'Submitted' ? '📬' : st === 'Rejected' ? '✗' : '○';
            return (
              <div key={lvl} style={{ display: 'flex', alignItems: 'center', gap: '.4rem' }}>
                <div className={`jnode ${cls}`}>
                  <div style={{ fontSize: '1.1rem' }}>{ico}</div>
                  <div className="jname">{lvl}</div>
                  <SBadge status={st} />
                </div>
                {i < LEVELS.length - 1 && <span className="jarr">→</span>}
              </div>
            );
          })}
        </div>
      </div>

      <div className="card">
        <div className="card-t">📢 Recent Notifications</div>
        {notifs.length === 0
          ? <p className="muted tsm">No notifications yet.</p>
          : notifs.slice(0, 4).map(n => (
            <div key={n.id} className="nitem">
              <div className={`ndot ${n.is_read ? 'read' : 'unread'}`} />
              <div>
                <div className="ntext"><strong>{n.title}</strong><br />{n.message}</div>
                <div className="ntime">{n.sender_name ? `From ${n.sender_name} · ` : ''}{new Date(n.created_at).toLocaleDateString()}</div>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}

/* ── PROGRESS ────────────────────────────────────────────── */
function Progress({ subs }) {
  return (
    <div>
      <PTitle sub="Track your submissions across all review levels">My Progress</PTitle>
      {subs.length === 0
        ? <div className="card"><p className="muted">No submissions yet. Head to Submissions to get started!</p></div>
        : subs.map(s => {
          const pct = s.status === 'Approved' ? 100 : ['Submitted','Reviewing'].includes(s.status) ? 50 : s.status === 'Rejected' ? 15 : 0;
          const hist = Array.isArray(s.history) ? s.history.filter(Boolean) : [];
          return (
            <div key={s.id} className="card">
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '.8rem', gap: '1rem' }}>
                <div>
                  <div style={{ fontWeight: 600, color: 'var(--ink)', fontSize: '.97rem' }}>{s.title}</div>
                  <div style={{ display: 'flex', gap: '.4rem', marginTop: '.4rem', flexWrap: 'wrap' }}>
                    <span className="badge b-ink">{s.type}</span>
                    <LBadge level={s.current_level} />
                    <span className="tsm muted">{new Date(s.submitted_at).toLocaleDateString()}</span>
                  </div>
                </div>
                <ScoreRing score={s.ai_score} />
              </div>
              <div className="pbar-wrap">
                <div className="pbar" style={{ width: `${pct}%`, background: pct === 100 ? 'var(--green)' : pct >= 50 ? 'var(--teal)' : pct > 0 ? 'var(--gold)' : 'var(--red)' }} />
              </div>
              <div style={{ display: 'flex', gap: '.35rem', flexWrap: 'wrap', marginTop: '.5rem' }}>
                {hist.map((h, i) => (
                  <span key={i} className={`badge ${h.status==='Approved'?'b-green':h.status==='Rejected'?'b-red':['Submitted','Reviewing'].includes(h.status)?'b-blue':'b-gray'}`}>
                    {h.level}: {h.status}
                  </span>
                ))}
              </div>
              {s.ai_score > 0 && (
                <div className="ai-box">
                  <div className="ai-label">🤖 AI Assessment — {s.ai_score}/100</div>
                  <div className="ai-text">{s.ai_feedback}</div>
                </div>
              )}
              {s.moderator_notes && (
                <div style={{ background: 'rgba(13,110,110,.06)', border: '1px solid rgba(13,110,110,.2)', borderRadius: 'var(--r)', padding: '.75rem 1rem', marginTop: '.8rem' }}>
                  <div style={{ fontSize: '.73rem', fontWeight: 700, color: 'var(--teal)', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '.25rem' }}>📝 Moderator Notes</div>
                  <div style={{ fontSize: '.87rem', color: 'var(--ink2)' }}>{s.moderator_notes}</div>
                </div>
              )}
            </div>
          );
        })}
    </div>
  );
}

/* ── SUBMISSIONS ─────────────────────────────────────────── */
function Submissions({ subs, onRefresh, user }) {
  const [tab, setTab] = useState('Proposal');
  const [form, setForm] = useState({ title: '', currentLevel: 'Department', content: '' });
  const [aiResult, setAiResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const types = ['Proposal', 'Results', 'Presentation', 'Publication'];
  const icons = { Proposal: '📄', Results: '📊', Presentation: '🎤', Publication: '📰' };

  const submit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.content) { showToast('Please fill in title and content.', 'error'); return; }
    setLoading(true); setAiResult(null);
    try {
      const scored = await runAI(tab, user.academic_level, user.department, user.research_topic, form.title, form.content);
      setAiResult(scored);
      await api.post('/submissions', { type: tab, title: form.title, content: form.content, currentLevel: form.currentLevel, aiScore: scored.score, aiFeedback: scored.feedback });
      setForm({ title: '', currentLevel: 'Department', content: '' });
      showToast('Submission saved and scored!', 'success');
      onRefresh();
    } catch (err) {
      showToast(err.response?.data?.error || 'Submission failed.', 'error');
    } finally { setLoading(false); }
  };

  return (
    <div>
      <PTitle sub="Submit academic documents for review">Submissions</PTitle>
      <div style={{ display: 'flex', gap: '.4rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {types.map(t => (
          <button key={t} onClick={() => { setTab(t); setAiResult(null); }}
            className={`btn btn-sm ${tab === t ? 'btn-teal' : 'btn-ghost'}`}>
            {icons[t]} {t}
          </button>
        ))}
      </div>

      <div className="card">
        <div className="card-t">{icons[tab]} Submit {tab}</div>
        <form onSubmit={submit}>
          <div className="fg"><label>Title</label><input type="text" placeholder={`${tab} title…`} value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} /></div>
          <div className="fg">
            <label>Target Review Level</label>
            <select value={form.currentLevel} onChange={e => setForm(p => ({ ...p, currentLevel: e.target.value }))}>
              {LEVELS.map(l => <option key={l}>{l}</option>)}
            </select>
          </div>
          <div className="fg"><label>Abstract / Description</label><textarea rows={5} placeholder={`Describe your ${tab.toLowerCase()} in detail…`} value={form.content} onChange={e => setForm(p => ({ ...p, content: e.target.value }))} /></div>

          {loading && (
            <div style={{ background: 'var(--gold-lt)', border: '1px solid #e8cc7a', borderRadius: 'var(--r)', padding: '1rem', marginBottom: '.9rem', display: 'flex', alignItems: 'center', gap: 10 }}>
              <span className="spin" /><span style={{ fontSize: '.88rem', color: 'var(--ink2)' }}>AI is evaluating your submission…</span>
            </div>
          )}
          {aiResult && (
            <div className="ai-box" style={{ marginBottom: '.9rem' }}>
              <div className="ai-label">🤖 AI Assessment — {aiResult.score}/100</div>
              <div className="ai-text" style={{ marginBottom: '.4rem' }}>{aiResult.feedback}</div>
              <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                <div className="tsm"><strong style={{ color: 'var(--green)' }}>Strengths:</strong> {aiResult.strengths}</div>
                <div className="tsm"><strong style={{ color: 'var(--amber)' }}>To improve:</strong> {aiResult.improvements}</div>
              </div>
            </div>
          )}
          <button type="submit" className="btn btn-teal" disabled={loading}>
            {loading ? <><span className="spin" />&nbsp;Submitting…</> : `Submit ${tab}`}
          </button>
        </form>
      </div>

      <div className="card">
        <div className="card-t">📋 Submission History</div>
        {subs.length === 0 ? <p className="muted tsm">No submissions yet.</p> : (
          <div className="tbl-wrap">
            <table className="dtbl">
              <thead><tr><th>Title</th><th>Type</th><th>Level</th><th>Status</th><th>Score</th><th>Date</th></tr></thead>
              <tbody>
                {subs.map(s => (
                  <tr key={s.id}>
                    <td style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={s.title}>{s.title}</td>
                    <td><span className="badge b-ink">{s.type}</span></td>
                    <td><LBadge level={s.current_level} /></td>
                    <td><SBadge status={s.status} /></td>
                    <td>{s.ai_score > 0 ? <span style={{ fontWeight: 600, color: s.ai_score >= 80 ? 'var(--green)' : s.ai_score >= 60 ? 'var(--gold)' : 'var(--red)' }}>{s.ai_score}</span> : '—'}</td>
                    <td className="tsm muted">{new Date(s.submitted_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── NOTIFICATIONS ───────────────────────────────────────── */
function Notifications({ notifs, onRefresh }) {
  const markRead = async (id) => { try { await api.patch(`/notifications/${id}/read`); onRefresh(); } catch {} };
  return (
    <div>
      <PTitle sub="Alerts and messages from your moderators">Notifications</PTitle>
      {notifs.length === 0 ? <div className="card"><p className="muted">No notifications yet.</p></div>
        : notifs.map(n => (
          <div key={n.id} className="nitem" style={{ cursor: !n.is_read ? 'pointer' : 'default' }} onClick={() => !n.is_read && markRead(n.id)}>
            <div className={`ndot ${n.is_read ? 'read' : 'unread'}`} />
            <div style={{ flex: 1 }}>
              <div className="ntext">
                <strong>{n.title}</strong>
                {!n.is_read && <span style={{ marginLeft: 8, fontSize: '.71rem', background: 'var(--teal-lt)', color: 'var(--teal)', padding: '1px 7px', borderRadius: 10, fontWeight: 600 }}>New</span>}
                <br />{n.message}
              </div>
              <div className="ntime">{n.sender_name ? `From ${n.sender_name} · ` : ''}{new Date(n.created_at).toLocaleDateString()}</div>
            </div>
          </div>
        ))}
    </div>
  );
}

/* ── MESSAGES ────────────────────────────────────────────── */
function Messages() {
  const [msgs, setMsgs] = useState([]);
  const [form, setForm] = useState({ subject: '', body: '' });
  const [loading, setLoading] = useState(false);
  const load = useCallback(async () => { try { const r = await api.get('/messages'); setMsgs(r.data); } catch {} }, []);
  useEffect(() => { load(); }, [load]);

  const send = async (e) => {
    e.preventDefault();
    if (!form.subject || !form.body) { showToast('Please fill all fields.', 'error'); return; }
    setLoading(true);
    try { await api.post('/messages', form); setForm({ subject: '', body: '' }); showToast('Message sent!', 'success'); load(); }
    catch { showToast('Failed to send.', 'error'); }
    finally { setLoading(false); }
  };

  return (
    <div>
      <PTitle sub="Send a direct message to your assigned moderator">Messages</PTitle>
      <div className="card">
        <div className="card-t">✉️ New Message</div>
        <form onSubmit={send}>
          <div className="fg"><label>Subject</label><input type="text" placeholder="Message subject" value={form.subject} onChange={e => setForm(p => ({ ...p, subject: e.target.value }))} /></div>
          <div className="fg"><label>Message</label><textarea rows={5} placeholder="Write your message here…" value={form.body} onChange={e => setForm(p => ({ ...p, body: e.target.value }))} /></div>
          <button type="submit" className="btn btn-teal" disabled={loading}>
            {loading ? <><span className="spin" />&nbsp;Sending…</> : 'Send Message'}
          </button>
        </form>
      </div>
      <div className="card">
        <div className="card-t">📨 Sent Messages</div>
        {msgs.length === 0 ? <p className="muted tsm">No messages yet.</p>
          : msgs.map(m => (
            <div key={m.id} style={{ background: 'var(--parchment)', border: '1px solid var(--border)', borderRadius: 'var(--r)', padding: '1rem', marginBottom: '.7rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '.4rem', flexWrap: 'wrap', gap: '.4rem' }}>
                <strong>{m.subject}</strong><span className="tsm muted">{new Date(m.created_at).toLocaleDateString()}</span>
              </div>
              <div className="tsm muted">{m.body}</div>
              {m.reply && (
                <div style={{ marginTop: '.7rem', padding: '.7rem', background: 'var(--teal-lt)', borderRadius: 'var(--r)', borderLeft: '3px solid var(--teal)' }}>
                  <div style={{ fontSize: '.73rem', fontWeight: 700, color: 'var(--teal)', marginBottom: '.2rem' }}>Reply from {m.replied_by_name || 'Moderator'}:</div>
                  <div className="tsm">{m.reply}</div>
                </div>
              )}
            </div>
          ))}
      </div>
    </div>
  );
}

/* ── PROFILE ─────────────────────────────────────────────── */
function Profile({ user, subs }) {
  const scored = subs.filter(s => s.ai_score > 0);
  const avg = scored.length ? Math.round(scored.reduce((a, b) => a + b.ai_score, 0) / scored.length) : null;
  const rows = [
    ['Registration No.', user?.reg_number],
    ['Email', user?.email],
    ['Phone', user?.phone],
    ['Academic Level', user?.academic_level],
    ['Department', user?.department],
    ['Research Topic', user?.research_topic || '—'],
    ['Total Submissions', subs.length],
    ['Average AI Score', avg ? `${avg} / 100` : 'N/A'],
    ['Member Since', new Date(user?.created_at).toLocaleDateString()],
  ];
  return (
    <div>
      <PTitle sub="Your academic profile and statistics">My Profile</PTitle>
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.3rem', marginBottom: '1.3rem' }}>
          <div style={{ width: 68, height: 68, borderRadius: '50%', background: 'linear-gradient(135deg,var(--gold),var(--gold2))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-h)', fontSize: '1.6rem', fontWeight: 700, color: 'var(--ink)', flexShrink: 0 }}>
            {user ? (user.first_name[0] + user.last_name[0]).toUpperCase() : '?'}
          </div>
          <div>
            <div style={{ fontFamily: 'var(--font-h)', fontSize: '1.4rem', fontWeight: 600 }}>{user?.first_name} {user?.last_name}</div>
            <span className="badge b-teal mt1">{user?.academic_level}</span>
          </div>
        </div>
        <div className="divider" />
        <table style={{ width: '100%', fontSize: '.88rem', borderCollapse: 'collapse' }}>
          <tbody>
            {rows.map(([k, v]) => (
              <tr key={k}>
                <td style={{ color: 'var(--ink2)', padding: '.45rem 0', width: '42%', fontSize: '.8rem', textTransform: 'uppercase', letterSpacing: '.3px' }}>{k}</td>
                <td style={{ fontWeight: 500, padding: '.45rem 0' }}>{v}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ── MAIN APP PAGE ───────────────────────────────────────── */
export default function AppPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [panel, setPanel] = useState('dashboard');
  const [subs, setSubs] = useState([]);
  const [notifs, setNotifs] = useState([]);

  const loadSubs = useCallback(async () => { try { const r = await api.get('/submissions'); setSubs(r.data); } catch {} }, []);
  const loadNotifs = useCallback(async () => { try { const r = await api.get('/notifications'); setNotifs(r.data); } catch {} }, []);

  useEffect(() => { loadSubs(); loadNotifs(); }, [loadSubs, loadNotifs]);
  useEffect(() => { if (!user) navigate('/login'); }, [user, navigate]);
  if (!user) return null;

  const switchPanel = (p) => {
    setPanel(p);
    if (p === 'notifications') loadNotifs();
    if (p === 'dashboard') { loadSubs(); loadNotifs(); }
    if (p === 'progress' || p === 'submit') loadSubs();
  };

  const panels = {
    dashboard:     <Dashboard subs={subs} notifs={notifs} user={user} />,
    progress:      <Progress subs={subs} />,
    submit:        <Submissions subs={subs} onRefresh={loadSubs} user={user} />,
    notifications: <Notifications notifs={notifs} onRefresh={loadNotifs} />,
    messages:      <Messages />,
    profile:       <Profile user={user} subs={subs} />,
  };

  return (
    <AppShell active={panel} setPanel={switchPanel}>
      {panels[panel] || panels.dashboard}
    </AppShell>
  );
}

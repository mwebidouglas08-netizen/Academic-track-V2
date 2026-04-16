import { useState } from 'react';
import { useAdmin } from '../contexts/AdminContext';
import { showToast } from '../components/Toast';
import api from '../utils/api';

export default function AdminLogin({ onLogin }) {
  const { login } = useAdmin();
  const [f, setF] = useState({ username: '', password: '' });
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setErr('');
    if (!f.username || !f.password) { setErr('Both fields are required.'); return; }
    setLoading(true);
    try {
      const res = await api.post('/admin/auth/login', f);
      login(res.data.token, res.data.moderator);
      showToast('Access granted.', 'success');
      onLogin();
    } catch (e) {
      setErr(e.response?.data?.error || 'Invalid credentials.');
    } finally { setLoading(false); }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'radial-gradient(ellipse at 60% 40%, #1a2840 0%, #0f1623 70%)', padding: '2rem',
    }}>
      {/* Subtle grid */}
      <div style={{ position: 'fixed', inset: 0, opacity: .03, backgroundImage: 'linear-gradient(rgba(255,255,255,.5) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.5) 1px,transparent 1px)', backgroundSize: '40px 40px', pointerEvents: 'none' }} />

      <div style={{ width: '100%', maxWidth: 420, position: 'relative', zIndex: 2 }}>
        <div style={{ textAlign: 'center', marginBottom: '2.2rem' }}>
          <div style={{ width: 62, height: 62, borderRadius: 16, background: 'linear-gradient(135deg,var(--gold),var(--gold2))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, margin: '0 auto 1rem' }}>🛡️</div>
          <h1 style={{ fontFamily: 'var(--font-h)', fontSize: '1.9rem', color: 'var(--text)', marginBottom: '.3rem' }}>Admin Portal</h1>
          <div style={{ fontSize: '.76rem', color: 'var(--red)', letterSpacing: '2px', textTransform: 'uppercase', fontWeight: 600, background: 'var(--red-lt)', display: 'inline-block', padding: '3px 12px', borderRadius: 20 }}>Restricted Access</div>
        </div>

        <div className="card" style={{ padding: '2.4rem', border: '1px solid rgba(212,160,23,.25)' }}>
          <form onSubmit={submit}>
            <div className="fg"><label>Admin Username</label><input type="text" placeholder="Enter username" value={f.username} onChange={e => setF(p => ({ ...p, username: e.target.value }))} autoComplete="username" /></div>
            <div className="fg"><label>Password</label><input type="password" placeholder="••••••••" value={f.password} onChange={e => setF(p => ({ ...p, password: e.target.value }))} autoComplete="current-password" /></div>
            {err && <div className="err-box">{err}</div>}
            <button type="submit" className="btn btn-gold btn-block btn-lg" style={{ marginTop: '.4rem' }} disabled={loading}>
              {loading ? <><span className="spin" />&nbsp;Verifying…</> : 'Access Admin Portal →'}
            </button>
          </form>
          <div style={{ marginTop: '1.5rem', padding: '.9rem', background: 'rgba(255,255,255,.04)', borderRadius: 'var(--r)', fontSize: '.78rem', color: 'var(--text2)', textAlign: 'center', lineHeight: 1.6 }}>
            Default credentials: <code style={{ color: 'var(--gold)' }}>superadmin</code> / <code style={{ color: 'var(--gold)' }}>Admin@1234</code><br />
            Change immediately after first login.
          </div>
        </div>
      </div>
    </div>
  );
}

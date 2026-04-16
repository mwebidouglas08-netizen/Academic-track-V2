import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { showToast } from '../components/Toast';
import api from '../utils/api';

function AuthWrap({ children, title, sub }) {
  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(160deg,var(--ink) 0%,#1e1e3a 50%,#0d2a2a 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div style={{ width: '100%', maxWidth: 520 }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ width: 54, height: 54, borderRadius: 12, background: 'linear-gradient(135deg,var(--gold),var(--gold2))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, margin: '0 auto .9rem' }}>🎓</div>
          <div style={{ fontFamily: 'var(--font-h)', fontSize: '1.7rem', fontWeight: 700, color: '#fff' }}>{title}</div>
          <div style={{ color: 'rgba(255,255,255,.5)', fontSize: '.88rem', marginTop: '.25rem' }}>{sub}</div>
        </div>
        <div className="card" style={{ borderRadius: 'var(--r3)', padding: '2.3rem', boxShadow: 'var(--shadow-lg)' }}>
          {children}
        </div>
        <div style={{ textAlign: 'center', marginTop: '1.2rem', fontSize: '.82rem', color: 'rgba(255,255,255,.35)' }}>
          <Link to="/" style={{ color: 'rgba(255,255,255,.4)' }}>← Back to Home</Link>
        </div>
      </div>
    </div>
  );
}

export function LoginPage() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [f, setF] = useState({ regNumber: '', password: '' });
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setErr('');
    if (!f.regNumber || !f.password) { setErr('All fields are required.'); return; }
    setLoading(true);
    try {
      const res = await api.post('/auth/login', f);
      login(res.data.token, res.data.student);
      showToast(`Welcome back, ${res.data.student.first_name}!`, 'success');
      nav('/app');
    } catch (e) {
      setErr(e.response?.data?.error || 'Login failed. Please try again.');
    } finally { setLoading(false); }
  };

  return (
    <AuthWrap title="AcademiTrack" sub="Sign in to your student portal">
      <h2 style={{ fontFamily: 'var(--font-h)', color: 'var(--ink)', marginBottom: '1.5rem', fontSize: '1.35rem' }}>Welcome Back</h2>
      <form onSubmit={submit}>
        <div className="fg"><label>Registration Number</label><input type="text" placeholder="e.g. REG/2024/001" value={f.regNumber} onChange={e => setF(p => ({ ...p, regNumber: e.target.value }))} /></div>
        <div className="fg"><label>Password</label><input type="password" placeholder="Your password" value={f.password} onChange={e => setF(p => ({ ...p, password: e.target.value }))} /></div>
        {err && <div className="err-box">{err}</div>}
        <button type="submit" className="btn btn-teal btn-block" disabled={loading}>
          {loading ? <><span className="spin" />&nbsp;Signing in…</> : 'Sign In →'}
        </button>
      </form>
      <div style={{ textAlign: 'center', marginTop: '1.2rem', fontSize: '.87rem', color: 'var(--ink2)' }}>
        No account? <Link to="/register">Register here</Link>
      </div>
    </AuthWrap>
  );
}

export function RegisterPage() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [f, setF] = useState({ firstName: '', lastName: '', regNumber: '', phone: '', email: '', academicLevel: '', department: '', researchTopic: '', password: '', password2: '' });
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);
  const set = k => e => setF(p => ({ ...p, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setErr('');
    if (!f.firstName || !f.lastName || !f.regNumber || !f.phone || !f.email || !f.academicLevel || !f.department || !f.password)
      { setErr('Please complete all required (*) fields.'); return; }
    if (f.password !== f.password2) { setErr('Passwords do not match.'); return; }
    if (f.password.length < 6) { setErr('Password must be at least 6 characters.'); return; }
    setLoading(true);
    try {
      const res = await api.post('/auth/register', f);
      login(res.data.token, res.data.student);
      showToast('Account created successfully!', 'success');
      nav('/app');
    } catch (e) {
      setErr(e.response?.data?.error || 'Registration failed.');
    } finally { setLoading(false); }
  };

  return (
    <AuthWrap title="Create Account" sub="Join AcademiTrack — Student Portal">
      <h2 style={{ fontFamily: 'var(--font-h)', color: 'var(--ink)', marginBottom: '1.5rem', fontSize: '1.35rem' }}>Student Registration</h2>
      <form onSubmit={submit}>
        <div className="fgrid">
          <div className="fg"><label>First Name *</label><input type="text" placeholder="First name" value={f.firstName} onChange={set('firstName')} /></div>
          <div className="fg"><label>Last Name *</label><input type="text" placeholder="Last name" value={f.lastName} onChange={set('lastName')} /></div>
          <div className="fg full"><label>Registration Number *</label><input type="text" placeholder="REG/2024/001" value={f.regNumber} onChange={set('regNumber')} /></div>
          <div className="fg full"><label>Phone Number *</label><input type="tel" placeholder="+254 700 000 000" value={f.phone} onChange={set('phone')} /></div>
          <div className="fg full"><label>Email Address *</label><input type="email" placeholder="you@university.edu" value={f.email} onChange={set('email')} /></div>
          <div className="fg full">
            <label>Academic Level *</label>
            <select value={f.academicLevel} onChange={set('academicLevel')}>
              <option value="">— Select level —</option>
              <option>Bachelor's Degree</option>
              <option>Master's Degree</option>
              <option>PhD / Postgraduate</option>
            </select>
          </div>
          <div className="fg full"><label>Department / Faculty *</label><input type="text" placeholder="e.g. Computer Science" value={f.department} onChange={set('department')} /></div>
          <div className="fg full"><label>Research Topic <span style={{ color: 'var(--ink3)', textTransform: 'none', letterSpacing: 0 }}>(optional)</span></label><input type="text" placeholder="Your research area" value={f.researchTopic} onChange={set('researchTopic')} /></div>
          <div className="fg"><label>Password *</label><input type="password" placeholder="Min 6 chars" value={f.password} onChange={set('password')} /></div>
          <div className="fg"><label>Confirm Password *</label><input type="password" placeholder="Repeat password" value={f.password2} onChange={set('password2')} /></div>
        </div>
        {err && <div className="err-box">{err}</div>}
        <button type="submit" className="btn btn-teal btn-block" disabled={loading}>
          {loading ? <><span className="spin" />&nbsp;Creating account…</> : 'Create Account →'}
        </button>
      </form>
      <div style={{ textAlign: 'center', marginTop: '1.2rem', fontSize: '.87rem', color: 'var(--ink2)' }}>
        Already registered? <Link to="/login">Sign in</Link>
      </div>
    </AuthWrap>
  );
}

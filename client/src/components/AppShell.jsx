import { useAuth } from '../contexts/AuthContext';
import { showToast } from './Toast';

const NAV = [
  { id: 'dashboard',     ico: '🏛️', label: 'Dashboard',     group: 'Main' },
  { id: 'progress',      ico: '📈', label: 'My Progress',    group: 'Main' },
  { id: 'submit',        ico: '📤', label: 'Submissions',    group: 'Main' },
  { id: 'notifications', ico: '🔔', label: 'Notifications',  group: 'Communication' },
  { id: 'messages',      ico: '✉️', label: 'Messages',       group: 'Communication' },
  { id: 'profile',       ico: '👤', label: 'My Profile',     group: 'Account' },
];

export default function AppShell({ active, setPanel, children }) {
  const { user, logout } = useAuth();
  const initials = user ? (user.first_name[0] + user.last_name[0]).toUpperCase() : '??';
  const groups = [...new Set(NAV.map(n => n.group))];

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--parchment)' }}>
      {/* Header */}
      <header style={{
        background: 'var(--ink)', color: '#fff', padding: '0 2rem',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        height: 62, position: 'sticky', top: 0, zIndex: 100,
        boxShadow: '0 2px 12px rgba(26,26,46,.25)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: 8, background: 'linear-gradient(135deg,var(--gold),var(--gold2))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>🎓</div>
          <div>
            <div style={{ fontFamily: 'var(--font-h)', fontWeight: 700, fontSize: '1.15rem', letterSpacing: '.02em', lineHeight: 1.1 }}>AcademiTrack</div>
            <div style={{ fontSize: '.6rem', color: 'rgba(255,255,255,.5)', letterSpacing: '2px', textTransform: 'uppercase' }}>Student Portal</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9, background: 'rgba(255,255,255,.08)', border: '1px solid rgba(255,255,255,.15)', borderRadius: 'var(--r)', padding: '.4rem .9rem' }}>
            <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'linear-gradient(135deg,var(--gold),var(--gold2))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: 'var(--ink)' }}>{initials}</div>
            <div>
              <div style={{ fontSize: '.84rem', fontWeight: 500, color: '#fff' }}>{user?.first_name} {user?.last_name}</div>
              <div style={{ fontSize: '.69rem', color: 'rgba(255,255,255,.5)' }}>{user?.reg_number}</div>
            </div>
          </div>
          <button className="btn btn-sm" onClick={() => { logout(); showToast('Logged out', 'info'); }}
            style={{ background: 'rgba(255,255,255,.1)', color: '#fff', border: '1px solid rgba(255,255,255,.2)' }}>
            Logout
          </button>
        </div>
      </header>

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Sidebar */}
        <nav style={{ width: 215, background: 'var(--cream)', borderRight: '1px solid var(--border)', padding: '1rem 0', flexShrink: 0, overflowY: 'auto' }}>
          {groups.map(g => (
            <div key={g}>
              <div className="slabel">{g}</div>
              {NAV.filter(n => n.group === g).map(n => (
                <div key={n.id} className={`sitem${active === n.id ? ' on' : ''}`} onClick={() => setPanel(n.id)}>
                  <span className="ico">{n.ico}</span><span>{n.label}</span>
                </div>
              ))}
            </div>
          ))}
        </nav>

        {/* Main */}
        <main style={{ flex: 1, padding: '2rem', overflowY: 'auto', maxHeight: 'calc(100vh - 62px)' }}>
          {children}
        </main>
      </div>
    </div>
  );
}

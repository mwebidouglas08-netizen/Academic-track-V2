import { useNavigate } from 'react-router-dom';

export default function Landing() {
  const nav = useNavigate();
  const features = [
    { ico: '📋', title: 'Multi-Level Submissions', desc: 'Submit proposals, results, presentations, and publications. Each advances through Department → Faculty → Postgraduate Board.' },
    { ico: '🤖', title: 'AI-Powered Scoring', desc: 'Every submission is automatically evaluated and scored by AI, giving instant academic feedback.' },
    { ico: '📊', title: 'Progress Tracking', desc: 'Visual dashboard showing exactly where each submission stands in the review pipeline.' },
    { ico: '🔔', title: 'Real-Time Notifications', desc: 'Receive targeted announcements and personalised feedback from your moderators.' },
    { ico: '✉️', title: 'Direct Messaging', desc: 'Message your moderator directly and receive replies within your student portal.' },
    { ico: '🎓', title: 'All Academic Levels', desc: "Designed for Bachelor's, Master's, and PhD / Postgraduate students across all departments." },
  ];

  return (
    <div style={{ background: 'var(--parchment)', minHeight: '100vh' }}>
      {/* NAV */}
      <nav style={{
        background: 'var(--ink)', padding: '0 3rem', display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', height: 68, position: 'sticky', top: 0, zIndex: 100,
        boxShadow: '0 2px 20px rgba(26,26,46,.3)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 42, height: 42, borderRadius: 10, background: 'linear-gradient(135deg,var(--gold),var(--gold2))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>🎓</div>
          <div>
            <div style={{ fontFamily: 'var(--font-h)', fontWeight: 700, color: '#fff', fontSize: '1.35rem', letterSpacing: '.02em', lineHeight: 1.1 }}>AcademiTrack</div>
            <div style={{ fontSize: '.6rem', color: 'rgba(255,255,255,.45)', letterSpacing: '2.5px', textTransform: 'uppercase' }}>Student Progress System</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-sm" style={{ background: 'rgba(255,255,255,.1)', color: '#fff', border: '1px solid rgba(255,255,255,.2)' }} onClick={() => nav('/login')}>Sign In</button>
          <button className="btn btn-gold btn-sm" onClick={() => nav('/register')}>Register</button>
        </div>
      </nav>

      {/* HERO */}
      <section style={{
        background: 'linear-gradient(160deg, var(--ink) 0%, #1e1e3a 40%, #0d2a2a 100%)',
        padding: '5rem 2rem 4rem', textAlign: 'center', position: 'relative', overflow: 'hidden',
      }}>
        {/* Decorative grid pattern */}
        <div style={{ position: 'absolute', inset: 0, opacity: .05, backgroundImage: 'linear-gradient(rgba(255,255,255,.3) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.3) 1px,transparent 1px)', backgroundSize: '50px 50px', pointerEvents: 'none' }} />

        {/* Academic building SVG */}
        <div style={{ position: 'relative', zIndex: 2, marginBottom: '2.5rem' }}>
          <svg viewBox="0 0 900 220" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', maxWidth: 800, margin: '0 auto', display: 'block', opacity: .6 }}>
            {/* Ground */}
            <rect y="195" width="900" height="25" fill="rgba(184,134,11,.2)" rx="2"/>
            {/* Main building body */}
            <rect x="275" y="75" width="350" height="120" fill="rgba(255,255,255,.08)" stroke="rgba(184,134,11,.4)" strokeWidth="1"/>
            {/* Pediment */}
            <polygon points="272,75 450,22 628,75" fill="rgba(255,255,255,.07)" stroke="rgba(184,134,11,.5)" strokeWidth="1.5"/>
            {/* Bell tower */}
            <rect x="420" y="20" width="60" height="55" fill="rgba(255,255,255,.07)" stroke="rgba(184,134,11,.4)" strokeWidth="1"/>
            <polygon points="420,20 450,2 480,20" fill="rgba(184,134,11,.25)" stroke="rgba(184,134,11,.6)" strokeWidth="1.5"/>
            {/* Columns */}
            {[295,320,345,515,540,565,590].map((x,i) => (
              <rect key={i} x={x} y="82" width="11" height="113" fill="rgba(255,255,255,.15)" rx="3"/>
            ))}
            {/* Door */}
            <rect x="420" y="145" width="60" height="50" fill="rgba(184,134,11,.2)" stroke="rgba(184,134,11,.4)" strokeWidth="1" rx="2"/>
            <circle cx="476" cy="171" r="3" fill="rgba(184,134,11,.6)"/>
            {/* Windows */}
            {[298,328,358,390,510,540,570].map((x,i) => (
              <rect key={i} x={x} y="100" width="28" height="22" fill="rgba(79,195,247,.12)" stroke="rgba(184,134,11,.25)" strokeWidth="1" rx="1"/>
            ))}
            {/* Side wings */}
            <rect x="100" y="115" width="170" height="80" fill="rgba(255,255,255,.05)" stroke="rgba(184,134,11,.2)" strokeWidth="1"/>
            <rect x="630" y="115" width="170" height="80" fill="rgba(255,255,255,.05)" stroke="rgba(184,134,11,.2)" strokeWidth="1"/>
            {/* Side columns */}
            {[112,132,152,172].map((x,i) => <rect key={i} x={x} y="122" width="8" height="73" fill="rgba(255,255,255,.1)" rx="2"/>)}
            {[642,662,682,702].map((x,i) => <rect key={i} x={x} y="122" width="8" height="73" fill="rgba(255,255,255,.1)" rx="2"/>)}
            {/* Trees */}
            <ellipse cx="60" cy="170" rx="30" ry="36" fill="rgba(13,110,110,.3)"/>
            <rect x="57" y="183" width="7" height="12" fill="rgba(13,110,110,.4)"/>
            <ellipse cx="840" cy="170" rx="30" ry="36" fill="rgba(13,110,110,.3)"/>
            <rect x="837" y="183" width="7" height="12" fill="rgba(13,110,110,.4)"/>
            {/* Stars */}
            {[[50,30],[750,20],[200,15],[680,35]].map(([x,y],i) => (
              <circle key={i} cx={x} cy={y} r="1.5" fill="rgba(255,255,255,.6)"/>
            ))}
          </svg>
        </div>

        <div style={{ position: 'relative', zIndex: 2 }}>
          <div style={{ display: 'inline-block', background: 'rgba(184,134,11,.2)', border: '1px solid rgba(184,134,11,.4)', color: '#d4a017', fontSize: '.75rem', letterSpacing: '2.5px', textTransform: 'uppercase', padding: '.4rem 1.2rem', borderRadius: 20, marginBottom: '1.8rem', fontFamily: 'var(--font-b)' }}>
            🏛️ Academic Progress Tracking Platform
          </div>
          <h1 style={{ fontFamily: 'var(--font-h)', fontSize: 'clamp(2.4rem,5vw,3.8rem)', fontWeight: 700, color: '#fff', lineHeight: 1.12, marginBottom: '1.3rem' }}>
            Track Every Step of Your<br />
            <span style={{ background: 'linear-gradient(90deg,var(--gold),var(--gold2),#fffde7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Academic Journey</span>
          </h1>
          <p style={{ fontSize: '1.05rem', color: 'rgba(255,255,255,.7)', maxWidth: 580, margin: '0 auto 2.5rem', lineHeight: 1.75, fontWeight: 300 }}>
            From Bachelor's to PhD — submit proposals, results, and publications. Monitor progress through Department, School Faculty, and Postgraduate Board levels with AI-powered scoring.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button className="btn btn-lg" style={{ background: 'linear-gradient(135deg,var(--gold),var(--gold2))', color: 'var(--ink)', fontWeight: 600 }} onClick={() => nav('/register')}>
              Begin Your Journey →
            </button>
            <button className="btn btn-lg" style={{ background: 'transparent', color: '#fff', border: '2px solid rgba(255,255,255,.35)' }} onClick={() => nav('/login')}>
              Sign In
            </button>
          </div>
        </div>
      </section>

      {/* REVIEW FLOW */}
      <section style={{ background: 'var(--cream)', padding: '4rem 2rem', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontFamily: 'var(--font-h)', fontSize: '2rem', color: 'var(--ink)', marginBottom: '.4rem' }}>The Review Journey</h2>
          <p style={{ color: 'var(--ink2)', marginBottom: '2.5rem', fontSize: '.95rem' }}>Your submissions advance through three progressive levels of academic review</p>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '.5rem', flexWrap: 'wrap' }}>
            {[
              { ico: '🏫', name: 'Department', sub: 'Initial Review', color: 'var(--teal-lt)', border: 'var(--teal)' },
              null,
              { ico: '🏛️', name: 'School Faculty', sub: 'Intermediate Review', color: 'var(--amber-lt)', border: 'var(--amber)' },
              null,
              { ico: '🎓', name: 'Postgrad Board', sub: 'Final Approval', color: 'var(--green-lt)', border: 'var(--green)' },
            ].map((item, i) => item === null ? (
              <span key={i} style={{ color: 'var(--ink3)', fontSize: '1.4rem', padding: '0 .3rem' }}>→</span>
            ) : (
              <div key={i} style={{ background: item.color, border: `2px solid ${item.border}`, borderRadius: 'var(--r2)', padding: '1.1rem 1.6rem', minWidth: 165, textAlign: 'center', boxShadow: 'var(--shadow-sm)' }}>
                <div style={{ fontSize: '1.6rem' }}>{item.ico}</div>
                <div style={{ fontFamily: 'var(--font-h)', fontWeight: 600, color: 'var(--ink)', fontSize: '.95rem', margin: '.35rem 0 .2rem' }}>{item.name}</div>
                <div style={{ fontSize: '.74rem', color: 'var(--ink3)', letterSpacing: '.3px' }}>{item.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section style={{ padding: '4.5rem 2rem' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <h2 style={{ fontFamily: 'var(--font-h)', fontSize: '2rem', color: 'var(--ink)', textAlign: 'center', marginBottom: '.4rem' }}>Everything You Need</h2>
          <p style={{ color: 'var(--ink2)', textAlign: 'center', marginBottom: '2.8rem', fontSize: '.95rem' }}>A complete academic progress management platform</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: '1.3rem' }}>
            {features.map((f, i) => (
              <div key={i} className="card" style={{ transition: 'all .25s', cursor: 'default' }}
                onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = 'var(--shadow)'; }}
                onMouseOut={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; }}>
                <div style={{ fontSize: '1.9rem', marginBottom: '.8rem' }}>{f.ico}</div>
                <div style={{ fontFamily: 'var(--font-h)', fontWeight: 600, color: 'var(--ink)', marginBottom: '.45rem', fontSize: '1.05rem' }}>{f.title}</div>
                <div style={{ fontSize: '.86rem', color: 'var(--ink2)', lineHeight: 1.65 }}>{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ background: 'var(--ink)', color: 'rgba(255,255,255,.4)', padding: '2rem 3rem', textAlign: 'center', fontSize: '.83rem' }}>
        © {new Date().getFullYear()} AcademiTrack — Empowering Academic Excellence
      </footer>
    </div>
  );
}

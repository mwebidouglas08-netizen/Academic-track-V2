import { useNavigate } from 'react-router-dom';

const HERO_IMAGE = 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=1920&q=90&auto=format&fit=crop';
const HERO_FALLBACK = 'https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?w=1920&q=90&auto=format&fit=crop';

export default function Landing() {
  const nav = useNavigate();

  const features = [
    { ico: '📋', color: '#1a56db', title: 'Multi-Level Submissions',
      desc: 'Submit proposals, results, presentations, and publications. Each advances through Department → School Faculty → Postgraduate Board.' },
    { ico: '🤖', color: '#7c3aed', title: 'AI-Powered Scoring',
      desc: 'Every submission is automatically evaluated by AI — instant quality score plus detailed academic feedback.' },
    { ico: '📊', color: '#0891b2', title: 'Live Progress Dashboard',
      desc: 'Visual dashboard showing exactly where each submission stands in the pipeline across all three levels.' },
    { ico: '🔔', color: '#059669', title: 'Smart Notifications',
      desc: 'Receive targeted announcements and personalised feedback from your assigned moderator.' },
    { ico: '✉️', color: '#d97706', title: 'Direct Messaging',
      desc: 'Message your moderator and track replies — all within your secure student portal.' },
    { ico: '🎓', color: '#dc2626', title: 'All Academic Levels',
      desc: "Tailored for Bachelor's, Master's, and PhD / Postgraduate students across every department." },
  ];

  const steps = [
    { n: '01', ico: '🏫', name: 'Department',     sub: 'Initial Review',      bg: '#eff5ff', border: '#1a56db', tc: '#1e40af' },
    { n: '02', ico: '🏛️', name: 'School Faculty', sub: 'Intermediate Review', bg: '#f0fdf4', border: '#059669', tc: '#065f46' },
    { n: '03', ico: '🎓', name: 'Postgrad Board',  sub: 'Final Approval',     bg: '#fdf4ff', border: '#7c3aed', tc: '#5b21b6' },
  ];

  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh', fontFamily: 'var(--font-b)' }}>

      {/* NAVBAR */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 500,
        background: 'rgba(255,255,255,0.97)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: '1px solid #e5e7eb',
        boxShadow: '0 1px 12px rgba(0,0,0,.07)',
        height: 68,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 2.5rem',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 10, flexShrink: 0,
            background: 'linear-gradient(135deg,#1a56db,#0891b2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 20, boxShadow: '0 2px 10px rgba(26,86,219,.35)',
          }}>🎓</div>
          <div>
            <div style={{ fontFamily: 'var(--font-h)', fontWeight: 700, color: '#0f172a', fontSize: '1.25rem', lineHeight: 1.1 }}>AcademiTrack</div>
            <div style={{ fontSize: '.58rem', color: '#94a3b8', letterSpacing: '2.5px', textTransform: 'uppercase' }}>Student Progress System</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={() => nav('/login')}
            style={{ padding: '.5rem 1.25rem', borderRadius: 8, background: 'transparent', border: '1.5px solid #d1d5db', color: '#374151', fontFamily: 'var(--font-b)', fontSize: '.87rem', fontWeight: 500, cursor: 'pointer', transition: 'all .17s' }}
            onMouseOver={e => { e.currentTarget.style.borderColor = '#1a56db'; e.currentTarget.style.color = '#1a56db'; }}
            onMouseOut={e => { e.currentTarget.style.borderColor = '#d1d5db'; e.currentTarget.style.color = '#374151'; }}
          >Sign In</button>
          <button onClick={() => nav('/register')}
            style={{ padding: '.5rem 1.4rem', borderRadius: 8, background: 'linear-gradient(135deg,#1a56db,#1447b6)', color: '#fff', fontFamily: 'var(--font-b)', fontSize: '.87rem', fontWeight: 600, border: 'none', cursor: 'pointer', boxShadow: '0 2px 10px rgba(26,86,219,.38)', transition: 'all .17s' }}
            onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-1px)'; }}
            onMouseOut={e => { e.currentTarget.style.transform = ''; }}
          >Get Started</button>
        </div>
      </nav>

      {/* HERO — real HD university photo */}
      <section style={{ position: 'relative', minHeight: '92vh', display: 'flex', alignItems: 'center', overflow: 'hidden' }}>

        <img
          src={HERO_IMAGE}
          alt="University campus"
          onError={e => { e.currentTarget.src = HERO_FALLBACK; }}
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 40%' }}
        />

        {/* Gradient overlay */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(100deg, rgba(5,12,45,0.93) 0%, rgba(8,20,65,0.85) 40%, rgba(8,20,65,0.55) 65%, rgba(8,20,65,0.15) 100%)',
        }} />

        {/* Dot texture */}
        <div style={{ position: 'absolute', inset: 0, opacity: 0.03, backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '30px 30px', pointerEvents: 'none' }} />

        {/* Content */}
        <div style={{ position: 'relative', zIndex: 10, maxWidth: 680, padding: '4rem 4rem 4rem 5rem' }}>

          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,.1)', border: '1px solid rgba(255,255,255,.22)', backdropFilter: 'blur(8px)', color: 'rgba(255,255,255,.9)', fontSize: '.73rem', fontWeight: 600, letterSpacing: '2.2px', textTransform: 'uppercase', padding: '.42rem 1.1rem', borderRadius: 30, marginBottom: '1.7rem' }}>
            🏛️ Academic Progress Tracking Platform
          </div>

          <h1 style={{ fontFamily: 'var(--font-h)', fontSize: 'clamp(2.5rem,5.5vw,4rem)', fontWeight: 700, lineHeight: 1.08, color: '#ffffff', marginBottom: '1.3rem', textShadow: '0 2px 28px rgba(0,0,0,.55)' }}>
            Track Every Step<br />of Your{' '}
            <span style={{ background: 'linear-gradient(90deg,#93c5fd,#a5b4fc,#c4b5fd)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              Academic Journey
            </span>
          </h1>

          <p style={{ fontSize: '1.07rem', color: 'rgba(255,255,255,.78)', lineHeight: 1.8, fontWeight: 300, marginBottom: '2.5rem', maxWidth: 560 }}>
            From Bachelor's to PhD — submit proposals, results, and publications.
            Monitor progress through{' '}
            <strong style={{ color: '#93c5fd', fontWeight: 500 }}>Department</strong>,{' '}
            <strong style={{ color: '#6ee7b7', fontWeight: 500 }}>School Faculty</strong>, and{' '}
            <strong style={{ color: '#c4b5fd', fontWeight: 500 }}>Postgraduate Board</strong>{' '}
            with AI-powered automatic scoring.
          </p>

          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '3rem' }}>
            <button onClick={() => nav('/register')}
              style={{ padding: '.9rem 2.4rem', borderRadius: 10, background: 'linear-gradient(135deg,#1a56db,#1447b6)', color: '#fff', fontFamily: 'var(--font-b)', fontWeight: 700, fontSize: '1rem', border: 'none', cursor: 'pointer', boxShadow: '0 4px 22px rgba(26,86,219,.58)', transition: 'all .2s' }}
              onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseOut={e => { e.currentTarget.style.transform = ''; }}
            >Start Tracking →</button>
            <button onClick={() => nav('/login')}
              style={{ padding: '.9rem 2rem', borderRadius: 10, background: 'rgba(255,255,255,.1)', backdropFilter: 'blur(8px)', color: '#fff', fontFamily: 'var(--font-b)', fontWeight: 500, fontSize: '1rem', border: '2px solid rgba(255,255,255,.38)', cursor: 'pointer', transition: 'all .2s' }}
              onMouseOver={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,.8)'; }}
              onMouseOut={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,.38)'; }}
            >Sign In</button>
          </div>

          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            {[{ val: '3', label: 'Review Levels' }, { val: '4', label: 'Document Types' }, { val: 'AI', label: 'Auto Scoring' }, { val: '∞', label: 'Students Welcome' }].map(s => (
              <div key={s.label} style={{ background: 'rgba(255,255,255,.1)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,.18)', borderRadius: 10, padding: '.6rem 1.2rem', textAlign: 'center', minWidth: 82 }}>
                <div style={{ fontFamily: 'var(--font-h)', fontSize: '1.65rem', fontWeight: 700, color: '#fff', lineHeight: 1 }}>{s.val}</div>
                <div style={{ fontSize: '.67rem', color: 'rgba(255,255,255,.6)', marginTop: 3, textTransform: 'uppercase', letterSpacing: '1px' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ position: 'absolute', bottom: '2rem', left: '50%', transform: 'translateX(-50%)', zIndex: 10, color: 'rgba(255,255,255,.45)', fontSize: '1.3rem', animation: 'bounce 2.2s ease-in-out infinite' }}>↓</div>
      </section>

      {/* REVIEW JOURNEY */}
      <section style={{ background: '#ffffff', padding: '5.5rem 2rem', borderBottom: '1px solid #e5e7eb' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto', textAlign: 'center' }}>
          <span style={{ display: 'inline-block', background: '#eff5ff', color: '#1a56db', fontSize: '.72rem', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', padding: '.35rem 1.1rem', borderRadius: 20, marginBottom: '1rem' }}>How It Works</span>
          <h2 style={{ fontFamily: 'var(--font-h)', fontSize: '2.3rem', color: '#0f172a', marginBottom: '.5rem' }}>The Review Journey</h2>
          <p style={{ color: '#6b7280', fontSize: '.97rem', maxWidth: 520, margin: '0 auto 3.5rem' }}>Every submission advances through three progressive levels of academic scrutiny</p>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap', gap: 0 }}>
            {steps.map((s, i) => (
              <div key={s.name} style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ background: s.bg, border: `2px solid ${s.border}`, borderRadius: 16, padding: '1.8rem 2rem', minWidth: 185, textAlign: 'center', boxShadow: `0 4px 24px ${s.border}25`, position: 'relative', transition: 'all .25s', cursor: 'default' }}
                  onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-6px)'; }}
                  onMouseOut={e => { e.currentTarget.style.transform = ''; }}
                >
                  <div style={{ position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)', background: s.border, color: '#fff', fontSize: '.66rem', fontWeight: 700, padding: '3px 11px', borderRadius: 20, letterSpacing: '1px' }}>STEP {s.n}</div>
                  <div style={{ fontSize: '2.3rem', marginBottom: '.6rem' }}>{s.ico}</div>
                  <div style={{ fontFamily: 'var(--font-h)', fontWeight: 700, color: s.tc, fontSize: '1.1rem', marginBottom: '.3rem' }}>{s.name}</div>
                  <div style={{ fontSize: '.77rem', color: '#6b7280' }}>{s.sub}</div>
                </div>
                {i < steps.length - 1 && <div style={{ color: '#cbd5e1', fontSize: '1.5rem', padding: '0 .8rem' }}>→</div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section style={{ background: '#f8fafc', padding: '5.5rem 2rem' }}>
        <div style={{ maxWidth: 1120, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <span style={{ display: 'inline-block', background: '#eff5ff', color: '#1a56db', fontSize: '.72rem', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', padding: '.35rem 1.1rem', borderRadius: 20, marginBottom: '1rem' }}>Features</span>
            <h2 style={{ fontFamily: 'var(--font-h)', fontSize: '2.3rem', color: '#0f172a', marginBottom: '.5rem' }}>Everything You Need</h2>
            <p style={{ color: '#6b7280', fontSize: '.97rem', maxWidth: 460, margin: '0 auto' }}>A complete academic progress management platform built for universities</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: '1.3rem' }}>
            {features.map((f, i) => (
              <div key={i}
                style={{ background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: 14, padding: '1.7rem', borderTop: `3px solid ${f.color}`, boxShadow: '0 1px 4px rgba(0,0,0,.05)', transition: 'all .25s', cursor: 'default' }}
                onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.boxShadow = '0 14px 36px rgba(0,0,0,.1)'; }}
                onMouseOut={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,.05)'; }}
              >
                <div style={{ width: 48, height: 48, borderRadius: 12, background: `${f.color}14`, border: `1px solid ${f.color}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', marginBottom: '1rem' }}>{f.ico}</div>
                <div style={{ fontFamily: 'var(--font-h)', fontWeight: 700, color: '#0f172a', fontSize: '1.07rem', marginBottom: '.48rem' }}>{f.title}</div>
                <div style={{ fontSize: '.87rem', color: '#6b7280', lineHeight: 1.7 }}>{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA BANNER */}
      <section style={{ background: 'linear-gradient(135deg,#0f2d6b 0%,#1a56db 55%,#0891b2 100%)', padding: '5.5rem 2rem', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, opacity: .05, backgroundImage: 'radial-gradient(circle,#fff 1px,transparent 1px)', backgroundSize: '28px 28px', pointerEvents: 'none' }} />
        <div style={{ position: 'relative', zIndex: 2, maxWidth: 620, margin: '0 auto' }}>
          <h2 style={{ fontFamily: 'var(--font-h)', fontSize: '2.5rem', color: '#fff', marginBottom: '.9rem', fontWeight: 700 }}>Ready to Track Your Progress?</h2>
          <p style={{ color: 'rgba(255,255,255,.78)', fontSize: '1.05rem', marginBottom: '2.2rem', lineHeight: 1.75 }}>Join students across all academic levels managing their journey with AcademiTrack.</p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={() => nav('/register')} style={{ padding: '.9rem 2.4rem', borderRadius: 10, background: '#ffffff', color: '#1a56db', fontFamily: 'var(--font-b)', fontWeight: 700, fontSize: '1rem', border: 'none', cursor: 'pointer', boxShadow: '0 4px 20px rgba(0,0,0,.2)', transition: 'all .2s' }} onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseOut={e => e.currentTarget.style.transform = ''}>Create Free Account</button>
            <button onClick={() => nav('/login')} style={{ padding: '.9rem 2rem', borderRadius: 10, background: 'transparent', color: '#fff', fontFamily: 'var(--font-b)', fontWeight: 500, fontSize: '1rem', border: '2px solid rgba(255,255,255,.45)', cursor: 'pointer', transition: 'all .2s' }} onMouseOver={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,.9)'} onMouseOut={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,.45)'}>Sign In</button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ background: '#0f172a', color: 'rgba(255,255,255,.38)', padding: '2rem 3rem', textAlign: 'center', fontSize: '.82rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: '.5rem' }}>
          <div style={{ width: 26, height: 26, borderRadius: 6, background: 'linear-gradient(135deg,#1a56db,#0891b2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13 }}>🎓</div>
          <span style={{ fontFamily: 'var(--font-h)', fontSize: '1rem', color: 'rgba(255,255,255,.55)' }}>AcademiTrack</span>
        </div>
        <p>© {new Date().getFullYear()} AcademiTrack — Empowering Academic Excellence</p>
      </footer>

      <style>{`
        @keyframes bounce {
          0%, 100% { transform: translateX(-50%) translateY(0px); }
          50% { transform: translateX(-50%) translateY(10px); }
        }
      `}</style>
    </div>
  );
}

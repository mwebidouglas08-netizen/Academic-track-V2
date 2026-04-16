import { useState, useEffect, useCallback } from 'react';
import { useAdmin } from '../contexts/AdminContext';
import { showToast } from '../components/Toast';
import api from '../utils/api';

const LEVELS = ['Department', 'School Faculty', 'Postgraduate Board'];

function SBadge({ s }) {
  const m={Approved:'b-green',Rejected:'b-red',Submitted:'b-blue',Reviewing:'b-amber'};
  return <span className={`badge ${m[s]||'b-gray'}`}>{s}</span>;
}
function LBadge({ l }) {
  const m={Department:'b-teal','School Faculty':'b-amber','Postgraduate Board':'b-blue'};
  return <span className={`badge ${m[l]||'b-gray'}`}>{l}</span>;
}
function PT({ children, sub }) {
  return <div style={{marginBottom:'1.8rem'}}>
    <h1 style={{fontFamily:'var(--font-h)',fontSize:'1.7rem',color:'var(--text)',fontWeight:600}}>{children}</h1>
    {sub && <p style={{color:'var(--text2)',fontSize:'.9rem',marginTop:'.2rem'}}>{sub}</p>}
  </div>;
}

const NAV = [
  {id:'dash',    ico:'📊',lbl:'Dashboard',   grp:'Overview'},
  {id:'students',ico:'👥',lbl:'Students',    grp:'Overview'},
  {id:'subs',    ico:'📤',lbl:'Submissions', grp:'Overview'},
  {id:'notifs',  ico:'🔔',lbl:'Notifications',grp:'Communication'},
  {id:'msgs',    ico:'✉️',lbl:'Messages',    grp:'Communication'},
  {id:'mods',    ico:'👮',lbl:'Moderators',  grp:'Management'},
];

export default function AdminDashboard() {
  const { admin, logout } = useAdmin();
  const [panel, setPanel] = useState('dash');
  const [data, setData] = useState({ stats:{}, students:[], subs:[], notifs:[], msgs:[], mods:[] });
  const [modal, setModal] = useState(null);
  const [revSub, setRevSub] = useState(null);

  const load = useCallback(async (sec) => {
    try {
      const endpoints = {
        stats:    '/admin/stats',
        students: '/admin/students',
        subs:     '/admin/submissions',
        notifs:   '/admin/notifications',
        msgs:     '/admin/messages',
        mods:     '/admin/moderators',
      };
      if (endpoints[sec]) {
        const r = await api.get(endpoints[sec]);
        setData(d => ({ ...d, [sec]: r.data }));
      }
    } catch (e) { showToast(e.response?.data?.error || 'Failed to load.', 'error'); }
  }, []);

  useEffect(() => { load('stats'); load('students'); }, [load]);

  const sw = (p) => { setPanel(p); load(p); if(p==='dash') load('stats'); };
  const groups = [...new Set(NAV.map(n => n.grp))];

  return (
    <div style={{ display:'flex', minHeight:'100vh', background:'var(--bg)' }}>
      {/* Sidebar */}
      <aside style={{ width:230, background:'#0a1020', borderRight:'1px solid var(--border)', display:'flex', flexDirection:'column', flexShrink:0 }}>
        <div style={{ padding:'1.3rem 1.4rem', borderBottom:'1px solid var(--border)', display:'flex', alignItems:'center', gap:10 }}>
          <div style={{ fontSize:'1.4rem' }}>🛡️</div>
          <div>
            <div style={{ fontFamily:'var(--font-h)', fontSize:'1rem', color:'var(--text)', lineHeight:1.1 }}>AcademiTrack</div>
            <div style={{ fontSize:'.62rem', color:'var(--red)', letterSpacing:'1.5px', textTransform:'uppercase' }}>Admin Portal</div>
          </div>
        </div>
        <nav style={{ flex:1, padding:'.8rem 0', overflowY:'auto' }}>
          {groups.map(g => (
            <div key={g}>
              <div className="slabel">{g}</div>
              {NAV.filter(n=>n.grp===g).map(n => (
                <div key={n.id} className={`anav${panel===n.id?' on':''}`} onClick={() => sw(n.id)}>
                  <span>{n.ico}</span><span>{n.lbl}</span>
                </div>
              ))}
            </div>
          ))}
        </nav>
        <div style={{ padding:'1rem 1.3rem', borderTop:'1px solid var(--border)' }}>
          <div style={{ fontSize:'.78rem', color:'var(--text2)', marginBottom:'.25rem' }}>{admin?.name}</div>
          <div style={{ fontSize:'.7rem', color:'var(--text3)', marginBottom:'.7rem' }}>{admin?.role}</div>
          <button className="btn btn-ghost btn-sm btn-block" onClick={logout}>Logout</button>
        </div>
      </aside>

      {/* Main content */}
      <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden' }}>
        <div style={{ background:'var(--surface)', borderBottom:'1px solid var(--border)', padding:'.9rem 2rem', display:'flex', alignItems:'center', justifyContent:'space-between', flexShrink:0 }}>
          <div style={{ fontFamily:'var(--font-h)', fontSize:'1.1rem', color:'var(--text)' }}>
            {NAV.find(n=>n.id===panel)?.ico} {NAV.find(n=>n.id===panel)?.lbl || 'Dashboard'}
          </div>
          <div style={{ fontSize:'.82rem', color:'var(--text2)' }}>Logged in as <strong style={{color:'var(--gold)'}}>{admin?.username}</strong></div>
        </div>
        <main style={{ flex:1, overflowY:'auto', padding:'2rem' }}>
          {panel==='dash'     && <DashPanel stats={data.stats} onNav={sw} />}
          {panel==='students' && <StudentsPanel students={data.students} onAdd={()=>setModal('add-stud')} onRefresh={()=>load('students')} />}
          {panel==='subs'     && <SubsPanel subs={data.subs} onReview={s=>{setRevSub(s);setModal('review');}} />}
          {panel==='notifs'   && <NotifsPanel notifs={data.notifs} students={data.students} onRefresh={()=>load('notifs')} />}
          {panel==='msgs'     && <MsgsPanel msgs={data.msgs} onRefresh={()=>load('msgs')} />}
          {panel==='mods'     && <ModsPanel mods={data.mods} adminRole={admin?.role} onAdd={()=>setModal('add-mod')} onRefresh={()=>load('mods')} />}
        </main>
      </div>

      {modal==='add-stud' && <AddStudentModal onClose={()=>setModal(null)} onDone={()=>{setModal(null);load('students');}} />}
      {modal==='add-mod'  && <AddModModal     onClose={()=>setModal(null)} onDone={()=>{setModal(null);load('mods');}} />}
      {modal==='review' && revSub && <ReviewModal sub={revSub} onClose={()=>{setModal(null);setRevSub(null);}} onDone={()=>{setModal(null);setRevSub(null);load('subs');}} />}
    </div>
  );
}

/* ── PANELS ── */
function DashPanel({ stats, onNav }) {
  const sc = [
    {lbl:'Total Students', val:stats.students||0, c:'var(--teal)'},
    {lbl:'Submissions',    val:stats.submissions||0, c:'var(--blue)'},
    {lbl:'Approved',       val:stats.approved||0, c:'var(--green)'},
    {lbl:'Pending Review', val:stats.pendingReview||0, c:'var(--amber)'},
    {lbl:'Unread Messages',val:stats.pendingMessages||0, c:'var(--red)'},
  ];
  return (
    <div>
      <PT sub="System overview and quick actions">Admin Dashboard</PT>
      <div className="sgrid">
        {sc.map(s=><div key={s.lbl} className="scard"><div className="sval" style={{color:s.c}}>{s.val}</div><div className="slb">{s.lbl}</div></div>)}
      </div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'1.3rem'}}>
        <div className="card">
          <div className="card-t">⚡ Quick Actions</div>
          <div style={{display:'flex',flexDirection:'column',gap:'.6rem'}}>
            <button className="btn btn-teal btn-sm" onClick={()=>onNav('subs')}>📤 Review Submissions</button>
            <button className="btn btn-ghost btn-sm" onClick={()=>onNav('students')}>👥 Manage Students</button>
            <button className="btn btn-ghost btn-sm" onClick={()=>onNav('notifs')}>🔔 Send Notification</button>
            <button className="btn btn-ghost btn-sm" onClick={()=>onNav('msgs')}>✉️ View Messages</button>
          </div>
        </div>
        <div className="card">
          <div className="card-t">📈 System Stats</div>
          <table style={{width:'100%',fontSize:'.87rem',borderCollapse:'collapse'}}>
            <tbody>
              <tr><td style={{color:'var(--text2)',padding:'.4rem 0',width:'55%'}}>Approval Rate</td><td style={{fontWeight:600}}>{stats.submissions?Math.round((stats.approved/stats.submissions)*100):0}%</td></tr>
              <tr><td style={{color:'var(--text2)',padding:'.4rem 0'}}>Pending Review</td><td style={{fontWeight:600,color:'var(--amber)'}}>{stats.pendingReview||0}</td></tr>
              <tr><td style={{color:'var(--text2)',padding:'.4rem 0'}}>Status</td><td><span className="badge b-green">● Online</span></td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StudentsPanel({ students, onAdd, onRefresh }) {
  const del = async (id) => {
    if (!confirm('Remove this student and all their data?')) return;
    try { await api.delete(`/admin/students/${id}`); showToast('Student removed.','success'); onRefresh(); }
    catch(e) { showToast(e.response?.data?.error||'Failed.','error'); }
  };
  const toggle = async (id, cur) => {
    try { await api.patch(`/admin/students/${id}`,{isActive:!cur}); showToast(`Student ${!cur?'activated':'deactivated'}.`,'success'); onRefresh(); }
    catch(e) { showToast(e.response?.data?.error||'Failed.','error'); }
  };
  return (
    <div>
      <div className="flex jb aic" style={{marginBottom:'1.5rem'}}>
        <PT sub="All registered students">Students</PT>
        <button className="btn btn-gold btn-sm" onClick={onAdd}>+ Add Student</button>
      </div>
      <div className="card" style={{padding:0}}>
        <div className="tbl-wrap">
          <table className="dtbl">
            <thead><tr><th>Name</th><th>Reg No.</th><th>Phone</th><th>Level</th><th>Dept</th><th>Subs</th><th>Status</th><th></th></tr></thead>
            <tbody>
              {students.length===0 && <tr><td colSpan={8} style={{textAlign:'center',color:'var(--text2)',padding:'2rem'}}>No students yet.</td></tr>}
              {students.map(s=>(
                <tr key={s.id}>
                  <td style={{fontWeight:500}}>{s.first_name} {s.last_name}</td>
                  <td className="tsm muted">{s.reg_number}</td>
                  <td className="tsm">{s.phone||'—'}</td>
                  <td><span className="badge b-gold">{s.academic_level?.split(' ')[0]}</span></td>
                  <td className="tsm">{s.department}</td>
                  <td>{s.submission_count||0}</td>
                  <td><span className={`badge ${s.is_active?'b-green':'b-red'}`}>{s.is_active?'Active':'Inactive'}</span></td>
                  <td style={{display:'flex',gap:'.4rem',flexWrap:'wrap'}}>
                    <button className="btn btn-ghost btn-sm" onClick={()=>toggle(s.id,s.is_active)}>{s.is_active?'Deactivate':'Activate'}</button>
                    <button className="btn btn-danger btn-sm" onClick={()=>del(s.id)}>Remove</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function SubsPanel({ subs, onReview }) {
  return (
    <div>
      <PT sub="Review, score and advance student submissions">All Submissions</PT>
      <div className="card" style={{padding:0}}>
        <div className="tbl-wrap">
          <table className="dtbl">
            <thead><tr><th>Title</th><th>Student</th><th>Type</th><th>Level</th><th>Status</th><th>AI Score</th><th>Date</th><th></th></tr></thead>
            <tbody>
              {subs.length===0 && <tr><td colSpan={8} style={{textAlign:'center',color:'var(--text2)',padding:'2rem'}}>No submissions yet.</td></tr>}
              {subs.map(s=>(
                <tr key={s.id}>
                  <td style={{maxWidth:170,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}} title={s.title}>{s.title}</td>
                  <td className="tsm">{s.first_name} {s.last_name}<br/><span style={{color:'var(--text2)'}}>{s.reg_number}</span></td>
                  <td><span className="badge b-gray">{s.type}</span></td>
                  <td><LBadge l={s.current_level}/></td>
                  <td><SBadge s={s.status}/></td>
                  <td>{s.ai_score>0?<span style={{fontWeight:600,color:s.ai_score>=80?'var(--green)':s.ai_score>=60?'var(--amber)':'var(--red)'}}>{s.ai_score}</span>:'—'}</td>
                  <td className="tsm muted">{new Date(s.submitted_at).toLocaleDateString()}</td>
                  <td><button className="btn btn-ghost btn-sm" onClick={()=>onReview(s)}>Review</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function NotifsPanel({ notifs, students, onRefresh }) {
  const [f, setF] = useState({recipientType:'all',recipientId:'',title:'',message:''});
  const [loading, setLoading] = useState(false);
  const send = async (e) => {
    e.preventDefault();
    if(!f.title||!f.message){showToast('Fill all fields.','error');return;}
    setLoading(true);
    try { await api.post('/admin/notifications',f); setF({recipientType:'all',recipientId:'',title:'',message:''}); showToast('Sent!','success'); onRefresh(); }
    catch(e){showToast(e.response?.data?.error||'Failed.','error');}
    finally{setLoading(false);}
  };
  return (
    <div>
      <PT sub="Send announcements to all or specific students">Notifications</PT>
      <div className="card">
        <div className="card-t">📢 New Notification</div>
        <form onSubmit={send}>
          <div className="fg"><label>Recipient</label>
            <select value={f.recipientType} onChange={e=>setF(p=>({...p,recipientType:e.target.value,recipientId:''}))}>
              <option value="all">All Students</option>
              <option value="student">Specific Student</option>
            </select>
          </div>
          {f.recipientType==='student' && (
            <div className="fg"><label>Select Student</label>
              <select value={f.recipientId} onChange={e=>setF(p=>({...p,recipientId:e.target.value}))}>
                <option value="">— Choose student —</option>
                {students.map(s=><option key={s.id} value={s.id}>{s.first_name} {s.last_name} ({s.reg_number})</option>)}
              </select>
            </div>
          )}
          <div className="fg"><label>Title</label><input type="text" placeholder="Notification title" value={f.title} onChange={e=>setF(p=>({...p,title:e.target.value}))}/></div>
          <div className="fg"><label>Message</label><textarea rows={4} placeholder="Notification body…" value={f.message} onChange={e=>setF(p=>({...p,message:e.target.value}))}/></div>
          <button type="submit" className="btn btn-gold" disabled={loading}>{loading?<><span className="spin"/>&nbsp;Sending…</>:'Send Notification'}</button>
        </form>
      </div>
      <div className="card">
        <div className="card-t">📋 Sent History</div>
        {notifs.length===0?<p className="muted tsm">No notifications sent yet.</p>
          :notifs.map(n=>(
          <div key={n.id} style={{background:'var(--surface2)',border:'1px solid var(--border)',borderRadius:'var(--r)',padding:'1rem',marginBottom:'.65rem'}}>
            <div className="flex jb aic" style={{marginBottom:'.4rem',flexWrap:'wrap',gap:'.4rem'}}>
              <strong>{n.title}</strong>
              <span className="tsm muted">{new Date(n.created_at).toLocaleDateString()} → {n.recipient_type==='all'?'All':n.recipient_name||'Student'}</span>
            </div>
            <div className="tsm muted">{n.message}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function MsgsPanel({ msgs, onRefresh }) {
  const [replies, setReplies] = useState({});
  const [loading, setLoading] = useState({});
  const sendReply = async (id) => {
    const reply = replies[id];
    if(!reply?.trim())return;
    setLoading(p=>({...p,[id]:true}));
    try { await api.post(`/admin/messages/${id}/reply`,{reply}); setReplies(p=>({...p,[id]:''})); showToast('Reply sent!','success'); onRefresh(); }
    catch{showToast('Failed.','error');}
    finally{setLoading(p=>({...p,[id]:false}));}
  };
  return (
    <div>
      <PT sub="Direct messages from students">Messages</PT>
      {msgs.length===0?<div className="card"><p className="muted">No messages yet.</p></div>
        :msgs.map(m=>(
        <div key={m.id} className="card">
          <div className="flex jb aic" style={{marginBottom:'.5rem',flexWrap:'wrap',gap:'.5rem'}}>
            <strong>{m.subject}</strong>
            <span className="tsm muted">{m.first_name} {m.last_name} ({m.reg_number}) · {new Date(m.created_at).toLocaleDateString()}</span>
          </div>
          <div className="tsm" style={{color:'var(--text)',lineHeight:1.65,marginBottom:'.8rem'}}>{m.body}</div>
          {m.reply?(
            <div style={{background:'rgba(20,184,166,.08)',borderRadius:'var(--r)',padding:'.75rem',borderLeft:'3px solid var(--teal)'}}>
              <div style={{fontSize:'.73rem',fontWeight:700,color:'var(--teal)',marginBottom:'.25rem'}}>Your reply:</div>
              <div className="tsm">{m.reply}</div>
            </div>
          ):(
            <div className="flex g1">
              <input type="text" placeholder="Type your reply…" value={replies[m.id]||''}
                onChange={e=>setReplies(p=>({...p,[m.id]:e.target.value}))}
                style={{flex:1,background:'var(--bg3)',border:'1.5px solid var(--border)',borderRadius:'var(--r)',padding:'.55rem .9rem',color:'var(--text)',fontFamily:'var(--font-b)',fontSize:'.87rem',outline:'none'}}/>
              <button className="btn btn-teal btn-sm" onClick={()=>sendReply(m.id)} disabled={loading[m.id]}>
                {loading[m.id]?<span className="spin"/>:'Reply'}
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function ModsPanel({ mods, adminRole, onAdd, onRefresh }) {
  const del = async (id) => {
    if(!confirm('Remove this moderator?'))return;
    try { await api.delete(`/admin/moderators/${id}`); showToast('Removed.','success'); onRefresh(); }
    catch(e){showToast(e.response?.data?.error||'Failed.','error');}
  };
  return (
    <div>
      <div className="flex jb aic" style={{marginBottom:'1.5rem'}}>
        <PT sub="Manage admin moderator accounts">Moderators</PT>
        {adminRole==='Super Admin'&&<button className="btn btn-gold btn-sm" onClick={onAdd}>+ Add Moderator</button>}
      </div>
      <div className="card" style={{padding:0}}>
        <div className="tbl-wrap">
          <table className="dtbl">
            <thead><tr><th>Name</th><th>Username</th><th>Email</th><th>Role</th><th>Joined</th><th></th></tr></thead>
            <tbody>
              {mods.map(m=>(
                <tr key={m.id}>
                  <td style={{fontWeight:500}}>{m.name}</td>
                  <td className="tsm muted">@{m.username}</td>
                  <td className="tsm">{m.email}</td>
                  <td><span className={`badge ${m.role==='Super Admin'?'b-red':m.role==='Senior Moderator'?'b-gold':'b-teal'}`}>{m.role}</span></td>
                  <td className="tsm muted">{new Date(m.created_at).toLocaleDateString()}</td>
                  <td>{adminRole==='Super Admin'&&m.role!=='Super Admin'&&<button className="btn btn-danger btn-sm" onClick={()=>del(m.id)}>Remove</button>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ── MODALS ── */
function AddStudentModal({ onClose, onDone }) {
  const [f, setF] = useState({firstName:'',lastName:'',regNumber:'',phone:'',email:'',academicLevel:"Bachelor's Degree",department:'',researchTopic:'',password:''});
  const [err, setErr] = useState(''); const [loading, setLoading] = useState(false);
  const set = k => e => setF(p=>({...p,[k]:e.target.value}));
  const submit = async (e) => {
    e.preventDefault();
    if(!f.firstName||!f.lastName||!f.regNumber||!f.phone||!f.email||!f.department||!f.password){setErr('Fill all required fields.');return;}
    setLoading(true);
    try{await api.post('/admin/students',f);showToast('Student added!','success');onDone();}
    catch(e){setErr(e.response?.data?.error||'Failed.');}finally{setLoading(false);}
  };
  return (
    <div className="moverlay open">
      <div className="modal">
        <div className="mhdr"><div className="mtitle">Add New Student</div><button className="mclose" onClick={onClose}>✕</button></div>
        <form onSubmit={submit}>
          <div className="fgrid">
            <div className="fg"><label>First Name *</label><input type="text" placeholder="First name" value={f.firstName} onChange={set('firstName')}/></div>
            <div className="fg"><label>Last Name *</label><input type="text" placeholder="Last name" value={f.lastName} onChange={set('lastName')}/></div>
            <div className="fg full"><label>Registration Number *</label><input type="text" placeholder="REG/2024/001" value={f.regNumber} onChange={set('regNumber')}/></div>
            <div className="fg full"><label>Phone Number *</label><input type="tel" placeholder="+254 700 000 000" value={f.phone} onChange={set('phone')}/></div>
            <div className="fg full"><label>Email</label><input type="email" placeholder="student@university.edu" value={f.email} onChange={set('email')}/></div>
            <div className="fg full"><label>Academic Level</label>
              <select value={f.academicLevel} onChange={set('academicLevel')}>
                <option>Bachelor's Degree</option><option>Master's Degree</option><option>PhD / Postgraduate</option>
              </select>
            </div>
            <div className="fg full"><label>Department *</label><input type="text" placeholder="Department" value={f.department} onChange={set('department')}/></div>
            <div className="fg full"><label>Research Topic</label><input type="text" placeholder="Optional" value={f.researchTopic} onChange={set('researchTopic')}/></div>
            <div className="fg full"><label>Password *</label><input type="password" placeholder="Temporary password" value={f.password} onChange={set('password')}/></div>
          </div>
          {err&&<div className="err-box">{err}</div>}
          <button type="submit" className="btn btn-gold btn-block" disabled={loading}>{loading?<><span className="spin"/>&nbsp;Adding…</>:'Add Student'}</button>
        </form>
      </div>
    </div>
  );
}

function AddModModal({ onClose, onDone }) {
  const [f, setF] = useState({name:'',username:'',email:'',password:'',role:'Moderator'});
  const [err, setErr] = useState(''); const [loading, setLoading] = useState(false);
  const set = k => e => setF(p=>({...p,[k]:e.target.value}));
  const submit = async (e) => {
    e.preventDefault();
    if(!f.name||!f.username||!f.email||!f.password){setErr('All fields required.');return;}
    setLoading(true);
    try{await api.post('/admin/moderators',f);showToast('Moderator added!','success');onDone();}
    catch(e){setErr(e.response?.data?.error||'Failed.');}finally{setLoading(false);}
  };
  return (
    <div className="moverlay open">
      <div className="modal">
        <div className="mhdr"><div className="mtitle">Add Moderator</div><button className="mclose" onClick={onClose}>✕</button></div>
        <form onSubmit={submit}>
          <div className="fg"><label>Full Name *</label><input type="text" placeholder="Dr. Jane Smith" value={f.name} onChange={set('name')}/></div>
          <div className="fg"><label>Username *</label><input type="text" placeholder="jsmith" value={f.username} onChange={set('username')}/></div>
          <div className="fg"><label>Email *</label><input type="email" placeholder="mod@university.edu" value={f.email} onChange={set('email')}/></div>
          <div className="fg"><label>Password *</label><input type="password" placeholder="Set password" value={f.password} onChange={set('password')}/></div>
          <div className="fg"><label>Role</label>
            <select value={f.role} onChange={set('role')}><option>Moderator</option><option>Senior Moderator</option><option>Super Admin</option></select>
          </div>
          {err&&<div className="err-box">{err}</div>}
          <button type="submit" className="btn btn-gold btn-block" disabled={loading}>{loading?<><span className="spin"/>&nbsp;Adding…</>:'Add Moderator'}</button>
        </form>
      </div>
    </div>
  );
}

function ReviewModal({ sub, onClose, onDone }) {
  const [score, setScore] = useState(sub.manual_score||sub.ai_score||'');
  const [notes, setNotes] = useState(sub.moderator_notes||'');
  const [advLvl, setAdvLvl] = useState(sub.current_level);
  const [loading, setLoading] = useState(false);
  const hist = Array.isArray(sub.history)?sub.history.filter(Boolean):[];

  const act = async (action) => {
    setLoading(true);
    try {
      await api.patch(`/admin/submissions/${sub.id}`,{action,manualScore:score?parseInt(score):undefined,moderatorNotes:notes,advanceToLevel:advLvl});
      showToast(action==='approve'?'Approved!':action==='reject'?'Rejected.':'Level advanced!', action==='reject'?'error':'success');
      onDone();
    } catch(e){showToast(e.response?.data?.error||'Failed.','error');}
    finally{setLoading(false);}
  };

  return (
    <div className="moverlay open">
      <div className="modal">
        <div className="mhdr"><div className="mtitle">Review: {sub.type}</div><button className="mclose" onClick={onClose}>✕</button></div>
        <div style={{marginBottom:'1rem'}}>
          <strong>{sub.title}</strong>
          <div className="tsm muted mt1">By: {sub.first_name} {sub.last_name} ({sub.reg_number}) · {new Date(sub.submitted_at).toLocaleDateString()}</div>
          <div className="flex g1 wrap" style={{marginTop:'.5rem'}}>
            <LBadge l={sub.current_level}/><SBadge s={sub.status}/>
            {sub.ai_score>0&&<span className="badge b-gold">AI: {sub.ai_score}/100</span>}
          </div>
        </div>
        <div style={{background:'var(--bg3)',borderRadius:'var(--r)',padding:'1rem',marginBottom:'1rem',maxHeight:180,overflowY:'auto'}}>
          <div className="tsm" style={{lineHeight:1.65}}>{sub.content}</div>
        </div>
        {sub.ai_feedback&&<div style={{background:'var(--gold-lt)',border:'1px solid rgba(212,160,23,.3)',borderRadius:'var(--r)',padding:'.8rem 1rem',marginBottom:'1rem'}}>
          <div style={{fontSize:'.73rem',fontWeight:700,color:'var(--gold)',marginBottom:'.25rem',textTransform:'uppercase',letterSpacing:'1px'}}>🤖 AI Feedback</div>
          <div className="tsm" style={{color:'var(--text2)'}}>{sub.ai_feedback}</div>
        </div>}
        {hist.length>0&&<div style={{marginBottom:'1rem'}}>
          <div style={{fontSize:'.72rem',fontWeight:700,color:'var(--text2)',marginBottom:'.4rem',textTransform:'uppercase',letterSpacing:'.5px'}}>Level History</div>
          <div className="flex g1 wrap">{hist.map((h,i)=><span key={i} className={`badge ${h.status==='Approved'?'b-green':h.status==='Rejected'?'b-red':'b-blue'}`}>{h.level}: {h.status}</span>)}</div>
        </div>}
        <div className="fg"><label>Manual Score Override (0–100)</label><input type="number" min="0" max="100" placeholder="Leave blank to keep AI score" value={score} onChange={e=>setScore(e.target.value)}/></div>
        <div className="fg"><label>Advance to Level</label>
          <select value={advLvl} onChange={e=>setAdvLvl(e.target.value)}>{LEVELS.map(l=><option key={l}>{l}</option>)}</select>
        </div>
        <div className="fg"><label>Moderator Notes</label><textarea rows={3} placeholder="Feedback for the student…" value={notes} onChange={e=>setNotes(e.target.value)}/></div>
        <div className="flex g1 wrap">
          <button className="btn btn-success" disabled={loading} onClick={()=>act('approve')}>{loading?<span className="spin"/>:'✓ Approve'}</button>
          <button className="btn btn-danger"  disabled={loading} onClick={()=>act('reject')} >{loading?<span className="spin"/>:'✗ Reject'}</button>
          <button className="btn btn-teal"    disabled={loading} onClick={()=>act('advance')}>{loading?<span className="spin"/>:'→ Advance Level'}</button>
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

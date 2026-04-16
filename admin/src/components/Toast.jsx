import { useState, useEffect } from 'react';
let _s = null;
export function showToast(msg, type = 'info') { if (_s) _s({ msg, type, id: Date.now() }); }
export default function Toast() {
  const [t, setT] = useState(null);
  _s = setT;
  useEffect(() => { if (!t) return; const x = setTimeout(() => setT(null), 3200); return () => clearTimeout(x); }, [t]);
  if (!t) return null;
  return <div className={`toast ${t.type}`}>{t.type==='success'&&'✓ '}{t.type==='error'&&'✕ '}{t.msg}</div>;
}

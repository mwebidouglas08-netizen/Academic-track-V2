import { useState, useEffect } from 'react';

let _set = null;
export function showToast(msg, type = 'info') {
  if (_set) _set({ msg, type, id: Date.now() });
}

export default function Toast() {
  const [toast, setToast] = useState(null);
  _set = setToast;
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3200);
    return () => clearTimeout(t);
  }, [toast]);
  if (!toast) return null;
  return (
    <div className={`toast ${toast.type}`}>
      {toast.type === 'success' && '✓ '}
      {toast.type === 'error' && '✕ '}
      {toast.msg}
    </div>
  );
}

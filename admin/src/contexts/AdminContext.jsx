import { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';

const Ctx = createContext(null);

export function AdminProvider({ children }) {
  const [admin, setAdmin] = useState(() => {
    try { return JSON.parse(localStorage.getItem('adm_user')); } catch { return null; }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('adm_token');
    if (!token) { setLoading(false); return; }
    api.get('/admin/auth/me')
      .then(r => { setAdmin(r.data); localStorage.setItem('adm_user', JSON.stringify(r.data)); })
      .catch(() => { localStorage.removeItem('adm_token'); localStorage.removeItem('adm_user'); setAdmin(null); })
      .finally(() => setLoading(false));
  }, []);

  const login = (token, mod) => {
    localStorage.setItem('adm_token', token);
    localStorage.setItem('adm_user', JSON.stringify(mod));
    setAdmin(mod);
  };

  const logout = () => {
    localStorage.removeItem('adm_token');
    localStorage.removeItem('adm_user');
    setAdmin(null);
  };

  return <Ctx.Provider value={{ admin, login, logout, loading }}>{children}</Ctx.Provider>;
}

export const useAdmin = () => useContext(Ctx);

import { useState, useEffect } from 'react';
import { AdminProvider, useAdmin } from './contexts/AdminContext';
import Toast from './components/Toast';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import './index.css';

function AppInner() {
  const { admin, loading } = useAdmin();
  const [view, setView] = useState('login');

  useEffect(() => {
    if (!loading) setView(admin ? 'dashboard' : 'login');
  }, [admin, loading]);

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'var(--bg)',
      }}>
        <span className="spin" style={{ width: 28, height: 28, borderWidth: 3 }} />
      </div>
    );
  }

  return view === 'dashboard' && admin
    ? <AdminDashboard />
    : <AdminLogin onLogin={() => setView('dashboard')} />;
}

export default function App() {
  return (
    <AdminProvider>
      <AppInner />
      <Toast />
    </AdminProvider>
  );
}

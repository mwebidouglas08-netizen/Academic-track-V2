import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Toast from './components/Toast';
import Landing from './pages/Landing';
import { LoginPage, RegisterPage } from './pages/Auth';
import AppPage from './pages/AppPage';

function Guard({ children }) {
  const { user, loading } = useAuth();
  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--parchment)' }}>
      <span className="spin" style={{ width: 28, height: 28, borderWidth: 3 }} />
    </div>
  );
  return user ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/"         element={<Landing />} />
          <Route path="/login"    element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/app/*"    element={<Guard><AppPage /></Guard>} />
          <Route path="*"         element={<Navigate to="/" replace />} />
        </Routes>
        <Toast />
      </AuthProvider>
    </BrowserRouter>
  );
}

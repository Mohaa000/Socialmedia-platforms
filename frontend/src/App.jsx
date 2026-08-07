import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth } from './AuthContext';
import TopBar from './components/TopBar';
import Landing from './pages/Landing';
import Feed from './pages/Feed';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';

function Shell() {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="app-shell">
        <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-dim)' }}>Loading CampusLink…</div>
      </div>
    );
  }
  return (
    <div className="app-shell">
      <TopBar />
      <Routes>
        <Route path="/" element={user ? <Feed /> : <Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/u/:username" element={<Profile />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Shell />
      </AuthProvider>
    </BrowserRouter>
  );
}

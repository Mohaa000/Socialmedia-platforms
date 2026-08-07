import { createContext, useContext, useEffect, useState } from 'react';
import { api } from './api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('campuslink_token');
    if (!token) {
      setLoading(false);
      return;
    }
    api.me()
      .then((data) => setUser(data.user))
      .catch(() => localStorage.removeItem('campuslink_token'))
      .finally(() => setLoading(false));
  }, []);

  function login(token, userData) {
    localStorage.setItem('campuslink_token', token);
    setUser(userData);
  }

  function logout() {
    localStorage.removeItem('campuslink_token');
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, setUser, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

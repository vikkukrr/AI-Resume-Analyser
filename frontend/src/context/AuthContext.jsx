import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../utils/api';

const DEMO_USER = {
  _id: 'demo-user',
  name: 'Demo User',
  email: 'demo@careerai.app',
  role: 'user',
  isDemo: true,
  bio: 'This is a demo account. Sign up to create your real profile.',
  skills: ['JavaScript', 'React', 'Node.js', 'Python'],
  targetRole: 'Software Engineer',
  location: 'San Francisco, CA',
  socialLinks: { linkedin: '', github: '', website: '' },
};

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const demoMode = localStorage.getItem('demo_mode');
    if (demoMode === 'true') {
      setUser(DEMO_USER);
      setLoading(false);
      return;
    }
    if (!token) { setLoading(false); return; }
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    api.get('/auth/me')
      .then(({ data }) => setUser(data.user))
      .catch(() => {
        localStorage.removeItem('token');
        delete api.defaults.headers.common['Authorization'];
      })
      .finally(() => setLoading(false));
  }, []);

  const startDemo = useCallback(() => {
    localStorage.setItem('demo_mode', 'true');
    setUser(DEMO_USER);
  }, []);

  const login = useCallback(async (email, password) => {
    localStorage.removeItem('demo_mode');
    const { data } = await api.post('/auth/login', { email, password });
    localStorage.setItem('token', data.token);
    api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
    setUser(data.user);
    return data.user;
  }, []);

  const register = useCallback(async (payload) => {
    localStorage.removeItem('demo_mode');
    const { data } = await api.post('/auth/register', payload);
    localStorage.setItem('token', data.token);
    api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
    setUser(data.user);
    return data.user;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('demo_mode');
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
  }, []);

  const updateUser = useCallback((updates) => {
    setUser(prev => ({ ...prev, ...updates }));
  }, []);

  return (
    <AuthContext.Provider value={{
      user, loading, login, register, logout, updateUser, startDemo,
      isDemo: user?.isDemo === true,
      isAdmin: user?.role === 'admin'
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

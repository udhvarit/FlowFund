import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchUser();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUser = async () => {
    try {
      const response = await api.get('/auth/me');
      setUser(response.data.data.user);
      setCompany(response.data.data.user.company);
    } catch (error) {
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    const { user, token } = response.data.data;
    localStorage.setItem('token', token);
    setUser(user);
    setCompany(user.company);
    return user;
  };

  const signup = async (data) => {
    const response = await api.post('/auth/signup', data);
    const { user, token } = response.data.data;
    localStorage.setItem('token', token);
    setUser(user);
    setCompany(user.company);
    return user;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setCompany(null);
  };

  const value = {
    user,
    company,
    loading,
    login,
    signup,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

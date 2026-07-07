import { createContext, useContext, useEffect, useState } from 'react';
import { login as loginRequest, register as registerRequest } from '../services/api.js';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('briefwire_token'));

  useEffect(() => {
    if (token) {
      const stored = localStorage.getItem('briefwire_user');
      if (stored) setUser(JSON.parse(stored));
    }
  }, [token]);

  const login = async (email, password) => {
    const response = await loginRequest(email, password);
    setUser(response.user);
    setToken(response.token);
    localStorage.setItem('briefwire_token', response.token);
    localStorage.setItem('briefwire_user', JSON.stringify(response.user));
  };

  const register = async (name, email, password) => {
    const response = await registerRequest(name, email, password);
    setUser(response.user);
    setToken(response.token);
    localStorage.setItem('briefwire_token', response.token);
    localStorage.setItem('briefwire_user', JSON.stringify(response.user));
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('briefwire_token');
    localStorage.removeItem('briefwire_user');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export default AuthProvider;

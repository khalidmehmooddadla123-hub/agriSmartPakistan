import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);
const USER_KEY = 'user';

function readCachedUser() {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  // Optimistic restore — if we have a cached user + token, trust it instantly.
  // This prevents a redirect-to-login flicker on every page refresh.
  const [user, setUser] = useState(() => {
    const token = localStorage.getItem('token');
    return token ? readCachedUser() : null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }

    // Validate token in background. Only log the user out on a definitive 401
    // (token genuinely invalid/expired). Cold starts, network hiccups, and 5xx
    // errors should NOT wipe the session — the cached user keeps the UI working.
    authAPI.getMe()
      .then(res => {
        const fresh = res.data.data;
        setUser(fresh);
        localStorage.setItem(USER_KEY, JSON.stringify(fresh));
      })
      .catch(err => {
        const status = err.response?.status;
        if (status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem(USER_KEY);
          setUser(null);
        }
        // Otherwise keep the cached user — backend may be cold-starting or offline.
      })
      .finally(() => setLoading(false));
  }, []);

  const login = (data) => {
    localStorage.setItem('token', data.token);
    localStorage.setItem('refreshToken', data.refreshToken);
    localStorage.setItem(USER_KEY, JSON.stringify(data.user));
    setUser(data.user);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem(USER_KEY);
    setUser(null);
  };

  const updateUser = (userData) => {
    setUser(prev => {
      const next = { ...prev, ...userData };
      try { localStorage.setItem(USER_KEY, JSON.stringify(next)); } catch {}
      return next;
    });
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

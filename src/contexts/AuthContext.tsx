import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { api } from '../lib/api';
import { getRefreshToken, setAccessToken, setRefreshToken } from '../lib/auth';

interface AuthUser {
  id: string;
  email: string;
  role: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isInitializing: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
}

function applyTokens(data: TokenResponse) {
  setAccessToken(data.accessToken);
  setRefreshToken(data.refreshToken);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const savedRefresh = getRefreshToken();
    if (!savedRefresh) {
      setIsInitializing(false);
      return;
    }
    import('axios').then(({ default: axios }) =>
      axios.post<TokenResponse>('/api/auth/refresh', { refreshToken: savedRefresh })
        .then(({ data }) => {
          applyTokens(data);
          setUser(data.user);
        })
        .catch(() => {
          setAccessToken(null);
          setRefreshToken(null);
        })
        .finally(() => setIsInitializing(false))
    );
  }, []);

  const login = async (email: string, password: string) => {
    const { data } = await api.post<TokenResponse>('/auth/login', { email, password });
    applyTokens(data);
    setUser(data.user);
  };

  const register = async (email: string, password: string) => {
    const { data } = await api.post<TokenResponse>('/auth/register', { email, password });
    applyTokens(data);
    setUser(data.user);
  };

  const logout = async () => {
    const rt = getRefreshToken();
    try {
      if (rt) await api.delete(`/auth/logout?refreshToken=${encodeURIComponent(rt)}`);
    } finally {
      setAccessToken(null);
      setRefreshToken(null);
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isInitializing, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}

import { useState, useEffect } from 'react';
import { authApi } from '../api/herbs';

export function useAuth() {
  const [isDM, setIsDM] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('dm_token');
    if (!token) {
      setLoading(false);
      return;
    }
    authApi.verify()
      .then(() => setIsDM(true))
      .catch(() => {
        localStorage.removeItem('dm_token');
        setIsDM(false);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = async (password: string) => {
    const { token } = await authApi.login(password);
    localStorage.setItem('dm_token', token);
    setIsDM(true);
  };

  const logout = () => {
    localStorage.removeItem('dm_token');
    setIsDM(false);
  };

  return { isDM, loading, login, logout };
}

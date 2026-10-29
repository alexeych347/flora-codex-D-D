import { useState, useEffect } from 'react';
import { authApi } from '../api/herbs';
import { Player } from '../types';

export function useAuth() {
  const [player, setPlayer] = useState<Player | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('codex_token');
    if (!token) {
      setLoading(false);
      return;
    }
    authApi.verify()
      .then(({ player }) => setPlayer(player))
      .catch(() => {
        localStorage.removeItem('codex_token');
        setPlayer(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = async (playerId: string, password: string) => {
    const { token, player } = await authApi.login(playerId, password);
    localStorage.setItem('codex_token', token);
    setPlayer(player);
  };

  const logout = () => {
    localStorage.removeItem('codex_token');
    setPlayer(null);
  };

  const isMaster = player?.role === 'MASTER';

  return { player, isMaster, loading, login, logout };
}

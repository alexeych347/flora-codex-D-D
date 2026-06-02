import { useState, FormEvent } from 'react';

interface Props {
  onLogin: (password: string) => Promise<void>;
  onClose: () => void;
}

export function DMLogin({ onLogin, onClose }: Props) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await onLogin(password);
      onClose();
    } catch {
      setError('Неверный пароль. Доступ запрещён.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(28,18,8,0.7)' }}
      onClick={onClose}
    >
      <div
        className="dm-login-modal p-8 w-full max-w-sm relative"
        style={{
          background: '#1C1208',
          border: '1px solid #C9A84C40',
          boxShadow: '0 0 40px rgba(0,0,0,0.6), 0 0 20px rgba(201,168,76,0.2)',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Ornamental top */}
        <div className="text-center mb-6">
          <svg width="40" height="46" viewBox="0 0 40 46" fill="none" className="mx-auto mb-3">
            <rect x="4" y="16" width="32" height="26" rx="3" fill="none" stroke="#C9A84C" strokeWidth="1.5"/>
            <path d="M10 16V11a10 10 0 0120 0v5" stroke="#C9A84C" strokeWidth="1.5" fill="none"/>
            <circle cx="20" cy="28" r="3" fill="#C9A84C"/>
            <line x1="20" y1="31" x2="20" y2="36" stroke="#C9A84C" strokeWidth="1.5"/>
          </svg>
          <h2 className="font-cinzel text-lg" style={{ color: '#C9A84C' }}>
            Вход для DM
          </h2>
          <p className="font-cormorant italic text-xs mt-1" style={{ color: '#C9A84C', opacity: 0.5 }}>
            Только для Мастера Подземелий
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Введите пароль..."
              autoFocus
              className="w-full px-4 py-2 font-garamond text-sm focus:outline-none"
              style={{
                background: 'rgba(201,168,76,0.05)',
                border: '1px solid #C9A84C40',
                color: '#F4E4BC',
              }}
            />
          </div>

          {error && (
            <p className="font-garamond text-xs text-center" style={{ color: '#c0392b' }}>
              {error}
            </p>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 font-garamond text-sm transition-colors"
              style={{
                border: '1px solid #C9A84C30',
                color: '#C9A84C',
                opacity: 0.6,
              }}
            >
              Отмена
            </button>
            <button
              type="submit"
              disabled={loading || !password}
              className="flex-1 py-2 font-cinzel text-xs tracking-widest transition-all disabled:opacity-40"
              style={{
                background: '#C9A84C',
                color: '#1C1208',
              }}
            >
              {loading ? '...' : 'Войти'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

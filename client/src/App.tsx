import { Book } from './components/Book';
import { useHerbs } from './hooks/useHerbs';
import { useAuth } from './hooks/useAuth';

export default function App() {
  const { herbs, loading, error, refetch } = useHerbs();
  const { isDM, loading: authLoading, login, logout } = useAuth();

  if (authLoading || loading) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center gap-4"
        style={{ background: '#0D0A06' }}
      >
        <svg width="48" height="56" viewBox="0 0 48 56" fill="none" className="opacity-60">
          <line x1="24" y1="52" x2="24" y2="8" stroke="#C9A84C" strokeWidth="2"/>
          <ellipse cx="24" cy="20" rx="14" ry="18" fill="#4A7C59" opacity="0.7" transform="rotate(-10 24 20)"/>
          <ellipse cx="10" cy="34" rx="10" ry="13" fill="#4A7C59" opacity="0.5" transform="rotate(15 10 34)"/>
          <ellipse cx="38" cy="32" rx="10" ry="13" fill="#4A7C59" opacity="0.5" transform="rotate(-15 38 32)"/>
        </svg>
        <p className="font-cormorant italic text-lg animate-pulse" style={{ color: '#C9A84C', opacity: 0.7 }}>
          Открываем кодекс...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center gap-4"
        style={{ background: '#0D0A06' }}
      >
        <p className="font-cinzel text-sm" style={{ color: '#c0392b' }}>
          Ошибка загрузки
        </p>
        <p className="font-garamond italic text-xs" style={{ color: '#C9A84C', opacity: 0.6 }}>
          {error}
        </p>
        <button
          onClick={refetch}
          className="mt-2 px-4 py-2 font-garamond text-sm"
          style={{ border: '1px solid #C9A84C40', color: '#C9A84C' }}
        >
          Попробовать снова
        </button>
      </div>
    );
  }

  return (
    <Book
      herbs={herbs}
      isDM={isDM}
      onLogin={login}
      onLogout={logout}
      onRefresh={refetch}
    />
  );
}

import { Book } from './components/Book';
import { useHerbs } from './hooks/useHerbs';
import { useAuth } from './hooks/useAuth';

export default function App() {
  const { herbs, loading, error, refetch } = useHerbs();
  const { player, isMaster, loading: authLoading, login, logout } = useAuth();

  if (authLoading || loading) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center gap-4"
        style={{ background: '#0D0A06' }}
      >
        <svg width="48" height="56" viewBox="0 0 48 56" fill="none" className="opacity-60">
          <line x1="24" y1="52" x2="24" y2="8" stroke="var(--gold-muted)" strokeWidth="2"/>
          <ellipse cx="24" cy="20" rx="14" ry="18" fill="#4A7C59" opacity="0.7" transform="rotate(-10 24 20)"/>
          <ellipse cx="10" cy="34" rx="10" ry="13" fill="#4A7C59" opacity="0.5" transform="rotate(15 10 34)"/>
          <ellipse cx="38" cy="32" rx="10" ry="13" fill="#4A7C59" opacity="0.5" transform="rotate(-15 38 32)"/>
        </svg>
        <p className="f-italic text-lg animate-pulse" style={{ color: 'var(--gold-muted)', opacity: 0.7 }}>
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
        <p className="f-cormorant-sc text-sm" style={{ color: 'var(--error)', letterSpacing: '.16em', fontWeight: 700 }}>
          Ошибка загрузки
        </p>
        <p className="f-italic text-xs" style={{ color: 'var(--gold-muted)', opacity: 0.6 }}>
          {error}
        </p>
        <button
          onClick={refetch}
          className="mt-2 f-cormorant-sc"
          style={{
            fontSize: 12.5, padding: '6px 13px', letterSpacing: '.1em',
            textTransform: 'uppercase', fontWeight: 600,
            background: 'rgba(184,134,11,.1)', border: '1px solid rgba(184,134,11,.4)',
            color: 'var(--gold-muted)', cursor: 'pointer',
          }}
        >
          Попробовать снова
        </button>
      </div>
    );
  }

  return (
    <Book
      herbs={herbs}
      player={player}
      isMaster={isMaster}
      onLogin={login}
      onLogout={logout}
      onRefresh={refetch}
    />
  );
}

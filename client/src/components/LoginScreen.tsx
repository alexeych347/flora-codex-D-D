import { useEffect, useState, FormEvent } from 'react';
import { authApi } from '../api/herbs';
import { Player } from '../types';
import { CornerOrnament, FloralDivider } from './ornaments';

interface Props {
  onLogin: (playerId: string, password: string) => Promise<void>;
  onClose: () => void;
}

export function LoginScreen({ onLogin, onClose }: Props) {
  const [players, setPlayers] = useState<Player[]>([]);
  const [userId, setUserId] = useState('');
  const [pw, setPw] = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    authApi.getPlayers().then(setPlayers).catch(() => setPlayers([]));
  }, []);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!userId) { setErr('Выберите персонажа.'); return; }
    setErr(''); setLoading(true);
    try {
      await onLogin(userId, pw);
      onClose();
    } catch {
      setErr('Неверный пароль. Доступ запрещён.');
    } finally {
      setLoading(false);
    }
  };

  const partyMembers = players.filter(p => p.role === 'PLAYER');
  const master = players.find(p => p.role === 'MASTER');

  return (
    <div className="overlay-in" onClick={onClose} style={{
      position: 'fixed', inset: 0, zIndex: 200,
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
      background: 'rgba(8,11,18,.8)', backdropFilter: 'blur(4px)',
    }}>
      <form onSubmit={submit} onClick={e => e.stopPropagation()} className="modal-pop" style={{
        position: 'relative', width: 440,
        background: '#120c04',
        boxShadow: '0 50px 100px rgba(0,0,0,.7)',
        color: 'var(--gold-muted)', overflow: 'visible',
      }}>
        <div style={{ position: 'absolute', inset: 0, boxShadow: 'inset 0 0 0 2.5px var(--ink)' }} />
        <div style={{ position: 'absolute', inset: '3px', boxShadow: 'inset 0 0 0 11px var(--slate)' }} />
        <div style={{ position: 'absolute', inset: '14px', boxShadow: 'inset 0 0 0 1.5px var(--gold-muted)', opacity: .85 }} />
        <div style={{ position: 'absolute', inset: '16px', boxShadow: 'inset 0 0 0 8px #6B1A12' }} />
        <div style={{ position: 'absolute', inset: '24px', boxShadow: 'inset 0 0 0 1.5px var(--gold-muted)', opacity: .65 }} />
        <div style={{ position: 'absolute', top: 1, left: 1 }}><CornerOrnament size={58} orient="tl" /></div>
        <div style={{ position: 'absolute', top: 1, right: 1 }}><CornerOrnament size={58} orient="tr" /></div>
        <div style={{ position: 'absolute', bottom: 1, left: 1 }}><CornerOrnament size={58} orient="bl" /></div>
        <div style={{ position: 'absolute', bottom: 1, right: 1 }}><CornerOrnament size={58} orient="br" /></div>

        <div style={{ position: 'relative', zIndex: 2, padding: '46px 46px 40px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <svg width="58" height="58" viewBox="0 0 18 18" style={{ marginBottom: 14 }}>
            <path d="M9,1 l2,6 l6,0 l-5,4 l2,6 l-5,-4 l-5,4 l2,-6 l-5,-4 l6,0 Z" fill="#8B1A1A" opacity=".9" />
          </svg>

          <h1 className="f-philosopher" style={{ fontSize: 30, fontWeight: 700, color: 'var(--gold-muted)', letterSpacing: '.08em', textAlign: 'center' }}>Кодекс Трав</h1>
          <p className="f-italic" style={{ fontSize: 17, opacity: .6, marginTop: 5, textAlign: 'center' }}>
            Войдите в свой кодекс
          </p>

          <div style={{ width: '100%', margin: '18px 0 20px', display: 'flex', justifyContent: 'center' }}>
            <FloralDivider width="100%" color="var(--gold-muted)" />
          </div>

          <label className="f-cormorant-sc" style={{ alignSelf: 'flex-start', fontSize: 13, letterSpacing: '.1em', opacity: .8, marginBottom: 9 }}>ПЕРСОНАЖ</label>
          <select
            value={userId}
            onChange={e => { setUserId(e.target.value); setErr(''); }}
            className="f-philosopher"
            style={{
              width: '100%', padding: '13px 16px', fontSize: 16, marginBottom: 14,
              color: userId ? 'var(--birch)' : 'rgba(245,240,232,.4)',
              background: 'rgba(184,134,11,.07)',
              border: '1.5px solid rgba(184,134,11,.45)', outline: 'none',
              cursor: 'pointer', appearance: 'none',
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%23B8860B' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E")`,
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'right 14px center',
            }}
          >
            <option value="" disabled style={{ background: '#120c04' }}>Выберите персонажа…</option>
            {partyMembers.length > 0 && (
              <optgroup label="Партия" style={{ background: '#120c04' }}>
                {partyMembers.map(p => (
                  <option key={p.id} value={p.id} style={{ background: '#120c04' }}>{p.name}</option>
                ))}
              </optgroup>
            )}
            {master && (
              <optgroup label="Мастер" style={{ background: '#120c04' }}>
                <option value={master.id} style={{ background: '#120c04' }}>{master.name}</option>
              </optgroup>
            )}
          </select>

          <input type="password" value={pw}
            onChange={e => setPw(e.target.value)}
            placeholder="Пароль…"
            autoFocus
            style={{
              width: '100%', padding: '13px 16px', fontSize: 16,
              color: 'var(--birch)', background: 'rgba(184,134,11,.07)',
              border: '1.5px solid rgba(184,134,11,.45)', outline: 'none',
              fontFamily: "'Cormorant Garamond',serif",
              textAlign: 'center', letterSpacing: '.1em',
            }} />

          {err && (
            <p className="f-body" style={{ color: '#e07a6f', fontSize: 14, textAlign: 'center', marginTop: 11, width: '100%' }}>{err}</p>
          )}

          <button type="submit" disabled={loading} className="f-cormorant-sc" style={{
            width: '100%', marginTop: 16, padding: '14px 0', fontSize: 15,
            letterSpacing: '.16em', textTransform: 'uppercase', fontWeight: 600,
            background: 'var(--gold-muted)', border: 'none', color: 'var(--ink)',
            opacity: loading ? .5 : 1, cursor: loading ? 'wait' : 'pointer',
          }}>{loading ? 'Проверка…' : 'Войти'}</button>

          <button type="button" onClick={onClose} className="f-cormorant-sc" style={{
            marginTop: 14, padding: '7px 4px', fontSize: 13.5, letterSpacing: '.08em',
            background: 'none', border: 'none', color: 'var(--gold-muted)', opacity: .7,
            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 7,
          }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
            </svg>
            Вернуться к кодексу
          </button>
        </div>
      </form>
    </div>
  );
}

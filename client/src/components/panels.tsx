import { HairDivider } from './ornaments';

/* — кнопка закрытия (медальон) — */
export function CloseMedallion({ onClick }: { onClick: () => void }) {
  return (
    <button onClick={onClick} aria-label="Закрыть" style={{
      position: 'absolute', top: -18, right: -18, zIndex: 40,
      width: 46, height: 46, background: '#1A0F00', borderRadius: '50%',
      border: 'none', color: 'var(--gold-muted)',
      boxShadow: '0 4px 16px rgba(0,0,0,.6)',
      display: 'grid', placeItems: 'center',
      transition: 'transform .25s', cursor: 'pointer',
    }}
      onMouseEnter={e => (e.currentTarget.style.transform = 'rotate(90deg)')}
      onMouseLeave={e => (e.currentTarget.style.transform = 'none')}>
      <svg width="46" height="46" viewBox="0 0 46 46" style={{ position: 'absolute', inset: 0 }}>
        <circle cx="23" cy="23" r="21" fill="none" stroke="currentColor" strokeWidth="1.4" />
        <circle cx="23" cy="23" r="15" fill="none" stroke="currentColor" strokeWidth=".7" opacity=".5" />
        {[0, 90, 180, 270].map((d, i) => {
          const a = d * Math.PI / 180, x = 23 + Math.cos(a) * 21, y = 23 + Math.sin(a) * 21;
          return <path key={i} d={`M${x},${y - 3} l3,3 l-3,3 l-3,-3 Z`} fill="currentColor" />;
        })}
      </svg>
      <svg width="16" height="16" viewBox="0 0 16 16" style={{ position: 'relative' }}>
        <path d="M3,3 L13,13 M13,3 L3,13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    </button>
  );
}

/* — заголовок секции — */
export function SectionHeading({ title, color }: { title: string; color: string }) {
  return (
    <div style={{ marginBottom: 13 }}>
      <h3 className="f-cormorant-sc" style={{ color: 'var(--ink)', fontSize: 17, fontWeight: 700, letterSpacing: '.16em', textTransform: 'uppercase' }}>{title}</h3>
      <div style={{ color, marginTop: 6, opacity: .85, display: 'flex' }}>
        <HairDivider width={150} color={color} />
      </div>
    </div>
  );
}

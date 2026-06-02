import { LockedHerbStub, RARITY_COLORS } from '../types';

interface CardProps {
  herb: LockedHerbStub;
}

export function LockedHerbCard({ herb }: CardProps) {
  const color = RARITY_COLORS[herb.rarity];

  return (
    <div
      className="locked-herb-card relative flex flex-col items-center justify-center p-3 cursor-default"
      style={{
        border: `1px solid ${color}40`,
        background: `linear-gradient(135deg, rgba(28,18,8,0.15) 0%, rgba(28,18,8,0.05) 100%)`,
        minHeight: '140px',
      }}
    >
      <div
        className="illustration-placeholder w-full flex items-center justify-center mb-2 rounded"
        style={{
          height: '90px',
          background: `${color}15`,
          border: `1px dashed ${color}40`,
          filter: 'blur(2px)',
        }}
      >
        <svg width="40" height="50" viewBox="0 0 40 50" fill="none" opacity="0.3">
          <line x1="20" y1="48" x2="20" y2="10" stroke={color} strokeWidth="2"/>
          <ellipse cx="20" cy="18" rx="10" ry="14" fill={color} transform="rotate(-10 20 18)"/>
          <ellipse cx="10" cy="28" rx="8" ry="10" fill={color} opacity="0.6" transform="rotate(15 10 28)"/>
          <ellipse cx="30" cy="25" rx="8" ry="10" fill={color} opacity="0.6" transform="rotate(-15 30 25)"/>
        </svg>
      </div>

      <div
        className="absolute inset-0 flex flex-col items-center justify-center"
        style={{ background: 'rgba(28,18,8,0.05)' }}
      >
        <svg width="24" height="28" viewBox="0 0 24 28" fill="none" className="mb-1" opacity="0.5">
          <rect x="3" y="12" width="18" height="14" rx="2" fill="#1C1208"/>
          <path d="M7 12V8a5 5 0 0110 0v4" stroke="#1C1208" strokeWidth="2" fill="none"/>
          <circle cx="12" cy="19" r="2" fill="#F4E4BC"/>
        </svg>
        <p className="font-garamond text-xs italic" style={{ color: '#3D2B1F', opacity: 0.5 }}>
          ???
        </p>
      </div>
    </div>
  );
}

interface SpreadProps {
  rarity: LockedHerbStub['rarity'];
}

export function LockedSpread({ rarity }: SpreadProps) {
  const color = RARITY_COLORS[rarity];

  return (
    <div
      className="locked-spread h-full flex items-center justify-center relative"
      style={{
        background: `linear-gradient(135deg, rgba(28,18,8,0.08) 0%, rgba(28,18,8,0.03) 100%)`,
        backdropFilter: 'blur(4px)',
      }}
    >
      <div
        className="absolute inset-0"
        style={{ backdropFilter: 'blur(6px)', background: 'rgba(244,228,188,0.4)' }}
      />

      <div className="relative text-center z-10 px-8">
        <svg width="48" height="56" viewBox="0 0 48 56" fill="none" className="mx-auto mb-4">
          <rect x="6" y="24" width="36" height="28" rx="4" fill="#1C1208" opacity="0.6"/>
          <path d="M14 24V16a10 10 0 0120 0v8" stroke="#1C1208" strokeWidth="3" fill="none" opacity="0.6"/>
          <circle cx="24" cy="38" r="4" fill="#C9A84C" opacity="0.8"/>
          <line x1="24" y1="42" x2="24" y2="46" stroke="#C9A84C" strokeWidth="2" opacity="0.8"/>
        </svg>
        <h3 className="font-cinzel text-lg mb-2" style={{ color: '#1C1208', opacity: 0.6 }}>
          Неизученная трава
        </h3>
        <p className="font-garamond italic text-sm" style={{ color: '#3D2B1F', opacity: 0.5 }}>
          Эта трава ещё не изучена...
        </p>
        <div className="mt-4 flex justify-center">
          <span
            className="text-xs font-garamond px-3 py-1"
            style={{ border: `1px solid ${color}50`, color: color, opacity: 0.6 }}
          >
            Редкость скрыта
          </span>
        </div>
      </div>
    </div>
  );
}

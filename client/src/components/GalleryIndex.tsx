import { HerbOrStub, isFullHerb, RARITY_COLORS } from '../types';
import { LockedHerbCard } from './LockedHerb';

interface Props {
  herbs: HerbOrStub[];
  onSelectHerb: (index: number) => void;
}

export function GalleryIndex({ herbs, onSelectHerb }: Props) {
  return (
    <div className="gallery-index h-full flex flex-col p-4 md:p-6 overflow-y-auto">
      {/* Header */}
      <div className="text-center mb-6">
        <h1 className="font-cinzel text-2xl md:text-3xl mb-1" style={{ color: '#1C1208' }}>
          Flora Codex
        </h1>
        <div className="flex items-center gap-2 justify-center">
          <div className="h-px flex-1" style={{ background: 'linear-gradient(to right, transparent, #C9A84C)' }} />
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M8 1L9.5 6H15L10.5 9.5L12 14.5L8 11L4 14.5L5.5 9.5L1 6H6.5Z" fill="#C9A84C" opacity="0.8"/>
          </svg>
          <div className="h-px flex-1" style={{ background: 'linear-gradient(to left, transparent, #C9A84C)' }} />
        </div>
        <p className="font-cormorant italic text-sm mt-1" style={{ color: '#3D2B1F', opacity: 0.7 }}>
          Атлас магических растений
        </p>
      </div>

      {/* Grid */}
      <div className="herbs-grid grid grid-cols-2 sm:grid-cols-3 gap-3 flex-1">
        {herbs.map((herb, index) => (
          <button
            key={herb.id}
            onClick={() => onSelectHerb(index)}
            className="herb-card text-left transition-transform duration-200 hover:-translate-y-1 focus:outline-none"
            style={{ background: 'transparent' }}
          >
            {isFullHerb(herb) ? (
              <UnlockedHerbCard herb={herb} />
            ) : (
              <LockedHerbCard herb={herb} />
            )}
          </button>
        ))}
      </div>

      {/* Legend */}
      <div className="legend mt-4 flex flex-wrap gap-x-4 gap-y-1 justify-center">
        {(['COMMON', 'UNCOMMON', 'RARE', 'LEGENDARY'] as const).map(rarity => (
          <span key={rarity} className="flex items-center gap-1 font-garamond text-xs">
            <span
              className="w-2 h-2 rounded-full inline-block"
              style={{ background: RARITY_COLORS[rarity] }}
            />
            <span style={{ color: RARITY_COLORS[rarity] }}>
              {rarity === 'COMMON' ? 'Обычная' : rarity === 'UNCOMMON' ? 'Необычная' : rarity === 'RARE' ? 'Редкая' : 'Легендарная'}
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}

function UnlockedHerbCard({ herb }: { herb: Extract<HerbOrStub, { isUnlocked: true }> }) {
  const color = RARITY_COLORS[herb.rarity];
  const isLegendary = herb.rarity === 'LEGENDARY';

  return (
    <div
      className="unlocked-card relative p-2 h-full"
      style={{
        border: `1px solid ${color}60`,
        background: `linear-gradient(135deg, rgba(244,228,188,0.5) 0%, rgba(232,213,163,0.3) 100%)`,
        boxShadow: isLegendary ? `0 0 12px rgba(201,168,76,0.3)` : 'none',
        minHeight: '140px',
      }}
    >
      <div
        className="thumbnail-area w-full flex items-center justify-center mb-2 rounded overflow-hidden"
        style={{ height: '80px', background: `${color}12` }}
      >
        <HerbThumbnail rarity={herb.rarity} />
      </div>

      <p className="font-cinzel text-xs leading-tight" style={{ color: '#1C1208', fontSize: '10px' }}>
        {herb.name}
      </p>
      <div
        className="rarity-dot absolute top-2 right-2 w-2 h-2 rounded-full"
        style={{
          background: color,
          boxShadow: isLegendary ? `0 0 6px ${color}` : 'none',
        }}
      />
    </div>
  );
}

function HerbThumbnail({ rarity }: { rarity: string }) {
  const color = RARITY_COLORS[rarity as keyof typeof RARITY_COLORS] || '#8A9B8A';
  return (
    <svg width="36" height="44" viewBox="0 0 36 44" fill="none" opacity="0.6">
      <line x1="18" y1="42" x2="18" y2="8" stroke={color} strokeWidth="1.5"/>
      <ellipse cx="18" cy="16" rx="9" ry="12" fill={color} opacity="0.7" transform="rotate(-10 18 16)"/>
      <ellipse cx="8" cy="26" rx="7" ry="9" fill={color} opacity="0.5" transform="rotate(15 8 26)"/>
      <ellipse cx="28" cy="24" rx="7" ry="9" fill={color} opacity="0.5" transform="rotate(-15 28 24)"/>
    </svg>
  );
}

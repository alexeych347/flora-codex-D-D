import { HerbOrStub, isFullHerb, RARITY_COLORS, RARITY_LABELS } from '../types';
import { GalleryIndex } from './GalleryIndex';

const API_URL = import.meta.env.VITE_API_URL || '';

interface Props {
  currentSpread: number;
  herbs: HerbOrStub[];
  onHerbClick: (herb: HerbOrStub) => void;
}

export function BookSpread({ currentSpread, herbs, onHerbClick }: Props) {
  if (currentSpread === 0) {
    return (
      <>
        <div className="book-page book-page-left relative">
          <PageTexture />
          <GalleryIndex herbs={herbs} onHerbClick={onHerbClick} />
        </div>
        <BookBinding />
        <div className="book-page book-page-right relative hidden md:block">
          <PageTexture />
          <div className="h-full flex items-center justify-center">
            <div className="text-center px-8 opacity-40">
              <svg width="60" height="70" viewBox="0 0 60 70" fill="none" className="mx-auto mb-3">
                <line x1="30" y1="65" x2="30" y2="10" stroke="#2D5A27" strokeWidth="2"/>
                <ellipse cx="30" cy="25" rx="15" ry="20" fill="#4A7C59" opacity="0.7" transform="rotate(-10 30 25)"/>
                <ellipse cx="14" cy="40" rx="10" ry="14" fill="#4A7C59" opacity="0.5" transform="rotate(15 14 40)"/>
                <ellipse cx="46" cy="38" rx="10" ry="14" fill="#4A7C59" opacity="0.5" transform="rotate(-15 46 38)"/>
              </svg>
              <p className="font-cormorant italic text-base" style={{ color: '#3D2B1F' }}>
                Выберите траву из оглавления
              </p>
            </div>
          </div>
        </div>
      </>
    );
  }

  const herbsStart = (currentSpread - 1) * 8;
  const leftHerbs = herbs.slice(herbsStart, herbsStart + 4);
  const rightHerbs = herbs.slice(herbsStart + 4, herbsStart + 8);

  return (
    <>
      <div className="book-page book-page-left relative">
        <PageTexture />
        <HerbGridPage herbs={leftHerbs} onHerbClick={onHerbClick} />
      </div>
      <BookBinding />
      <div className="book-page book-page-right relative hidden md:block">
        <PageTexture />
        <HerbGridPage herbs={rightHerbs} onHerbClick={onHerbClick} />
      </div>
    </>
  );
}

interface GridProps {
  herbs: HerbOrStub[];
  onHerbClick: (herb: HerbOrStub) => void;
}

function HerbGridPage({ herbs, onHerbClick }: GridProps) {
  return (
    <div className="h-full p-4 grid grid-cols-2 grid-rows-2 gap-3">
      {[0, 1, 2, 3].map(i => {
        const herb = herbs[i];
        if (!herb) {
          return <EmptySlot key={i} />;
        }
        if (!isFullHerb(herb)) {
          return <LockedHerbCard key={herb.id} herb={herb} />;
        }
        return (
          <button
            key={herb.id}
            onClick={() => onHerbClick(herb)}
            className="text-left transition-transform duration-200 hover:-translate-y-0.5 focus:outline-none group"
          >
            <HerbCard herb={herb} />
          </button>
        );
      })}
    </div>
  );
}

function HerbCard({ herb }: { herb: Extract<HerbOrStub, { isUnlocked: true }> }) {
  const color = RARITY_COLORS[herb.rarity];
  const imageUrl = herb.imageUrl ? `${API_URL}${herb.imageUrl}` : null;

  return (
    <div
      className="relative h-full flex flex-col overflow-hidden"
      style={{
        border: `1px solid ${color}70`,
        background: `linear-gradient(145deg, rgba(244,228,188,0.6) 0%, rgba(228,212,163,0.4) 100%)`,
        boxShadow: `0 2px 8px rgba(0,0,0,0.12), inset 0 0 20px rgba(201,168,76,0.05)`,
      }}
    >
      {/* Rarity corner dot */}
      <div
        className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full z-10"
        style={{ background: color, boxShadow: `0 0 6px ${color}80` }}
      />

      {/* Illustration */}
      <div
        className="flex-1 flex items-center justify-center overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${color}0A 0%, ${color}18 100%)`,
          borderBottom: `1px solid ${color}30`,
          minHeight: 0,
        }}
      >
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={herb.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <HerbMiniIllustration rarity={herb.rarity} color={color} />
        )}
      </div>

      {/* Info */}
      <div className="flex-shrink-0 px-2 py-2">
        <p
          className="font-cinzel leading-tight mb-1 truncate"
          style={{ color: '#1C1208', fontSize: '11px' }}
        >
          {herb.name}
        </p>
        <p
          className="font-cormorant italic truncate mb-1.5"
          style={{ color: '#3D2B1F', opacity: 0.65, fontSize: '10px' }}
        >
          {herb.latinName}
        </p>
        <span
          className="inline-block px-1.5 py-0.5 font-garamond tracking-wide uppercase"
          style={{
            color: color,
            border: `1px solid ${color}50`,
            backgroundColor: `${color}12`,
            fontSize: '8px',
          }}
        >
          {RARITY_LABELS[herb.rarity]}
        </span>
      </div>
    </div>
  );
}

function HerbMiniIllustration({ rarity, color }: { rarity: string; color: string }) {
  const illustrations: Record<string, JSX.Element> = {
    COMMON: (
      <svg width="44" height="54" viewBox="0 0 44 54" fill="none" opacity="0.65">
        <line x1="22" y1="50" x2="22" y2="12" stroke={color} strokeWidth="1.5"/>
        <ellipse cx="22" cy="20" rx="9" ry="13" fill={color} opacity="0.7" transform="rotate(-12 22 20)"/>
        <ellipse cx="12" cy="30" rx="7" ry="10" fill={color} opacity="0.5" transform="rotate(18 12 30)"/>
        <ellipse cx="32" cy="28" rx="7" ry="10" fill={color} opacity="0.5" transform="rotate(-18 32 28)"/>
      </svg>
    ),
    UNCOMMON: (
      <svg width="44" height="54" viewBox="0 0 44 54" fill="none" opacity="0.7">
        <line x1="22" y1="50" x2="22" y2="8" stroke={color} strokeWidth="1.5"/>
        <circle cx="22" cy="16" r="10" fill={color} opacity="0.8"/>
        <circle cx="12" cy="28" r="7" fill={color} opacity="0.55"/>
        <circle cx="32" cy="26" r="7" fill={color} opacity="0.55"/>
        <circle cx="18" cy="38" r="5" fill={color} opacity="0.4"/>
        <circle cx="28" cy="36" r="5" fill={color} opacity="0.4"/>
      </svg>
    ),
    RARE: (
      <svg width="44" height="54" viewBox="0 0 44 54" fill="none" opacity="0.75">
        <line x1="22" y1="50" x2="22" y2="6" stroke="#1C1208" strokeWidth="1.5"/>
        <path d="M22 6 Q30 18 22 30 Q14 18 22 6Z" fill={color} opacity="0.75"/>
        <path d="M8 24 Q22 32 8 40 Q-6 32 8 24Z" fill={color} opacity="0.5"/>
        <path d="M36 22 Q50 30 36 38 Q22 30 36 22Z" fill={color} opacity="0.5"/>
        <circle cx="22" cy="30" r="4" fill="#6A9FBA" opacity="0.9"/>
      </svg>
    ),
    VERY_RARE: (
      <svg width="44" height="54" viewBox="0 0 44 54" fill="none">
        <line x1="22" y1="50" x2="22" y2="6" stroke="#4A1A6B" strokeWidth="1.5"/>
        <path d="M22 6 L25 18 L37 14 L28 22 L33 34 L22 26 L11 34 L16 22 L7 14 L19 18 Z" fill={color} opacity="0.85"/>
        <circle cx="22" cy="26" r="5" fill="#C090E0" opacity="0.9"/>
        <circle cx="10" cy="14" r="1.5" fill="#C9A84C" opacity="0.8"/>
        <circle cx="34" cy="12" r="1.5" fill="#C9A84C" opacity="0.8"/>
        <circle cx="6" cy="30" r="1" fill="#C9A84C" opacity="0.6"/>
        <circle cx="38" cy="28" r="1" fill="#C9A84C" opacity="0.6"/>
      </svg>
    ),
  };

  return illustrations[rarity] ?? illustrations.COMMON;
}

function LockedHerbCard({ herb }: { herb: Extract<HerbOrStub, { isUnlocked: false }> }) {
  const color = RARITY_COLORS[herb.rarity];

  return (
    <div
      className="relative h-full flex flex-col items-center justify-center overflow-hidden"
      style={{
        border: `1px dashed ${color}40`,
        background: `linear-gradient(135deg, rgba(28,18,8,0.1) 0%, rgba(28,18,8,0.04) 100%)`,
      }}
    >
      <div style={{ filter: 'blur(1px)', opacity: 0.35 }}>
        <HerbMiniIllustration rarity={herb.rarity} color={color} />
      </div>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <svg width="20" height="24" viewBox="0 0 24 28" fill="none" className="mb-1" opacity="0.45">
          <rect x="3" y="12" width="18" height="14" rx="2" fill="#1C1208"/>
          <path d="M7 12V8a5 5 0 0110 0v4" stroke="#1C1208" strokeWidth="2" fill="none"/>
          <circle cx="12" cy="19" r="2" fill="#F4E4BC"/>
        </svg>
        <p className="font-garamond italic" style={{ color: '#3D2B1F', opacity: 0.4, fontSize: '10px' }}>???</p>
      </div>
    </div>
  );
}

function EmptySlot() {
  return (
    <div
      className="h-full"
      style={{
        border: '1px dashed rgba(201,168,76,0.12)',
        background: 'rgba(201,168,76,0.02)',
      }}
    />
  );
}

function PageTexture() {
  return (
    <div
      className="absolute inset-0 pointer-events-none"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E")`,
        mixBlendMode: 'multiply',
        opacity: 0.5,
      }}
    />
  );
}

function BookBinding() {
  return (
    <div
      className="book-binding flex-shrink-0 hidden md:block"
      style={{
        width: '24px',
        background: 'linear-gradient(to right, rgba(28,18,8,0.15) 0%, rgba(28,18,8,0.3) 40%, rgba(28,18,8,0.15) 100%)',
        boxShadow: 'inset -2px 0 4px rgba(0,0,0,0.2), inset 2px 0 4px rgba(0,0,0,0.2)',
        position: 'relative',
      }}
    >
      <div
        className="absolute inset-y-0 left-1/2 -translate-x-1/2"
        style={{ width: '1px', background: 'rgba(201,168,76,0.2)' }}
      />
    </div>
  );
}

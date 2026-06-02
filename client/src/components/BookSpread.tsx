import { HerbOrStub, isFullHerb, RARITY_COLORS, RARITY_LABELS } from '../types';

const API_URL = import.meta.env.VITE_API_URL || '';

interface Props {
  currentSpread: number;
  herbs: HerbOrStub[];
  onHerbClick: (herb: HerbOrStub) => void;
  mobileSide: 'left' | 'right';
  isMobile: boolean;
}

export function BookSpread({ currentSpread, herbs, onHerbClick, mobileSide, isMobile }: Props) {
  const showLeft = !isMobile || mobileSide === 'left';
  const showRight = !isMobile || mobileSide === 'right';
  const showBinding = !isMobile;

  if (currentSpread === 0) {
    return (
      <>
        {showLeft && (
          <div className="book-page book-page-left relative flex-1">
            <PageTexture />
            <CoverLeftPage />
          </div>
        )}
        {showBinding && <BookBinding />}
        {showRight && (
          <div className="book-page book-page-right relative flex-1">
            <PageTexture />
            <CoverRightPage />
          </div>
        )}
      </>
    );
  }

  const herbsStart = (currentSpread - 1) * 8;
  const leftHerbs = herbs.slice(herbsStart, herbsStart + 4);
  const rightHerbs = herbs.slice(herbsStart + 4, herbsStart + 8);

  return (
    <>
      {showLeft && (
        <div className="book-page book-page-left relative flex-1">
          <PageTexture />
          <HerbGridPage herbs={leftHerbs} onHerbClick={onHerbClick} side="left" />
        </div>
      )}
      {showBinding && <BookBinding />}
      {showRight && (
        <div className="book-page book-page-right relative flex-1">
          <PageTexture />
          <HerbGridPage herbs={rightHerbs} onHerbClick={onHerbClick} side="right" />
        </div>
      )}
    </>
  );
}

// ── Cover pages ───────────────────────────────────────────────────────────────

function CoverLeftPage() {
  return (
    <div className="h-full flex flex-col items-center justify-between p-6 md:p-8">
      {/* Top ornament */}
      <div className="w-full flex justify-center flex-shrink-0">
        <svg width="160" height="20" viewBox="0 0 160 20" fill="none">
          <path d="M0 10 Q40 3 80 10 Q120 17 160 10" stroke="#C9A84C" strokeWidth="1.5" fill="none" opacity="0.6"/>
          <circle cx="80" cy="10" r="3" fill="#C9A84C" opacity="0.8"/>
          <circle cx="48" cy="8" r="1.5" fill="#C9A84C" opacity="0.5"/>
          <circle cx="112" cy="12" r="1.5" fill="#C9A84C" opacity="0.5"/>
        </svg>
      </div>

      {/* Central illustration */}
      <div className="flex-1 flex items-center justify-center py-4">
        <svg width="180" height="220" viewBox="0 0 180 220" fill="none" opacity="0.75">
          {/* Main stem */}
          <line x1="90" y1="210" x2="90" y2="40" stroke="#2D5A27" strokeWidth="2.5"/>
          {/* Large central leaf */}
          <ellipse cx="90" cy="70" rx="28" ry="40" fill="#4A7C59" opacity="0.75" transform="rotate(-8 90 70)"/>
          {/* Left branch */}
          <line x1="90" y1="110" x2="50" y2="85" stroke="#2D5A27" strokeWidth="1.5"/>
          <ellipse cx="38" cy="78" rx="18" ry="26" fill="#4A7C59" opacity="0.6" transform="rotate(20 38 78)"/>
          {/* Right branch */}
          <line x1="90" y1="100" x2="130" y2="78" stroke="#2D5A27" strokeWidth="1.5"/>
          <ellipse cx="142" cy="72" rx="18" ry="26" fill="#4A7C59" opacity="0.6" transform="rotate(-20 142 72)"/>
          {/* Lower left */}
          <line x1="90" y1="140" x2="55" y2="125" stroke="#2D5A27" strokeWidth="1.2"/>
          <ellipse cx="44" cy="118" rx="13" ry="18" fill="#3A5F8A" opacity="0.45" transform="rotate(15 44 118)"/>
          {/* Lower right */}
          <line x1="90" y1="150" x2="125" y2="138" stroke="#2D5A27" strokeWidth="1.2"/>
          <ellipse cx="136" cy="132" rx="13" ry="18" fill="#7B3FA0" opacity="0.4" transform="rotate(-12 136 132)"/>
          {/* Gold accents */}
          <circle cx="90" cy="40" r="4" fill="#C9A84C" opacity="0.7"/>
          <circle cx="30" cy="68" r="2" fill="#C9A84C" opacity="0.5"/>
          <circle cx="150" cy="62" r="2" fill="#C9A84C" opacity="0.5"/>
          <circle cx="36" cy="110" r="1.5" fill="#C9A84C" opacity="0.4"/>
          <circle cx="144" cy="105" r="1.5" fill="#C9A84C" opacity="0.4"/>
        </svg>
      </div>

      {/* Title */}
      <div className="text-center flex-shrink-0 mb-2">
        <h1
          className="font-cinzel leading-none tracking-widest mb-3"
          style={{ color: '#1C1208', fontSize: '28px' }}
        >
          FLORA
        </h1>
        <div className="flex items-center gap-2 mb-2 justify-center">
          <div className="h-px flex-1" style={{ background: 'linear-gradient(to right, transparent, #C9A84C)' }} />
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M7 1 L8.2 5 L12 5 L9 7.5 L10.2 11.5 L7 9 L3.8 11.5 L5 7.5 L2 5 L5.8 5 Z" fill="#C9A84C" opacity="0.8"/>
          </svg>
          <div className="h-px flex-1" style={{ background: 'linear-gradient(to left, transparent, #C9A84C)' }} />
        </div>
        <h1
          className="font-cinzel leading-none tracking-widest"
          style={{ color: '#1C1208', fontSize: '28px' }}
        >
          CODEX
        </h1>
      </div>

      {/* Rarity legend at bottom */}
      <RarityLegend />
    </div>
  );
}

function CoverRightPage() {
  return (
    <div className="h-full flex flex-col">
      {/* Flora Codex title bar — consistent with herb pages */}
      <FloraCodexTitle />

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 md:p-8">
        {/* Decorative border */}
        <div
          className="w-full flex-1 flex flex-col items-center justify-center p-6"
          style={{
            border: '1px solid #C9A84C30',
            background: 'rgba(201,168,76,0.03)',
          }}
        >
          <div className="text-center mb-6">
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none" className="mx-auto mb-4" opacity="0.5">
              <circle cx="20" cy="20" r="18" stroke="#C9A84C" strokeWidth="1"/>
              <circle cx="20" cy="20" r="12" stroke="#C9A84C" strokeWidth="0.5" strokeDasharray="2 2"/>
              <path d="M20 5 L21.8 14 L30 11 L24.5 18.5 L30 26 L21.8 23 L20 32 L18.2 23 L10 26 L15.5 18.5 L10 11 L18.2 14 Z" fill="#C9A84C" opacity="0.6"/>
            </svg>
            <h2
              className="font-cinzel tracking-widest mb-3"
              style={{ color: '#1C1208', fontSize: '14px' }}
            >
              Предисловие
            </h2>
            <div className="h-px mb-4" style={{ background: 'linear-gradient(to right, transparent, #C9A84C60, transparent)' }} />
          </div>

          <p
            className="font-garamond text-base leading-relaxed text-center"
            style={{ color: '#3D2B1F', maxWidth: '280px' }}
          >
            Сей кодекс содержит знания о магических растениях, собранных в ходе великих странствий. Каждая трава скрывает в себе тайну, доступную лишь посвящённым.
          </p>

          <div className="mt-6 flex items-center gap-3">
            <div className="h-px w-10" style={{ background: '#C9A84C40' }} />
            <span className="font-cormorant italic text-sm" style={{ color: '#C9A84C', opacity: 0.6 }}>
              ex herbis natura
            </span>
            <div className="h-px w-10" style={{ background: '#C9A84C40' }} />
          </div>

          {/* Corner ornaments */}
          {['top-2 left-2', 'top-2 right-2', 'bottom-2 left-2', 'bottom-2 right-2'].map((pos, i) => (
            <div
              key={i}
              className={`absolute ${pos} w-5 h-5`}
              style={{
                border: '1px solid #C9A84C40',
                borderRadius: 0,
                transform: i === 1 ? 'scaleX(-1)' : i === 2 ? 'scaleY(-1)' : i === 3 ? 'scale(-1)' : 'none',
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Herb grid pages ────────────────────────────────────────────────────────────

interface GridProps {
  herbs: HerbOrStub[];
  onHerbClick: (herb: HerbOrStub) => void;
  side: 'left' | 'right';
}

function HerbGridPage({ herbs, onHerbClick, side }: GridProps) {
  return (
    <div className="h-full flex flex-col">
      {/* Right pages: Flora Codex title at top */}
      {side === 'right' && <FloraCodexTitle />}

      {/* Herb grid — flex-1 fills remaining space, min-h-0 enables overflow */}
      <div className="flex-1 p-3 md:p-4 grid grid-cols-2 grid-rows-2 gap-2 md:gap-3 min-h-0">
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
              className="text-left transition-transform duration-200 hover:-translate-y-0.5 focus:outline-none"
            >
              <HerbCard herb={herb} />
            </button>
          );
        })}
      </div>

      {/* Left pages: rarity legend at bottom */}
      {side === 'left' && <RarityLegend />}
    </div>
  );
}

// ── Shared page elements ───────────────────────────────────────────────────────

function FloraCodexTitle() {
  return (
    <div
      className="flex-shrink-0 text-center px-4 py-2"
      style={{ borderBottom: '1px solid #C9A84C25' }}
    >
      <p
        className="font-cinzel tracking-widest"
        style={{ color: '#1C1208', fontSize: '10px', opacity: 0.6 }}
      >
        ✦ Flora Codex — Атлас магических растений ✦
      </p>
    </div>
  );
}

function RarityLegend() {
  return (
    <div
      className="flex-shrink-0 px-3 py-2"
      style={{ borderTop: '1px solid #C9A84C25' }}
    >
      <div className="flex flex-wrap justify-center gap-x-3 gap-y-0.5">
        {(['COMMON', 'UNCOMMON', 'RARE', 'VERY_RARE'] as const).map(r => (
          <div key={r} className="flex items-center gap-1">
            <div
              className="w-2 h-2 rounded-full flex-shrink-0"
              style={{ background: RARITY_COLORS[r] }}
            />
            <span
              className="font-garamond"
              style={{ color: '#3D2B1F', fontSize: '9px', opacity: 0.7 }}
            >
              {RARITY_LABELS[r]}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Herb cards ─────────────────────────────────────────────────────────────────

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
          className="font-cinzel leading-tight mb-1.5 truncate"
          style={{ color: '#1C1208', fontSize: '13px' }}
        >
          {herb.name}
        </p>
        <span
          className="inline-block px-1.5 py-0.5 font-garamond tracking-wide uppercase"
          style={{
            color: color,
            border: `1px solid ${color}50`,
            backgroundColor: `${color}12`,
            fontSize: '10px',
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
      <div style={{ filter: 'blur(1px)', opacity: 0.3 }}>
        <HerbMiniIllustration rarity={herb.rarity} color={color} />
      </div>
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5">
        <svg width="22" height="26" viewBox="0 0 24 28" fill="none" opacity="0.5">
          <rect x="3" y="12" width="18" height="14" rx="2" fill="#1C1208"/>
          <path d="M7 12V8a5 5 0 0110 0v4" stroke="#1C1208" strokeWidth="2" fill="none"/>
          <circle cx="12" cy="19" r="2" fill="#F4E4BC"/>
        </svg>
        <p
          className="font-garamond italic text-center"
          style={{ color: '#3D2B1F', opacity: 0.5, fontSize: '12px' }}
        >
          Не изучено
        </p>
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
      className="book-binding flex-shrink-0"
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

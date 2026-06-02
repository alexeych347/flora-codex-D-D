import { Herb, RARITY_LABELS, RARITY_COLORS } from '../types';

interface Props {
  herb: Herb;
  apiUrl: string;
}

export function HerbPageLeft({ herb, apiUrl }: Props) {
  const rarityColor = RARITY_COLORS[herb.rarity];
  const isLegendary = herb.rarity === 'LEGENDARY';
  const imageUrl = herb.imageUrl ? `${apiUrl}${herb.imageUrl}` : null;

  return (
    <div className="page-left h-full flex flex-col items-center justify-between p-6 md:p-8 relative">
      <div className="ornament-top w-full flex justify-center mb-4">
        <svg width="200" height="24" viewBox="0 0 200 24" fill="none">
          <path d="M0 12 Q50 4 100 12 Q150 20 200 12" stroke="#C9A84C" strokeWidth="1.5" fill="none" opacity="0.7"/>
          <circle cx="100" cy="12" r="3" fill="#C9A84C" opacity="0.8"/>
          <circle cx="60" cy="10" r="2" fill="#C9A84C" opacity="0.5"/>
          <circle cx="140" cy="14" r="2" fill="#C9A84C" opacity="0.5"/>
        </svg>
      </div>

      {/* Illustration */}
      <div
        className="illustration-frame relative w-full flex-1 flex items-center justify-center mx-auto max-w-xs"
        style={{ maxHeight: '55%' }}
      >
        <div
          className="illustration-border w-full h-full flex items-center justify-center"
          style={{
            border: `2px solid ${rarityColor}`,
            boxShadow: isLegendary
              ? `0 0 20px rgba(201,168,76,0.4), inset 0 0 20px rgba(201,168,76,0.1)`
              : `inset 0 0 15px rgba(0,0,0,0.1)`,
            background: `linear-gradient(135deg, rgba(228,212,163,0.3) 0%, rgba(244,228,188,0.6) 100%)`,
            minHeight: '220px',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Corner ornaments */}
          {['top-1 left-1', 'top-1 right-1', 'bottom-1 left-1', 'bottom-1 right-1'].map((pos, i) => (
            <div
              key={i}
              className={`absolute ${pos} w-4 h-4`}
              style={{
                border: `1px solid ${rarityColor}`,
                borderRadius: i < 2 ? '0 0 4px 0' : '0 4px 0 0',
                opacity: 0.6,
                transform: i === 1 ? 'scaleX(-1)' : i === 2 ? 'scaleY(-1)' : i === 3 ? 'scale(-1)' : 'none',
              }}
            />
          ))}

          {imageUrl ? (
            <img
              src={imageUrl}
              alt={herb.name}
              className="w-full h-full object-cover"
              style={{ maxHeight: '250px' }}
            />
          ) : (
            <div className="flex flex-col items-center justify-center gap-3 p-6 text-center">
              <HerbIllustrationPlaceholder rarity={herb.rarity} />
            </div>
          )}
        </div>
      </div>

      {/* Name & Rarity */}
      <div className="herb-info text-center mt-4 w-full">
        <h2
          className="font-cinzel text-xl md:text-2xl leading-tight mb-2"
          style={{ color: '#1C1208' }}
        >
          {herb.name}
        </h2>

        <div className="flex justify-center mb-2">
          <span
            className="rarity-badge px-3 py-1 text-xs font-garamond font-semibold tracking-widest uppercase"
            style={{
              color: rarityColor,
              border: `1px solid ${rarityColor}`,
              backgroundColor: `${rarityColor}18`,
              boxShadow: isLegendary ? `0 0 12px rgba(201,168,76,0.5)` : 'none',
            }}
          >
            {RARITY_LABELS[herb.rarity]}
          </span>
        </div>

        {herb.discoveredAt && (
          <p
            className="font-garamond text-xs italic opacity-70 mt-1"
            style={{ color: '#3D2B1F' }}
          >
            Обнаружена: {herb.discoveredAt}
          </p>
        )}
      </div>

      <div className="ornament-bottom w-full flex justify-center mt-4">
        <svg width="120" height="16" viewBox="0 0 120 16" fill="none">
          <path d="M0 8 L55 8 M65 8 L120 8" stroke="#C9A84C" strokeWidth="1" opacity="0.5"/>
          <path d="M55 4 L60 8 L65 4 L60 0 Z" fill="#C9A84C" opacity="0.6"/>
        </svg>
      </div>
    </div>
  );
}

function HerbIllustrationPlaceholder({ rarity }: { rarity: string }) {
  const svgData: Record<string, JSX.Element> = {
    COMMON: (
      <svg width="100" height="120" viewBox="0 0 100 120" fill="none" opacity="0.6">
        <line x1="50" y1="110" x2="50" y2="30" stroke="#2D5A27" strokeWidth="2"/>
        <ellipse cx="50" cy="50" rx="20" ry="28" fill="#4A7C59" opacity="0.7" transform="rotate(-15 50 50)"/>
        <ellipse cx="35" cy="65" rx="15" ry="20" fill="#4A7C59" opacity="0.5" transform="rotate(20 35 65)"/>
        <ellipse cx="65" cy="60" rx="15" ry="20" fill="#4A7C59" opacity="0.5" transform="rotate(-20 65 60)"/>
      </svg>
    ),
    UNCOMMON: (
      <svg width="100" height="120" viewBox="0 0 100 120" fill="none" opacity="0.7">
        <line x1="50" y1="110" x2="50" y2="20" stroke="#2D5A27" strokeWidth="2"/>
        <circle cx="50" cy="30" r="18" fill="#4A7C59" opacity="0.8"/>
        <circle cx="30" cy="55" r="12" fill="#4A7C59" opacity="0.6"/>
        <circle cx="70" cy="50" r="12" fill="#4A7C59" opacity="0.6"/>
        <circle cx="40" cy="75" r="10" fill="#4A7C59" opacity="0.4"/>
        <circle cx="60" cy="70" r="10" fill="#4A7C59" opacity="0.4"/>
      </svg>
    ),
    RARE: (
      <svg width="100" height="120" viewBox="0 0 100 120" fill="none" opacity="0.7">
        <line x1="50" y1="110" x2="50" y2="15" stroke="#1C1208" strokeWidth="2"/>
        <path d="M50 15 Q65 35 50 55 Q35 35 50 15Z" fill="#3A5F8A" opacity="0.7"/>
        <path d="M30 50 Q50 65 30 80 Q10 65 30 50Z" fill="#3A5F8A" opacity="0.5"/>
        <path d="M70 45 Q90 60 70 75 Q50 60 70 45Z" fill="#3A5F8A" opacity="0.5"/>
        <circle cx="50" cy="55" r="5" fill="#6A9FBA" opacity="0.8"/>
      </svg>
    ),
    LEGENDARY: (
      <svg width="100" height="120" viewBox="0 0 100 120" fill="none">
        <line x1="50" y1="110" x2="50" y2="10" stroke="#8B4513" strokeWidth="2"/>
        <path d="M50 10 L55 30 L75 25 L60 40 L70 60 L50 48 L30 60 L40 40 L25 25 L45 30 Z" fill="#C9A84C" opacity="0.8"/>
        <circle cx="50" cy="48" r="8" fill="#F0C060" opacity="0.9"/>
        <path d="M25 80 Q50 70 75 80 Q50 95 25 80Z" fill="#8B4513" opacity="0.6"/>
      </svg>
    ),
  };

  return (
    <>
      {svgData[rarity] || svgData.COMMON}
      <p className="font-garamond text-xs italic" style={{ color: '#3D2B1F', opacity: 0.5 }}>
        Иллюстрация отсутствует
      </p>
    </>
  );
}

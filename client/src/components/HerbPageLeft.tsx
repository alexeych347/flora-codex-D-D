import { Herb, RARITY_LABELS, RARITY_COLORS } from '../types';

interface Props {
  herb: Herb;
  apiUrl: string;
}

export function HerbPageLeft({ herb, apiUrl }: Props) {
  const rarityColor = RARITY_COLORS[herb.rarity];
  const isVeryRare = herb.rarity === 'VERY_RARE';
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
            boxShadow: isVeryRare
              ? `0 0 24px rgba(123,63,160,0.45), inset 0 0 20px rgba(123,63,160,0.12)`
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
          className="font-cinzel text-2xl md:text-3xl leading-tight mb-2"
          style={{ color: '#1C1208' }}
        >
          {herb.name}
        </h2>

        <div className="flex justify-center mb-2">
          <span
            className="rarity-badge px-3 py-1 text-sm font-garamond font-semibold tracking-widest uppercase"
            style={{
              color: rarityColor,
              border: `1px solid ${rarityColor}`,
              backgroundColor: `${rarityColor}18`,
              boxShadow: isVeryRare ? `0 0 14px rgba(123,63,160,0.5)` : 'none',
            }}
          >
            {RARITY_LABELS[herb.rarity]}
          </span>
        </div>

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
    VERY_RARE: (
      <svg width="100" height="120" viewBox="0 0 100 120" fill="none">
        <line x1="50" y1="110" x2="50" y2="10" stroke="#4A1A6B" strokeWidth="2"/>
        <path d="M50 10 L57 32 L80 25 L63 44 L75 68 L50 55 L25 68 L37 44 L20 25 L43 32 Z" fill="#7B3FA0" opacity="0.85"/>
        <circle cx="50" cy="55" r="10" fill="#C090E0" opacity="0.9"/>
        <circle cx="22" cy="28" r="2.5" fill="#C9A84C" opacity="0.85"/>
        <circle cx="78" cy="22" r="2.5" fill="#C9A84C" opacity="0.85"/>
        <circle cx="12" cy="58" r="2" fill="#C9A84C" opacity="0.65"/>
        <circle cx="88" cy="52" r="2" fill="#C9A84C" opacity="0.65"/>
        <circle cx="50" cy="8" r="1.5" fill="#C9A84C" opacity="0.7"/>
      </svg>
    ),
  };

  return (
    <>
      {svgData[rarity] || svgData.COMMON}
      <p className="font-garamond text-sm italic" style={{ color: '#3D2B1F', opacity: 0.5 }}>
        Иллюстрация отсутствует
      </p>
    </>
  );
}

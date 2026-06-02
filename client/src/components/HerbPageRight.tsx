import { Herb, RARITY_COLORS } from '../types';

interface Props {
  herb: Herb;
  pageNumber: number;
}

export function HerbPageRight({ herb, pageNumber }: Props) {
  const rarityColor = RARITY_COLORS[herb.rarity];

  return (
    <div className="page-right h-full flex flex-col p-6 md:p-8 relative overflow-y-auto">
      {/* Latin name */}
      <div className="text-center mb-4">
        <p
          className="font-cormorant italic text-xl md:text-2xl"
          style={{ color: '#3D2B1F', opacity: 0.85 }}
        >
          {herb.latinName}
        </p>
      </div>

      {/* Divider */}
      <div className="ornament-divider flex items-center gap-3 mb-5">
        <div className="flex-1 h-px" style={{ background: `linear-gradient(to right, transparent, ${rarityColor})` }} />
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M12 2 L14 9 L21 9 L15 14 L17 21 L12 16 L7 21 L9 14 L3 9 L10 9 Z" fill={rarityColor} opacity="0.7"/>
        </svg>
        <div className="flex-1 h-px" style={{ background: `linear-gradient(to left, transparent, ${rarityColor})` }} />
      </div>

      {/* Description */}
      <div className="description mb-5">
        <p
          className="font-garamond text-sm md:text-base leading-relaxed"
          style={{ color: '#1C1208', textAlign: 'justify' }}
        >
          {herb.description}
        </p>
      </div>

      {/* Properties */}
      {herb.properties.length > 0 && (
        <div className="properties mb-4">
          <h3
            className="font-cinzel text-xs tracking-widest uppercase mb-2"
            style={{ color: '#3D2B1F', opacity: 0.7 }}
          >
            ✦ Свойства
          </h3>
          <div className="flex flex-wrap gap-2">
            {herb.properties.map(prop => (
              <span
                key={prop}
                className="property-tag px-2 py-0.5 font-garamond text-xs"
                style={{
                  color: rarityColor,
                  border: `1px solid ${rarityColor}`,
                  backgroundColor: `${rarityColor}15`,
                }}
              >
                {prop}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Effects */}
      <div className="effects flex-1">
        <h3
          className="font-cinzel text-xs tracking-widest uppercase mb-2"
          style={{ color: '#3D2B1F', opacity: 0.7 }}
        >
          ✦ Эффекты D&D
        </h3>
        <div
          className="effects-box p-3 font-garamond text-sm leading-relaxed"
          style={{
            background: 'rgba(28,18,8,0.04)',
            border: `1px solid ${rarityColor}40`,
            borderLeft: `3px solid ${rarityColor}`,
            color: '#1C1208',
          }}
        >
          {herb.effects}
        </div>
      </div>

      {/* Footer with page number */}
      <div
        className="page-footer mt-auto pt-4 flex items-center justify-between"
        style={{ borderTop: `1px solid #C9A84C40` }}
      >
        <div className="flex-1 h-px" style={{ background: 'linear-gradient(to right, #C9A84C30, transparent)' }} />
        <span
          className="font-cormorant italic text-sm px-4"
          style={{ color: '#3D2B1F', opacity: 0.5 }}
        >
          {pageNumber}
        </span>
        <div className="flex-1 h-px" style={{ background: 'linear-gradient(to left, #C9A84C30, transparent)' }} />
      </div>
    </div>
  );
}

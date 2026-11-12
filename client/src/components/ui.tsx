import { HerbOrStub, isFullHerb, RARITY_COLORS, RARITY_LABELS, Rarity } from '../types';
import {
  leafPath, HairDivider, FloralDivider, CornerOrnament, SlavicFlower,
  HeraldicBadge, SpreadBorder, PageBorder,
} from './ornaments';

/* ===========================================================================
   ui.tsx — Кодекс Трав. Карточки трав, разворот, обложка.
   Портировано из дизайн-проекта Claude Design ("DND травушки").
   =========================================================================== */

/* — флора-глиф (плейсхолдер, когда нет фото) — */
export function PlantGlyph({ rarity, size = 120 }: { rarity: Rarity; size?: number | string }) {
  const c = RARITY_COLORS[rarity];
  // size — ширина глифа: число пикселей или доля плиты ('75%'). Высота
  // всегда в 1.12 раза больше: viewBox 120x134.
  const h = typeof size === 'number' ? size * 1.12
    : size.endsWith('%') ? `${parseFloat(size) * 1.12}%` : size;
  const blooms: Record<Rarity, JSX.Element> = {
    COMMON: (
      <g>
        <path d={leafPath(60, 90, 40, 20)} fill={c} opacity=".7" />
        <path d={leafPath(60, 90, 40, 20)} fill="none" stroke="var(--ink)" strokeWidth="1.2" opacity=".5" />
        <g transform="rotate(38 60 72)"><path d={leafPath(40, 80, 52, 15)} fill={c} opacity=".5" /></g>
        <g transform="rotate(-38 60 72)"><path d={leafPath(80, 80, 52, 15)} fill={c} opacity=".5" /></g>
      </g>
    ),
    UNCOMMON: (
      <g>
        <circle cx="60" cy="42" r="17" fill={c} opacity=".85" />
        <circle cx="42" cy="62" r="11" fill={c} opacity=".6" />
        <circle cx="78" cy="60" r="11" fill={c} opacity=".6" />
        <circle cx="60" cy="42" r="5" fill="var(--gold-muted)" opacity=".9" />
      </g>
    ),
    RARE: (
      <g>
        <path d="M60,28 Q76,52 60,76 Q44,52 60,28 Z" fill={c} opacity=".82" stroke="var(--ink)" strokeWidth="1" />
        <path d="M34,54 Q58,68 34,82 Q10,68 34,54 Z" fill={c} opacity=".55" />
        <path d="M86,52 Q110,66 86,80 Q62,66 86,52 Z" fill={c} opacity=".55" />
        <circle cx="60" cy="62" r="7" fill="var(--cobalt)" />
        <circle cx="60" cy="62" r="3" fill="var(--gold-muted)" />
      </g>
    ),
    VERY_RARE: (
      <g>
        <path d="M60,24 L67,50 L94,44 L72,62 L82,88 L60,72 L38,88 L48,62 L26,44 L53,50 Z"
          fill={c} opacity=".88" stroke="var(--ink)" strokeWidth="1" />
        <circle cx="60" cy="60" r="9" fill="#6E2C4D" />
        <circle cx="60" cy="60" r="3.5" fill="var(--gold-muted)" />
        {[0, 90, 180, 270].map((d, i) => {
          const a = d * Math.PI / 180;
          return <circle key={i} cx={60 + Math.cos(a) * 6} cy={60 + Math.sin(a) * 6} r="2" fill="#F2C040" />;
        })}
      </g>
    ),
  };
  return (
    <svg width={size} height={h} viewBox="0 0 120 134" style={{ display: 'block' }}>
      <line x1="60" y1="130" x2="60" y2="60" stroke="#1B4332" strokeWidth="2.5" />
      <line x1="60" y1="105" x2="38" y2="90" stroke="#1B4332" strokeWidth="1.8" />
      <line x1="60" y1="115" x2="82" y2="102" stroke="#1B4332" strokeWidth="1.8" />
      <g transform="rotate(40 38 90)"><path d={leafPath(38, 95, 82, 8)} fill="#1B4332" opacity=".55" /></g>
      <g transform="rotate(-40 82 102)"><path d={leafPath(82, 106, 94, 8)} fill="#1B4332" opacity=".55" /></g>
      {blooms[rarity] || blooms.COMMON}
    </svg>
  );
}

/* — навигационная стрелка: общая для книги и окна травы — */
export function NavArrow({ dir, enabled, onClick, isMobile }: {
  dir: 'prev' | 'next'; enabled: boolean; onClick: () => void; isMobile: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={!enabled}
      aria-label={dir === 'prev' ? 'Предыдущая страница' : 'Следующая страница'}
      className="flex-shrink-0 flex items-center justify-center rounded-lg transition-all duration-200"
      style={{
        width: isMobile ? '44px' : '52px',
        height: isMobile ? '44px' : '80px',
        background: enabled ? 'rgba(201,168,76,0.12)' : 'transparent',
        border: enabled ? '1px solid rgba(201,168,76,0.35)' : '1px solid transparent',
        color: enabled ? '#C9A84C' : 'transparent',
        cursor: enabled ? 'pointer' : 'default',
        boxShadow: enabled ? '0 2px 12px rgba(0,0,0,0.3)' : 'none',
      }}
    >
      <svg width={isMobile ? 22 : 28} height={isMobile ? 22 : 28} viewBox="0 0 24 24" fill="none">
        <path d={dir === 'prev' ? 'M15 18l-6-6 6-6' : 'M9 18l6-6-6-6'}
          stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </button>
  );
}

/* — шапка страницы разворота — */
export function PageHeader() {
  return (
    <div style={{ flexShrink: 0, textAlign: 'center', padding: '2px 8px 10px' }}>
      <p className="f-cormorant-sc" style={{ color: 'var(--ink)', fontSize: 13, letterSpacing: '.14em', opacity: .82, lineHeight: 1.4 }}>
        АТЛАС МАГИЧЕСКИХ РАСТЕНИЙ
      </p>
      <div style={{ marginTop: 5, color: 'var(--gold-muted)', opacity: .85, display: 'flex', justifyContent: 'center' }}>
        <HairDivider width={210} />
      </div>
    </div>
  );
}

/* — карточка изученной травы — */
export function HerbCard({ herb, onClick, isMobile = false }:
  { herb: HerbOrStub & { isUnlocked: true }; onClick: () => void; isMobile?: boolean }) {
  const color = RARITY_COLORS[herb.rarity];
  return (
    <button onClick={onClick} className="hover-lift" style={{
      position: 'relative', textAlign: 'left', background: 'none',
      border: 'none', padding: 0, height: '100%', width: '100%', display: 'block',
    }}>
      <div style={{
        position: 'relative', height: '100%',
        display: 'flex', flexDirection: 'column',
        overflow: 'hidden',
        background: 'rgba(255,250,238,.45)',
        boxShadow: [
          `inset 0 0 0 1px ${color}55`,
          `inset 0 0 0 2px rgba(255,250,238,.45)`,
          `inset 0 0 0 2.5px ${color}AA`,
          '0 2px 8px rgba(60,40,15,.14)',
        ].join(','),
      }}>
        {/* Плита 1:1. Высоту задаёт flex, ширину выводит aspect-ratio, по бокам
            остаются поля пергамента — иллюстрация показывается целиком, без среза. */}
        <div style={{ flex: 1, minHeight: 0, margin: '8px 8px 0', position: 'relative' }}>
          <div style={{
            position: 'absolute', top: 0, bottom: 0,
            left: '50%', transform: 'translateX(-50%)',
            width: 'auto', aspectRatio: '1', maxWidth: '100%',
            overflow: 'hidden',
            background: herb.imageUrl ? '#000' : `linear-gradient(160deg,${color}14 0%,${color}05 100%)`,
            boxShadow: `inset 0 0 0 1px ${color}99`,
          }}>
            {herb.imageUrl
              ? <img src={herb.imageUrl} alt={herb.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
              : <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {/* Доля плиты, а не пиксели: на мобильном плита тянется
                      вместе с книгой (79–152px), фиксированный глиф её бы перерос */}
                  <PlantGlyph rarity={herb.rarity} size={isMobile ? '75%' : 128} />
                </div>}
          </div>
        </div>

        {/* Делитель есть и на мобильном: место освободилось после снятия легенды,
            а цвет редкости должен получить все три носителя (кант, делитель, щит) */}
        <div style={{ margin: isMobile ? '4px 9px 2px' : '5px 12px 3px', color, display: 'flex', justifyContent: 'center' }}>
          <HairDivider width="100%" color={color} />
        </div>

        <div style={{ flexShrink: 0, padding: isMobile ? '1px 8px 9px' : '1px 11px 9px', textAlign: 'center' }}>
          {/* Зарезервированная высота в две строки держит плиты одного размера
              через весь ряд; текст прижат книзу, чтобы у однострочного имени
              не висело пустой строки между ним и щитом. */}
          <div style={{ height: '2.24em', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', marginBottom: 6 }}>
            <p className="f-philosopher" lang="ru" style={{
              color: 'var(--ink)', fontSize: 17.5, fontWeight: 700,
              lineHeight: 1.12, hyphens: 'auto', overflowWrap: 'break-word',
              display: '-webkit-box', WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical', overflow: 'hidden',
            }}>{herb.name}</p>
          </div>
          {/* Кегль подписи на мобильном плавающий: «ОЧЕНЬ РЕДКАЯ» при 11px
              занимает 119.7px и на 360 не влезает в колонку (115.3px) — nowrap
              при этом ещё и раздвигает сетку, делая карточки разной ширины.
              min() держит 11px там, где есть место, и ужимает на узких. */}
          <HeraldicBadge
            color={color}
            label={RARITY_LABELS[herb.rarity]}
            size={isMobile ? 14 : 15}
            labelSize={isMobile ? 'min(11px, 2.7vw)' : 13}
          />
        </div>
      </div>
    </button>
  );
}

/* — заблокированная карточка — */
export function LockedHerbCard({ herb, isMobile = false }: { herb: HerbOrStub; isMobile?: boolean }) {
  const color = RARITY_COLORS[herb.rarity];
  // Замок повторяет глиф-заглушку открытой травы: закрытая карточка стоит
  // с ней в одном ряду. Плиты у закрытой карточки нет, поэтому её размер
  // пересчитывается от самой карточки. У открытой плита квадратная:
  //   плита = min(ширина карточки - 16, высота карточки - 100.8)
  // (16 — поля плиты по бокам, 100.8 — делитель с подвалом), а глиф —
  // 0.75 плиты. cq-единицы меряют content box, то есть карточку без
  // её падингов 14/10, отсюда +20 по ширине и +28 по высоте в пересчёте:
  //   лок = min(0.75*(cqw + 20 - 16), 0.75*(cqh + 28 - 100.8))
  // На десктопе книга фиксированной высоты — хватает числа.
  const lock = isMobile
    ? 'min(calc(75cqw + 3px), calc(75cqh - 54.6px))'
    : 128;
  return (
    <div style={{
      position: 'relative', height: '100%',
      containerType: 'size',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', gap: 11,
      overflow: 'hidden', padding: '14px 10px',
      background: `linear-gradient(150deg,${color}12 0%,${color}05 100%)`,
      boxShadow: [
        `inset 0 0 0 1px ${color}55`,
        `inset 0 0 0 2px rgba(255,250,238,.4)`,
        `inset 0 0 0 2.5px ${color}88`,
      ].join(','),
    }}>
      <svg viewBox="0 0 82 82" style={{ display: 'block', width: lock, height: lock, flexShrink: 0 }}>
        <circle cx="41" cy="41" r="36" fill="none" stroke={color} strokeWidth="1.1" strokeDasharray="3.5 4.5" opacity=".42" />
        <circle cx="41" cy="41" r="27" fill={`${color}10`} stroke="none" />
        <rect x="28" y="38" width="26" height="18" rx="3" fill={`${color}22`} stroke={color} strokeWidth="1.7" opacity=".8" />
        <path d="M33.5,38 v-6 a7.5,7.5 0 0 1 15,0 v6" fill="none" stroke={color} strokeWidth="1.7" opacity=".8" />
        <circle cx="41" cy="47" r="2.8" fill={color} opacity=".8" />
        <line x1="41" y1="48.5" x2="41" y2="52.5" stroke={color} strokeWidth="1.6" opacity=".72" />
        {[0, 90, 180, 270].map((d, i) => {
          const a = d * Math.PI / 180, x = 41 + Math.cos(a) * 36, y = 41 + Math.sin(a) * 36;
          return <path key={i} d={`M${x},${y - 3.5} l3.5,3.5 l-3.5,3.5 l-3.5,-3.5 Z`} fill={color} opacity=".46" />;
        })}
      </svg>
      {/* Без opacity: при .6 подпись давала 3.46:1 — ниже порога. Чернила в полную силу — 10.6:1 */}
      <p className="f-italic" style={{ color: 'var(--ink-soft)', fontSize: 15, textAlign: 'center' }}>Не изучено</p>
    </div>
  );
}

export function EmptySlot() {
  return <div style={{
    height: '100%',
    background: 'rgba(184,134,11,.02)',
    boxShadow: 'inset 0 0 0 1px rgba(184,134,11,.07)',
  }} />;
}

/* — разворот с сеткой трав (4 травы: 2×2) — */
export function HerbGridPage({ herbs, onHerbClick, isMobile = false }:
  { herbs: HerbOrStub[]; onHerbClick: (herb: HerbOrStub) => void; isMobile?: boolean }) {
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      <SpreadBorder />
      <div style={{ position: 'relative', zIndex: 5, flex: 1, display: 'flex', flexDirection: 'column', padding: isMobile ? '34px' : '30px 30px 30px' }}>
        <PageHeader />
        <div style={{
          flex: 1, minHeight: 0,
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gridTemplateRows: 'minmax(0,1fr) minmax(0,1fr)',
          gap: isMobile ? 9 : 11,
        }}>
          {[0, 1, 2, 3].map(i => {
            const herb = herbs[i];
            if (!herb) return <EmptySlot key={i} />;
            if (!isFullHerb(herb)) return <LockedHerbCard key={herb.id} herb={herb} isMobile={isMobile} />;
            return <HerbCard key={herb.id} herb={herb} onClick={() => onHerbClick(herb)} isMobile={isMobile} />;
          })}
        </div>
      </div>
    </div>
  );
}

/* ===================== ОБЛОЖКА ===================== */

export function CoverLeftPage({ isMobile = false }: { isMobile?: boolean }) {
  return (
    <div style={{ height: '100%', position: 'relative', overflow: 'hidden' }}>
      <PageBorder />
      <div style={{
        position: 'absolute', inset: 34,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        gap: 11, padding: '14px 30px',
      }}>
        <p className="f-cormorant-sc" style={{ color: 'var(--ink)', fontSize: 13.5, letterSpacing: '.16em', opacity: .85, textAlign: 'center' }}>
          АТЛАС МАГИЧЕСКИХ РАСТЕНИЙ
        </p>

        <div style={{ color: 'var(--gold-muted)', width: '74%', display: 'flex', justifyContent: 'center' }}>
          <FloralDivider width="100%" />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0' }}>
          <SlavicFlower size={128} />
        </div>

        <div style={{ textAlign: 'center', width: '100%' }}>
          <h1 className="f-philosopher" style={{ color: 'var(--ink)', fontSize: isMobile ? 30 : 42, fontWeight: 700, letterSpacing: '.14em', lineHeight: 1, marginRight: '-.14em' }}>КОДЕКС</h1>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, margin: '5px 0' }}>
            <span style={{ height: 1.5, flex: 1, maxWidth: 78, background: 'linear-gradient(to right,transparent,#8B1A1A)' }} />
            <svg width="16" height="16" viewBox="0 0 18 18">
              <path d="M9,1 l2,6 l6,0 l-5,4 l2,6 l-5,-4 l-5,4 l2,-6 l-5,-4 l6,0 Z" fill="#8B1A1A" opacity=".9" />
            </svg>
            <span style={{ height: 1.5, flex: 1, maxWidth: 78, background: 'linear-gradient(to left,transparent,#8B1A1A)' }} />
          </div>
          <h1 className="f-philosopher" style={{ color: 'var(--ink)', fontSize: isMobile ? 30 : 42, fontWeight: 700, letterSpacing: '.14em', lineHeight: 1, marginRight: '-.14em' }}>ТРАВ</h1>
        </div>

        <div style={{ color: 'var(--gold-muted)', width: '74%', display: 'flex', justifyContent: 'center' }}>
          <FloralDivider width="100%" flip />
        </div>

      </div>
    </div>
  );
}

export function CoverRightPage() {
  return (
    <div style={{ height: '100%', position: 'relative', overflow: 'hidden' }}>
      <PageBorder />
      <div style={{ position: 'absolute', inset: 34, display: 'flex', flexDirection: 'column', padding: '26px 30px' }}>
        <div style={{
          flex: 1,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          padding: '30px 30px',
          position: 'relative',
          background: 'rgba(107,26,18,.045)',
          boxShadow: 'inset 0 0 0 1.5px rgba(184,134,11,.55), inset 0 0 0 5px rgba(242,232,213,.5), inset 0 0 0 6px rgba(184,134,11,.3)',
        }}>
          <div style={{ position: 'absolute', top: 3, left: 3, color: 'var(--gold-muted)' }}><CornerOrnament size={38} orient="tl" /></div>
          <div style={{ position: 'absolute', top: 3, right: 3, color: 'var(--gold-muted)' }}><CornerOrnament size={38} orient="tr" /></div>
          <div style={{ position: 'absolute', bottom: 3, left: 3, color: 'var(--gold-muted)' }}><CornerOrnament size={38} orient="bl" /></div>
          <div style={{ position: 'absolute', bottom: 3, right: 3, color: 'var(--gold-muted)' }}><CornerOrnament size={38} orient="br" /></div>

          <h2 className="f-cormorant-sc" style={{ color: 'var(--ink)', fontSize: 25, letterSpacing: '.14em', fontWeight: 600, textAlign: 'center' }}>ПРЕДИСЛОВИЕ</h2>

          <div style={{ color: 'var(--gold-muted)', margin: '16px 0 20px' }}>
            <FloralDivider width={180} />
          </div>

          <p className="f-italic" style={{ color: 'var(--ink)', fontSize: 18.5, lineHeight: 1.85, textAlign: 'center', maxWidth: 340 }}>
            Сей кодекс содержит знания о магических растениях, собранных в ходе великих странствий. Каждая трава скрывает в себе тайну, доступную лишь посвящённым.
          </p>

          <div style={{ color: 'var(--gold-muted)', margin: '20px 0 16px' }}>
            <FloralDivider width={170} flip />
          </div>

          <p className="f-cormorant-sc" style={{ color: 'var(--ink-soft)', fontSize: 14, letterSpacing: '.18em', opacity: .72, textAlign: 'center' }}>СО ВСЕГО МИРА</p>
        </div>
      </div>
    </div>
  );
}

import React from 'react';

/* ===========================================================================
   ornaments.tsx — сложные орнаменты в стиле Билибина / славянская этника
   Органические кривые, плоские цвета, чёрный контур, цветы, лозы, ягоды.
   Портировано из дизайн-проекта Claude Design ("DND травушки").
   =========================================================================== */

/* Органичный лист (асимметричный, с жилкой) — возвращает SVG path string.
   Ось роста вертикальная: tipY — кончик, baseY — основание, hw — полуширина */
export function bilibinLeaf(cx: number, baseY: number, tipY: number, hw: number) {
  const h = baseY - tipY;
  const m1 = tipY + h * 0.28, m2 = tipY + h * 0.62;
  const lw = hw * 0.96, rw = hw * 0.84;
  return (
    `M${cx},${tipY} ` +
    `C${cx + rw * 0.55},${tipY + h * 0.06} ${cx + rw},${m1} ${cx + rw * 0.92},${m2} ` +
    `C${cx + rw * 0.72},${m2 + h * 0.2} ${cx + rw * 0.38},${baseY - h * 0.04} ${cx},${baseY} ` +
    `C${cx - lw * 0.38},${baseY - h * 0.04} ${cx - lw * 0.72},${m2 + h * 0.2} ${cx - lw * 0.92},${m2} ` +
    `C${cx - lw},${m1} ${cx - lw * 0.55},${tipY + h * 0.06} ${cx},${tipY} Z`
  );
}

/* Лист горизонтальный (растёт влево: tipX < baseX) */
export function bilibinLeafH(baseX: number, cy: number, tipX: number, hw: number) {
  const h = baseX - tipX;
  const m1 = baseX - h * 0.28, m2 = baseX - h * 0.62;
  const uw = hw * 0.96, dw = hw * 0.84;
  return (
    `M${tipX},${cy} ` +
    `C${tipX + h * 0.06},${cy - uw * 0.55} ${m1},${cy - uw} ${m2},${cy - uw * 0.92} ` +
    `C${m2 + h * 0.2},${cy - uw * 0.72} ${baseX - h * 0.04},${cy - uw * 0.38} ${baseX},${cy} ` +
    `C${baseX - h * 0.04},${cy + dw * 0.38} ${m2 + h * 0.2},${cy + dw * 0.72} ${m2},${cy + dw * 0.92} ` +
    `C${m1},${cy + dw} ${tipX + h * 0.06},${cy + dw * 0.55} ${tipX},${cy} Z`
  );
}

export const leafPath = bilibinLeaf;

/* ── 5-лепестковый цветок в стиле народной вышивки ── */
export function Flower5({ cx, cy, size, fill = '#6B1A12', core = 'var(--gold-muted)' }:
  { cx: number; cy: number; size: number; fill?: string; core?: string }) {
  const pd = size * 0.56, rx = size * 0.2, ry = size * 0.35;
  return (
    <g>
      {Array.from({ length: 5 }, (_, i) => {
        const a = (i / 5) * Math.PI * 2 - Math.PI / 2;
        const px = cx + Math.cos(a) * pd, py = cy + Math.sin(a) * pd, deg = (i / 5) * 360 - 90;
        return <ellipse key={i} cx={px} cy={py} rx={rx} ry={ry}
          transform={`rotate(${deg} ${px} ${py})`}
          fill={fill} stroke="var(--ink)" strokeWidth="1.1" />;
      })}
      <circle cx={cx} cy={cy} r={size * 0.26} fill={fill} stroke="var(--ink)" strokeWidth="1.1" />
      <circle cx={cx} cy={cy} r={size * 0.13} fill={core} />
    </g>
  );
}

type Orient = 'tl' | 'tr' | 'bl' | 'br';

/* ── Угловой орнамент: ботаническая вставка Билибина ── */
export function CornerOrnament({ size = 60, orient = 'tl', style = {} }:
  { size?: number; orient?: Orient; style?: React.CSSProperties }) {
  const tf = {
    tl: '', tr: 'translate(60,0) scale(-1,1)',
    bl: 'translate(0,60) scale(1,-1)', br: 'translate(60,60) scale(-1,-1)',
  }[orient];
  const ink = 'var(--ink)', slt = 'var(--slate)', red = '#6B1A12', grn = '#1B4332', gld = 'var(--gold-muted)';

  return (
    <svg width={size} height={size} viewBox="0 0 60 60"
      style={{ display: 'block', overflow: 'visible', ...style }}>
      <g transform={tf} strokeLinecap="round" strokeLinejoin="round">
        <path d="M6,58 L6,20 Q6,6 20,6 L58,6" fill="none" stroke={ink} strokeWidth="3.2" />
        <path d="M8.5,58 L8.5,22.5 Q8.5,8.5 22.5,8.5 L58,8.5" fill="none" stroke={slt} strokeWidth="2.2" />
        <path d="M11,58 L11,25 Q11,11 25,11 L58,11" fill="none" stroke={red} strokeWidth="1.5" />
        <path d="M13,58 L13,27 Q13,13 27,13 L58,13" fill="none" stroke={gld} strokeWidth=".9" opacity=".88" />

        <Flower5 cx={6} cy={6} size={12} fill={red} core={gld} />

        <path d="M6,20 C5,26 7,30 6,36 C5,42 7,46 6,52" fill="none" stroke={grn} strokeWidth=".9" opacity=".7" />

        <path d={bilibinLeafH(6, 20, -4, 6.5)} fill={grn} stroke={ink} strokeWidth="1.1" />
        <line x1="-2" y1="20" x2="6" y2="20" stroke="#4A8C5C" strokeWidth=".7" />
        <path d={bilibinLeafH(6, 26, -4, 5.5)} fill={grn} stroke={ink} strokeWidth="1.1"
          transform="rotate(25 6 26)" />

        <Flower5 cx={6} cy={35} size={9} fill={red} core={gld} />

        <circle cx="3.5" cy="44" r="2.6" fill={red} stroke={ink} strokeWidth="1" />
        <circle cx="7.5" cy="42.5" r="2.2" fill={red} stroke={ink} strokeWidth="1" />
        <circle cx="5.5" cy="48" r="2" fill={red} stroke={ink} strokeWidth=".9" />
        <path d="M5,40 C5,42 4,43 3.5,44 M5,40 C5,42 7,42 7.5,42.5 M5,40 L5.5,48"
          fill="none" stroke={grn} strokeWidth=".8" />

        <path d="M20,6 C26,5 30,7 36,6 C42,5 46,7 52,6" fill="none" stroke={grn} strokeWidth=".9" opacity=".7" />

        <path d={bilibinLeaf(20, 6, -4, 6.5)} fill={grn} stroke={ink} strokeWidth="1.1"
          transform="rotate(90 20 6)" />
        <line x1="20" y1="-2" x2="20" y2="6" stroke="#4A8C5C" strokeWidth=".7" />
        <path d={bilibinLeaf(26, 6, -4, 5.5)} fill={grn} stroke={ink} strokeWidth="1.1"
          transform="rotate(90 26 6) rotate(-25 26 6)" />

        <Flower5 cx={35} cy={6} size={9} fill={red} core={gld} />

        <circle cx="44" cy="3.5" r="2.6" fill={red} stroke={ink} strokeWidth="1" />
        <circle cx="42.5" cy="7.5" r="2.2" fill={red} stroke={ink} strokeWidth="1" />
        <circle cx="48" cy="5.5" r="2" fill={red} stroke={ink} strokeWidth=".9" />
        <path d="M40,5 C42,5 43,4 44,3.5 M40,5 C42,5 42,7 42.5,7.5 M40,5 L48,5.5"
          fill="none" stroke={grn} strokeWidth=".8" />

        <path d="M12,18 C11,18 9,17 9,15 C9,13 11,12 12,14 C13,15.5 12,17 11,16.5"
          fill="none" stroke={ink} strokeWidth="1.1" />
        <path d="M18,12 C18,11 17,9 15,9 C13,9 12,11 14,12 C15.5,13 17,12 16.5,11"
          fill="none" stroke={ink} strokeWidth="1.1" />
      </g>
    </svg>
  );
}

/* ── Горизонтальный орнаментальный бордюр — волнистая лоза с цветами ── */
export function BorderVine({ height = 32, className = '', style = {} }:
  { height?: number; className?: string; style?: React.CSSProperties }) {
  const pid = React.useMemo(() => 'vine-' + Math.random().toString(36).slice(2, 8), []);
  const TW = 72, TH = 38, sy = 19;
  return (
    <svg width="100%" height={height} preserveAspectRatio="xMidYMid slice"
      className={className} style={{ display: 'block', overflow: 'visible', ...style }}>
      <defs>
        <pattern id={pid} width={TW} height={TH} patternUnits="userSpaceOnUse">
          <path d={`M0,${sy} C9,${sy - 9} 18,${sy - 9} 27,${sy} C36,${sy + 9} 45,${sy + 9} 54,${sy} C63,${sy - 9} 68,${sy - 8} 72,${sy}`}
            fill="none" stroke="var(--gold-muted)" strokeWidth="1.3" opacity=".65" />

          <g transform={`translate(18 ${sy - 9})`}>
            <path d={bilibinLeaf(0, -1, -12, 6)} fill="#1B4332" stroke="var(--ink)" strokeWidth="1" />
            <line x1="0" y1="-1" x2="0" y2="-11" stroke="#4A8C5C" strokeWidth=".7" />
          </g>
          <g transform={`translate(10 ${sy - 4})`}>
            <path d={bilibinLeafH(0, 0, -10, 4.5)} fill="#1B4332" stroke="var(--ink)" strokeWidth=".9" />
          </g>
          <g transform={`translate(26 ${sy - 5})`}>
            <path d={bilibinLeafH(0, 0, 10, 4.5)} fill="#1B4332" stroke="var(--ink)" strokeWidth=".9"
              transform="scale(-1,1)" />
          </g>

          <g transform={`translate(54 ${sy + 9})`}>
            <path d={bilibinLeaf(0, 12, 1, 6)} fill="#1B4332" stroke="var(--ink)" strokeWidth="1" />
            <line x1="0" y1="2" x2="0" y2="11" stroke="#4A8C5C" strokeWidth=".7" />
          </g>
          <g transform={`translate(46 ${sy + 4})`}>
            <path d={bilibinLeafH(0, 0, -10, 4.5)} fill="#1B4332" stroke="var(--ink)" strokeWidth=".9" />
          </g>
          <g transform={`translate(62 ${sy + 5})`}>
            <path d={bilibinLeafH(0, 0, 10, 4.5)} fill="#1B4332" stroke="var(--ink)" strokeWidth=".9"
              transform="scale(-1,1)" />
          </g>

          <Flower5 cx={36} cy={sy} size={10} fill="#6B1A12" core="var(--gold-muted)" />

          <circle cx="1" cy={sy} r="2.8" fill="#6B1A12" stroke="var(--ink)" strokeWidth="1" />
          <circle cx="71" cy={sy} r="2.8" fill="#6B1A12" stroke="var(--ink)" strokeWidth="1" />

          <circle cx="18" cy={sy - 18} r="1.8" fill="#8B1A1A" stroke="var(--ink)" strokeWidth=".8" />
          <circle cx="54" cy={sy + 18} r="1.8" fill="#8B1A1A" stroke="var(--ink)" strokeWidth=".8" />
        </pattern>
      </defs>
      <rect width="100%" height={TH} y={`${height / 2 - TH / 2}`} fill={`url(#${pid})`} />
    </svg>
  );
}

/* ── Вертикальный орнамент переплёта ── */
export function SpineOrnament({ width = 30, className = '', style = {} }:
  { width?: number; className?: string; style?: React.CSSProperties }) {
  const pid = React.useMemo(() => 'spine-' + Math.random().toString(36).slice(2, 8), []);
  const tw = width, th = 64, cx = width / 2;
  return (
    <svg width={width} height="100%" preserveAspectRatio="none"
      className={className} style={{ display: 'block', overflow: 'visible', ...style }}>
      <defs>
        <pattern id={pid} width={tw} height={th} patternUnits="userSpaceOnUse">
          <path d={`M${cx},0 C${cx * 0.25},16 ${cx * 0.25},16 ${cx},32 C${cx * 1.75},48 ${cx * 1.75},48 ${cx},64`}
            fill="none" stroke="var(--gold-muted)" strokeWidth="1.3" opacity=".6" />
          <path d={`M${cx},0 C${cx * 1.75},16 ${cx * 1.75},16 ${cx},32 C${cx * 0.25},48 ${cx * 0.25},48 ${cx},64`}
            fill="none" stroke="var(--gold-muted)" strokeWidth="1.3" opacity=".6" />
          {[0, 1].map(i => (
            <g key={i} transform={`translate(${cx} ${i === 0 ? 28 : 60})`}>
              {Array.from({ length: 4 }, (_, j) => {
                const a = (j / 4) * Math.PI * 2, px = Math.cos(a) * 4, py = Math.sin(a) * 4;
                return <ellipse key={j} cx={px} cy={py} rx="1.5" ry="2.5"
                  transform={`rotate(${j * 90} ${px} ${py})`}
                  fill="#6B1A12" stroke="var(--ink)" strokeWidth=".7" />;
              })}
              <circle cx="0" cy="0" r="2" fill="#6B1A12" stroke="var(--ink)" strokeWidth=".7" />
              <circle cx="0" cy="0" r=".9" fill="var(--gold-muted)" />
            </g>
          ))}
          <path d={bilibinLeafH(cx, th * 0.16, cx * 0.1, 3.5)} fill="#1B4332" stroke="var(--ink)" strokeWidth=".8" />
          <path d={bilibinLeafH(cx, th * 0.84, cx * 0.1, 3.5)} fill="#1B4332" stroke="var(--ink)" strokeWidth=".8" />
          <path d={bilibinLeafH(cx, th * 0.16, cx * 1.9, 3.5)} fill="#1B4332" stroke="var(--ink)" strokeWidth=".8"
            transform={`scale(-1,1) translate(${-tw} 0)`} />
          <path d={bilibinLeafH(cx, th * 0.84, cx * 1.9, 3.5)} fill="#1B4332" stroke="var(--ink)" strokeWidth=".8"
            transform={`scale(-1,1) translate(${-tw} 0)`} />
        </pattern>
      </defs>
      <rect x="0" y="0" width="100%" height="100%" fill={`url(#${pid})`} />
    </svg>
  );
}

/* ── Медальонная рамка ── */
export function MedallionFrame({ size = 250, color = 'var(--gold-muted)', glow = false, children }:
  { size?: number; color?: string; accent?: string; glow?: boolean; children?: React.ReactNode }) {
  const r = size / 2, N = 20;
  const leaves = Array.from({ length: N }, (_, i) => {
    const a = (i / N) * Math.PI * 2, lr = r - 10, x = r + Math.cos(a) * lr, y = r + Math.sin(a) * lr, deg = (a * 180 / Math.PI) + 90;
    return (
      <g key={i} transform={`translate(${x} ${y}) rotate(${deg})`} opacity={i % 2 ? 0.5 : 0.9}>
        <path d={bilibinLeaf(0, 0, -9, 4)} fill="var(--gold-muted)" stroke="var(--ink)" strokeWidth=".9" />
      </g>
    );
  });
  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <div style={{
        position: 'absolute', inset: 14, borderRadius: '50%', overflow: 'hidden',
        boxShadow: glow ? `0 0 28px rgba(107,26,18,.55),inset 0 0 0 1px rgba(26,15,0,.4)` : 'inset 0 0 0 1px rgba(26,15,0,.4)',
        background: 'var(--parchment-dark)',
      }}>
        {children}
      </div>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ position: 'absolute', inset: 0, overflow: 'visible' }}>
        <circle cx={r} cy={r} r={r - 1} fill="none" stroke="#6B1A12" strokeWidth="2.2" opacity=".85" />
        <circle cx={r} cy={r} r={r - 7} fill="none" stroke={color} strokeWidth="1.1" opacity=".7" />
        <circle cx={r} cy={r} r={r - 13} fill="none" stroke="var(--ink)" strokeWidth=".7" opacity=".3" />
        {leaves}
        {[0, 90, 180, 270].map((d, i) => {
          const a = d * Math.PI / 180, x = r + Math.cos(a) * (r - 1), y = r + Math.sin(a) * (r - 1);
          return <path key={i} d={`M${x},${y - 4} l4,4 l-4,4 l-4,-4 Z`} fill="#6B1A12" stroke="var(--ink)" strokeWidth=".9" />;
        })}
      </svg>
    </div>
  );
}

/* ── Гербовый щит ── */
export function HeraldicBadge({ color = 'var(--gold-muted)', label, size = 18, withLabel = true, title }:
  { color?: string; label: string; size?: number; withLabel?: boolean; title?: string }) {
  const w = size, h = size * 1.18;
  return (
    <span title={title || label} style={{ display: 'inline-flex', alignItems: 'center', gap: 7, lineHeight: 1 }}>
      <svg width={w} height={h} viewBox="0 0 40 48" style={{ display: 'block', flexShrink: 0 }}>
        <path d="M4,5 H36 V25 C36,37 28,43 20,46.5 C12,43 4,37 4,25 Z"
          fill={color} fillOpacity=".9" stroke="var(--ink)" strokeWidth="1.6" />
        <path d="M9,10 H31 V24 C31,33 24,38 20,40 C16,38 9,33 9,24 Z"
          fill="none" stroke="rgba(245,240,232,.3)" strokeWidth=".8" />
        {[0, 90, 180, 270].map((d, i) => {
          const a = d * Math.PI / 180, px = 20 + Math.cos(a) * 5, py = 22 + Math.sin(a) * 5;
          return <ellipse key={i} cx={px} cy={py} rx="2.2" ry="3.5"
            transform={`rotate(${d} ${px} ${py})`} fill="#F5F0E8" fillOpacity=".85" />;
        })}
        <circle cx="20" cy="22" r="2.5" fill="#F5F0E8" fillOpacity=".9" />
      </svg>
      {withLabel && (
        <span className="f-cormorant-sc" style={{ color, fontSize: Math.max(12, size * 0.62), fontWeight: 600, letterSpacing: '.12em', textTransform: 'uppercase' }}>
          {label}
        </span>
      )}
    </span>
  );
}

/* ── Многополосная рамка модала ── */
export function ModalFrame() {
  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 30 }}>
      <div style={{ position: 'absolute', inset: 0, boxShadow: 'inset 0 0 0 2.5px var(--ink)' }} />
      <div style={{ position: 'absolute', inset: '3px', boxShadow: 'inset 0 0 0 11px var(--slate)' }} />
      <div style={{ position: 'absolute', inset: '14px', boxShadow: 'inset 0 0 0 1.5px var(--gold-muted)', opacity: .9 }} />
      <div style={{ position: 'absolute', inset: '16px', boxShadow: 'inset 0 0 0 7px #6B1A12' }} />
      <div style={{ position: 'absolute', inset: '23px', boxShadow: 'inset 0 0 0 1.5px var(--gold-muted)', opacity: .78 }} />
      <div style={{ position: 'absolute', inset: '25px', boxShadow: 'inset 0 0 0 5px #162E20' }} />
      <div style={{ position: 'absolute', inset: '30px', boxShadow: 'inset 0 0 0 1px var(--gold-muted)', opacity: .55 }} />
    </div>
  );
}

/* ── Рамка страницы ── */
export function PageBorder() {
  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 4 }}>
      <div style={{ position: 'absolute', inset: 0, boxShadow: 'inset 0 0 0 2.5px var(--ink)' }} />
      <div style={{ position: 'absolute', inset: '3px', boxShadow: 'inset 0 0 0 11px var(--slate)' }} />
      <div style={{ position: 'absolute', inset: '14px', boxShadow: 'inset 0 0 0 1.5px var(--gold-muted)', opacity: .95 }} />
      <div style={{ position: 'absolute', inset: '16px', boxShadow: 'inset 0 0 0 8px #6B1A12' }} />
      <div style={{ position: 'absolute', inset: '24px', boxShadow: 'inset 0 0 0 1.5px var(--gold-muted)', opacity: .8 }} />
      <div style={{ position: 'absolute', inset: '26px', boxShadow: 'inset 0 0 0 5px #162E20' }} />
      <div style={{ position: 'absolute', inset: '31px', boxShadow: 'inset 0 0 0 1px var(--gold-muted)', opacity: .6 }} />
      <div style={{ position: 'absolute', top: 3, left: 52, right: 52, height: 8, overflow: 'hidden', opacity: .58 }}>
        <BorderVine height={8} />
      </div>
      <div style={{ position: 'absolute', bottom: 3, left: 52, right: 52, height: 8, overflow: 'hidden', opacity: .58 }}>
        <BorderVine height={8} />
      </div>
      <div style={{ position: 'absolute', top: 1, left: 1 }}><CornerOrnament size={54} orient="tl" /></div>
      <div style={{ position: 'absolute', top: 1, right: 1 }}><CornerOrnament size={54} orient="tr" /></div>
      <div style={{ position: 'absolute', bottom: 1, left: 1 }}><CornerOrnament size={54} orient="bl" /></div>
      <div style={{ position: 'absolute', bottom: 1, right: 1 }}><CornerOrnament size={54} orient="br" /></div>
    </div>
  );
}

/* ── Тонкая рамка разворота (страницы с сеткой трав) ── */
export function SpreadBorder() {
  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 4 }}>
      <div style={{ position: 'absolute', inset: 0, boxShadow: 'inset 0 0 0 2px var(--ink)' }} />
      <div style={{ position: 'absolute', inset: '2px', boxShadow: 'inset 0 0 0 9px var(--slate)' }} />
      <div style={{ position: 'absolute', inset: '11px', boxShadow: 'inset 0 0 0 1.5px var(--gold-muted)', opacity: .92 }} />
      <div style={{ position: 'absolute', inset: '13px', boxShadow: 'inset 0 0 0 6px #6B1A12' }} />
      <div style={{ position: 'absolute', inset: '19px', boxShadow: 'inset 0 0 0 1.5px var(--gold-muted)', opacity: .75 }} />
      <div style={{ position: 'absolute', inset: '21px', boxShadow: 'inset 0 0 0 4px #162E20' }} />
      <div style={{ position: 'absolute', inset: '25px', boxShadow: 'inset 0 0 0 0.8px var(--gold-muted)', opacity: .5 }} />
      <div style={{ position: 'absolute', top: 0, left: 0 }}><CornerOrnament size={48} orient="tl" /></div>
      <div style={{ position: 'absolute', top: 0, right: 0 }}><CornerOrnament size={48} orient="tr" /></div>
      <div style={{ position: 'absolute', bottom: 0, left: 0 }}><CornerOrnament size={48} orient="bl" /></div>
      <div style={{ position: 'absolute', bottom: 0, right: 0 }}><CornerOrnament size={48} orient="br" /></div>
    </div>
  );
}

/* ── Простой тонкий делитель: линия + ромб ── */
export function HairDivider({ width = 200, color = 'var(--gold-muted)', flip = false }:
  { width?: number | string; color?: string; flip?: boolean }) {
  return (
    <svg width={width} height="11" viewBox="0 0 200 11"
      style={{ color, display: 'block', overflow: 'visible', transform: flip ? 'scaleY(-1)' : 'none' }}>
      <line x1="2" y1="5.5" x2="86" y2="5.5" stroke="currentColor" strokeWidth="1" opacity=".55" />
      <line x1="114" y1="5.5" x2="198" y2="5.5" stroke="currentColor" strokeWidth="1" opacity=".55" />
      <path d="M100,0.5 l5,5 l-5,5 l-5,-5 Z" fill="currentColor" opacity=".75" />
      <circle cx="100" cy="5.5" r="1.6" fill="var(--parchment)" />
    </svg>
  );
}

/* ── Горизонтальный разделитель с ромбом ── */
export function FloralDivider({ width = 200, flip = false, color = 'var(--gold-muted)' }:
  { width?: number | string; flip?: boolean; color?: string }) {
  return (
    <svg width={width} height="20" viewBox="0 0 200 20"
      style={{ color, display: 'block', overflow: 'visible', transform: flip ? 'scaleY(-1)' : 'none' }}>
      <g stroke="currentColor" fill="none" strokeLinecap="round">
        <path d="M2,10 H66" strokeWidth="1.3" opacity=".5" />
        <path d="M134,10 H198" strokeWidth="1.3" opacity=".5" />
        <path d="M66,10 Q74,3 80,10 Q74,17 66,10 Z" fill="currentColor" opacity=".38" />
        <path d="M134,10 Q126,3 120,10 Q126,17 134,10 Z" fill="currentColor" opacity=".38" />
        <path d="M100,3 l6,7 l-6,7 l-6,-7 Z" fill="currentColor" opacity=".65" />
        <circle cx="100" cy="10" r="2.2" fill="var(--parchment)" stroke="none" />
        <circle cx="54" cy="10" r="1.6" fill="currentColor" stroke="none" opacity=".55" />
        <circle cx="146" cy="10" r="1.6" fill="currentColor" stroke="none" opacity=".55" />
      </g>
    </svg>
  );
}

/* ── Ключ ── */
export function KeyIcon({ size = 20, style = {} }: { size?: number; style?: React.CSSProperties }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ display: 'block', ...style }}
      stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="7.5" cy="7.5" r="4.5" />
      <path d="M7.5 4.8V10.2M4.8 7.5H10.2" strokeWidth="1" opacity=".7" />
      <path d="M10.8 10.8 L20 20" />
      <path d="M16.5 16.5L19 14 M19 19L21.5 16.5" />
    </svg>
  );
}

/* ── Навигационная кнопка-щит ── */
export function NavShield({ dir = 'next', disabled = false, onClick }:
  { dir?: 'next' | 'prev'; disabled?: boolean; onClick?: () => void }) {
  const w = 58, h = 86;
  return (
    <button onClick={onClick} disabled={disabled}
      aria-label={dir === 'next' ? 'Вперёд' : 'Назад'}
      style={{
        flexShrink: 0, width: w, height: h, background: 'none', border: 'none',
        opacity: disabled ? 0 : 1, pointerEvents: disabled ? 'none' : 'auto',
        color: 'var(--gold-muted)', transition: 'transform .2s, filter .2s',
        filter: 'drop-shadow(0 4px 12px rgba(0,0,0,.65))',
      }}
      onMouseEnter={e => !disabled && (e.currentTarget.style.transform = dir === 'next' ? 'translateX(4px)' : 'translateX(-4px)')}
      onMouseLeave={e => (e.currentTarget.style.transform = 'none')}>
      <svg width={w} height={h} viewBox="0 0 58 86" style={{ display: 'block', overflow: 'visible' }}>
        <path d="M5,5 H53 V54 C53,70 40,78 29,82 C18,78 5,70 5,54 Z"
          fill="#0c1220" stroke="currentColor" strokeWidth="2" />
        <path d="M8,8 H50 V54 C50,68.5 38.5,75.5 29,79 C19.5,75.5 8,68.5 8,54 Z"
          fill="none" stroke="var(--slate)" strokeWidth="1.6" opacity=".8" />
        <path d="M11,11 H47 V53.5 C47,65.5 37,72 29,75.5 C21,72 11,65.5 11,53.5 Z"
          fill="none" stroke="#6B1A12" strokeWidth="2" />
        <path d="M14,14 H44 V52.5 C44,63 35,68.5 29,72 C23,68.5 14,63 14,52.5 Z"
          fill="none" stroke="currentColor" strokeWidth=".8" opacity=".35" />
        <g stroke="currentColor" fill="none" strokeWidth="3"
          strokeLinecap="round" strokeLinejoin="round" opacity=".95">
          {dir === 'next' ? <path d="M24,30 L35,42 L24,54" /> : <path d="M35,30 L24,42 L35,54" />}
        </g>
      </svg>
    </button>
  );
}

/* ── Славянский цветок для обложки ── */
export function SlavicFlower({ size = 220, style = {} }: { size?: number; style?: React.CSSProperties }) {
  const cx = size / 2, cy = size * 0.52, r = size * 0.26;
  const grn = '#1B4332', red = '#8B1A1A', dred = '#6B1A12', ink = 'var(--ink)', gld = 'var(--gold-muted)';
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}
      style={{ display: 'block', overflow: 'visible', ...style }}>
      <line x1={cx} y1={cy + r * 0.2} x2={cx} y2={size * 0.94} stroke={grn} strokeWidth={size * 0.026} />
      {[-1, 1].map((d, i) => (
        <g key={i} transform={`translate(${cx + d * size * 0.04} ${cy + r * 0.52}) rotate(${d * 32})`}>
          <path d={bilibinLeaf(0, size * 0.16, -size * 0.02, size * 0.06)} fill={grn} stroke={ink} strokeWidth="1.4" />
          <line x1="0" y1={-size * 0.01} x2="0" y2={size * 0.14} stroke="#4A8C5C" strokeWidth=".9" />
        </g>
      ))}
      {[-1, 1].map((d, i) => (
        <g key={i} transform={`translate(${cx} ${cy + r * 0.75})`}>
          <path d={`M0,0 C${d * size * 0.04},${-size * 0.02} ${d * size * 0.1},${-size * 0.04} ${d * size * 0.12},${-size * 0.06}`}
            fill="none" stroke={grn} strokeWidth="1.4" />
          <circle cx={d * size * 0.13} cy={-size * 0.07} r={size * 0.025} fill={red} stroke={ink} strokeWidth="1" />
        </g>
      ))}
      {Array.from({ length: 8 }, (_, i) => (
        <g key={i} transform={`rotate(${i * 45} ${cx} ${cy})`}>
          <path d={bilibinLeaf(cx, cy + r * 0.18, cy - r * 0.9, r * 0.28)} fill={dred} stroke={ink} strokeWidth="1.5" />
          <line x1={cx} y1={cy + r * 0.1} x2={cx} y2={cy - r * 0.88} stroke="#C05050" strokeWidth=".8" />
        </g>
      ))}
      {Array.from({ length: 8 }, (_, i) => (
        <g key={i} transform={`rotate(${i * 45 + 22.5} ${cx} ${cy})`}>
          <path d={bilibinLeaf(cx, cy + r * 0.12, cy - r * 0.65, r * 0.14)} fill={red} stroke={ink} strokeWidth="1.1" />
        </g>
      ))}
      <circle cx={cx} cy={cy} r={r * 0.28} fill={gld} stroke={ink} strokeWidth="1.6" />
      <circle cx={cx} cy={cy} r={r * 0.18} fill="#D4A820" stroke={ink} strokeWidth="1" />
      {Array.from({ length: 10 }, (_, i) => {
        const a = (i / 10) * Math.PI * 2, px = cx + Math.cos(a) * r * 0.22, py = cy + Math.sin(a) * r * 0.22;
        return <circle key={i} cx={px} cy={py} r={r * 0.035} fill={ink} />;
      })}
      <circle cx={cx} cy={cy} r={r * 0.09} fill="#F2C040" />
    </svg>
  );
}

/* ── Бегунок: зигзаг-орнамент для разворотов ── */
export function SpreadDivider({ height = 22, className = '', style = {} }:
  { height?: number; className?: string; style?: React.CSSProperties }) {
  const pid = React.useMemo(() => 'sd-' + Math.random().toString(36).slice(2, 8), []);
  const TW = 32, TH = 22, cy = 11, amp = 6;
  return (
    <svg width="100%" height={height} className={className}
      style={{ display: 'block', overflow: 'visible', ...style }}>
      <defs>
        <pattern id={pid} width={TW} height={TH} patternUnits="userSpaceOnUse">
          <line x1="0" y1={cy - amp - 1.5} x2={TW} y2={cy - amp - 1.5} stroke="var(--gold-muted)" strokeWidth=".5" opacity=".35" />
          <line x1="0" y1={cy + amp + 1.5} x2={TW} y2={cy + amp + 1.5} stroke="var(--gold-muted)" strokeWidth=".5" opacity=".35" />
          <polyline points={`0,${cy} ${TW / 4},${cy - amp} ${TW / 2},${cy} ${3 * TW / 4},${cy + amp} ${TW},${cy}`}
            fill="none" stroke="#6B1A12" strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round" />
          <circle cx={TW / 4} cy={cy - amp} r="2.5" fill="#6B1A12" stroke="var(--ink)" strokeWidth="1" />
          <circle cx={3 * TW / 4} cy={cy + amp} r="2.5" fill="#6B1A12" stroke="var(--ink)" strokeWidth="1" />
          <path d={`M${TW / 2},${cy - 2.2} l2.2,2.2 l-2.2,2.2 l-2.2,-2.2 Z`} fill="var(--gold-muted)" />
          <path d={`M0,${cy - 2.2} l2.2,2.2 l-2.2,2.2 l-2.2,-2.2 Z`} fill="var(--gold-muted)" />
          <path d="M5,4 l2,-2 l2,2 Z" fill="#1B4332" opacity=".75" />
          <path d="M21,18 l2,2 l2,-2 Z" fill="#1B4332" opacity=".75" />
        </pattern>
      </defs>
      <rect width="100%" height={height} fill={`url(#${pid})`} />
    </svg>
  );
}

/* ── Вертикальный разделитель для модала ── */
export function ModalSpine({ width = 28 }: { width?: number }) {
  const cx = width / 2;
  return (
    <svg width={width} height="100%" viewBox={`0 0 ${width} 480`}
      preserveAspectRatio="xMidYMid slice" style={{ display: 'block' }}>
      <line x1={cx} y1="0" x2={cx} y2="480" stroke="var(--gold-muted)" strokeWidth=".7" opacity=".45" />
      {Array.from({ length: 10 }, (_, i) => {
        const y = 24 + i * 45;
        return (
          <g key={i} transform={`translate(${cx} ${y})`}>
            <path d="M0,-5.5 l5.5,5.5 l-5.5,5.5 l-5.5,-5.5 Z" fill="#6B1A12" stroke="var(--ink)" strokeWidth="1" />
            <path d="M0,-2.8 l2.8,2.8 l-2.8,2.8 l-2.8,-2.8 Z" fill="var(--gold-muted)" />
          </g>
        );
      })}
      {Array.from({ length: 9 }, (_, i) => {
        const y = 46 + i * 45;
        return (
          <g key={i} transform={`translate(${cx} ${y})`}>
            <path d={bilibinLeafH(0, 0, -9, 3.5)} fill="#1B4332" stroke="var(--ink)" strokeWidth=".8" />
            <path d={bilibinLeafH(0, 0, 9, 3.5)} fill="#1B4332" stroke="var(--ink)" strokeWidth=".8"
              transform="scale(-1,1)" />
          </g>
        );
      })}
    </svg>
  );
}

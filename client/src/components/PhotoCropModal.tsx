import { useState, useRef, useCallback, useEffect } from 'react';

interface Props {
  src: string;
  onApply: (blob: Blob) => void;
  onCancel: () => void;
}

export function PhotoCropModal({ src, onApply, onCancel }: Props) {
  const SV = 320, OUT = 720;
  const [dim, setDim] = useState<{ w: number; h: number } | null>(null);
  const [zoom, setZoom] = useState(1);
  const [off, setOff] = useState({ x: 0, y: 0 });
  const drag = useRef<{ px: number; py: number; ox: number; oy: number } | null>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  const baseCover = dim ? Math.max(SV / dim.w, SV / dim.h) : 1;
  const dispScale = baseCover * zoom;
  const dispW = dim ? dim.w * dispScale : 0;
  const dispH = dim ? dim.h * dispScale : 0;

  const clamp = useCallback((o: { x: number; y: number }) => {
    const maxX = Math.max(0, (dispW - SV) / 2), maxY = Math.max(0, (dispH - SV) / 2);
    return { x: Math.max(-maxX, Math.min(maxX, o.x)), y: Math.max(-maxY, Math.min(maxY, o.y)) };
  }, [dispW, dispH]);

  useEffect(() => { setOff(o => clamp(o)); }, [zoom, dim, clamp]);
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onCancel(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [onCancel]);

  const onDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = { px: e.clientX, py: e.clientY, ox: off.x, oy: off.y };
  };
  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!drag.current) return;
    setOff(clamp({ x: drag.current.ox + (e.clientX - drag.current.px), y: drag.current.oy + (e.clientY - drag.current.py) }));
  };
  const onUp = () => { drag.current = null; };

  const apply = () => {
    if (!dim || !imgRef.current) return;
    const k = OUT / SV;
    const c = document.createElement('canvas');
    c.width = OUT; c.height = OUT;
    const ctx = c.getContext('2d')!;
    ctx.fillStyle = '#000'; ctx.fillRect(0, 0, OUT, OUT);
    const imgLeft = SV / 2 - dispW / 2 + off.x;
    const imgTop = SV / 2 - dispH / 2 + off.y;
    ctx.drawImage(imgRef.current, imgLeft * k, imgTop * k, dispW * k, dispH * k);
    c.toBlob(blob => { if (blob) onApply(blob); }, 'image/jpeg', 0.9);
  };

  return (
    <div onClick={onCancel} className="overlay-in" style={{
      position: 'fixed', inset: 0, zIndex: 260,
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
      background: 'rgba(8,6,3,.85)', backdropFilter: 'blur(4px)',
    }}>
      <div onClick={e => e.stopPropagation()} className="modal-pop" style={{
        position: 'relative', width: 'min(92vw,400px)',
        background: '#140d04',
        boxShadow: '0 40px 90px rgba(0,0,0,.7)',
        color: 'var(--gold-muted)', padding: '30px 30px 26px',
      }}>
        <div style={{ position: 'absolute', inset: 0, boxShadow: 'inset 0 0 0 2px var(--ink)' }} />
        <div style={{ position: 'absolute', inset: '3px', boxShadow: 'inset 0 0 0 7px #6B1A12' }} />
        <div style={{ position: 'absolute', inset: '10px', boxShadow: 'inset 0 0 0 1px var(--gold-muted)', opacity: .6 }} />

        <div style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <h3 className="f-philosopher" style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>Кадрирование фото</h3>
          <p className="f-italic" style={{ fontSize: 14, opacity: .6, marginBottom: 16, textAlign: 'center' }}>
            Перетащите изображение и приблизьте, чтобы выстроить кадр
          </p>

          <div
            onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp}
            style={{
              width: SV, height: SV, position: 'relative', overflow: 'hidden',
              background: '#000', cursor: drag.current ? 'grabbing' : 'grab',
              touchAction: 'none',
              boxShadow: `0 0 0 1.5px var(--ink), 0 0 0 4px var(--gold-muted)`,
            }}>
            <img ref={imgRef} src={src} alt="" draggable={false}
              onLoad={e => setDim({ w: e.currentTarget.naturalWidth, h: e.currentTarget.naturalHeight })}
              style={{
                position: 'absolute', left: '50%', top: '50%',
                width: dispW || 'auto', height: dispH || 'auto',
                transform: `translate(-50%,-50%) translate(${off.x}px,${off.y}px)`,
                userSelect: 'none', pointerEvents: 'none', display: 'block',
              }} />
            <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', boxShadow: 'inset 0 0 0 1px rgba(255,255,255,.25)' }} />
          </div>

          <div style={{ width: SV, display: 'flex', alignItems: 'center', gap: 11, marginTop: 18 }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7" /><line x1="11" y1="8" x2="11" y2="14" /><line x1="8" y1="11" x2="14" y2="11" /><line x1="21" y1="21" x2="16.5" y2="16.5" /></svg>
            <input type="range" min="1" max="3" step="0.01" value={zoom}
              onChange={e => setZoom(parseFloat(e.target.value))}
              style={{ flex: 1, accentColor: 'var(--gold-muted)' }} />
          </div>

          <div style={{ width: SV, display: 'flex', gap: 12, marginTop: 20 }}>
            <button type="button" onClick={onCancel} className="f-cormorant-sc" style={{
              flex: 1, padding: '12px', fontSize: 14, letterSpacing: '.1em',
              textTransform: 'uppercase', fontWeight: 600, background: 'none',
              border: '1.5px solid rgba(184,134,11,.35)', color: 'var(--gold-muted)', opacity: .8, cursor: 'pointer',
            }}>Отмена</button>
            <button type="button" onClick={apply} disabled={!dim} className="f-cormorant-sc" style={{
              flex: 1, padding: '12px', fontSize: 14, letterSpacing: '.1em',
              textTransform: 'uppercase', fontWeight: 600,
              background: 'var(--gold-muted)', border: 'none', color: 'var(--ink)', cursor: 'pointer',
            }}>Применить</button>
          </div>
        </div>
      </div>
    </div>
  );
}

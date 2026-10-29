import { useEffect } from 'react';
import { Herb, RARITY_COLORS, RARITY_LABELS } from '../types';
import { PlantGlyph } from './ui';
import { ModalFrame, ModalSpine, FloralDivider, HeraldicBadge } from './ornaments';
import { CloseMedallion, SectionHeading } from './panels';

const API_URL = import.meta.env.VITE_API_URL || '';

interface Props {
  herb: Herb;
  onClose: () => void;
}

export function HerbDetailModal({ herb, onClose }: Props) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const color = RARITY_COLORS[herb.rarity];
  const imageUrl = herb.imageUrl ? `${API_URL}${herb.imageUrl}` : null;

  return (
    <div onClick={onClose} className="overlay-in" style={{
      position: 'fixed', inset: 0, zIndex: 200,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 32,
      background: 'rgba(8,11,18,.8)',
      backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)',
    }}>
      <div onClick={e => e.stopPropagation()} className="modal-pop" style={{
        position: 'relative', width: '100%', maxWidth: 920,
        maxHeight: '88vh', display: 'flex',
        background: 'var(--birch)',
        boxShadow: '0 50px 100px rgba(0,0,0,.8), inset 0 0 0 1px rgba(26,15,0,.15)',
      }}>
        <ModalFrame />
        <CloseMedallion onClick={onClose} />

        <div style={{
          flex: '0 0 42%', minWidth: 0,
          padding: '54px 28px 48px',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          gap: 18, position: 'relative', zIndex: 10,
        }}>
          <div style={{
            width: 236, height: 236, flexShrink: 0,
            padding: 7, background: 'var(--parchment)',
            boxShadow: `0 0 0 1.5px var(--ink), 0 0 0 5px ${color}, 0 0 0 6.5px var(--ink), 0 10px 26px rgba(0,0,0,.4)`,
          }}>
            <div style={{
              width: '100%', height: '100%', overflow: 'hidden',
              background: imageUrl ? '#000' : 'radial-gradient(circle at 50% 38%,#fbf5e6,#e8d9b8)',
              boxShadow: `inset 0 0 0 1px ${color}88`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {imageUrl
                ? <img src={imageUrl} alt={herb.name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                : <PlantGlyph rarity={herb.rarity} size={150} />}
            </div>
          </div>

          <h2 className="f-philosopher" style={{ color: 'var(--ink)', fontSize: 29, fontWeight: 700, textAlign: 'center', lineHeight: 1.12 }}>{herb.name}</h2>

          <div style={{ color, display: 'flex', justifyContent: 'center' }}>
            <FloralDivider width={180} color={color} />
          </div>
          <HeraldicBadge color={color} label={RARITY_LABELS[herb.rarity]} size={22} />
        </div>

        <div style={{ flexShrink: 0, width: 28, color: 'var(--gold-muted)', alignSelf: 'stretch', margin: '14px 0', position: 'relative', zIndex: 10 }}>
          <ModalSpine width={28} />
        </div>

        <div style={{ flex: 1, minWidth: 0, padding: '52px 40px 48px 16px', overflowY: 'auto', position: 'relative', zIndex: 10 }}>
          <SectionHeading title="ОПИСАНИЕ" color={color} />
          <div style={{ color: 'var(--ink)', fontSize: 18.5, lineHeight: 1.72, textAlign: 'justify', marginBottom: 30, overflowWrap: 'break-word', hyphens: 'auto' }} lang="ru">
            {(herb.description || 'Описание отсутствует.').split('\n').map((line, i) => (
              <p key={i} className={i === 0 ? 'f-prose drop-cap' : 'f-prose'} style={{ marginBottom: line ? 10 : 0 }}>
                {line || ' '}
              </p>
            ))}
          </div>

          <SectionHeading title="ЭФФЕКТЫ" color={color} />
          <div style={{ padding: '17px 20px', background: 'var(--parchment-dark)', boxShadow: `inset 0 0 0 1px ${color}33`, borderLeft: `3.5px solid ${color}66` }}>
            <span className="f-prose" style={{ color: 'var(--ink)', fontSize: 17.5, fontWeight: 700, lineHeight: 1.72, display: 'block', overflowWrap: 'break-word', hyphens: 'auto' }} lang="ru">
              {herb.effects || 'Эффекты не описаны.'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

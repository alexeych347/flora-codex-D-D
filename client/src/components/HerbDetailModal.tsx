import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Herb, RARITY_COLORS, RARITY_LABELS, Rarity } from '../types';
import { NavArrow, PlantGlyph } from './ui';
import { ModalFrame, ModalSpine, FloralDivider, HeraldicBadge } from './ornaments';
import { CloseMedallion, SectionHeading } from './panels';
import { usePagedFlow } from '../hooks/usePagedFlow';

const API_URL = import.meta.env.VITE_API_URL || '';

interface Props {
  herb: Herb;
  onClose: () => void;
  isMobile?: boolean;
}

export function HerbDetailModal({ herb, onClose, isMobile = false }: Props) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const color = RARITY_COLORS[herb.rarity];
  const imageUrl = herb.imageUrl ? `${API_URL}${herb.imageUrl}` : null;

  if (isMobile) {
    return <HerbPages herb={herb} onClose={onClose} color={color} imageUrl={imageUrl} />;
  }

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

          <h2 className="f-philosopher" style={{ color: 'var(--ink)', fontSize: 29, fontWeight: 700, textAlign: 'center', lineHeight: 1.12, overflowWrap: 'anywhere' }}>{herb.name}</h2>

          <div style={{ color, display: 'flex', justifyContent: 'center' }}>
            <FloralDivider width={180} color={color} />
          </div>
          <HeraldicBadge color={color} label={RARITY_LABELS[herb.rarity]} size={22} />
        </div>

        <div style={{ flexShrink: 0, width: 28, color: 'var(--gold-muted)', alignSelf: 'stretch', margin: '14px 0', position: 'relative', zIndex: 10 }}>
          <ModalSpine width={28} />
        </div>

        <div style={{
          flex: 1, minWidth: 0,
          padding: '52px 40px 48px 16px',
          overflowY: 'auto',
          position: 'relative', zIndex: 10,
        }}>
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

/* ===========================================================================
   Мобильное окно травы: постраничный режим вместо внутренней прокрутки.
   =========================================================================== */

const PAD = 36;       // больше толщины ModalFrame (31 px) — правило Frame-Clearance
const HEAD_H = 56;    // полоса с медальоном и компактной шапкой
const FOOT_H = 52;    // счётчик и стрелки; высота постоянна, чтобы не пересчитывать страницы

function MiniPlate({ imageUrl, rarity, color }:
  { imageUrl: string | null; rarity: Rarity; color: string }) {
  return (
    <div style={{
      width: 38, height: 38, flexShrink: 0, overflow: 'hidden',
      background: imageUrl ? '#000' : 'var(--parchment)',
      boxShadow: `0 0 0 1px var(--ink), 0 0 0 3px ${color}`,
    }}>
      {imageUrl
        ? <img src={imageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
        : <div style={{ height: '100%', display: 'grid', placeItems: 'center' }}>
            <PlantGlyph rarity={rarity} size={24} />
          </div>}
    </div>
  );
}

function HerbPages({ herb, onClose, color, imageUrl }:
  { herb: Herb; onClose: () => void; color: string; imageUrl: string | null }) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const flowRef = useRef<HTMLDivElement>(null);
  const { page, total, ready, offset, pageHeight, canPrev, canNext, toPrev, toNext } =
    usePagedFlow(viewportRef, flowRef, herb.id);

  // Свайп листает страницы окна. Книга под ним не листается: окно лежит
  // отдельным fixed-поддеревом, и жест до её обработчика не доходит.
  const handlePanEnd = (_e: unknown, info: { offset: { x: number } }) => {
    if (Math.abs(info.offset.x) < 60) return;
    if (info.offset.x < 0) toNext(); else toPrev();
  };

  return (
    <div onClick={onClose} className="overlay-in" style={{
      position: 'fixed', inset: 0, zIndex: 200,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 12,
      background: 'rgba(8,11,18,.8)',
      backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)',
    }}>
      <div onClick={e => e.stopPropagation()} className="modal-pop" style={{
        position: 'relative', width: '100%', maxWidth: 560, height: '92%',
        display: 'flex', flexDirection: 'column',
        background: 'var(--birch)',
        boxShadow: '0 50px 100px rgba(0,0,0,.8), inset 0 0 0 1px rgba(26,15,0,.15)',
      }}>
        <ModalFrame />

        <div style={{
          position: 'relative', zIndex: 10, flex: 1, minHeight: 0,
          display: 'flex', flexDirection: 'column', padding: PAD,
        }}>
          {/* Шапка: со второй страницы — уменьшенная иллюстрация и название */}
          <div style={{ flexShrink: 0, height: HEAD_H, display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
            {page > 0 && (
              <>
                <MiniPlate imageUrl={imageUrl} rarity={herb.rarity} color={color} />
                <span className="f-philosopher" style={{
                  color: 'var(--ink)', fontSize: 16, fontWeight: 700, minWidth: 0,
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>{herb.name}</span>
              </>
            )}
            <span style={{ marginLeft: 'auto', display: 'flex' }}>
              <CloseMedallion onClick={onClose} isMobile />
            </span>
          </div>

          {/* Окно страницы: поток один, страница — его сдвиг */}
          <motion.div
            ref={viewportRef}
            data-pager-viewport
            onPanEnd={handlePanEnd}
            style={{
              flex: 1, minHeight: 0, overflow: 'hidden', position: 'relative',
              opacity: ready ? 1 : 0, transition: 'opacity .15s',
            }}
          >
            <div style={{ height: pageHeight ?? '100%', overflow: 'hidden' }}>
            <div ref={flowRef} data-pager-flow style={{
              transform: `translateY(${-offset}px)`,
              transition: 'transform .32s cubic-bezier(.4,0,.2,1)',
            }}>
              {/* Блок 1 — иллюстрация, название, редкость. Не делится.
                  paddingTop — чтобы окно страницы (overflow: hidden) не срезало
                  внешние кольца плиты (6.5 px) и её тень. */}
              <div data-block data-atomic style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                gap: 13, paddingTop: 14, paddingBottom: 22,
              }}>
                <div style={{
                  width: 196, maxWidth: '100%', aspectRatio: '1', flexShrink: 0,
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
                      : <PlantGlyph rarity={herb.rarity} size={130} />}
                  </div>
                </div>

                <h2 className="f-philosopher" style={{ color: 'var(--ink)', fontSize: 24, fontWeight: 700, textAlign: 'center', lineHeight: 1.12, overflowWrap: 'anywhere' }}>{herb.name}</h2>

                <div style={{ color, display: 'flex', justifyContent: 'center' }}>
                  <FloralDivider width={180} color={color} />
                </div>
                <HeraldicBadge color={color} label={RARITY_LABELS[herb.rarity]} size={22} />
              </div>

              {/* Блок 2 — описание */}
              <div data-block style={{ paddingBottom: 22 }}>
                <div data-keep-next><SectionHeading title="ОПИСАНИЕ" color={color} /></div>
                <div style={{ color: 'var(--ink)', fontSize: 17, lineHeight: 1.72, textAlign: 'left', overflowWrap: 'break-word', hyphens: 'auto' }} lang="ru">
                  {(herb.description || 'Описание отсутствует.').split('\n').map((line, i) => (
                    <p key={i} className={i === 0 ? 'f-prose drop-cap' : 'f-prose'} style={{ marginBottom: line ? 10 : 0 }}>
                      {line || ' '}
                    </p>
                  ))}
                </div>
              </div>

              {/* Блок 3 — эффекты */}
              <div data-block>
                <div data-keep-next><SectionHeading title="ЭФФЕКТЫ" color={color} /></div>
                <div style={{ padding: '17px 20px', background: 'var(--parchment-dark)', boxShadow: `inset 0 0 0 1px ${color}33`, borderLeft: `3.5px solid ${color}66` }}>
                  <span className="f-prose" style={{ color: 'var(--ink)', fontSize: 16.5, fontWeight: 700, lineHeight: 1.72, display: 'block', overflowWrap: 'break-word', hyphens: 'auto' }} lang="ru">
                    {herb.effects || 'Эффекты не описаны.'}
                  </span>
                </div>
              </div>
            </div>
            </div>
          </motion.div>

          {/* Подвал: счётчик и стрелки. Рендерится всегда — от его высоты
              зависит высота страницы, и она не должна меняться после замера. */}
          <div style={{
            flexShrink: 0, height: FOOT_H,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14,
          }}>
            <NavArrow dir="prev" enabled={canPrev} onClick={toPrev} isMobile />
            <span className="f-italic" aria-live="polite" style={{
              color: 'var(--ink-soft)', fontSize: 15, opacity: .75,
              minWidth: 58, textAlign: 'center',
            }}>{page + 1} / {total}</span>
            <NavArrow dir="next" enabled={canNext} onClick={toNext} isMobile />
          </div>
        </div>
      </div>
    </div>
  );
}

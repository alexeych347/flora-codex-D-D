import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { Herb, HerbOrStub, Player, isFullHerb } from '../types';
import { BookSpread } from './BookSpread';
import { useBook } from '../hooks/useBook';
import { SearchBar } from './SearchBar';
import { DMPanel } from './DMPanel';
import { LoginScreen } from './LoginScreen';
import { HerbDetailModal } from './HerbDetailModal';

interface Props {
  herbs: HerbOrStub[];
  player: Player | null;
  isMaster: boolean;
  onLogin: (playerId: string, password: string) => Promise<void>;
  onLogout: () => void;
  onRefresh: () => void;
}

const pageVariants = {
  initial: (direction: number) => ({
    x: direction > 0 ? '100%' : '-100%',
    opacity: 0,
  }),
  animate: {
    x: 0,
    opacity: 1,
    transition: { duration: 0.45, ease: [0.4, 0, 0.2, 1] },
  },
  exit: (direction: number) => ({
    x: direction > 0 ? '-100%' : '100%',
    opacity: 0,
    transition: { duration: 0.35, ease: [0.4, 0, 0.2, 1] },
  }),
};

function NavArrow({ dir, enabled, onClick, isMobile }: {
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

export function Book({ herbs, player, isMaster, onLogin, onLogout, onRefresh }: Props) {
  const {
    currentSpread,
    direction,
    totalSpreads,
    canGoNext,
    canGoPrev,
    goToNext,
    goToPrev,
    mobileSide,
    isMobile,
    animationKey,
  } = useBook(herbs.length);

  const [showLogin, setShowLogin] = useState(false);
  const [showPanel, setShowPanel] = useState(false);
  const [showSheet, setShowSheet] = useState(false);
  const [selectedHerb, setSelectedHerb] = useState<Herb | null>(null);
  const identityRef = useRef<HTMLDivElement>(null);

  // Лист игрока закрывается по клику мимо — как выдача поиска
  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (identityRef.current && !identityRef.current.contains(e.target as Node)) setShowSheet(false);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, []);

  const handleHerbClick = (herb: HerbOrStub) => {
    if (isFullHerb(herb)) {
      setSelectedHerb(herb);
    }
  };

  const handleSearchSelect = (herb: Herb) => {
    setSelectedHerb(herb);
  };

  const handlePanEnd = (_e: unknown, info: { offset: { x: number } }) => {
    if (!isMobile) return;
    if (Math.abs(info.offset.x) < 60) return;
    if (info.offset.x < 0) goToNext();
    else goToPrev();
  };

  // Spread label for counter
  const spreadLabel = (() => {
    if (currentSpread === 0) return 'Обложка';
    if (!isMobile) return `Разворот ${currentSpread} / ${totalSpreads}`;
    const totalMobilePages = 1 + totalSpreads * 2;
    const mobileIdx = currentSpread === 0 ? 0 : (currentSpread - 1) * 2 + (mobileSide === 'left' ? 1 : 2);
    return `Страница ${mobileIdx + 1} / ${totalMobilePages}`;
  })();

  return (
    <div className="book-app min-h-screen flex flex-col" style={{ background: '#0D0A06' }}>
      {/* Top bar */}
      <div
        className="top-bar flex items-center gap-3 px-3 md:px-6 py-2.5 flex-shrink-0"
        style={{
          background: 'rgba(9,13,21,.97)',
          borderBottom: '1px solid rgba(184,134,11,.32)',
          backdropFilter: 'blur(12px)',
          position: 'relative',
          zIndex: 100,
        }}
      >
        {/* Заголовок занимает 162 px — на мобильном уступает их поиску */}
        {!isMobile && (
          <span className="f-cormorant-sc flex-shrink-0" style={{
            color: 'var(--gold-muted)', fontSize: 16, letterSpacing: '.2em',
            whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <svg width="14" height="14" viewBox="0 0 18 18">
              <path d="M9,1 l2,6 l6,0 l-5,4 l2,6 l-5,-4 l-5,4 l2,-6 l-5,-4 l6,0 Z" fill="#8B1A1A" opacity=".9" />
            </svg>
            КОДЕКС ТРАВ
          </span>
        )}

        <div className="flex-1" style={{ minWidth: isMobile ? 0 : undefined }}>
          <SearchBar onSelectHerb={handleSearchSelect} isMobile={isMobile} />
        </div>

        {player ? (
          isMobile ? (
          <div ref={identityRef} style={{ position: 'relative', flexShrink: 0 }}>
            <button
              onClick={() => (isMaster ? setShowPanel(true) : setShowSheet(v => !v))}
              aria-label={isMaster ? `${player.name} — панель мастера` : player.name}
              style={{
                width: 44, height: 44, display: 'grid', placeItems: 'center',
                background: 'rgba(184,134,11,.1)', border: '1px solid rgba(184,134,11,.4)',
                color: isMaster ? '#d9a93a' : 'var(--gold-muted)', cursor: 'pointer',
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
                {isMaster
                  ? <path d="M3 17l2-9 4 4 3-7 3 7 4-4 2 9z" strokeLinejoin="round" />
                  : <><circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 4-6 8-6s8 2 8 6" strokeLinecap="round" /></>}
              </svg>
            </button>

            {showSheet && !isMaster && (
              <div style={{
                position: 'absolute', top: '100%', right: 0, marginTop: 6, zIndex: 120,
                minWidth: 196, background: 'rgba(9,13,21,.98)',
                border: '1px solid rgba(184,134,11,.4)',
                boxShadow: '0 10px 30px rgba(0,0,0,.6)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '11px 14px' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                    stroke="var(--gold-muted)" strokeWidth="1.7">
                    <circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 4-6 8-6s8 2 8 6" strokeLinecap="round" />
                  </svg>
                  <span className="f-italic" style={{ color: 'var(--birch)', fontSize: 16, opacity: .9 }}>{player.name}</span>
                </div>
                <div style={{ height: 1, background: 'rgba(184,134,11,.25)' }} />
                <button
                  onClick={() => { setShowSheet(false); onLogout(); }}
                  className="f-cormorant-sc"
                  style={{
                    width: '100%', minHeight: 44, display: 'flex', alignItems: 'center', gap: 10,
                    padding: '0 14px', background: 'none', border: 'none', cursor: 'pointer',
                    color: 'var(--gold-muted)', fontSize: 13, letterSpacing: '.1em',
                    textTransform: 'uppercase', fontWeight: 600,
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                    strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                    <polyline points="16 17 21 12 16 7" />
                    <line x1="21" y1="12" x2="9" y2="12" />
                  </svg>
                  Выйти
                </button>
              </div>
            )}
          </div>
          ) : (
          <span style={{ display: 'flex', alignItems: 'center', gap: 7, whiteSpace: 'nowrap' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
              stroke={isMaster ? '#d9a93a' : 'var(--gold-muted)'} strokeWidth="1.7">
              {isMaster
                ? <path d="M3 17l2-9 4 4 3-7 3 7 4-4 2 9z" strokeLinejoin="round" />
                : <><circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 4-6 8-6s8 2 8 6" strokeLinecap="round" /></>}
            </svg>
            <span className="f-italic" style={{ color: 'var(--birch)', fontSize: 15, opacity: .9 }}>{player.name}</span>
          </span>
          )
        ) : (
          <button onClick={() => setShowLogin(true)} className="f-cormorant-sc flex-shrink-0" style={{
            fontSize: 12.5, padding: isMobile ? '0 15px' : '6px 13px', minHeight: isMobile ? 44 : undefined, letterSpacing: '.1em',
            textTransform: 'uppercase', fontWeight: 600,
            background: 'rgba(184,134,11,.1)', border: '1px solid rgba(184,134,11,.4)',
            color: 'var(--gold-muted)', cursor: 'pointer', whiteSpace: 'nowrap',
          }}>Войти</button>
        )}

        {isMaster && !isMobile && (
          <button onClick={() => setShowPanel(p => !p)} className="f-cormorant-sc flex-shrink-0" style={{
            fontSize: 12.5, padding: '6px 13px', letterSpacing: '.1em',
            textTransform: 'uppercase', fontWeight: 600,
            background: 'rgba(184,134,11,.14)', border: '1px solid rgba(184,134,11,.5)',
            color: 'var(--gold-muted)', cursor: 'pointer', whiteSpace: 'nowrap',
          }}>Панель Мастера</button>
        )}

        {player && !isMobile && (
          <button onClick={onLogout} title="Выйти" className="flex-shrink-0" style={{
            background: 'none', border: 'none', color: 'var(--gold-muted)',
            opacity: 0.6, padding: 4, display: 'grid', placeItems: 'center', transition: 'opacity .2s',
          }}
            onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
            onMouseLeave={e => (e.currentTarget.style.opacity = '0.6')}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
          </button>
        )}
      </div>

      {/* Book + navigation row */}
      <div className="flex-1 flex items-center justify-center p-2 md:p-4">
        <div className="flex items-center gap-2 md:gap-4 w-full" style={{ maxWidth: '1440px' }}>

          {/* Left nav arrow — на мобильном переезжает под книгу, в строку со счётчиком */}
          {!isMobile && <NavArrow dir="prev" enabled={canGoPrev} onClick={goToPrev} isMobile={isMobile} />}

          {/* Book */}
          <div className="flex-1 flex flex-col items-center gap-2 md:gap-3" style={{ minWidth: isMobile ? 0 : undefined }}>
            <div
              className="book relative flex items-stretch animate-fade-in w-full"
              style={{
                minHeight: isMobile ? '560px' : '680px',
                background: '#F4E4BC',
                boxShadow: '0 40px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(201,168,76,0.15), 8px 8px 30px rgba(0,0,0,0.5)',
                overflow: 'hidden',
              }}
            >
              <AnimatePresence mode="wait" custom={direction}>
                <motion.div
                  key={animationKey}
                  custom={direction}
                  variants={pageVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  className="spread-wrapper flex w-full"
                  style={{}}
                  onPanEnd={handlePanEnd}
                >
                  <BookSpread
                    currentSpread={currentSpread}
                    herbs={herbs}
                    onHerbClick={handleHerbClick}
                    mobileSide={mobileSide}
                    isMobile={isMobile}
                  />
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Spread counter */}
            {(totalSpreads > 0 || isMobile) && (
              <div className="flex items-center gap-3">
                {isMobile && <NavArrow dir="prev" enabled={canGoPrev} onClick={goToPrev} isMobile={isMobile} />}
                <div className="h-px w-8 md:w-12" style={{ background: 'linear-gradient(to right, transparent, rgba(201,168,76,0.3))' }} />
                <span className="font-cormorant italic text-sm md:text-base" style={{ color: '#C9A84C', opacity: 0.65 }}>
                  {spreadLabel}
                </span>
                <div className="h-px w-8 md:w-12" style={{ background: 'linear-gradient(to left, transparent, rgba(201,168,76,0.3))' }} />
                {isMobile && <NavArrow dir="next" enabled={canGoNext} onClick={goToNext} isMobile={isMobile} />}
              </div>
            )}

            {/* Mobile swipe hint — shown only on mobile when there are multiple pages */}
            {isMobile && totalSpreads > 0 && (
              <p className="font-garamond italic text-xs" style={{ color: '#C9A84C', opacity: 0.4 }}>
                Проведите по книге для листания
              </p>
            )}
          </div>

          {/* Right nav arrow — на мобильном переезжает под книгу */}
          {!isMobile && <NavArrow dir="next" enabled={canGoNext} onClick={goToNext} isMobile={isMobile} />}

        </div>
      </div>

      {/* Login modal */}
      {showLogin && (
        <LoginScreen
          onLogin={onLogin}
          isMobile={isMobile}
          onClose={() => setShowLogin(false)}
        />
      )}

      {/* Master panel */}
      {isMaster && showPanel && (
        <DMPanel
          herbs={herbs}
          isMobile={isMobile}
          onClose={() => setShowPanel(false)}
          onLogout={() => { onLogout(); setShowPanel(false); }}
          onRefresh={onRefresh}
        />
      )}

      {/* Herb detail modal */}
      {selectedHerb && (
        <HerbDetailModal
          herb={selectedHerb}
          isMobile={isMobile}
          onClose={() => setSelectedHerb(null)}
        />
      )}
    </div>
  );
}

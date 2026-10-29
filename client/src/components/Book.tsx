import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';
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
    rotateY: direction > 0 ? 90 : -90,
    opacity: 0,
    transformOrigin: direction > 0 ? 'left center' : 'right center',
  }),
  animate: {
    rotateY: 0,
    opacity: 1,
    transition: { duration: 0.55, ease: [0.4, 0, 0.2, 1] },
  },
  exit: (direction: number) => ({
    rotateY: direction > 0 ? -90 : 90,
    opacity: 0,
    transformOrigin: direction > 0 ? 'right center' : 'left center',
    transition: { duration: 0.45, ease: [0.4, 0, 0.2, 1] },
  }),
};

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
  const [selectedHerb, setSelectedHerb] = useState<Herb | null>(null);

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
        <span className="f-cormorant-sc flex-shrink-0" style={{
          color: 'var(--gold-muted)', fontSize: 16, letterSpacing: '.2em',
          whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <svg width="14" height="14" viewBox="0 0 18 18">
            <path d="M9,1 l2,6 l6,0 l-5,4 l2,6 l-5,-4 l-5,4 l2,-6 l-5,-4 l6,0 Z" fill="#8B1A1A" opacity=".9" />
          </svg>
          КОДЕКС ТРАВ
        </span>

        <div className="flex-1">
          <SearchBar onSelectHerb={handleSearchSelect} />
        </div>

        {player ? (
          <span style={{ display: 'flex', alignItems: 'center', gap: 7, whiteSpace: 'nowrap' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
              stroke={isMaster ? '#d9a93a' : 'var(--gold-muted)'} strokeWidth="1.7">
              {isMaster
                ? <path d="M3 17l2-9 4 4 3-7 3 7 4-4 2 9z" strokeLinejoin="round" />
                : <><circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 4-6 8-6s8 2 8 6" strokeLinecap="round" /></>}
            </svg>
            <span className="f-italic" style={{ color: 'var(--birch)', fontSize: 15, opacity: .9 }}>{player.name}</span>
          </span>
        ) : (
          <button onClick={() => setShowLogin(true)} className="f-cormorant-sc flex-shrink-0" style={{
            fontSize: 12.5, padding: '6px 13px', letterSpacing: '.1em',
            textTransform: 'uppercase', fontWeight: 600,
            background: 'rgba(184,134,11,.1)', border: '1px solid rgba(184,134,11,.4)',
            color: 'var(--gold-muted)', cursor: 'pointer', whiteSpace: 'nowrap',
          }}>Войти</button>
        )}

        {isMaster && (
          <button onClick={() => setShowPanel(p => !p)} className="f-cormorant-sc flex-shrink-0" style={{
            fontSize: 12.5, padding: '6px 13px', letterSpacing: '.1em',
            textTransform: 'uppercase', fontWeight: 600,
            background: 'rgba(184,134,11,.14)', border: '1px solid rgba(184,134,11,.5)',
            color: 'var(--gold-muted)', cursor: 'pointer', whiteSpace: 'nowrap',
          }}>Панель Мастера</button>
        )}

        {player && (
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
      <div className="flex-1 flex items-center justify-center p-2 md:p-4" style={{ perspective: '1500px' }}>
        <div className="flex items-center gap-2 md:gap-4 w-full" style={{ maxWidth: '1440px' }}>

          {/* Left nav arrow */}
          <button
            onClick={goToPrev}
            disabled={!canGoPrev}
            className="flex-shrink-0 flex items-center justify-center rounded-lg transition-all duration-200"
            style={{
              width: isMobile ? '40px' : '52px',
              height: isMobile ? '60px' : '80px',
              background: canGoPrev ? 'rgba(201,168,76,0.12)' : 'transparent',
              border: canGoPrev ? '1px solid rgba(201,168,76,0.35)' : '1px solid transparent',
              color: canGoPrev ? '#C9A84C' : 'transparent',
              cursor: canGoPrev ? 'pointer' : 'default',
              boxShadow: canGoPrev ? '0 2px 12px rgba(0,0,0,0.3)' : 'none',
            }}
          >
            <svg width={isMobile ? 22 : 28} height={isMobile ? 22 : 28} viewBox="0 0 24 24" fill="none">
              <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>

          {/* Book */}
          <div className="flex-1 flex flex-col items-center gap-2 md:gap-3">
            <div
              className="book relative flex items-stretch animate-fade-in w-full"
              style={{
                minHeight: isMobile ? '480px' : '680px',
                background: '#F4E4BC',
                boxShadow: '0 40px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(201,168,76,0.15), 8px 8px 30px rgba(0,0,0,0.5)',
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
                  style={{ transformStyle: 'preserve-3d' }}
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
            {totalSpreads > 0 && (
              <div className="flex items-center gap-3">
                <div className="h-px w-8 md:w-12" style={{ background: 'linear-gradient(to right, transparent, rgba(201,168,76,0.3))' }} />
                <span className="font-cormorant italic text-sm md:text-base" style={{ color: '#C9A84C', opacity: 0.65 }}>
                  {spreadLabel}
                </span>
                <div className="h-px w-8 md:w-12" style={{ background: 'linear-gradient(to left, transparent, rgba(201,168,76,0.3))' }} />
              </div>
            )}

            {/* Mobile swipe hint — shown only on mobile when there are multiple pages */}
            {isMobile && totalSpreads > 0 && (
              <p className="font-garamond italic text-xs" style={{ color: '#C9A84C', opacity: 0.4 }}>
                Проведите по книге для листания
              </p>
            )}
          </div>

          {/* Right nav arrow */}
          <button
            onClick={goToNext}
            disabled={!canGoNext}
            className="flex-shrink-0 flex items-center justify-center rounded-lg transition-all duration-200"
            style={{
              width: isMobile ? '40px' : '52px',
              height: isMobile ? '60px' : '80px',
              background: canGoNext ? 'rgba(201,168,76,0.12)' : 'transparent',
              border: canGoNext ? '1px solid rgba(201,168,76,0.35)' : '1px solid transparent',
              color: canGoNext ? '#C9A84C' : 'transparent',
              cursor: canGoNext ? 'pointer' : 'default',
              boxShadow: canGoNext ? '0 2px 12px rgba(0,0,0,0.3)' : 'none',
            }}
          >
            <svg width={isMobile ? 22 : 28} height={isMobile ? 22 : 28} viewBox="0 0 24 24" fill="none">
              <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>

        </div>
      </div>

      {/* Login modal */}
      {showLogin && (
        <LoginScreen
          onLogin={onLogin}
          onClose={() => setShowLogin(false)}
        />
      )}

      {/* Master panel */}
      {isMaster && showPanel && (
        <DMPanel
          herbs={herbs}
          onClose={() => setShowPanel(false)}
          onLogout={() => { onLogout(); setShowPanel(false); }}
          onRefresh={onRefresh}
        />
      )}

      {/* Herb detail modal */}
      {selectedHerb && (
        <HerbDetailModal
          herb={selectedHerb}
          onClose={() => setSelectedHerb(null)}
        />
      )}
    </div>
  );
}

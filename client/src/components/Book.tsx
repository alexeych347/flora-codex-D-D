import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';
import { Herb, HerbOrStub, isFullHerb } from '../types';
import { BookSpread } from './BookSpread';
import { useBook } from '../hooks/useBook';
import { SearchBar } from './SearchBar';
import { DMPanel } from './DMPanel';
import { DMLogin } from './DMLogin';
import { HerbDetailModal } from './HerbDetailModal';

interface Props {
  herbs: HerbOrStub[];
  isDM: boolean;
  onLogin: (password: string) => Promise<void>;
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

export function Book({ herbs, isDM, onLogin, onLogout, onRefresh }: Props) {
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
      {/* Top bar — high z-index so search dropdown overlaps the book */}
      <div
        className="top-bar flex items-center justify-between px-3 md:px-8 py-3 flex-shrink-0"
        style={{
          background: 'rgba(28,18,8,0.95)',
          borderBottom: '1px solid #C9A84C20',
          backdropFilter: 'blur(8px)',
          position: 'relative',
          zIndex: 100,
        }}
      >
        <span className="font-cinzel text-xs md:text-sm tracking-widest flex-shrink-0" style={{ color: '#C9A84C', opacity: 0.8 }}>
          ✦ Flora Codex
        </span>

        <div className="flex-1 mx-3 md:mx-6">
          <SearchBar onSelectHerb={handleSearchSelect} />
        </div>

        <button
          onClick={() => isDM ? setShowPanel(p => !p) : setShowLogin(true)}
          className="dm-key-btn p-2 flex-shrink-0 transition-opacity hover:opacity-80"
          title={isDM ? 'Панель DM' : 'Войти как DM'}
          style={{ color: '#C9A84C', opacity: isDM ? 1 : 0.35 }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
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

      {/* DM Login modal */}
      {showLogin && (
        <DMLogin
          onLogin={onLogin}
          onClose={() => setShowLogin(false)}
        />
      )}

      {/* DM Panel */}
      {isDM && showPanel && (
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

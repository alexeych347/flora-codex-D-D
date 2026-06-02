import { AnimatePresence, motion } from 'framer-motion';
import { HerbOrStub } from '../types';
import { BookSpread } from './BookSpread';
import { useBook } from '../hooks/useBook';
import { SearchBar } from './SearchBar';
import { DMPanel } from './DMPanel';
import { DMLogin } from './DMLogin';
import { useState } from 'react';

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
  const { currentPage, direction, canGoNext, canGoPrev, goToNext, goToPrev, goToHerb } = useBook(herbs.length);
  const [showLogin, setShowLogin] = useState(false);
  const [showPanel, setShowPanel] = useState(false);

  return (
    <div className="book-app min-h-screen flex flex-col" style={{ background: '#0D0A06' }}>
      {/* Top bar */}
      <div
        className="top-bar flex items-center justify-between px-4 md:px-8 py-3 flex-shrink-0"
        style={{
          background: 'rgba(28,18,8,0.95)',
          borderBottom: '1px solid #C9A84C20',
          backdropFilter: 'blur(8px)',
        }}
      >
        <button
          onClick={() => goToHerb(-1)}
          className="font-cinzel text-xs tracking-widest transition-opacity hover:opacity-80"
          style={{ color: '#C9A84C', opacity: 0.8 }}
        >
          ✦ Гербарий
        </button>

        <SearchBar onSelectHerb={goToHerb} herbs={herbs} />

        {/* DM key button */}
        <button
          onClick={() => isDM ? setShowPanel(p => !p) : setShowLogin(true)}
          className="dm-key-btn p-2 transition-opacity hover:opacity-80"
          title={isDM ? 'Панель DM' : 'Войти как DM'}
          style={{ color: '#C9A84C', opacity: isDM ? 1 : 0.35 }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>

      {/* Book container */}
      <div className="book-container flex-1 flex items-center justify-center p-4 md:p-8" style={{ perspective: '1500px' }}>
        <div
          className="book relative flex items-stretch animate-fade-in"
          style={{
            maxWidth: '960px',
            width: '100%',
            minHeight: '560px',
            background: '#F4E4BC',
            boxShadow: '0 40px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(201,168,76,0.15), 8px 8px 30px rgba(0,0,0,0.5)',
          }}
        >
          {/* Nav arrow left */}
          {canGoPrev && (
            <button
              onClick={goToPrev}
              className="nav-arrow nav-arrow-left absolute left-0 top-1/2 -translate-y-1/2 -translate-x-full px-2 py-6 flex items-center transition-opacity hover:opacity-100 opacity-60 z-10"
              style={{ color: '#C9A84C' }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </button>
          )}

          {/* Pages */}
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={currentPage}
              custom={direction}
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="spread-wrapper flex w-full"
              style={{ transformStyle: 'preserve-3d' }}
            >
              <BookSpread
                currentPage={currentPage}
                herbs={herbs}
                onSelectHerb={goToHerb}
              />
            </motion.div>
          </AnimatePresence>

          {/* Nav arrow right */}
          {canGoNext && (
            <button
              onClick={goToNext}
              className="nav-arrow nav-arrow-right absolute right-0 top-1/2 -translate-y-1/2 translate-x-full px-2 py-6 flex items-center transition-opacity hover:opacity-100 opacity-60 z-10"
              style={{ color: '#C9A84C' }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </button>
          )}

          {/* Page indicator */}
          <div
            className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5 z-10"
          >
            {herbs.slice(0, Math.min(herbs.length, 12)).map((_, i) => (
              <button
                key={i}
                onClick={() => goToHerb(i)}
                className="w-1.5 h-1.5 rounded-full transition-all duration-200"
                style={{
                  background: currentPage === i + 1 ? '#C9A84C' : 'rgba(201,168,76,0.3)',
                  transform: currentPage === i + 1 ? 'scale(1.4)' : 'scale(1)',
                }}
              />
            ))}
          </div>
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
    </div>
  );
}

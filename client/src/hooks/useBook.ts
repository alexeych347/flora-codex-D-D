import { useState, useEffect } from 'react';

const HERBS_PER_SPREAD = 8;

export function useBook(totalHerbs: number) {
  const totalSpreads = Math.ceil(totalHerbs / HERBS_PER_SPREAD);
  const [currentSpread, setCurrentSpread] = useState(0);
  const [direction, setDirection] = useState(1);
  const [mobileSide, setMobileSide] = useState<'left' | 'right'>('left');
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)');
    setIsMobile(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  // On mobile: navigate through individual pages (left/right halves of each spread)
  const totalMobilePages = 1 + totalSpreads * 2; // cover + 2 pages per spread
  const mobilePageIndex = currentSpread === 0 ? 0 : (currentSpread - 1) * 2 + (mobileSide === 'left' ? 1 : 2);
  const canGoNextMobile = mobilePageIndex < totalMobilePages - 1;
  const canGoPrevMobile = mobilePageIndex > 0;

  const goToNextMobile = () => {
    if (!canGoNextMobile) return;
    setDirection(1);
    if (currentSpread === 0) {
      setCurrentSpread(1);
      setMobileSide('left');
    } else if (mobileSide === 'left') {
      setMobileSide('right');
    } else {
      setCurrentSpread(p => p + 1);
      setMobileSide('left');
    }
  };

  const goToPrevMobile = () => {
    if (!canGoPrevMobile) return;
    setDirection(-1);
    if (currentSpread === 0) return;
    if (mobileSide === 'right') {
      setMobileSide('left');
    } else if (currentSpread === 1) {
      setCurrentSpread(0);
      setMobileSide('left');
    } else {
      setCurrentSpread(p => p - 1);
      setMobileSide('right');
    }
  };

  const canGoNext = isMobile ? canGoNextMobile : currentSpread < totalSpreads;
  const canGoPrev = isMobile ? canGoPrevMobile : currentSpread > 0;

  const goToNext = () => {
    if (isMobile) { goToNextMobile(); return; }
    if (currentSpread >= totalSpreads) return;
    setDirection(1);
    setCurrentSpread(p => p + 1);
  };

  const goToPrev = () => {
    if (isMobile) { goToPrevMobile(); return; }
    if (currentSpread <= 0) return;
    setDirection(-1);
    setCurrentSpread(p => p - 1);
  };

  const goToSpreadOfHerb = (index: number) => {
    const targetSpread = Math.floor(index / HERBS_PER_SPREAD) + 1;
    setDirection(targetSpread > currentSpread ? 1 : -1);
    setCurrentSpread(targetSpread);
    setMobileSide('left');
  };

  const goToGallery = () => {
    setDirection(-1);
    setCurrentSpread(0);
    setMobileSide('left');
  };

  // Unique key for AnimatePresence: changes on spread change AND mobile side change
  const animationKey = isMobile ? `${currentSpread}-${mobileSide}` : String(currentSpread);

  return {
    currentSpread,
    direction,
    totalSpreads,
    canGoNext,
    canGoPrev,
    goToNext,
    goToPrev,
    goToSpreadOfHerb,
    goToGallery,
    mobileSide,
    isMobile,
    animationKey,
  };
}

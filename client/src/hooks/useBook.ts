import { useState } from 'react';

const HERBS_PER_SPREAD = 8;

export function useBook(totalHerbs: number) {
  const totalSpreads = Math.ceil(totalHerbs / HERBS_PER_SPREAD);
  // 0 = gallery, 1..totalSpreads = herb spreads
  const [currentSpread, setCurrentSpread] = useState(0);
  const [direction, setDirection] = useState(1);

  const canGoNext = currentSpread < totalSpreads;
  const canGoPrev = currentSpread > 0;

  const goToNext = () => {
    if (!canGoNext) return;
    setDirection(1);
    setCurrentSpread(p => p + 1);
  };

  const goToPrev = () => {
    if (!canGoPrev) return;
    setDirection(-1);
    setCurrentSpread(p => p - 1);
  };

  const goToSpreadOfHerb = (index: number) => {
    const targetSpread = Math.floor(index / HERBS_PER_SPREAD) + 1;
    setDirection(targetSpread > currentSpread ? 1 : -1);
    setCurrentSpread(targetSpread);
  };

  const goToGallery = () => {
    setDirection(-1);
    setCurrentSpread(0);
  };

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
  };
}

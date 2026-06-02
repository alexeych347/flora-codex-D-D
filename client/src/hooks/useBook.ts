import { useState } from 'react';

export function useBook(totalHerbs: number) {
  // 0 = gallery, 1..N = herbs
  const [currentPage, setCurrentPage] = useState(0);
  const [direction, setDirection] = useState(1);

  const canGoNext = currentPage < totalHerbs;
  const canGoPrev = currentPage > 0;

  const goToNext = () => {
    if (!canGoNext) return;
    setDirection(1);
    setCurrentPage(p => p + 1);
  };

  const goToPrev = () => {
    if (!canGoPrev) return;
    setDirection(-1);
    setCurrentPage(p => p - 1);
  };

  const goToHerb = (index: number) => {
    const targetPage = index + 1;
    setDirection(targetPage > currentPage ? 1 : -1);
    setCurrentPage(targetPage);
  };

  const goToGallery = () => {
    setDirection(-1);
    setCurrentPage(0);
  };

  return { currentPage, direction, canGoNext, canGoPrev, goToNext, goToPrev, goToHerb, goToGallery };
}

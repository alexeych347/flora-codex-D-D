import { HerbOrStub, isFullHerb } from '../types';
import { HerbPageLeft } from './HerbPageLeft';
import { HerbPageRight } from './HerbPageRight';
import { LockedSpread } from './LockedHerb';
import { GalleryIndex } from './GalleryIndex';

const API_URL = import.meta.env.VITE_API_URL || '';

interface Props {
  currentPage: number;
  herbs: HerbOrStub[];
  onSelectHerb: (index: number) => void;
}

export function BookSpread({ currentPage, herbs, onSelectHerb }: Props) {
  // Page 0 = gallery
  if (currentPage === 0) {
    return (
      <>
        <div className="book-page book-page-left relative">
          <PageTexture />
          <GalleryIndex herbs={herbs} onSelectHerb={onSelectHerb} />
        </div>
        <BookBinding />
        <div className="book-page book-page-right relative hidden md:block">
          <PageTexture />
          <div className="h-full flex items-center justify-center">
            <div className="text-center px-8 opacity-40">
              <svg width="60" height="70" viewBox="0 0 60 70" fill="none" className="mx-auto mb-3">
                <line x1="30" y1="65" x2="30" y2="10" stroke="#2D5A27" strokeWidth="2"/>
                <ellipse cx="30" cy="25" rx="15" ry="20" fill="#4A7C59" opacity="0.7" transform="rotate(-10 30 25)"/>
                <ellipse cx="14" cy="40" rx="10" ry="14" fill="#4A7C59" opacity="0.5" transform="rotate(15 14 40)"/>
                <ellipse cx="46" cy="38" rx="10" ry="14" fill="#4A7C59" opacity="0.5" transform="rotate(-15 46 38)"/>
              </svg>
              <p className="font-cormorant italic text-sm" style={{ color: '#3D2B1F' }}>
                Выберите траву из оглавления
              </p>
            </div>
          </div>
        </div>
      </>
    );
  }

  // Herb pages (1-indexed)
  const herb = herbs[currentPage - 1];

  if (!herb) return null;

  return (
    <>
      <div className="book-page book-page-left relative">
        <PageTexture />
        {isFullHerb(herb) ? (
          <HerbPageLeft herb={herb} apiUrl={API_URL} />
        ) : (
          <LockedSpread rarity={herb.rarity} />
        )}
      </div>
      <BookBinding />
      <div className="book-page book-page-right relative hidden md:block">
        <PageTexture />
        {isFullHerb(herb) ? (
          <HerbPageRight herb={herb} pageNumber={currentPage} />
        ) : (
          <LockedSpread rarity={herb.rarity} />
        )}
      </div>
    </>
  );
}

function PageTexture() {
  return (
    <div
      className="absolute inset-0 pointer-events-none"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E")`,
        mixBlendMode: 'multiply',
        opacity: 0.5,
      }}
    />
  );
}

function BookBinding() {
  return (
    <div
      className="book-binding flex-shrink-0 hidden md:block"
      style={{
        width: '24px',
        background: 'linear-gradient(to right, rgba(28,18,8,0.15) 0%, rgba(28,18,8,0.3) 40%, rgba(28,18,8,0.15) 100%)',
        boxShadow: 'inset -2px 0 4px rgba(0,0,0,0.2), inset 2px 0 4px rgba(0,0,0,0.2)',
        position: 'relative',
      }}
    >
      <div
        className="absolute inset-y-0 left-1/2 -translate-x-1/2"
        style={{ width: '1px', background: 'rgba(201,168,76,0.2)' }}
      />
    </div>
  );
}

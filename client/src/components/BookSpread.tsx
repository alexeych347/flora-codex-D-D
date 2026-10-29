import { HerbOrStub } from '../types';
import { CoverLeftPage, CoverRightPage, HerbGridPage } from './ui';
import { SpineOrnament } from './ornaments';

interface Props {
  currentSpread: number;
  herbs: HerbOrStub[];
  onHerbClick: (herb: HerbOrStub) => void;
  mobileSide: 'left' | 'right';
  isMobile: boolean;
}

export function BookSpread({ currentSpread, herbs, onHerbClick, mobileSide, isMobile }: Props) {
  const showLeft = !isMobile || mobileSide === 'left';
  const showRight = !isMobile || mobileSide === 'right';
  const showBinding = !isMobile;

  if (currentSpread === 0) {
    return (
      <>
        {showLeft && (
          <div className="book-page book-page-left relative flex-1">
            <PageTexture />
            <CoverLeftPage />
          </div>
        )}
        {showBinding && <BookBinding />}
        {showRight && (
          <div className="book-page book-page-right relative flex-1">
            <PageTexture />
            <CoverRightPage />
          </div>
        )}
      </>
    );
  }

  const herbsStart = (currentSpread - 1) * 8;
  const leftHerbs = herbs.slice(herbsStart, herbsStart + 4);
  const rightHerbs = herbs.slice(herbsStart + 4, herbsStart + 8);

  return (
    <>
      {showLeft && (
        <div className="book-page book-page-left relative flex-1">
          <PageTexture />
          <HerbGridPage herbs={leftHerbs} onHerbClick={onHerbClick} />
        </div>
      )}
      {showBinding && <BookBinding />}
      {showRight && (
        <div className="book-page book-page-right relative flex-1">
          <PageTexture />
          <HerbGridPage herbs={rightHerbs} onHerbClick={onHerbClick} />
        </div>
      )}
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
      className="book-binding flex-shrink-0"
      style={{
        width: '28px',
        position: 'relative', overflow: 'hidden',
        background: 'linear-gradient(to right,rgba(0,0,0,.34) 0%,rgba(16,9,3,.9) 36%,rgba(8,4,1,1) 50%,rgba(16,9,3,.9) 64%,rgba(0,0,0,.34) 100%)',
        boxShadow: 'inset 4px 0 10px rgba(0,0,0,.5), inset -4px 0 10px rgba(0,0,0,.5)',
      }}
    >
      <div style={{ position: 'absolute', inset: '0 5px', color: 'rgba(184,134,11,.4)' }}>
        <SpineOrnament width={18} />
      </div>
    </div>
  );
}

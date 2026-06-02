import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Herb } from '../types';
import { HerbPageLeft } from './HerbPageLeft';
import { HerbPageRight } from './HerbPageRight';

const API_URL = import.meta.env.VITE_API_URL || '';

interface Props {
  herb: Herb;
  onClose: () => void;
}

export function HerbDetailModal({ herb, onClose }: Props) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8"
        style={{ background: 'rgba(0,0,0,0.8)' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="relative flex w-full overflow-hidden"
          style={{
            maxWidth: '900px',
            maxHeight: '88vh',
            background: '#F4E4BC',
            boxShadow: '0 40px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(201,168,76,0.2)',
          }}
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
          onClick={e => e.stopPropagation()}
        >
          {/* Page texture */}
          <div
            className="absolute inset-0 pointer-events-none z-0"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E")`,
              mixBlendMode: 'multiply',
              opacity: 0.5,
            }}
          />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 z-20 w-9 h-9 flex items-center justify-center transition-opacity hover:opacity-100 opacity-60"
            style={{
              background: 'rgba(28,18,8,0.12)',
              border: '1px solid rgba(201,168,76,0.3)',
              color: '#3D2B1F',
              fontSize: '20px',
              lineHeight: 1,
            }}
            title="Закрыть"
          >
            ×
          </button>

          {/* Left page */}
          <div className="relative z-10 flex-1 overflow-y-auto" style={{ minWidth: 0 }}>
            <HerbPageLeft herb={herb} apiUrl={API_URL} />
          </div>

          {/* Binding */}
          <div
            className="flex-shrink-0 relative z-10"
            style={{
              width: '20px',
              background: 'linear-gradient(to right, rgba(28,18,8,0.15) 0%, rgba(28,18,8,0.3) 40%, rgba(28,18,8,0.15) 100%)',
              boxShadow: 'inset -2px 0 4px rgba(0,0,0,0.2), inset 2px 0 4px rgba(0,0,0,0.2)',
            }}
          >
            <div
              className="absolute inset-y-0 left-1/2 -translate-x-1/2"
              style={{ width: '1px', background: 'rgba(201,168,76,0.2)' }}
            />
          </div>

          {/* Right page */}
          <div className="relative z-10 flex-1 overflow-y-auto" style={{ minWidth: 0 }}>
            <HerbPageRight herb={herb} />
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

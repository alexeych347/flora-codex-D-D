import { useState, useEffect, useRef } from 'react';
import { herbsApi } from '../api/herbs';
import { Herb } from '../types';

interface Props {
  onSelectHerb: (herb: Herb) => void;
  isMobile?: boolean;
}

export function SearchBar({ onSelectHerb, isMobile = false }: Props) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Herb[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!query.trim()) {
      setResults([]);
      setOpen(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const data = await herbsApi.search(query);
        setResults(data);
        setOpen(true);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (herb: Herb) => {
    onSelectHerb(herb);
    setQuery('');
    setOpen(false);
  };

  const highlight = (text: string) => {
    if (!query) return text;
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    return parts.map((part, i) =>
      regex.test(part) ? (
        <mark key={i} style={{ background: 'rgba(184,134,11,.3)', color: 'var(--ink)' }}>
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  return (
    <div ref={containerRef} className="search-container relative w-full max-w-md">
      <div className="search-input-wrap relative flex items-center">
        <svg
          width="16" height="16" viewBox="0 0 24 24" fill="none"
          className="absolute left-3 pointer-events-none"
          style={{ color: 'var(--gold-muted)', opacity: 0.8 }}
        >
          <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/>
          <line x1="21" y1="21" x2="16.65" y2="16.65" stroke="currentColor" strokeWidth="2"/>
        </svg>
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Найти траву..."
          aria-label="Поиск травы"
          className="search-input w-full pl-9 pr-4 py-2 f-prose text-sm focus:outline-none"
          style={{
            minHeight: isMobile ? 44 : undefined,
            background: 'rgba(244,228,188,0.9)',
            border: '1px solid rgba(184,134,11,.38)',
            color: 'var(--ink)',
          }}
        />
        {loading && (
          <div className="absolute right-3 w-3 h-3 border border-gold border-t-transparent rounded-full animate-spin" />
        )}
      </div>

      {open && results.length > 0 && (
        <div
          className="search-dropdown absolute top-full left-0 right-0 mt-1 z-50 max-h-64 overflow-y-auto"
          style={{
            background: 'var(--parchment)',
            border: '1px solid rgba(184,134,11,.38)',
            boxShadow: '0 8px 24px rgba(28,18,8,0.3)',
          }}
        >
          {results.map(herb => (
            <button
              key={herb.id}
              onClick={() => handleSelect(herb)}
              className="search-result w-full text-left px-4 py-2 transition-colors duration-150"
              style={{ minHeight: isMobile ? 44 : undefined }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(184,134,11,.14)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >
              <span className="f-philosopher text-xs" style={{ color: 'var(--ink)', fontSize: '13px', fontWeight: 700 }}>
                {highlight(herb.name)}
              </span>
            </button>
          ))}
        </div>
      )}

      {open && query && results.length === 0 && !loading && (
        <div
          className="search-dropdown absolute top-full left-0 right-0 mt-1 z-50 px-4 py-3 text-center"
          style={{ background: 'var(--parchment)', border: '1px solid rgba(184,134,11,.38)' }}
        >
          <p className="f-italic text-sm" style={{ color: 'var(--ink-soft)', opacity: 0.7 }}>
            Трава не найдена
          </p>
        </div>
      )}
    </div>
  );
}

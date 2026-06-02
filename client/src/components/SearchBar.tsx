import { useState, useEffect, useRef } from 'react';
import { herbsApi } from '../api/herbs';
import { Herb } from '../types';

interface Props {
  onSelectHerb: (herb: Herb) => void;
}

export function SearchBar({ onSelectHerb }: Props) {
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
        <mark key={i} style={{ background: '#C9A84C50', color: '#1C1208' }}>
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
          style={{ color: '#C9A84C', opacity: 0.7 }}
        >
          <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/>
          <line x1="21" y1="21" x2="16.65" y2="16.65" stroke="currentColor" strokeWidth="2"/>
        </svg>
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Найти траву..."
          className="search-input w-full pl-9 pr-4 py-2 font-garamond text-sm focus:outline-none"
          style={{
            background: 'rgba(244,228,188,0.9)',
            border: '1px solid #C9A84C60',
            color: '#1C1208',
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
            background: '#F4E4BC',
            border: '1px solid #C9A84C60',
            boxShadow: '0 8px 24px rgba(28,18,8,0.3)',
          }}
        >
          {results.map(herb => (
            <button
              key={herb.id}
              onClick={() => handleSelect(herb)}
              className="search-result w-full text-left px-4 py-2 transition-colors duration-150 hover:bg-gold/20"
            >
              <span className="font-cinzel text-xs" style={{ color: '#1C1208', fontSize: '12px' }}>
                {highlight(herb.name)}
              </span>
            </button>
          ))}
        </div>
      )}

      {open && query && results.length === 0 && !loading && (
        <div
          className="search-dropdown absolute top-full left-0 right-0 mt-1 z-50 px-4 py-3 text-center"
          style={{ background: '#F4E4BC', border: '1px solid #C9A84C60' }}
        >
          <p className="font-garamond italic text-sm" style={{ color: '#3D2B1F', opacity: 0.6 }}>
            Трава не найдена
          </p>
        </div>
      )}
    </div>
  );
}

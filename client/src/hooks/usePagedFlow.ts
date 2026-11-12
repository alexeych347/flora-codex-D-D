import { RefObject, useCallback, useEffect, useRef, useState } from 'react';

/* ===========================================================================
   Разбиение непрерывного потока на страницы.

   Текст не режется и не перерисовывается: поток остаётся одним куском, а
   страница — это сдвиг потока внутри окна с overflow: hidden. Поэтому
   переносы строк на странице ровно те же, что были при замере, и буквица
   не может появиться дважды.
   =========================================================================== */

interface Zone { from: number; to: number; }

const EPS = 0.5;
const MAX_PAGES = 500;

function lineRects(node: Node, range: Range): DOMRect[] {
  range.selectNodeContents(node);
  return Array.from(range.getClientRects()).filter(r => r.height > 0);
}

/** Верхние границы всех строк и блоков — места, где поток можно разорвать. */
function collectBreaks(flow: HTMLElement, base: number): number[] {
  const range = document.createRange();
  const walker = document.createTreeWalker(flow, NodeFilter.SHOW_TEXT);
  const out = new Set<number>();
  let n: Node | null;
  while ((n = walker.nextNode())) {
    if (!n.textContent || !n.textContent.trim()) continue;
    for (const r of lineRects(n, range)) out.add(Math.round(r.top - base));
  }
  flow.querySelectorAll('[data-block]').forEach(el => {
    const r = el.getBoundingClientRect();
    out.add(Math.round(r.top - base));
    out.add(Math.round(r.bottom - base));
  });
  return Array.from(out).sort((a, b) => a - b);
}

/** Границы блоков: блок переносится целиком, если не влез в остаток страницы. */
function collectBlocks(flow: HTMLElement, base: number): Zone[] {
  return Array.from(flow.querySelectorAll('[data-block]')).map(el => {
    const r = el.getBoundingClientRect();
    return { from: r.top - base, to: r.bottom - base };
  });
}

/** Запретные зоны: атомарные блоки и «заголовок без двух строк под ним». */
function collectForbidden(flow: HTMLElement, base: number): Zone[] {
  const range = document.createRange();
  const zones: Zone[] = [];

  flow.querySelectorAll('[data-atomic]').forEach(el => {
    const r = el.getBoundingClientRect();
    zones.push({ from: r.top - base, to: r.bottom - base });
  });

  flow.querySelectorAll('[data-keep-next]').forEach(head => {
    const hr = head.getBoundingClientRect();
    const body = head.nextElementSibling;
    if (!body) { zones.push({ from: hr.top - base, to: hr.bottom - base }); return; }

    // до верха третьей строки под заголовком рвать нельзя: иначе заголовок
    // останется внизу страницы с одной строкой или вовсе один
    const walker = document.createTreeWalker(body, NodeFilter.SHOW_TEXT);
    const tops: number[] = [];
    let n: Node | null;
    while ((n = walker.nextNode()) && tops.length < 3) {
      if (!n.textContent || !n.textContent.trim()) continue;
      for (const r of lineRects(n, range)) {
        tops.push(r.top - base);
        if (tops.length >= 3) break;
      }
    }
    const to = tops.length >= 3 ? tops[2] : body.getBoundingClientRect().bottom - base;
    zones.push({ from: hr.top - base, to });
  });

  return zones;
}

function inZone(y: number, zones: Zone[]): boolean {
  return zones.some(z => y > z.from + EPS && y < z.to - EPS);
}

/** Сдвиги потока для каждой страницы. Экспортируется ради проверок. */
export function computeOffsets(
  pageH: number,
  totalH: number,
  breaks: number[],
  blocks: Zone[],
  forbidden: Zone[],
): number[] {
  const offsets = [0];
  if (pageH <= 0) return offsets;

  let cur = 0;
  for (let guard = 0; guard < MAX_PAGES; guard++) {
    if (cur + pageH >= totalH - 1) break;
    const limit = cur + pageH;
    let next = 0;

    // блок, который разрезает граница страницы
    const b = blocks.find(z => z.from <= limit + EPS && z.to > limit + EPS);
    if (b && b.from > cur + EPS && b.to - b.from <= pageH) {
      next = b.from;                      // влез бы в пустую страницу — переносим целиком
    } else {
      for (const y of breaks) {           // иначе последняя строка, которая влезла
        if (y > cur + EPS && y <= limit + EPS && !inZone(y, forbidden)) next = y;
      }
    }

    if (!next || next <= cur + EPS) next = limit;   // страховка от зацикливания
    offsets.push(next);
    cur = next;
  }
  return offsets;
}

export function usePagedFlow(
  viewportRef: RefObject<HTMLElement>,
  flowRef: RefObject<HTMLElement>,
  contentKey: string,
) {
  const [offsets, setOffsets] = useState<number[]>([0]);
  const [page, setPage] = useState(0);
  const [ready, setReady] = useState(false);
  const offsetsRef = useRef<number[]>([0]);
  const pageRef = useRef(0);
  pageRef.current = page;

  const measure = useCallback(() => {
    const vp = viewportRef.current;
    const flow = flowRef.current;
    if (!vp || !flow) return;

    // меряем без сдвига и без анимации, иначе попадём в середину перехода
    const prevTransform = flow.style.transform;
    const prevTransition = flow.style.transition;
    flow.style.transition = 'none';
    flow.style.transform = 'none';

    const pageH = vp.clientHeight;
    const rect = flow.getBoundingClientRect();
    const next = computeOffsets(
      pageH, rect.height,
      collectBreaks(flow, rect.top),
      collectBlocks(flow, rect.top),
      collectForbidden(flow, rect.top),
    );

    flow.style.transform = prevTransform;
    flow.style.transition = prevTransition;

    // держим позицию чтения: страница, начало которой не ниже прежнего сдвига
    const was = offsetsRef.current[pageRef.current] ?? 0;
    let keep = 0;
    next.forEach((y, i) => { if (y <= was + EPS) keep = i; });

    offsetsRef.current = next;
    setOffsets(next);
    setPage(keep);
    setReady(true);
  }, [viewportRef, flowRef]);

  // первый замер — только после шрифтов и картинок, иначе промах на строку
  useEffect(() => {
    let alive = true;
    const run = async () => {
      try { await document.fonts?.ready; } catch { /* нет Font Loading API */ }

      // Окно появляется с анимацией scale(.94). clientHeight её не видит, а
      // getBoundingClientRect — видит, и замер в середине анимации смешал бы
      // масштабированные координаты с немасштабированной высотой страницы.
      const vp = viewportRef.current;
      if (vp && typeof vp.getAnimations === 'function') {
        const root = vp.closest('.modal-pop') ?? vp;
        await Promise.all(root.getAnimations({ subtree: true })
          .map(a => a.finished.catch(() => undefined)));
      }

      const flow = flowRef.current;
      if (flow) {
        await Promise.all(Array.from(flow.querySelectorAll('img')).map(
          img => (img.decode ? img.decode().catch(() => undefined) : Promise.resolve())));
      }
      if (!alive) return;
      requestAnimationFrame(() => { if (alive) measure(); });
    };
    run();
    return () => { alive = false; };
  }, [measure, flowRef, viewportRef, contentKey]);

  // поворот экрана и любое изменение высоты окна страницы
  useEffect(() => {
    const vp = viewportRef.current;
    if (!vp || typeof ResizeObserver === 'undefined') return;
    let timer: ReturnType<typeof setTimeout> | null = null;
    const ro = new ResizeObserver(() => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(measure, 120);
    });
    ro.observe(vp);
    return () => { if (timer) clearTimeout(timer); ro.disconnect(); };
  }, [measure, viewportRef]);

  const total = offsets.length;
  const safePage = Math.min(page, total - 1);
  const start = offsets[safePage] ?? 0;
  const end = offsets[safePage + 1];

  return {
    page: safePage,
    total,
    ready,
    offset: start,
    // Высота ровно этой страницы. Окно выше, чем страница, на остаток до
    // следующего разрыва, и без подрезки снизу торчала бы верхушка строки,
    // которая принадлежит уже следующей странице.
    pageHeight: end === undefined ? undefined : end - start,
    canPrev: safePage > 0,
    canNext: safePage < total - 1,
    toPrev: () => setPage(p => Math.max(0, p - 1)),
    toNext: () => setPage(p => Math.min(offsetsRef.current.length - 1, p + 1)),
  };
}

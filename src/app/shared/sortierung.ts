import { signal } from '@angular/core';

export type SortRichtung = 'asc' | 'desc';

export interface Sortierung {
  spalte: ReturnType<typeof signal<string | null>>;
  richtung: ReturnType<typeof signal<SortRichtung>>;
  toggle: (spalte: string) => void;
  indikator: (spalte: string) => string;
}

export function createSortierung(): Sortierung {
  const spalte = signal<string | null>(null);
  const richtung = signal<SortRichtung>('asc');

  return {
    spalte,
    richtung,
    toggle(neueSpalte: string): void {
      if (spalte() === neueSpalte) {
        richtung.update(r => (r === 'asc' ? 'desc' : 'asc'));
      } else {
        spalte.set(neueSpalte);
        richtung.set('asc');
      }
    },
    indikator(s: string): string {
      if (spalte() !== s) return '';
      return richtung() === 'asc' ? ' ↑' : ' ↓';
    },
  };
}

export function sortiereItems<T>(
  items: T[],
  spalte: string | null,
  richtung: SortRichtung,
  wertFuer: (item: T, spalte: string) => unknown,
): T[] {
  if (!spalte) return items;
  return [...items].sort((a, b) => {
    const av = String(wertFuer(a, spalte) ?? '');
    const bv = String(wertFuer(b, spalte) ?? '');
    const cmp = av.localeCompare(bv, 'de-CH', { numeric: true });
    return richtung === 'asc' ? cmp : -cmp;
  });
}

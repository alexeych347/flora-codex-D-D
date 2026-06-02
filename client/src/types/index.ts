export type Rarity = 'COMMON' | 'UNCOMMON' | 'RARE' | 'VERY_RARE';

export interface Herb {
  id: string;
  name: string;
  latinName: string;
  imageUrl?: string | null;
  rarity: Rarity;
  discoveredAt?: string | null;
  description: string;
  properties: string[];
  effects: string;
  isUnlocked: true;
  sortOrder: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface LockedHerbStub {
  id: string;
  isUnlocked: false;
  sortOrder: number;
  rarity: Rarity;
}

export type HerbOrStub = Herb | LockedHerbStub;

export function isFullHerb(herb: HerbOrStub): herb is Herb {
  return herb.isUnlocked === true;
}

export const RARITY_LABELS: Record<Rarity, string> = {
  COMMON: 'Обычная',
  UNCOMMON: 'Необычная',
  RARE: 'Редкая',
  VERY_RARE: 'Очень редкая',
};

export const RARITY_COLORS: Record<Rarity, string> = {
  COMMON: '#8A9B8A',
  UNCOMMON: '#4A7C59',
  RARE: '#3A5F8A',
  VERY_RARE: '#7B3FA0',
};

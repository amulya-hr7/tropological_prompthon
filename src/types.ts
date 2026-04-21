export type Category =
  | 'politics'
  | 'technology'
  | 'climate'
  | 'health'
  | 'economy'
  | 'sports'
  | 'entertainment'
  | 'science';

export interface CategoryMeta {
  label: string;
  color: string;
  description: string;
}

export const CATEGORIES: Record<Category, CategoryMeta> = {
  politics: {
    label: 'Politics',
    color: '#ef4444',
    description: 'Government, elections, policy, and international relations',
  },
  technology: {
    label: 'Technology',
    color: '#3b82f6',
    description: 'AI, software, hardware, and digital innovation',
  },
  climate: {
    label: 'Climate',
    color: '#22c55e',
    description: 'Environment, energy, sustainability, and climate science',
  },
  health: {
    label: 'Health',
    color: '#ec4899',
    description: 'Medicine, public health, research, and wellness',
  },
  economy: {
    label: 'Economy',
    color: '#f59e0b',
    description: 'Markets, finance, trade, and economic policy',
  },
  sports: {
    label: 'Sports',
    color: '#f97316',
    description: 'Athletics, leagues, competitions, and sports culture',
  },
  entertainment: {
    label: 'Entertainment',
    color: '#14b8a6',
    description: 'Film, music, media, celebrities, and culture',
  },
  science: {
    label: 'Science',
    color: '#06b6d4',
    description: 'Research, discovery, physics, astronomy, and biology',
  },
};

export interface NewsArticle {
  id: string;
  title: string;
  summary: string;
  category: Category;
  source: string;
  timestamp: Date;
  embedding: number[];
  projected?: [number, number];
}

export interface Transform {
  x: number;
  y: number;
  scale: number;
}

export type TimePeriod = '24h' | '7d' | '30d' | 'all';

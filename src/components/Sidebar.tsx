import { Search, X } from 'lucide-react';
import { Category, CATEGORIES, TimePeriod } from '../types';

interface Props {
  activeCategories: Set<Category>;
  onToggleCategory: (cat: Category) => void;
  timePeriod: TimePeriod;
  onSetTimePeriod: (t: TimePeriod) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  visibleCount: number;
  totalCount: number;
}

const TIME_OPTIONS: { value: TimePeriod; label: string }[] = [
  { value: '24h', label: 'Last 24 hours' },
  { value: '7d', label: 'Last 7 days' },
  { value: '30d', label: 'Last 30 days' },
  { value: 'all', label: 'All time' },
];

export default function Sidebar({
  activeCategories,
  onToggleCategory,
  timePeriod,
  onSetTimePeriod,
  searchQuery,
  onSearchChange,
  visibleCount,
  totalCount,
}: Props) {
  const allActive = activeCategories.size === Object.keys(CATEGORIES).length;

  const handleToggleAll = () => {
    const cats = Object.keys(CATEGORIES) as Category[];
    if (allActive) {
      cats.forEach(c => {
        if (activeCategories.has(c)) onToggleCategory(c);
      });
    } else {
      cats.forEach(c => {
        if (!activeCategories.has(c)) onToggleCategory(c);
      });
    }
  };

  return (
    <aside className="w-64 flex-shrink-0 bg-slate-900 border-r border-slate-800 flex flex-col h-full overflow-y-auto">
      {/* Search */}
      <div className="p-4 border-b border-slate-800">
        <label className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-2 block">
          Search Articles
        </label>
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => onSearchChange(e.target.value)}
            placeholder="Keywords..."
            className="w-full bg-slate-800 border border-slate-700 rounded-md pl-8 pr-8 py-2 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500 transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
            >
              <X size={12} />
            </button>
          )}
        </div>
      </div>

      {/* Time Period */}
      <div className="p-4 border-b border-slate-800">
        <label className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-3 block">
          Time Period
        </label>
        <div className="flex flex-col gap-1">
          {TIME_OPTIONS.map(opt => (
            <button
              key={opt.value}
              onClick={() => onSetTimePeriod(opt.value)}
              className={`text-left text-sm px-3 py-2 rounded-md transition-colors font-medium ${
                timePeriod === opt.value
                  ? 'bg-slate-700 text-slate-100'
                  : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Categories */}
      <div className="p-4 flex-1">
        <div className="flex items-center justify-between mb-3">
          <label className="text-xs font-semibold uppercase tracking-widest text-slate-500">
            Topics
          </label>
          <button
            onClick={handleToggleAll}
            className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
          >
            {allActive ? 'Clear all' : 'Select all'}
          </button>
        </div>
        <div className="flex flex-col gap-1">
          {(Object.keys(CATEGORIES) as Category[]).map(cat => {
            const meta = CATEGORIES[cat];
            const isActive = activeCategories.has(cat);
            return (
              <button
                key={cat}
                onClick={() => onToggleCategory(cat)}
                className={`flex items-center gap-3 text-sm px-3 py-2.5 rounded-md transition-all text-left group ${
                  isActive ? 'bg-slate-800' : 'opacity-40 hover:opacity-60'
                }`}
              >
                <span
                  className="w-3 h-3 rounded-full flex-shrink-0 transition-transform group-hover:scale-110"
                  style={{ backgroundColor: meta.color, boxShadow: isActive ? `0 0 8px ${meta.color}66` : 'none' }}
                />
                <span className={`font-medium ${isActive ? 'text-slate-200' : 'text-slate-500'}`}>
                  {meta.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Stats */}
      <div className="p-4 border-t border-slate-800">
        <div className="bg-slate-800/50 rounded-lg p-3">
          <div className="flex justify-between items-center">
            <span className="text-xs text-slate-500">Visible articles</span>
            <span className="text-sm font-bold text-slate-200 tabular-nums">{visibleCount}</span>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-1 mt-2">
            <div
              className="h-1 rounded-full bg-blue-500 transition-all duration-300"
              style={{ width: `${totalCount > 0 ? (visibleCount / totalCount) * 100 : 0}%` }}
            />
          </div>
          <div className="text-xs text-slate-600 mt-1">{totalCount} total indexed</div>
        </div>
      </div>
    </aside>
  );
}

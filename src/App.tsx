import { useState, useEffect, useMemo, useCallback } from 'react';
import { Activity, Info, RefreshCw } from 'lucide-react';
import { Category, NewsArticle, TimePeriod, CATEGORIES } from './types';
import { generateNewsArticles } from './data/newsData';
import { runPCA, normalizeProjections } from './utils/pca';
import VisualizationCanvas from './components/VisualizationCanvas';
import Sidebar from './components/Sidebar';
import ArticlePanel from './components/ArticlePanel';
import MethodologyPanel from './components/MethodologyPanel';

function timeFilter(article: NewsArticle, period: TimePeriod): boolean {
  if (period === 'all') return true;
  const now = new Date('2026-04-21').getTime();
  const ms = article.timestamp.getTime();
  const hours = (now - ms) / (1000 * 60 * 60);
  if (period === '24h') return hours <= 24;
  if (period === '7d') return hours <= 24 * 7;
  if (period === '30d') return hours <= 24 * 30;
  return true;
}

const ALL_CATEGORIES = new Set(Object.keys(CATEGORIES) as Category[]);

export default function App() {
  const [activeCategories, setActiveCategories] = useState<Set<Category>>(new Set(ALL_CATEGORIES));
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedArticle, setSelectedArticle] = useState<NewsArticle | null>(null);
  const [showMethodology, setShowMethodology] = useState(false);
  const [isComputing, setIsComputing] = useState(true);

  const [allArticles, setAllArticles] = useState<NewsArticle[]>([]);
  const [explainedVariance, setExplainedVariance] = useState<[number, number]>([0, 0]);

  useEffect(() => {
    const timer = setTimeout(() => {
      const articles = generateNewsArticles();
      const embeddings = articles.map(a => a.embedding);
      const result = runPCA(embeddings);
      const normalized = normalizeProjections(result.projected);
      const enriched = articles.map((a, i) => ({ ...a, projected: normalized[i] }));
      setAllArticles(enriched);
      setExplainedVariance(result.explainedVariance);
      setIsComputing(false);
    }, 900);
    return () => clearTimeout(timer);
  }, []);

  const toggleCategory = useCallback((cat: Category) => {
    setActiveCategories(prev => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  }, []);

  const visibleArticles = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return allArticles.filter(a => {
      if (!activeCategories.has(a.category)) return false;
      if (!timeFilter(a, timePeriod)) return false;
      if (q && !a.title.toLowerCase().includes(q) && !a.summary.toLowerCase().includes(q) && !a.source.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [allArticles, activeCategories, timePeriod, searchQuery]);

  const handleRecompute = () => {
    setIsComputing(true);
    setSelectedArticle(null);
    setTimeout(() => setIsComputing(false), 650);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 flex flex-col font-sans">
      {/* Header */}
      <header className="flex-shrink-0 border-b border-slate-800 bg-slate-900/80 backdrop-blur-sm px-6 py-3 flex items-center gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center">
            <Activity size={16} className="text-blue-400" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-slate-100 tracking-tight">Semantic News Map</h1>
            <p className="text-xs text-slate-500">Conceptual distance visualization · PCA embeddings</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 ml-4">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
          </span>
          <span className="text-xs text-slate-500">Live index</span>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={handleRecompute}
            className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 px-3 py-1.5 rounded-md transition-colors"
          >
            <RefreshCw size={12} className={isComputing ? 'animate-spin' : ''} />
            Recompute PCA
          </button>
          <button
            onClick={() => setShowMethodology(true)}
            className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 px-3 py-1.5 rounded-md transition-colors"
          >
            <Info size={12} />
            Methodology
          </button>
        </div>
      </header>

      {/* Body */}
      <div className="flex flex-1 overflow-hidden" style={{ height: 'calc(100vh - 97px)' }}>
        <Sidebar
          activeCategories={activeCategories}
          onToggleCategory={toggleCategory}
          timePeriod={timePeriod}
          onSetTimePeriod={setTimePeriod}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          visibleCount={visibleArticles.length}
          totalCount={allArticles.length}
        />

        {/* Canvas area */}
        <main className="flex-1 relative overflow-hidden bg-slate-950">
          {/* Background dot grid */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage: 'radial-gradient(circle, #1e293b 1px, transparent 1px)',
              backgroundSize: '32px 32px',
            }}
          />

          {isComputing ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-5 z-10">
              <div className="relative">
                <div className="w-16 h-16 rounded-full border-2 border-slate-800" />
                <div className="absolute inset-0 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
                <div className="absolute inset-3 rounded-full border border-blue-700 border-b-transparent animate-spin" style={{ animationDirection: 'reverse', animationDuration: '600ms' }} />
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold text-slate-300">Computing PCA projections</p>
                <p className="text-xs text-slate-600 mt-1">Analyzing semantic embeddings in 20-dimensional space...</p>
              </div>
              <div className="flex gap-2">
                {['Mean-center', 'Covariance', 'Eigenvectors', 'Project'].map((step) => (
                  <div
                    key={step}
                    className="text-xs px-2.5 py-1.5 rounded-md border border-slate-800 bg-slate-900 text-slate-600 font-mono"
                  >
                    {step}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <VisualizationCanvas
              articles={visibleArticles}
              selectedId={selectedArticle?.id ?? null}
              onSelect={setSelectedArticle}
              explainedVariance={explainedVariance}
            />
          )}
        </main>

        <ArticlePanel
          article={selectedArticle}
          onClose={() => setSelectedArticle(null)}
        />
      </div>

      {/* Footer legend */}
      <footer className="flex-shrink-0 border-t border-slate-800 bg-slate-900/80 backdrop-blur-sm px-6 py-2.5 flex items-center gap-5 overflow-x-auto">
        <span className="text-xs text-slate-600 flex-shrink-0 font-medium">CLUSTERS</span>
        {(Object.keys(CATEGORIES) as Category[]).map(cat => {
          const meta = CATEGORIES[cat];
          const isActive = activeCategories.has(cat);
          return (
            <button
              key={cat}
              onClick={() => toggleCategory(cat)}
              className={`flex items-center gap-1.5 flex-shrink-0 transition-all hover:opacity-100 ${isActive ? 'opacity-100' : 'opacity-25'}`}
            >
              <span
                className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                style={{
                  backgroundColor: meta.color,
                  boxShadow: isActive ? `0 0 6px ${meta.color}` : 'none',
                }}
              />
              <span className="text-xs text-slate-400 font-medium">{meta.label}</span>
            </button>
          );
        })}
        <div className="ml-auto flex-shrink-0 text-xs text-slate-700 font-mono">
          {visibleArticles.length} articles · {(explainedVariance[0] + explainedVariance[1] > 0 ? ((explainedVariance[0] + explainedVariance[1]) * 100).toFixed(1) : '—')}% var explained
        </div>
      </footer>

      {showMethodology && (
        <MethodologyPanel
          onClose={() => setShowMethodology(false)}
          explainedVariance={explainedVariance}
          totalArticles={allArticles.length}
        />
      )}
    </div>
  );
}

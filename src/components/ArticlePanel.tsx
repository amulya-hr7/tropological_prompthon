import { X, Calendar, Tag } from 'lucide-react';
import { NewsArticle, CATEGORIES } from '../types';

interface Props {
  article: NewsArticle | null;
  onClose: () => void;
}

export default function ArticlePanel({ article, onClose }: Props) {
  if (!article) return null;

  const meta = CATEGORIES[article.category];
  const dateStr = article.timestamp.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const embeddingPreview = article.embedding.slice(0, 10).map(v => v.toFixed(2));

  return (
    <div className="w-80 flex-shrink-0 bg-slate-900 border-l border-slate-800 flex flex-col h-full overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-800">
        <span className="text-xs font-semibold uppercase tracking-widest text-slate-500">Article Detail</span>
        <button
          onClick={onClose}
          className="w-6 h-6 flex items-center justify-center rounded text-slate-500 hover:text-slate-300 hover:bg-slate-800 transition-colors"
        >
          <X size={14} />
        </button>
      </div>

      {/* Category badge */}
      <div className="px-4 pt-4">
        <span
          className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full"
          style={{ backgroundColor: `${meta.color}20`, color: meta.color, border: `1px solid ${meta.color}40` }}
        >
          <Tag size={10} />
          {meta.label}
        </span>
      </div>

      {/* Title */}
      <div className="px-4 pt-3">
        <h3 className="text-base font-semibold text-slate-100 leading-snug">{article.title}</h3>
      </div>

      {/* Meta */}
      <div className="px-4 pt-3 flex items-center gap-3 text-xs text-slate-500">
        <span className="font-medium text-slate-400">{article.source}</span>
        <span className="text-slate-700">·</span>
        <span className="flex items-center gap-1">
          <Calendar size={10} />
          {dateStr}
        </span>
      </div>

      {/* Summary */}
      <div className="px-4 pt-4">
        <p className="text-sm text-slate-400 leading-relaxed">{article.summary}</p>
      </div>

      {/* Separator */}
      <div className="mx-4 mt-5 border-t border-slate-800" />

      {/* Embedding info */}
      <div className="px-4 pt-4">
        <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-2">
          Embedding Snapshot
        </p>
        <div className="bg-slate-800/60 rounded-lg p-3">
          <p className="text-xs text-slate-600 mb-2 font-medium">20-dimensional vector (first 10 dims)</p>
          <div className="flex flex-wrap gap-1">
            {embeddingPreview.map((v, i) => (
              <span
                key={i}
                className="text-xs font-mono px-1.5 py-0.5 rounded"
                style={{
                  backgroundColor: `rgba(59, 130, 246, ${Math.abs(parseFloat(v)) * 0.4 + 0.05})`,
                  color: '#93c5fd',
                }}
              >
                {v}
              </span>
            ))}
            <span className="text-xs font-mono text-slate-600 px-1.5 py-0.5">...</span>
          </div>
        </div>
      </div>

      {/* Projected coordinates */}
      <div className="px-4 pt-4">
        <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-2">
          PCA Projection
        </p>
        <div className="bg-slate-800/60 rounded-lg p-3">
          <div className="flex gap-4">
            <div>
              <span className="text-xs text-slate-600 font-mono">PC1</span>
              <p className="text-sm font-mono font-bold text-slate-300 mt-0.5">
                {article.projected ? article.projected[0].toFixed(4) : '—'}
              </p>
            </div>
            <div>
              <span className="text-xs text-slate-600 font-mono">PC2</span>
              <p className="text-sm font-mono font-bold text-slate-300 mt-0.5">
                {article.projected ? article.projected[1].toFixed(4) : '—'}
              </p>
            </div>
          </div>
          <p className="text-xs text-slate-600 mt-2">
            Position reflects conceptual distance from other articles in semantic space.
          </p>
        </div>
      </div>

      {/* Category description */}
      <div className="px-4 pt-4 pb-4">
        <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-2">
          Cluster
        </p>
        <div
          className="rounded-lg p-3 text-xs text-slate-400"
          style={{ backgroundColor: `${meta.color}10`, borderLeft: `3px solid ${meta.color}60` }}
        >
          {meta.description}
        </div>
      </div>
    </div>
  );
}

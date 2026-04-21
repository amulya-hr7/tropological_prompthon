import React, { useRef, useState, useCallback, useEffect, useMemo } from 'react';
import { NewsArticle, CATEGORIES, Transform } from '../types';
import { clusterCentroids } from '../utils/pca';
import { ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';

interface TooltipState {
  article: NewsArticle;
  x: number;
  y: number;
}

interface Props {
  articles: NewsArticle[];
  selectedId: string | null;
  onSelect: (article: NewsArticle | null) => void;
  explainedVariance: [number, number];
}

const CANVAS_W = 800;
const CANVAS_H = 600;
const PADDING = 60;
const POINT_RADIUS = 6;

function projectToCanvas(x: number, y: number): [number, number] {
  const cx = CANVAS_W / 2 + x * (CANVAS_W / 2 - PADDING);
  const cy = CANVAS_H / 2 - y * (CANVAS_H / 2 - PADDING);
  return [cx, cy];
}

export default function VisualizationCanvas({ articles, selectedId, onSelect, explainedVariance }: Props) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [transform, setTransform] = useState<Transform>({ x: 0, y: 0, scale: 1 });
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);
  const [isPanning, setIsPanning] = useState(false);
  const panStart = useRef<{ mx: number; my: number; tx: number; ty: number } | null>(null);

  const centroids = useMemo(() => clusterCentroids(articles), [articles]);

  const handleWheel = useCallback((e: WheelEvent) => {
    e.preventDefault();
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    const factor = e.deltaY < 0 ? 1.12 : 1 / 1.12;
    setTransform(prev => {
      const newScale = Math.max(0.4, Math.min(12, prev.scale * factor));
      return {
        scale: newScale,
        x: mx - (mx - prev.x) * (newScale / prev.scale),
        y: my - (my - prev.y) * (newScale / prev.scale),
      };
    });
  }, []);

  useEffect(() => {
    const el = svgRef.current;
    if (!el) return;
    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => el.removeEventListener('wheel', handleWheel);
  }, [handleWheel]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    setIsPanning(true);
    panStart.current = { mx: e.clientX, my: e.clientY, tx: transform.x, ty: transform.y };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isPanning || !panStart.current) return;
    setTransform(prev => ({
      ...prev,
      x: panStart.current!.tx + e.clientX - panStart.current!.mx,
      y: panStart.current!.ty + e.clientY - panStart.current!.my,
    }));
  };

  const handleMouseUp = () => {
    setIsPanning(false);
    panStart.current = null;
  };

  const resetView = () => setTransform({ x: 0, y: 0, scale: 1 });
  const zoomIn = () => setTransform(prev => ({ ...prev, scale: Math.min(12, prev.scale * 1.3) }));
  const zoomOut = () => setTransform(prev => ({ ...prev, scale: Math.max(0.4, prev.scale / 1.3) }));

  const groupTransform = `translate(${transform.x}, ${transform.y}) scale(${transform.scale})`;

  const gridLines = useMemo(() => {
    const lines = [];
    const step = (CANVAS_W / 2 - PADDING) / 2;
    for (let i = -2; i <= 2; i++) {
      const x = CANVAS_W / 2 + i * step;
      const y = CANVAS_H / 2 + i * step;
      lines.push(<line key={`vg${i}`} x1={x} y1={PADDING / 2} x2={x} y2={CANVAS_H - PADDING / 2} stroke="#1e293b" strokeWidth="1" />);
      lines.push(<line key={`hg${i}`} x1={PADDING / 2} y1={y} x2={CANVAS_W - PADDING / 2} y2={y} stroke="#1e293b" strokeWidth="1" />);
    }
    return lines;
  }, []);

  return (
    <div className="relative w-full h-full flex flex-col">
      {/* Controls */}
      <div className="absolute top-4 right-4 z-10 flex flex-col gap-1.5">
        <button onClick={zoomIn} className="w-8 h-8 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded flex items-center justify-center text-slate-300 hover:text-white transition-colors">
          <ZoomIn size={14} />
        </button>
        <button onClick={zoomOut} className="w-8 h-8 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded flex items-center justify-center text-slate-300 hover:text-white transition-colors">
          <ZoomOut size={14} />
        </button>
        <button onClick={resetView} className="w-8 h-8 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded flex items-center justify-center text-slate-300 hover:text-white transition-colors">
          <Maximize2 size={14} />
        </button>
      </div>

      {/* Explained variance badges */}
      <div className="absolute top-4 left-4 z-10 flex flex-col gap-1">
        <div className="text-xs text-slate-500 bg-slate-900/80 px-2 py-1 rounded border border-slate-800">
          PC1 — {(explainedVariance[0] * 100).toFixed(1)}% variance
        </div>
        <div className="text-xs text-slate-500 bg-slate-900/80 px-2 py-1 rounded border border-slate-800">
          PC2 — {(explainedVariance[1] * 100).toFixed(1)}% variance
        </div>
      </div>

      {/* SVG Canvas */}
      <svg
        ref={svgRef}
        viewBox={`0 0 ${CANVAS_W} ${CANVAS_H}`}
        className="w-full h-full"
        style={{ cursor: isPanning ? 'grabbing' : 'grab', background: 'transparent' }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {/* Defs */}
        <defs>
          {Object.entries(CATEGORIES).map(([cat, meta]) => (
            <radialGradient key={cat} id={`glow-${cat}`} cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor={meta.color} stopOpacity="0.6" />
              <stop offset="100%" stopColor={meta.color} stopOpacity="0" />
            </radialGradient>
          ))}
          <filter id="glow-filter">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Axis lines */}
        <line x1={CANVAS_W / 2} y1={PADDING / 2} x2={CANVAS_W / 2} y2={CANVAS_H - PADDING / 2} stroke="#1e293b" strokeWidth="1.5" />
        <line x1={PADDING / 2} y1={CANVAS_H / 2} x2={CANVAS_W - PADDING / 2} y2={CANVAS_H / 2} stroke="#1e293b" strokeWidth="1.5" />

        {/* Axis labels */}
        <text x={CANVAS_W - PADDING / 2 + 8} y={CANVAS_H / 2 + 4} fill="#475569" fontSize="11" fontFamily="monospace">PC1</text>
        <text x={CANVAS_W / 2 + 6} y={PADDING / 2 - 6} fill="#475569" fontSize="11" fontFamily="monospace">PC2</text>

        <g transform={groupTransform}>
          {/* Grid */}
          {gridLines}

          {/* Cluster glow halos */}
          {Object.entries(centroids).map(([cat, [cx, cy]]) => {
            const [px, py] = projectToCanvas(cx, cy);
            return (
              <ellipse
                key={`halo-${cat}`}
                cx={px}
                cy={py}
                rx={70}
                ry={55}
                fill={`url(#glow-${cat})`}
                opacity={0.35}
              />
            );
          })}

          {/* Points */}
          {articles.map(article => {
            if (!article.projected) return null;
            const [px, py] = projectToCanvas(article.projected[0], article.projected[1]);
            const meta = CATEGORIES[article.category];
            const isSelected = article.id === selectedId;
            const isHovered = tooltip?.article.id === article.id;

            return (
              <g key={article.id}>
                {(isSelected || isHovered) && (
                  <circle
                    cx={px}
                    cy={py}
                    r={isSelected ? POINT_RADIUS + 6 : POINT_RADIUS + 4}
                    fill={meta.color}
                    opacity={0.25}
                  />
                )}
                <circle
                  cx={px}
                  cy={py}
                  r={isSelected ? POINT_RADIUS + 2 : POINT_RADIUS}
                  fill={meta.color}
                  stroke={isSelected ? '#fff' : meta.color}
                  strokeWidth={isSelected ? 1.5 : 0.5}
                  opacity={isSelected || isHovered ? 1 : 0.82}
                  style={{ cursor: 'pointer', transition: 'r 0.15s, opacity 0.15s' }}
                  filter={isSelected || isHovered ? 'url(#glow-filter)' : undefined}
                  onMouseEnter={(e) => {
                    const rect = svgRef.current?.getBoundingClientRect();
                    if (rect) {
                      setTooltip({
                        article,
                        x: e.clientX - rect.left,
                        y: e.clientY - rect.top,
                      });
                    }
                  }}
                  onMouseLeave={() => setTooltip(null)}
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelect(isSelected ? null : article);
                  }}
                />
              </g>
            );
          })}

          {/* Cluster centroid labels */}
          {Object.entries(centroids).map(([cat, [cx, cy]]) => {
            const [px, py] = projectToCanvas(cx, cy);
            const meta = CATEGORIES[cat as keyof typeof CATEGORIES];
            return (
              <g key={`label-${cat}`}>
                <text
                  x={px}
                  y={py - 40}
                  textAnchor="middle"
                  fill={meta.color}
                  fontSize="11"
                  fontWeight="600"
                  fontFamily="ui-sans-serif, system-ui, sans-serif"
                  letterSpacing="0.05em"
                  opacity={0.9}
                  style={{ textTransform: 'uppercase', pointerEvents: 'none' }}
                >
                  {meta.label.toUpperCase()}
                </text>
              </g>
            );
          })}
        </g>
      </svg>

      {/* Tooltip */}
      {tooltip && (
        <div
          className="absolute z-20 pointer-events-none max-w-xs"
          style={{
            left: tooltip.x + 14,
            top: tooltip.y - 10,
            transform: tooltip.x > CANVAS_W * 0.65 ? 'translateX(-110%)' : undefined,
          }}
        >
          <div className="bg-slate-900 border border-slate-700 rounded-lg p-3 shadow-xl">
            <div className="flex items-center gap-2 mb-1.5">
              <span
                className="inline-block w-2 h-2 rounded-full flex-shrink-0"
                style={{ backgroundColor: CATEGORIES[tooltip.article.category].color }}
              />
              <span className="text-xs font-semibold uppercase tracking-wide"
                style={{ color: CATEGORIES[tooltip.article.category].color }}>
                {CATEGORIES[tooltip.article.category].label}
              </span>
              <span className="text-xs text-slate-500 ml-auto">{tooltip.article.source}</span>
            </div>
            <p className="text-sm text-slate-100 font-medium leading-snug mb-1">{tooltip.article.title}</p>
            <p className="text-xs text-slate-400 leading-relaxed">{tooltip.article.summary.slice(0, 90)}...</p>
            <div className="mt-2 text-xs text-slate-600">
              {tooltip.article.timestamp.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </div>
          </div>
        </div>
      )}

      {/* Hint */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 text-xs text-slate-700 pointer-events-none">
        Scroll to zoom · Drag to pan · Click a point to inspect
      </div>
    </div>
  );
}

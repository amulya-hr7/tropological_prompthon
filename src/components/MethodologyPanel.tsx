import React from 'react';
import { X, Cpu, BarChart2, Layers, GitBranch } from 'lucide-react';

interface Props {
  onClose: () => void;
  explainedVariance: [number, number];
  totalArticles: number;
}

export default function MethodologyPanel({ onClose, explainedVariance, totalArticles }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto mx-4">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 sticky top-0 bg-slate-900 z-10">
          <div>
            <h2 className="text-base font-bold text-slate-100">Methodology</h2>
            <p className="text-xs text-slate-500 mt-0.5">How this visualization is constructed</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-500 hover:text-slate-300 hover:bg-slate-800 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <div className="px-6 py-5 space-y-6">
          {/* Overview */}
          <div>
            <p className="text-sm text-slate-400 leading-relaxed">
              This tool maps the <span className="text-slate-200 font-medium">conceptual distance</span> between news articles
              using high-dimensional semantic embeddings projected onto a 2D plane via Principal Component Analysis (PCA).
              Articles that appear close together share similar topics, vocabulary, and semantic content.
            </p>
          </div>

          {/* Steps */}
          <div className="space-y-4">
            <Step
              icon={<Layers size={16} />}
              step="1"
              title="Embedding Generation"
              color="#3b82f6"
            >
              <p>Each news article is encoded as a <strong className="text-slate-300">20-dimensional vector</strong> representing its semantic content. In production, these would come from transformer-based language models (e.g., BERT, Sentence-BERT, or OpenAI embeddings). Here, we simulate embeddings with category-specific centroids plus Gaussian noise, preserving realistic inter-category overlap.</p>
              <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                <div className="bg-slate-800 rounded p-2">
                  <div className="text-slate-500 font-medium mb-0.5">Vector Dimensions</div>
                  <div className="text-slate-300 font-bold font-mono">20</div>
                </div>
                <div className="bg-slate-800 rounded p-2">
                  <div className="text-slate-500 font-medium mb-0.5">Articles Indexed</div>
                  <div className="text-slate-300 font-bold font-mono">{totalArticles}</div>
                </div>
              </div>
            </Step>

            <Step
              icon={<Cpu size={16} />}
              step="2"
              title="Principal Component Analysis (PCA)"
              color="#22c55e"
            >
              <p>PCA reduces the 20-dimensional embedding space to 2 dimensions, preserving maximum variance. The algorithm:</p>
              <ol className="mt-2 space-y-1 list-decimal list-inside text-slate-400">
                <li>Mean-centers the embedding matrix</li>
                <li>Computes the sample covariance matrix (20×20)</li>
                <li>Finds the dominant eigenvector via power iteration (PC1)</li>
                <li>Deflates the covariance matrix and extracts PC2</li>
                <li>Projects all embeddings onto the PC1–PC2 plane</li>
              </ol>
              <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                <div className="bg-slate-800 rounded p-2">
                  <div className="text-slate-500 font-medium mb-0.5">PC1 Explained Variance</div>
                  <div className="text-green-400 font-bold font-mono">{(explainedVariance[0] * 100).toFixed(1)}%</div>
                </div>
                <div className="bg-slate-800 rounded p-2">
                  <div className="text-slate-500 font-medium mb-0.5">PC2 Explained Variance</div>
                  <div className="text-green-400 font-bold font-mono">{(explainedVariance[1] * 100).toFixed(1)}%</div>
                </div>
              </div>
              <p className="mt-2 text-slate-500">
                Combined, the two principal components capture <strong className="text-slate-400">{((explainedVariance[0] + explainedVariance[1]) * 100).toFixed(1)}%</strong> of total semantic variance.
              </p>
            </Step>

            <Step
              icon={<BarChart2 size={16} />}
              step="3"
              title="Cluster Visualization"
              color="#f59e0b"
            >
              <p>Each point represents one article, colored by its assigned category. Spatial proximity indicates semantic similarity. Cluster centroids are computed as the mean projected position within each category and labeled on the canvas.</p>
              <p className="mt-2">Radial glow halos highlight cluster regions, helping users identify topic groupings at a glance. Overlapping clusters indicate articles that blend topic domains (e.g., technology and science, politics and economy).</p>
            </Step>

            <Step
              icon={<GitBranch size={16} />}
              step="4"
              title="Interaction & Filtering"
              color="#ec4899"
            >
              <p>Users can explore the embedding space through:</p>
              <ul className="mt-2 space-y-1 list-disc list-inside text-slate-400">
                <li><strong className="text-slate-300">Zoom / Pan</strong> — mouse wheel to zoom, drag to pan</li>
                <li><strong className="text-slate-300">Category filter</strong> — toggle topic clusters on/off</li>
                <li><strong className="text-slate-300">Time filter</strong> — restrict view to recent articles</li>
                <li><strong className="text-slate-300">Search</strong> — highlight articles matching keyword queries</li>
                <li><strong className="text-slate-300">Click to inspect</strong> — view embedding details for any article</li>
              </ul>
            </Step>
          </div>

          {/* Bias note */}
          <div className="bg-amber-950/40 border border-amber-900/50 rounded-lg p-4">
            <h4 className="text-xs font-bold uppercase tracking-wide text-amber-500 mb-2">Bias Considerations</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Embedding models inherit biases from their training corpora. Western and English-language news sources may be over-represented, causing non-English topics to cluster differently than expected. Category boundaries are human-defined heuristics — many real articles span multiple domains. PCA maximizes variance, not semantic interpretability, so axis directions may not align with intuitive concepts.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Step({
  icon, step, title, color, children
}: {
  icon: React.ReactNode;
  step: string;
  title: string;
  color: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex gap-4">
      <div className="flex-shrink-0 flex flex-col items-center">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: `${color}20`, color }}
        >
          {icon}
        </div>
        <div className="flex-1 w-px bg-slate-800 mt-2" />
      </div>
      <div className="pb-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs font-mono" style={{ color }}>{`STEP ${step}`}</span>
          <h3 className="text-sm font-semibold text-slate-200">{title}</h3>
        </div>
        <div className="text-xs text-slate-400 leading-relaxed space-y-2">
          {children}
        </div>
      </div>
    </div>
  );
}

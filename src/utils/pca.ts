function dot(a: number[], b: number[]): number {
  return a.reduce((sum, v, i) => sum + v * b[i], 0);
}

function norm(v: number[]): number {
  return Math.sqrt(dot(v, v));
}

function normalize(v: number[]): number[] {
  const n = norm(v);
  return n === 0 ? v : v.map(x => x / n);
}

function matVecMul(matrix: number[][], vec: number[]): number[] {
  return matrix.map(row => dot(row, vec));
}

// Compute sample covariance matrix of centered data
function covarianceMatrix(data: number[][]): number[][] {
  const n = data.length;
  const dims = data[0].length;
  const cov: number[][] = Array.from({ length: dims }, () => new Array(dims).fill(0));

  for (let i = 0; i < dims; i++) {
    for (let j = i; j < dims; j++) {
      let sum = 0;
      for (const row of data) {
        sum += row[i] * row[j];
      }
      const val = sum / (n - 1);
      cov[i][j] = val;
      cov[j][i] = val;
    }
  }

  return cov;
}

// Deflate: remove component of v along direction of u (Gram-Schmidt style)
function deflate(matrix: number[][], eigenvector: number[]): number[][] {
  const dims = matrix.length;
  return Array.from({ length: dims }, (_, i) =>
    Array.from({ length: dims }, (_, j) => matrix[i][j] - eigenvector[i] * eigenvector[j])
  );
}

// Power iteration to find dominant eigenvector
function powerIteration(matrix: number[][], dims: number, iterations = 200): number[] {
  // Initialize with a fixed non-random vector to ensure reproducibility
  let v = new Array(dims).fill(0).map((_, i) => (i === 0 ? 1 : 0.1 * (i + 1)));
  v = normalize(v);

  for (let iter = 0; iter < iterations; iter++) {
    const vNew = matVecMul(matrix, v);
    const n = norm(vNew);
    if (n < 1e-12) break;
    v = vNew.map(x => x / n);
  }

  return v;
}

export interface PCAResult {
  projected: [number, number][];
  components: [number[], number[]];
  explainedVariance: [number, number];
}

export function runPCA(data: number[][]): PCAResult {
  const n = data.length;
  const dims = data[0].length;

  // 1. Compute mean
  const mean = new Array(dims).fill(0);
  for (const row of data) {
    for (let j = 0; j < dims; j++) {
      mean[j] += row[j];
    }
  }
  for (let j = 0; j < dims; j++) {
    mean[j] /= n;
  }

  // 2. Center data
  const centered = data.map(row => row.map((v, j) => v - mean[j]));

  // 3. Compute covariance matrix
  let cov = covarianceMatrix(centered);

  // 4. Find PC1 via power iteration
  const pc1 = powerIteration(cov, dims);
  const lambda1 = dot(matVecMul(cov, pc1), pc1);

  // 5. Deflate and find PC2
  const deflated = deflate(cov, pc1);
  const pc2 = powerIteration(deflated, dims);
  const lambda2 = dot(matVecMul(deflated, pc2), pc2);

  // 6. Project data
  const projected: [number, number][] = centered.map(row => [
    dot(row, pc1),
    dot(row, pc2),
  ]);

  // 7. Total variance (trace of covariance matrix)
  let totalVar = 0;
  for (let i = 0; i < dims; i++) totalVar += cov[i][i];
  const explainedVariance: [number, number] = [
    Math.abs(lambda1) / totalVar,
    Math.abs(lambda2) / totalVar,
  ];

  return { projected, components: [pc1, pc2], explainedVariance };
}

// Normalize projected coordinates to fit in a canonical space [-1, 1]
export function normalizeProjections(projected: [number, number][]): [number, number][] {
  const xs = projected.map(p => p[0]);
  const ys = projected.map(p => p[1]);
  const xMin = Math.min(...xs);
  const xMax = Math.max(...xs);
  const yMin = Math.min(...ys);
  const yMax = Math.max(...ys);
  const xRange = xMax - xMin || 1;
  const yRange = yMax - yMin || 1;
  const maxRange = Math.max(xRange, yRange);

  return projected.map(([x, y]) => [
    ((x - (xMin + xMax) / 2) / maxRange) * 2,
    ((y - (yMin + yMax) / 2) / maxRange) * 2,
  ]);
}

// Compute cluster centroid in projected space for label placement
export function clusterCentroids<T extends { category: string; projected?: [number, number] }>(
  articles: T[]
): Record<string, [number, number]> {
  const sums: Record<string, [number, number, number]> = {};
  for (const a of articles) {
    if (!a.projected) continue;
    if (!sums[a.category]) sums[a.category] = [0, 0, 0];
    sums[a.category][0] += a.projected[0];
    sums[a.category][1] += a.projected[1];
    sums[a.category][2]++;
  }
  const centroids: Record<string, [number, number]> = {};
  for (const [cat, [sx, sy, count]] of Object.entries(sums)) {
    centroids[cat] = [sx / count, sy / count];
  }
  return centroids;
}

export const normalizeLabel = (value) => {
  if (value === null || value === undefined) {
    return "Unknown";
  }
  const cleaned = String(value).trim().replace(/\s+/g, " ");
  return cleaned.length > 0 ? cleaned : "Unknown";
};

export const topN = (items, n, key) => {
  const getValue =
    typeof key === "function" ? key : (item) => item?.[key] ?? 0;
  const sorted = [...items].sort((a, b) => getValue(b) - getValue(a));
  return {
    top: sorted.slice(0, n),
    remaining: Math.max(0, sorted.length - n),
    sorted,
  };
};

export const isSkewed = (values) => {
  if (!values || values.length < 2) {
    return false;
  }
  const sorted = [...values].sort((a, b) => a - b);
  const max = sorted[sorted.length - 1];
  const p50 = percentile(sorted, 0.5);
  const p90 = percentile(sorted, 0.9);

  if (p50 > 0 && max / p50 > 100) {
    return true;
  }
  if (p50 === 0 && p90 > 0 && max / p90 > 100) {
    return true;
  }
  return false;
};

export const log1pTransform = (values) => values.map((v) => Math.log1p(v));

export const buildHistogram = (values, binCount = 30) => {
  if (!values.length) {
    return { labels: [], counts: [] };
  }
  const min = Math.min(...values);
  const max = Math.max(...values);
  if (min === max) {
    return {
      labels: [formatNumber(min)],
      counts: [values.length],
    };
  }

  const width = (max - min) / binCount;
  const counts = new Array(binCount).fill(0);
  values.forEach((value) => {
    const idx = Math.min(
      binCount - 1,
      Math.floor((value - min) / width),
    );
    counts[idx] += 1;
  });

  const labels = Array.from({ length: binCount }, (_, i) => {
    const start = min + width * i;
    const end = start + width;
    return `${formatNumber(start)}–${formatNumber(end)}`;
  });

  return { labels, counts };
};

export const sampleArray = (values, maxN, seed = 42) => {
  if (!values || values.length <= maxN) {
    return values;
  }
  const rng = createSeededRng(seed);
  const indices = [...values.keys()];
  for (let i = indices.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }
  const selected = indices.slice(0, maxN).sort((a, b) => a - b);
  return selected.map((idx) => values[idx]);
};

export const makeJitter = (n, range = 0.1, seed = 42) => {
  const rng = createSeededRng(seed);
  return Array.from({ length: n }, () => (rng() * 2 - 1) * range);
};

export const sanitizeFilename = (value) => {
  if (!value) {
    return "chart";
  }
  const sanitized = String(value)
    .replace(/[^a-z0-9-_]+/gi, "_")
    .replace(/^_+|_+$/g, "");
  return sanitized.length ? sanitized : "chart";
};

const percentile = (sorted, p) => {
  if (!sorted.length) {
    return 0;
  }
  const idx = (sorted.length - 1) * p;
  const lower = Math.floor(idx);
  const upper = Math.ceil(idx);
  if (lower === upper) {
    return sorted[lower];
  }
  return sorted[lower] + (sorted[upper] - sorted[lower]) * (idx - lower);
};

const createSeededRng = (seed = 42) => {
  let state = seed % 2147483647;
  if (state <= 0) {
    state += 2147483646;
  }
  return () => {
    state = (state * 16807) % 2147483647;
    return (state - 1) / 2147483646;
  };
};

const formatNumber = (value) => {
  if (!Number.isFinite(value)) {
    return "0";
  }
  const abs = Math.abs(value);
  if (abs >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  }
  if (abs >= 1000) {
    return `${(value / 1000).toFixed(1)}k`;
  }
  if (abs >= 10) {
    return value.toFixed(1);
  }
  return value.toFixed(2);
};

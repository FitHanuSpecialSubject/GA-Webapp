// Utility functions to compute summary metrics for
// Game Theory and Stable Matching results.

function jainsFairnessIndex(values) {
  if (!Array.isArray(values) || values.length === 0) return null;
  const cleaned = values
    .map((v) => Number(v))
    .filter((v) => Number.isFinite(v) && v >= 0);
  if (cleaned.length === 0) return null;

  const sum = cleaned.reduce((acc, v) => acc + v, 0);
  const sumSquares = cleaned.reduce((acc, v) => acc + v * v, 0);
  if (sum === 0 || sumSquares === 0) return null;

  const n = cleaned.length;
  return (sum * sum) / (n * sumSquares);
}

export function computeGTMetrics(players) {
  if (!Array.isArray(players) || players.length === 0) {
    return {
      socialWelfare: null,
      averageRank: null,
      worstCaseRank: null,
      fairnessIndex: null,
    };
  }

  const payoffs = players.map((p) => Number(p?.payoff) || 0);
  const n = payoffs.length;

  // Social welfare: total payoff of all players
  const socialWelfare = payoffs.reduce((acc, v) => acc + v, 0);

  // Rank players by payoff (higher payoff = better rank)
  const sorted = [...payoffs].sort((a, b) => b - a);
  const ranks = payoffs.map((value) => sorted.indexOf(value) + 1);

  const averageRank =
    ranks.reduce((acc, r) => acc + r, 0) / (ranks.length || 1);
  const worstCaseRank = Math.max(...ranks);

  const fairnessIndex = jainsFairnessIndex(payoffs);

  return {
    socialWelfare,
    averageRank,
    worstCaseRank,
    fairnessIndex,
  };
}

export function computeSMTMetrics(setSatisfactions, leftOvers, totalIndividuals) {
  const satisfactionsArray = Array.isArray(setSatisfactions)
    ? [...setSatisfactions]
    : [];

  const nIndividuals =
    Number.isInteger(totalIndividuals) && totalIndividuals > 0
      ? totalIndividuals
      : satisfactionsArray.length;

  const leftOverIndices = Array.isArray(leftOvers) ? leftOvers : [];

  // Build full satisfaction vector including leftovers (0 satisfaction)
  const fullSatisfactions =
    nIndividuals > 0
      ? Array.from({ length: nIndividuals }, (_, idx) => {
          const value = satisfactionsArray[idx];
          return Number.isFinite(Number(value)) ? Number(value) : 0;
        })
      : [];

  // Apply 0 satisfaction for leftovers explicitly if indices are in range
  leftOverIndices.forEach((idx) => {
    if (
      Number.isInteger(idx) &&
      idx >= 0 &&
      idx < fullSatisfactions.length
    ) {
      fullSatisfactions[idx] = 0;
    }
  });

  const matchedCount = nIndividuals - leftOverIndices.length;
  const matchingRate =
    nIndividuals > 0 ? (matchedCount / nIndividuals) * 100 : null;

  const socialWelfare = fullSatisfactions.reduce((acc, v) => acc + v, 0);

  const nonZero = fullSatisfactions.filter((v) => Number.isFinite(v));
  const avg =
    nonZero.length > 0
      ? nonZero.reduce((acc, v) => acc + v, 0) / nonZero.length
      : null;

  const worst =
    nonZero.length > 0 ? Math.min(...nonZero) : null;

  const fairnessIndex = jainsFairnessIndex(fullSatisfactions);

  return {
    matchingRate,
    socialWelfare,
    averageRank: avg,
    worstCaseRank: worst,
    fairnessIndex,
  };
}

/**
 * Compute high-level insight metrics from benchmarking fitness values
 * returned by backend insight runs.
 *
 * @param {Object<string, number[]>} fitnessValuesByAlgorithm
 */
export function computeInsightMetricsFromFitnessMap(fitnessValuesByAlgorithm) {
  if (
    !fitnessValuesByAlgorithm ||
    typeof fitnessValuesByAlgorithm !== "object"
  ) {
    return {
      socialWelfare: null,
      averageRank: null,
      worstCaseRank: null,
      fairnessIndex: null,
    };
  }

  const algoNames = Object.keys(fitnessValuesByAlgorithm);
  if (algoNames.length === 0) {
    return {
      socialWelfare: null,
      averageRank: null,
      worstCaseRank: null,
      fairnessIndex: null,
    };
  }

  // Flatten all fitness values across algorithms to get a global view
  const allFitness = [];
  const algoAverages = [];

  algoNames.forEach((name) => {
    const values = Array.isArray(fitnessValuesByAlgorithm[name])
      ? fitnessValuesByAlgorithm[name]
      : [];
    const cleaned = values
      .map((v) => Number(v))
      .filter((v) => Number.isFinite(v));

    if (cleaned.length > 0) {
      allFitness.push(...cleaned);
      const avg =
        cleaned.reduce((acc, v) => acc + v, 0) / cleaned.length;
      algoAverages.push({ name, avg });
    }
  });

  if (allFitness.length === 0 || algoAverages.length === 0) {
    return {
      socialWelfare: null,
      averageRank: null,
      worstCaseRank: null,
      fairnessIndex: null,
    };
  }

  // Global social welfare: average fitness over all runs & algorithms
  const socialWelfare =
    allFitness.reduce((acc, v) => acc + v, 0) / allFitness.length;

  // Rank algorithms by their average fitness (higher is better)
  const sortedByAvg = [...algoAverages].sort((a, b) => b.avg - a.avg);
  const ranksByName = new Map();
  sortedByAvg.forEach((item, index) => {
    ranksByName.set(item.name, index + 1);
  });

  const ranks = algoAverages.map((item) => ranksByName.get(item.name));
  const averageRank =
    ranks.reduce((acc, r) => acc + r, 0) / (ranks.length || 1);
  const worstCaseRank = Math.max(...ranks);

  const fairnessIndex = jainsFairnessIndex(
    algoAverages.map((item) => item.avg),
  );

  return {
    socialWelfare,
    averageRank,
    worstCaseRank,
    fairnessIndex,
  };
}



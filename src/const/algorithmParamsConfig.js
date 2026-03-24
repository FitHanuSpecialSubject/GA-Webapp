/**
 * Algorithm Parameters Configuration
 * Defines which parameters each algorithm accepts and their input types
 */

/**
 * Common parameters shared across all algorithms
 */
const COMMON_PARAMS = {
  populationSize: {
    displayName: "Population Size",
    type: "slider",
    min: 1,
    max: 3000,
    step: 10,
    default: 1000,
    tooltip: "Number of candidate solutions maintained in each generation.",
  },
  generation: {
    displayName: "Generations",
    type: "slider",
    min: 1,
    max: 1000,
    step: 1,
    default: 100,
    tooltip: "Number of generations used during evolution.",
  },
  maxTime: {
    displayName: "Max Time (ms)",
    type: "slider",
    min: 0,
    max: 60000,
    step: 500,
    default: 5000,
    tooltip: "Maximum runtime allowed before termination in milliseconds.",
  },
  distributedCores: {
    displayName: "Distributed Cores",
    type: "dropdown",
    options: ["all", "1", "2", "4", "8"],
    default: "all",
    tooltip: "Number of CPU cores used for parallel evaluation.",
  },
  runCountPerAlgorithm: {
    displayName: "Run Count per Algorithm",
    type: "slider",
    min: 5,
    max: 25,
    step: 1,
    default: 5,
    tooltip: "Number of independent runs executed per algorithm for benchmarking.",
  },
  randomSeed: {
    displayName: "Random Seed",
    type: "number",
    min: 0,
    max: 999999999,
    step: 1,
    default: "",
    tooltip: "Seed for the pseudo-random generator. Leave empty for system random.",
  },
};

export const ALGORITHM_PARAMS_CONFIG = {
  // NSGA-II
  NSGAII: {
    displayName: "NSGA-II",
    params: {
      ...COMMON_PARAMS,
      crossoverRate: {
        displayName: "Crossover Rate",
        type: "slider",
        min: 0,
        max: 1,
        step: 0.01,
        default: 0.8,
        tooltip: "Probability of crossover operation. Higher values encourage exploration of the solution space.",
      },
      mutationRate: {
        displayName: "Mutation Rate",
        type: "slider",
        min: 0,
        max: 1,
        step: 0.01,
        default: 0.1,
        tooltip: "Probability of mutation. Lower values maintain genetic structure, higher values increase diversity.",
      },
      sbxDistributionIndex: {
        displayName: "SBX Distribution Index",
        type: "slider",
        min: 1,
        max: 100,
        step: 1,
        default: 15,
        tooltip: "Controls the shape of SBX crossover distribution. Larger values generate offspring closer to the parents.",
      },
      pmDistributionIndex: {
        displayName: "PM Distribution Index",
        type: "slider",
        min: 1,
        max: 100,
        step: 1,
        default: 20,
        tooltip: "Controls the shape of Polynomial Mutation distribution. Larger values generate offspring closer to the parent.",
      },
    },
  },

  // NSGA-III
  NSGAIII: {
    displayName: "NSGA-III",
    params: {
      ...COMMON_PARAMS,
      crossoverRate: {
        displayName: "Crossover Rate",
        type: "slider",
        min: 0,
        max: 1,
        step: 0.01,
        default: 0.8,
        tooltip: "Probability of crossover operation.",
      },
      mutationRate: {
        displayName: "Mutation Rate",
        type: "slider",
        min: 0,
        max: 1,
        step: 0.01,
        default: 0.1,
        tooltip: "Probability of mutation.",
      },
      divideByObjectives: {
        displayName: "Divide by Objectives",
        type: "checkbox",
        default: true,
        tooltip: "Whether to use objective-based division for reference points.",
      },
      sbxDistributionIndex: {
        displayName: "SBX Distribution Index",
        type: "slider",
        min: 1,
        max: 100,
        step: 1,
        default: 15,
        tooltip: "Controls SBX crossover offspring distribution. Larger values produce offspring closer to parents.",
      },
      pmDistributionIndex: {
        displayName: "PM Distribution Index",
        type: "slider",
        min: 1,
        max: 100,
        step: 1,
        default: 20,
        tooltip: "Controls Polynomial Mutation distribution shape. Larger values produce offspring closer to the parent.",
      },
    },
  },

  // εMOEA
  eMOEA: {
    displayName: "εMOEA",
    params: {
      ...COMMON_PARAMS,
      epsilon: {
        displayName: "Epsilon Grid Size",
        type: "slider",
        min: 0.001,
        max: 1,
        step: 0.01,
        default: 0.1,
        tooltip: "Epsilon value for the grid-based archive. Smaller values provide finer granularity.",
      },
    },
  },

  // PESA2
  PESA2: {
    displayName: "PESA2",
    params: {
      ...COMMON_PARAMS,
      archiveSize: {
        displayName: "Archive Size",
        type: "slider",
        min: 10,
        max: 5000,
        step: 10,
        default: 100,
        tooltip: "Maximum size of the elite archive.",
      },
    },
  },

  // VEGA
  VEGA: {
    displayName: "VEGA",
    params: {
      ...COMMON_PARAMS,
    },
  },

  // PAES
  PAES: {
    displayName: "PAES",
    params: {
      ...COMMON_PARAMS,
      archiveSize: {
        displayName: "Archive Size",
        type: "slider",
        min: 10,
        max: 5000,
        step: 10,
        default: 100,
        tooltip: "Maximum size of the elite archive.",
      },
      bisectionDivisions: {
        displayName: "Bisection Divisions",
        type: "slider",
        min: 1,
        max: 10,
        step: 1,
        default: 5,
        tooltip: "Number of divisions for adaptive grid.",
      },
    },
  },

  // MOEAD
  MOEAD: {
    displayName: "MOEAD",
    params: {
      ...COMMON_PARAMS,
      neighborhoodSize: {
        displayName: "Neighborhood Size",
        type: "slider",
        min: 2,
        max: 500,
        step: 1,
        default: 20,
        tooltip: "Size of neighborhood for mating selection.",
      },
      decompositionApproach: {
        displayName: "Decomposition Approach",
        type: "dropdown",
        options: ["Weighted Sum", "Chebyshev", "PBI"],
        default: "Weighted Sum",
        tooltip: "Method to decompose the multi-objective problem.",
      },
      delta: {
        displayName: "Delta",
        type: "slider",
        min: 0,
        max: 1,
        step: 0.05,
        default: 0.9,
        tooltip: "Probability of mating with a solution in the neighborhood rather than the entire population.",
      },
      eta: {
        displayName: "Eta",
        type: "slider",
        min: 1,
        max: 20,
        step: 1,
        default: 2,
        tooltip: "Maximum number of population slots a single offspring solution can replace.",
      },
      updateUtility: {
        displayName: "Utility Update Frequency",
        type: "slider",
        min: -1,
        max: 200,
        step: 1,
        default: 50,
        tooltip: "Frequency (in generations) for updating utility values. Set to 50 for recommended, or -1 to disable.",
      },
    },
  },

  // IBEA
  IBEA: {
    displayName: "IBEA",
    params: {
      ...COMMON_PARAMS,
      kappa: {
        displayName: "Kappa",
        type: "slider",
        min: 0.001,
        max: 10,
        step: 0.1,
        default: 0.05,
        tooltip: "Scaling factor for fitness calculation.",
      },
    },
  },

  // SPEA2
  SPEA2: {
    displayName: "SPEA2",
    params: {
      ...COMMON_PARAMS,
      archiveSize: {
        displayName: "Archive Size",
        type: "slider",
        min: 10,
        max: 5000,
        step: 10,
        default: 100,
        tooltip: "Size of elite archive.",
      },
      k: {
        displayName: "K-Nearest Neighbors",
        type: "slider",
        min: 1,
        max: 100,
        step: 1,
        default: 1,
        tooltip: "Number of nearest neighbors for density estimation.",
      },
    },
  },

  // PSO Algorithms
  OMOPSO: {
    displayName: "OMOPSO",
    params: {
      ...COMMON_PARAMS,
      w: {
        displayName: "Inertia Weight (w)",
        type: "slider",
        min: 0.1,
        max: 1,
        step: 0.01,
        default: 0.7,
        tooltip: "Inertia weight controls exploration vs exploitation.",
      },
      c1: {
        displayName: "Cognitive Parameter (c1)",
        type: "slider",
        min: 0.1,
        max: 4,
        step: 0.1,
        default: 1.5,
        tooltip: "Cognitive parameter for individual best influence.",
      },
      c2: {
        displayName: "Social Parameter (c2)",
        type: "slider",
        min: 0.1,
        max: 4,
        step: 0.1,
        default: 1.5,
        tooltip: "Social parameter for global best influence.",
      },
      leaderSize: {
        displayName: "Leader Archive Size",
        type: "slider",
        min: 10,
        max: 1000,
        step: 10,
        default: 100,
        tooltip: "Number of leaders (non-dominated solutions) maintained in the archive.",
      },
      mutationProbability: {
        displayName: "Mutation Probability",
        type: "slider",
        min: 0,
        max: 1,
        step: 0.01,
        default: 0.05,
        tooltip: "Probability of uniform and non-uniform mutation.",
      },
      perturbationIndex: {
        displayName: "Perturbation Index",
        type: "slider",
        min: 0,
        max: 1,
        step: 0.05,
        default: 0.5,
        tooltip: "Perturbation index for uniform and non-uniform mutation operators.",
      },
      maxIterations: {
        displayName: "Max Iterations",
        type: "slider",
        min: -1,
        max: 10000,
        step: 100,
        default: -1,
        tooltip: "Maximum iterations for scaling non-uniform mutation. -1 to derive from termination conditions.",
      },
    },
  },

  SMPSO: {
    displayName: "SMPSO",
    params: {
      ...COMMON_PARAMS,
      w: {
        displayName: "Inertia Weight (w)",
        type: "slider",
        min: 0.1,
        max: 1,
        step: 0.01,
        default: 0.7,
        tooltip: "Inertia weight controls velocity update.",
      },
      c1: {
        displayName: "Cognitive Parameter (c1)",
        type: "slider",
        min: 0.1,
        max: 4,
        step: 0.1,
        default: 1.5,
        tooltip: "Cognitive parameter for individual best.",
      },
      c2: {
        displayName: "Social Parameter (c2)",
        type: "slider",
        min: 0.1,
        max: 4,
        step: 0.1,
        default: 1.5,
        tooltip: "Social parameter for global best.",
      },
      globalBest: {
        displayName: "Use Global Best",
        type: "checkbox",
        default: true,
        tooltip: "Whether to use global best or local neighborhood best.",
      },
      leaderSize: {
        displayName: "Leader Archive Size",
        type: "slider",
        min: 10,
        max: 1000,
        step: 10,
        default: 100,
        tooltip: "Number of leaders maintained in the external archive.",
      },
      mutationProbability: {
        displayName: "Mutation Probability",
        type: "slider",
        min: 0,
        max: 1,
        step: 0.01,
        default: 0.05,
        tooltip: "Probability of Polynomial Mutation applied to each particle.",
      },
      pmDistributionIndex: {
        displayName: "PM Distribution Index",
        type: "slider",
        min: 1,
        max: 100,
        step: 1,
        default: 20,
        tooltip: "Distribution index for Polynomial Mutation. Larger values produce offspring closer to the parent.",
      },
    },
  },
};

/**
 * Get algorithm configuration by algorithm name
 * @param {string} algorithmName - Algorithm value (e.g., "NSGAII")
 * @returns {object} Algorithm configuration object
 */
export function getAlgorithmConfig(algorithmName) {
  return ALGORITHM_PARAMS_CONFIG[algorithmName] || null;
}

/**
 * Get default values for an algorithm's parameters
 * @param {string} algorithmName - Algorithm value
 * @returns {object} Default parameter values
 */
export function getDefaultParams(algorithmName) {
  const config = getAlgorithmConfig(algorithmName);
  if (!config) return {};

  const defaults = {};
  Object.entries(config.params).forEach(([key, param]) => {
    defaults[key] = param.default;
  });
  return defaults;
}

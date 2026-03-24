/**
 * Global Parameters Configuration
 * Defines parameters that apply to all problems (Game Theory and Stable Matching)
 * These are problem-level parameters, not algorithm-specific
 */

export const GLOBAL_PARAMS_CONFIG = {
  algorithm: {
    displayName: "Algorithm",
    type: "dropdown",
    options: [
      "NSGAII",
      "NSGAIII",
      "εMOEA",
      "PESA2",
      "VEGA",
      "PAES",
      "MOEAD",
      "IBEA",
      "SPEA2",
      "OMOPSO",
      "SMPSO",
    ],
    default: "NSGAII",
    description:
      "Multi-objective evolutionary algorithm used to solve the matching optimization problem",
    validRange: {
      min: null,
      max: null,
    },
  },

  population: {
    displayName: "Population Size",
    type: "number-input",
    default: null,
    description:
      "Number of candidate solutions maintained in each generation",
    validRange: {
      min: 1,
      max: 3000,
    },
  },

  generation: {
    displayName: "Generation Count",
    type: "number-input",
    default: null,
    description: "Number of generations used during evolution",
    validRange: {
      min: 1,
      max: 1000,
    },
  },

  maxEvaluations: {
    displayName: "Maximum Evaluations",
    type: "read-only-number",
    default: null, // Computed as population * generation
    description:
      "Maximum number of objective function evaluations allowed (derived from population × generation)",
    validRange: {
      min: 1,
      max: null,
    },
    isDerived: true,
    derivedFrom: ["population", "generation"],
  },

  runCountPerAlgorithm: {
    displayName: "Independent Runs per Algorithm",
    type: "number-input",
    default: null,
    description:
      "Number of independent runs executed per algorithm for statistical comparison",
    validRange: {
      min: 5,
      max: 25,
    },
  },

  distributedCores: {
    displayName: "Distributed Cores",
    type: "distributed-cores-select",
    default: "all",
    description:
      "Number of CPU cores used for parallel evaluation ({all, 1, 2, 4, ...})",
    validRange: {
      min: null,
      max: null,
      options: "all", // Special value: means use all available cores, or specific numbers 1-N
    },
  },

  maxTime: {
    displayName: "Maximum Runtime",
    type: "number-input",
    unit: "seconds",
    default: null,
    description: "Optional upper bound on total runtime allowed before termination",
    validRange: {
      min: 0,
      max: null,
    },
  },

  randomSeed: {
    displayName: "Random Seed",
    type: "number-input",
    default: null,
    description:
      "Seed for the pseudo-random generator to allow reproducible experiments",
    validRange: {
      min: 0,
      max: null,
    },
  },
};

/**
 * Get global parameter configuration
 * @param {string} paramName - Parameter name (e.g., "population", "generation")
 * @returns {object} Parameter configuration object
 */
export function getGlobalParamConfig(paramName) {
  return GLOBAL_PARAMS_CONFIG[paramName] || null;
}

/**
 * Validate global parameter value
 * @param {string} paramName - Parameter name
 * @param {*} value - Value to validate
 * @returns {object} { isValid: boolean, error?: string }
 */
export function validateGlobalParam(paramName, value) {
  const config = getGlobalParamConfig(paramName);

  if (!config) {
    return { isValid: false, error: `Unknown parameter: ${paramName}` };
  }

  // Handle read-only parameters
  if (config.isDerived) {
    return { isValid: true, warning: `${paramName} is derived and read-only` };
  }

  // Handle special cases
  if (paramName === "distributedCores") {
    if (value === "all") return { isValid: true };
    const numValue = parseInt(value, 10);
    if (isNaN(numValue) || numValue < 1) {
      return { isValid: false, error: "Must be 'all' or a positive integer" };
    }
    return { isValid: true };
  }

  // Validate numeric parameters
  if (
    config.type === "number-input" ||
    config.type === "read-only-number"
  ) {
    const numValue = Number(value);

    if (isNaN(numValue)) {
      return { isValid: false, error: `${paramName} must be a number` };
    }

    if (
      config.validRange.min !== null &&
      numValue < config.validRange.min
    ) {
      return {
        isValid: false,
        error: `${paramName} must be at least ${config.validRange.min}`,
      };
    }

    if (
      config.validRange.max !== null &&
      numValue > config.validRange.max
    ) {
      return {
        isValid: false,
        error: `${paramName} cannot exceed ${config.validRange.max}`,
      };
    }
  }

  return { isValid: true };
}

/**
 * Compute derived parameters
 * @param {object} params - Parameter object with population and generation
 * @returns {object} Parameters with derived values filled in
 */
export function computeDerivedParams(params) {
  const result = { ...params };

  // Compute maxEvaluations if population and generation are provided
  if (
    params.population !== undefined &&
    params.generation !== undefined &&
    !params.maxEvaluations
  ) {
    result.maxEvaluations = params.population * params.generation;
  }

  return result;
}

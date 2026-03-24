/**
 * Game Theory Parameters Configuration
 * Defines parameters specific to Game Theory problems
 */

export const GAME_THEORY_PARAMS_CONFIG = {
  algorithm: {
    displayName: "Algorithm",
    type: "dropdown",
    options: [
      "NSGAII",
      "NSGAIII",
      "SPEA2",
      "PESA2",
      "εMOEA",
      "VEGA",
      "PAES",
      "MOEAD",
      "IBEA",
      "OMOPSO",
      "SMPSO",
    ],
    default: null,
    description:
      "Multi-objective evolutionary algorithm used to solve the matching optimization problem",
    validRange: {
      min: null,
      max: null,
    },
  },

  population: {
    displayName: "Population",
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
    displayName: "Generation",
    type: "number-input",
    default: null,
    description: "Number of generations used during evolution",
    validRange: {
      min: 1,
      max: 1000,
    },
  },

  maxEvaluations: {
    displayName: "Max Evaluations",
    type: "read-only-number",
    default: null,
    description:
      "Maximum number of objective function evaluations allowed (derived: population × generation)",
    validRange: {
      min: 1,
      max: null,
    },
    isDerived: true,
    derivedFrom: ["population", "generation"],
  },

  runCountPerAlgorithm: {
    displayName: "Run Count per Algorithm",
    type: "number-input",
    default: null,
    description:
      "Number of independent runs executed per algorithm for benchmarking",
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
      "Number of CPU cores used for parallel evaluation ({all, 1..CPU cores})",
    validRange: {
      min: null,
      max: null,
    },
  },

  maxTime: {
    displayName: "Max Time",
    type: "number-input",
    unit: "seconds",
    default: null,
    description: "Maximum runtime allowed before termination (optional)",
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
 * Get Game Theory parameter configuration
 * @param {string} paramName - Parameter name
 * @returns {object} Parameter configuration object
 */
export function getGameTheoryParamConfig(paramName) {
  return GAME_THEORY_PARAMS_CONFIG[paramName] || null;
}

/**
 * Validate Game Theory parameter value
 * @param {string} paramName - Parameter name
 * @param {*} value - Value to validate
 * @returns {object} { isValid: boolean, error?: string }
 */
export function validateGameTheoryParam(paramName, value) {
  const config = getGameTheoryParamConfig(paramName);

  if (!config) {
    return { isValid: false, error: `Unknown parameter: ${paramName}` };
  }

  if (config.isDerived) {
    return { isValid: true, warning: `${paramName} is derived and read-only` };
  }

  if (paramName === "distributedCores") {
    if (value === "all") return { isValid: true };
    const numValue = parseInt(value, 10);
    if (isNaN(numValue) || numValue < 1) {
      return { isValid: false, error: "Must be 'all' or a positive integer" };
    }
    return { isValid: true };
  }

  if (config.type === "number-input" || config.type === "read-only-number") {
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
 * Compute derived parameters for Game Theory
 * @param {object} params - Parameter object
 * @returns {object} Parameters with derived values
 */
export function computeGameTheoryDerivedParams(params) {
  const result = { ...params };

  if (
    params.population !== undefined &&
    params.generation !== undefined &&
    !params.maxEvaluations
  ) {
    result.maxEvaluations = params.population * params.generation;
  }

  return result;
}

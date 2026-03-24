import { ALGORITHMS } from "./algorithm_const";
import { GAME_THEORY_PARAMS_CONFIG, getGameTheoryParamConfig, validateGameTheoryParam, computeGameTheoryDerivedParams } from "./gameTheoryParamsConfig";

export const GT_ALGORITHMS = Object.freeze([
  ALGORITHMS.NSGA2,
  ALGORITHMS.NSGA3,
  ALGORITHMS.eMOEA,
  ALGORITHMS.PESA2,
  ALGORITHMS.VEGA,
  ALGORITHMS.PAES,
  ALGORITHMS.MOEAD,
  ALGORITHMS.OMOPSO,
  ALGORITHMS.SMPSO,
]);

// Game Theory Parameters Configuration and utilities
export { GAME_THEORY_PARAMS_CONFIG, getGameTheoryParamConfig, validateGameTheoryParam, computeGameTheoryDerivedParams };

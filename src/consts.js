import { ALGORITHMS } from "./const/algorithm_const";
import {
  DEFAULT_ALGORITHM,
  DEFAULT_PROBLEM_TYPE,
  DEFAULT_POPULATION_SIZE,
  DEFAULT_GENERATION_NUM,
  DEFAULT_SAMPLE_DISPLAY_NUM,
  DEFAULT_MAXTIME,
  INVALID_MATH_SYMBOLS,
  DEFAULT_CORE_NUM,
} from "./const/matching_const";
import { MATCHING_PROBLEM_TYPES } from "./const/matching_types";

export const SMT = Object.freeze({
  ALGORITHMS: ALGORITHMS,
  DEFAULT_ALGORITHM: DEFAULT_ALGORITHM,
  DEFAULT_PROBLEM_TYPE: DEFAULT_PROBLEM_TYPE,
  DEFAULT_POPULATION_SIZE: DEFAULT_POPULATION_SIZE,
  DEFAULT_GENERATION_NUM: DEFAULT_GENERATION_NUM,
  DEFAULT_SAMPLE_DISPLAY_NUM: DEFAULT_SAMPLE_DISPLAY_NUM,
  DEFAULT_MAXTIME: DEFAULT_MAXTIME,
  DEFAULT_CORE_NUM: DEFAULT_CORE_NUM,
  PROBLEM_TYPES: MATCHING_PROBLEM_TYPES,
  INDIVIDUAL_SHEET: 0,
  EXCLUDE_PAIRS_SHEET: 1,
  MIN_SET: 2,
  MAX_SET: 10,
});

export const SMT_VALIDATE = Object.freeze({
  INVALID_MATH_SYMBOLS: INVALID_MATH_SYMBOLS,
});

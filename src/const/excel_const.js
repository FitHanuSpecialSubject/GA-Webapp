export const MATCHING = Object.freeze({
  CHARACTERISTIC_START_COL: "E",
  CHARACTERISTIC_ROW: 7,
});

export const STABLE_MATCHING_REQ_REGEX = /^(?:\d+:\d+|\d+\+\+|\d+--)$/;
export const REQUIREMENT_ROW_NAME = "Requirements";
export const STABLE_MATCHING_WORKBOOK = {
  PROBLEM_INFO_SHEET_NAME: "Problem Information",
  DATASET_SHEET_NAME: "Dataset",
  EXCLUDE_PAIRS_SHEET_NAME: "Exclude Pairs",
  GUIDELINE_SHEET_NAME: "Guidelines",
};

export const GAME_THEORY_WORKBOOK = {
  PROBLEM_INFO_SHEET_NAME: "Problem information",
  NORMAL_PLAYER_SHEET_NAME: "Normal player",
  SPECIAL_PLAYER_SHEET_NAME: "Special player",
  CONFLICT_MATRIX_SHEET_NAME: "Conflict matrix",
  GUIDELINE_SHEET_NAME: "Guidelines",
};

export const RESULT_WORKBOOK = {
  SOLUTION_SHEET_NAME: "Optimal Solution",
  COMPUTER_SPECS_SHEET_NAME: "Computer Specifications",
  PARAMETER_CONFIG_SHEET_NAME: "Parameter Configurations",
};

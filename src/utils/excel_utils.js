import {
  STABLE_MATCHING_REQ_REGEX,
  STABLE_MATCHING_WORKBOOK,
  GAME_THEORY_WORKBOOK,
} from "../const/excel_const";
import ExcelJS from "exceljs";
import colCache from "exceljs/lib/utils/col-cache";
import { RESULT_WORKBOOK } from "../const/excel_const";
import { genRandom } from "./common_utils";

/**
 * Tạo một sheet từ thông tin cấu hình máy tính.
 * @param {ExcelJS.Workbook} workbook - Workbook cần thêm sheet.
 * @param {Object} appData - Dữ liệu ứng dụng chứa thông tin cấu hình.
 * @returns {void}
 */
export const createSystemInfoSheet = (workbook, appData) => {
  const computerSpecs = appData?.result?.data?.computerSpecs || {};
  const sheet = workbook.addWorksheet(
    RESULT_WORKBOOK.COMPUTER_SPECS_SHEET_NAME,
  );
  sheet.addRows([
    ["Operating System Family", computerSpecs.osFamily || "unknown"],
    [
      "Operating System Manufacturer",
      computerSpecs.osManufacturer || "unknown",
    ],
    ["Operating System Version", computerSpecs.osVersion || "unknown"],
    ["CPU Name", computerSpecs.cpuName || "unknown"],
    ["CPU Physical Cores", computerSpecs.cpuPhysicalCores || "unknown"],
    ["CPU Logical Cores", computerSpecs.cpuLogicalCores || "unknown"],
    ["Total Memory", computerSpecs.totalMemory || "unknown"],
  ]);
};

/**
 * Tạo một sheet từ các thông số cấu hình.
 * @param {ExcelJS.Workbook} workbook - Workbook cần thêm sheet.
 * @param {Object} appData - Dữ liệu ứng dụng chứa thông số cấu hình.
 * @returns {void}
 */
export const createParameterConfigSheet = (workbook, appData) => {
  const numberOfCores =
    appData.result.params.distributedCoreParam === "all"
      ? "All available cores"
      : appData.result.params.distributedCoreParam + " cores";
  const sheet = workbook.addWorksheet(
    RESULT_WORKBOOK.PARAMETER_CONFIG_SHEET_NAME,
  );
  sheet.addRows([
    ["Number of distributed cores", numberOfCores],
    ["Population size", appData.result.params.populationSizeParam],
    ["Number of crossover generation", appData.result.params.generationParam],
    [
      "Optimization execution max time (in milliseconds)",
      appData.result.params.maxTimeParam,
    ],
  ]);
};

/**
 * Tải thông tin bài toán từ Workbook
 * @param {ExcelJS.Workbook} workbook - Workbook Excel chứa thông tin bài toán
 * @returns {Object} - Thông tin bài toán
 */
export const loadProblemInfoSMT = async (workbook) => {
  const problemSheet = workbook.getWorksheet(
    STABLE_MATCHING_WORKBOOK.PROBLEM_INFO_SHEET_NAME,
  );
  const problemName = getCellValueStr(problemSheet, "B1");
  const setNum = getCellValueNum(problemSheet, 2, 2);
  const totalNumberOfIndividuals = getCellValueNum(problemSheet, 3, 2);
  const characteristicNum = getCellValueNum(problemSheet, 4, 2);
  const fitnessFunction = getCellValueStr(problemSheet, "B5");
  const setEvaluateFunction = [];
  for (let i = 0; i < setNum; i++) {
    setEvaluateFunction.push(problemSheet.getCell(`B${i + 5}`).value);
  }
  return {
    problemName,
    setNum,
    totalNumberOfIndividuals,
    characteristicNum,
    fitnessFunction,
    setEvaluateFunction,
  };
};

/**
 * Tải dữ liệu bài toán từ Workbook
 * @param {ExcelJS.Workbook} workbook - Workbook Excel chứa dữ liệu bài toán
 * @param {number} charNum - Số lượng characteristics
 * @param {number} setNum - Số lượng set
 * @returns {Object} - Dữ liệu bài toán
 */
export const loadDataset = async (workbook, charNum, setNum) => {
  const dataSheet = workbook.getWorksheet(
    STABLE_MATCHING_WORKBOOK.DATASET_SHEET_NAME,
  );
  const characteristics = [];
  const setNames = [];
  const individualNames = [];
  const individualSetIndices = [];
  const individualCapacities = [];
  const individualProperties = [];
  const individualRequirements = [];
  const individualWeights = [];
  for (let i = 0; i < charNum; i++) {
    const cellValue = dataSheet.getCell(1, i + 5).value;
    characteristics.push(
      cellValue == null ? `Characteristic ${i + 1}` : cellValue,
    );
  }
  let rowPointer = 1;
  for (let set = 0; set < setNum; set++) {
    setNames.push(dataSheet.getCell(`A${rowPointer}`).value);
    const individualNum = Number(dataSheet.getCell(`C${rowPointer}`));
    rowPointer++;
    for (let i = 0; i < individualNum; i++) {
      individualNames.push(dataSheet.getCell(`A${rowPointer}`).value);
      individualCapacities.push(dataSheet.getCell(`B${rowPointer}`).value);
      individualSetIndices.push(set);
      const r = [];
      const w = [];
      const p = [];
      for (let c = 0; c < charNum; c++) {
        r.push(getPropertyRequirement(dataSheet, rowPointer, c + 4));
        w.push(getPropertyWeight(dataSheet, rowPointer + 1, c + 4));
        p.push(getPropertyValue(dataSheet, rowPointer + 2, c + 4));
      }
      individualRequirements.push(r);
      individualWeights.push(w);
      individualProperties.push(p);
      rowPointer += 3;
    }
  }
  return {
    characteristics,
    setNames,
    individualNames,
    individualCapacities,
    individualSetIndices,
    individualProperties,
    individualRequirements,
    individualWeights,
  };
};

export const loadProblemInfoGT = async (workbook) => {
  const problemInfoWorksheet = workbook.getWorksheet(
    GAME_THEORY_WORKBOOK.PROBLEM_INFO_SHEET_NAME,
  );

  const problemName = getCellValueStr(problemInfoWorksheet, "B1");
  const specialPlayerExists = getCellValueNum(problemInfoWorksheet, 2, 2);
  const specialPlayerPropsNum = getCellValueNum(problemInfoWorksheet, 3, 2);
  const normalPlayerNum = getCellValueNum(problemInfoWorksheet, 4, 2);
  const normalPlayerPropsNum = getCellValueNum(problemInfoWorksheet, 5, 2);
  const fitnessFunction = getCellValueStr(problemInfoWorksheet, "B6");
  const playerPayoffFunction = getCellValueStr(problemInfoWorksheet, "B7");
  const isMaximizing =
    problemInfoWorksheet.getCell("B8")?.value &&
    problemInfoWorksheet.getCell("B8")?.value.toString().toLowerCase() ===
      "true";

  return {
    problemName,
    specialPlayerExists,
    specialPlayerPropsNum,
    normalPlayerNum,
    normalPlayerPropsNum,
    fitnessFunction,
    playerPayoffFunction,
    isMaximizing,
  };
};

export const loadNormalPlayers = async (
  workbook,
  normalPlayerNum,
  normalPlayerPropsNum,
) => {
  let currentRow = 1;
  const players = [];
  let errorMessage = null;
  const normalPlayerWorkSheet = workbook.getWorksheet(
    GAME_THEORY_WORKBOOK.NORMAL_PLAYER_SHEET_NAME,
  );
  let currentPlayer = 0;

  // LOAD PLAYERS
  while (players.length < normalPlayerNum) {
    const playerNameCell = normalPlayerWorkSheet.getCell(`A${currentRow}`);
    const playerName = playerNameCell
      ? playerNameCell.value
      : `Player ${currentPlayer + 1}`; // because the player name is optional
    const strategyNumber = normalPlayerWorkSheet.getCell(
      `B${currentRow}`,
    ).value;

    if (!strategyNumber || typeof strategyNumber !== "number") {
      errorMessage =
        "Error when loading player#" +
        (currentPlayer + 1) +
        " row = " +
        currentRow +
        " . Number of strategies is invalid";
      throw new Error(errorMessage);
    }
    const payoffFunction = normalPlayerWorkSheet.getCell(`C${currentRow}`)
      ? getCellValueStr(normalPlayerWorkSheet, `C${currentRow}`)
      : null;

    const strategies = [];

    // LOAD STRATEGIES
    for (let i = 0; i < strategyNumber; i++) {
      // currentRow + i because the current row is the player name and the strategy number
      const strategyNameCell = normalPlayerWorkSheet.getCell(
        `A${currentRow + i + 1}`,
      );

      const strategyName = strategyNameCell
        ? strategyNameCell.value
        : `Strategy ${i + 1}`; // because the strategy name is optional
      const properties = [];
      // LOAD PROPERTIES
      for (let j = 0; j < normalPlayerPropsNum; j++) {
        // c (1-based)
        // r (1-based)
        const prop = getCellValueNum(
          normalPlayerWorkSheet,
          currentRow + i + 1,
          j + 2,
        );
        if (prop !== null) {
          properties.push(prop);
        }
      }

      // CHECK IF THE STRATEGY HAS PROPERTIES
      if (!properties.length) {
        errorMessage =
          "Error when loading player#" +
          (currentPlayer + 1) +
          " row = " +
          (currentRow + i) +
          ". Properties of strategy are invalid";
        throw new Error(errorMessage);
      }

      strategies.push({
        name: strategyName,
        properties: properties,
      });
    }

    // CHECK IF ALL STRATEGIES HAVE THE SAME NUMBER OF PROPERTIES
    const allStrategiesHaveSameNumOfProps = strategies.every((strategy) => {
      const firstStrategy = strategies[0];
      return (strategy.properties.length = firstStrategy.properties.length);
    });

    if (!allStrategiesHaveSameNumOfProps) {
      errorMessage = `Error when loading the player#${players.length + 1}.
        All strategies of a player must have the same number of properties!`;
      throw new Error(errorMessage);
    }

    players.push({
      name: playerName,
      strategies: strategies,
      payoffFunction: payoffFunction,
    });
    currentRow += strategyNumber + 1;
    currentPlayer++;
  }

  return players;
};

/**
 * Tải dữ liệu Exclude Pairs từ workbook
 * @param {ExcelJS.Workbook} workbook - Workbook Excel chứa dữ liệu bài toán
 * @param {number} specialPlayerPropsNum
 * @returns {Object} -  Exclude Pairs
 */
export const loadSpecialPlayer = async (workbook, specialPlayerPropsNum) => {
  const specialPlayerWorkSheet = workbook.getWorksheet(
    GAME_THEORY_WORKBOOK.SPECIAL_PLAYER_SHEET_NAME,
  );
  const properties = [];
  const weights = [];

  // LOAD PROPERTIES AND WEIGHTS
  for (let i = 1; i <= specialPlayerPropsNum; i++) {
    // [`A${i + 1}`] and  [`B${i + 1}`] because the first row is the header
    properties.push(specialPlayerWorkSheet.getCell(`A${i + 1}`).value);
    weights.push(specialPlayerWorkSheet.getCell(`B${i + 1}`).value);
  }
  return {
    properties,
    weights,
  };
};

export const loadConflictSet = async (workbook) => {
  const conflictSetWorkSheet = workbook.getWorksheet(
    GAME_THEORY_WORKBOOK.CONFLICT_MATRIX_SHEET_NAME,
  );
  const conflictSet = [];
  let row = 1;
  let col = 1;
  let currentCell = conflictSetWorkSheet.getCell(row, col);
  // loop until there is a cell contains data
  while (currentCell.value) {
    const string = currentCell.value;
    const conflict = string
      .replace(/[( )]/g, "")
      .split(",")
      .map((item) => parseInt(item));
    conflictSet.push({
      leftPlayer: conflict[0],
      leftPlayerStrategy: conflict[1],
      rightPlayer: conflict[2],
      rightPlayerStrategy: conflict[3],
    });

    col++; // move to the right cell
    currentCell = conflictSetWorkSheet.getCell(row, col);

    // after moving to the right cell, if the cell is empty, move to the next row
    if (!currentCell) {
      row++;
      col = 0;
      currentCell = conflictSetWorkSheet.getCell(row, col);
    }
  }

  return conflictSet;
};

/**
 * Tải dữ liệu Exclude Pairs từ workbook
 * @param {ExcelJS.Workbook} workbook - Workbook Excel chứa dữ liệu bài toán
 * @returns {Object} -  Exclude Pairs
 */
export const loadExcludePairs = async (workbook) => {
  const sheet = workbook.getWorksheet(
    STABLE_MATCHING_WORKBOOK.EXCLUDE_PAIRS_SHEET_NAME,
  );
  const result = {};
  let index = 2;
  while (
    getCellValueStr(sheet, "A" + index) !== "" &&
    getCellValueStr(sheet, "B" + index) !== ""
  ) {
    const individual = getCellValueNum(sheet, "A" + index);
    result[individual] = getCellValueStr(sheet, "B" + index)
      .split(",")
      .map((e) => parseInt(e));
    index++;
  }
  return result;
};

/**
 *
 * @param {Map<string, number>} fitnessValues
 * @param {Map<string, number>} runtimes
 * @param {Map<string, string>} computerSpecs
 * @param {Map<string, string>} params
 * @returns {Blob} Excel file
 */
export async function exportInsights(
  fitnessValues,
  runtimes,
  computerSpecs,
  params,
) {
  const workbook = new ExcelJS.Workbook();

  const algorithms = Object.keys(fitnessValues);

  const sheet1 = workbook.addWorksheet("Sheet 1");
  sheet1.addRow(["Iteration", ...algorithms]);

  const totalRun = fitnessValues[algorithms[0]].length;
  for (let i = 0; i < totalRun; i++) {
    const values = Object.values(fitnessValues).map((values) => values[i]);
    const row = [i + 1, ...values];
    sheet1.addRow(row);
  }

  // write runtime values to the second sheet
  const sheet2 = workbook.addWorksheet("Sheet 2");
  sheet2.addRow(["Iteration", ...algorithms]);
  for (let i = 0; i < totalRun; i++) {
    const values = Object.values(runtimes).map((value) => value[i]);
    const row = [i + 1, ...values];

    sheet2.addRow(row);
  }

  // write parameter configurations to the third sheet
  const numberOfCores =
    params.distributedCoreParam === "all"
      ? "All available cores"
      : params.distributedCoreParam + " cores";
  const sheet3 = workbook.addWorksheet("Sheet 3");
  sheet3.addRows([
    ["Number of distributed cores", numberOfCores],
    ["Population size", params.populationSizeParam],
    ["Number of crossover generation", params.generationParam],
    ["Optimization execution max time (milliseconds)", params.maxTimeParam],
  ]);

  // write computer specifications to the fourth sheet
  const sheet4 = workbook.addWorksheet("Sheet 4");
  sheet4.addRows([
    ["Operating System Family", computerSpecs?.osFamily || "unknown"],
    [
      "Operating System Manufacturer",
      computerSpecs?.osManufacturer || "unknown",
    ],
    ["Operating System Version", computerSpecs?.osVersion || "unknown"],
    ["CPU Name", computerSpecs?.cpuName || "unknown"],
    ["CPU Physical Cores", computerSpecs?.cpuPhysicalCores || "unknown"],
    ["CPU Logical Cores", computerSpecs?.cpuLogicalCores || "unknown"],
    ["Total Memory", computerSpecs?.totalMemory || "unknown"],
  ]);

  // save the workbook
  const wbout = await workbook.xlsx.writeBuffer();
  return new Blob([wbout], { type: "application/octet-stream" });
}

/**
 * Get cell value as String
 * @param {ExcelJS.Worksheet} sheet
 * @param {string} address
 * @returns {string} - Empty String if error
 */
const getCellValueStr = (sheet, address) => {
  try {
    return sheet.getCell(address)?.value?.toString() || "";
  } catch (error) {
    console.error(
      "Error parsing string cell value, address: " +
        address +
        " , details: " +
        error,
    );
    return "";
  }
};

/**
 * Get cell value as Number
 * @param {ExcelJS.Worksheet} sheet
 * @param {number} row
 * @param {number} col
 * @returns {number}
 *
 * @throws error if error
 */
export const getCellValueNum = (sheet, row, col) => {
  validateAddress(row, col);
  const val = Number(sheet.getCell(row, col).value);
  if (Number.isNaN(val) || sheet.getCell(row, col).value == null) {
    console.error(row, col, sheet.name);
    throw new TypeError(
      `Invalid number format, Cell(${colCache.encode(row, col)}) Sheet(${sheet.name})`,
    );
  }
  return val;
};

export const getPropertyValue = (sheet, row, col) => {
  validateAddress(row, col);
  const value = Number(sheet.getCell(row, col).value);
  try {
    if (Number.isNaN(value)) {
      throw new TypeError(`Invalid type for property value: ${value},
        Cell(${colCache.encode(row, col)}) Sheet(${sheet.name}), 
        expected type: number`);
    } else {
      return value;
    }
  } catch (e) {
    console.error(e);
    throw new Error(
      `Error when reading Property Value at: ${colCache.encode(row, col)} - ${sheet.name}`,
    );
  }
};

export const getPropertyWeight = (sheet, row, col) => {
  validateAddress(row, col);
  try {
    const value = Number(sheet.getCell(row, col).value);
    if (!Number.isNaN(value)) {
      if (value < 0 || value > 10) {
        throw new RangeError(`Invalid value for property Weight: ${value},
          field address: R=${row} C=${col},
          expected value in range [0, 10] for Weight`);
      }
      return value;
    } else {
      throw new TypeError(`Invalid type for property Weight: ${value},
        field address: R=${row} C=${col},
        expected type: number`);
    }
  } catch (e) {
    console.error(e);
    throw new Error(
      `Error when reading Property Weight at: ${colCache.encode(row, col)}`,
    );
  }
};

export const getPropertyRequirement = (sheet, row, col) => {
  validateAddress(row, col);
  try {
    const value = sheet.getCell(row, col).value;
    if (!Number.isNaN(value)) {
      return value;
    } else if (typeof value === "string") {
      if (STABLE_MATCHING_REQ_REGEX.test(value)) {
        return value;
      } else {
        throw new TypeError(`Invalid string format for property Requirement: ${value},
          field address: ${colCache.encode(row, col)},
          expected value in format: "number:number" or "number++" or "number--"`);
      }
    } else {
      throw new TypeError(`Invalid type for property Requirement: ${value},
        field address: ${colCache.encode(row, col)},
        expected type: string, number`);
    }
  } catch (e) {
    console.error(e);
    throw new Error(
      `Error when reading Property Value at: ${colCache.encode(row, col)}`,
    );
  }
};

const validateAddress = (row, column) => {
  if (row < 0) {
    throw new Error("Invalid row index: " + row);
  }
  if (column < 0) {
    throw new Error("Invalid column index: " + column);
  }
  return true;
};

/**
 * Get problem information for Generator
 * @param {ExcelJS.Workbook} workbook
 * @returns {Object} - Problem data
 */
export const generatorSMTReader = (workbook) => {
  const { GUIDELINE_SHEET_NAME: _, ...essentialSheet } =
    STABLE_MATCHING_WORKBOOK;
  for (const sheetName of Object.values(essentialSheet)) {
    if (!workbook.worksheets.find((ws) => ws.name === sheetName)) {
      throw new Error(`Sheet missing: ${sheetName}`);
    }
  }
  const problemName = workbook
    .getWorksheet(STABLE_MATCHING_WORKBOOK.PROBLEM_INFO_SHEET_NAME)
    .getCell("B1").value;
  const numberOfCharacteristic = Number(
    workbook
      .getWorksheet(STABLE_MATCHING_WORKBOOK.PROBLEM_INFO_SHEET_NAME)
      .getCell("B4").value,
  );
  const numberOfSet = Number(
    workbook
      .getWorksheet(STABLE_MATCHING_WORKBOOK.PROBLEM_INFO_SHEET_NAME)
      .getCell("B2").value,
  );
  const characteristic = [];
  const dataSheet = workbook.getWorksheet(
    STABLE_MATCHING_WORKBOOK.DATASET_SHEET_NAME,
  );
  for (let i = 4; i < 4 + numberOfCharacteristic; i++) {
    const cname = dataSheet.getCell(1, i).value;
    if (!cname) {
      throw new Error(
        "Missing characteristic. Maybe there are some conflicts between Information sheet and Dataset sheet.",
      );
    }
    characteristic.push(cname);
  }
  return {
    problemName,
    characteristic,
    numberOfSet,
  };
};

/**
 * Write data to Excel file | Data Generator
 * @param {ExcelJS.Workbook} workbook
 * @param {Object} dataRanges
 * @param {Object} capacity
 * @param {Object} types
 * @param {Object} data
 * @returns {ExcelJS.Workbook}
 */
export const generatorSMTWriter = (
  workbook,
  dataRanges,
  types,
  data,
  capacity,
) => {
  const dataSheet = workbook.getWorksheet(
    STABLE_MATCHING_WORKBOOK.DATASET_SHEET_NAME,
  );
  const fields = ["r", "w", "p"];
  let currentRow = 1;
  for (let set = 0; set < data.numberOfSet; set++) {
    const numberOfIndividual = Number(dataSheet.getCell(currentRow, 3));
    for (let individual = 0; individual < numberOfIndividual; individual++) {
      dataSheet.getCell(currentRow + 1, 2).value = genRandom(
        capacity[set],
        false,
      );
      for (let k = 0; k < data.characteristic.length; k++) {
        const col = 4 + k;
        for (let f = 1; f <= fields.length; f++) {
          dataSheet.getCell(currentRow + f, col).value = genRandom(
            dataRanges[set][fields[f - 1]][k],
            types[set][fields[f - 1]][k],
          );
          dataSheet.getCell(currentRow + f, col).style.numFmt = "0.00";
        }
      }
      currentRow += 3;
    }
    currentRow++;
  }
  return workbook;
};

/**
 * Get problem information for Generator
 * @param {ExcelJS.Workbook} workbook
 * @returns {Object} - Problem data
 */
export const generatorGTReader = (workbook) => {
  const {
    GUIDELINE_SHEET_NAME: _,
    SPECIAL_PLAYER_SHEET_NAME: _2,
    ...essentialSheet
  } = GAME_THEORY_WORKBOOK;
  for (const sheetName of Object.values(essentialSheet)) {
    if (!workbook.worksheets.find((ws) => ws.name === sheetName)) {
      throw new Error(`Sheet missing: ${sheetName}`);
    }
  }
  const problemName = workbook
    .getWorksheet(GAME_THEORY_WORKBOOK.PROBLEM_INFO_SHEET_NAME)
    .getCell("B1").value;
  const numberOfPlayer = Number(
    workbook
      .getWorksheet(GAME_THEORY_WORKBOOK.PROBLEM_INFO_SHEET_NAME)
      .getCell("B4").value,
  );
  const numberOfProperty = Number(
    workbook
      .getWorksheet(GAME_THEORY_WORKBOOK.PROBLEM_INFO_SHEET_NAME)
      .getCell("B5").value,
  );
  return {
    problemName,
    numberOfPlayer,
    numberOfProperty,
  };
};

/**
 * Write data to Excel file | Data Generator
 * @param {ExcelJS.Workbook} workbook
 * @param {Object} range
 * @param {Object} type
 * @param {Object} data
 * @returns {ExcelJS.Workbook}
 */
export const generatorGTWriter = (workbook, range, type, data) => {
  const dataSheet = workbook.getWorksheet(
    GAME_THEORY_WORKBOOK.NORMAL_PLAYER_SHEET_NAME,
  );
  let currentRow = 1;
  for (let player = 0; player < data.numberOfPlayer; player++) {
    const numberOfStrat = Number(dataSheet.getCell(currentRow, 2).value);
    if (Number.isNaN(numberOfStrat)) {
      throw new Error(
        "Invalid number of strategy at cell: " + colCache.encode(currentRow, 2),
      );
    }
    for (let p = 1; p <= data.numberOfProperty; p++) {
      const r = range[p - 1];
      for (let strat = 1; strat <= numberOfStrat; strat++) {
        dataSheet.getCell(currentRow + strat, p + 1).value = genRandom(
          r,
          type[p - 1],
        );
        dataSheet.getCell(currentRow + strat, p + 1).style.numFmt = "0.00";
      }
    }
    currentRow += numberOfStrat + 1;
  }
  return workbook;
};

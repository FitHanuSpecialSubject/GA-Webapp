import * as XLSX from "@e965/xlsx";
import {
  MATCHING,
  STABLE_MATCHING_REQ_REGEX,
  REQUIREMENT_ROW_NAME,
} from "../const/excel_const";
import ExcelJS from "exceljs";
import colCache from "exceljs/lib/utils/col-cache";

/**
 * Tạo một sheet từ thông tin cấu hình máy tính.
 * @param {ExcelJS.Workbook} workbook - Workbook cần thêm sheet.
 * @param {Object} appData - Dữ liệu ứng dụng chứa thông tin cấu hình.
 * @returns {void}
 */
export const createSystemInfoSheet = (workbook, appData) => {
  const computerSpecs = appData?.result?.data?.computerSpecs || {};
  const sheet = workbook.addWorksheet("Computer Specifications");
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
  const sheet = workbook.addWorksheet("Parameter Configurations");
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
 * Tải dữ liệu bài toán song song từ workbook
 * @param {ExcelJS.Workbook} workbook - Workbook Excel chứa dữ liệu bài toán
 * @param {number} sheetNumber - Số thứ tự sheet cần đọc
 * @returns {Object} - Dữ liệu bài toán
 */
export const loadProblemDataParallel = async (workbook, sheetNumber) => {
  const sheetName = workbook.worksheets[sheetNumber].name;
  const sheet = workbook.getWorksheet(sheetName);
  const problemName = getCellValueStr(sheet, "B1");
  const setNum = getCellValueNum(sheet, "B2");
  const totalNumberOfIndividuals = getCellValueNum(sheet, "B3");
  const characteristicNum = getCellValueNum(sheet, "B4");
  const fitnessFunction = getCellValueStr(sheet, "B5");

  let currentRow = 6 + setNum;
  const characteristics = [];

  const currentColumnIndex = colCache.decode(
    MATCHING.CHARACTERISTIC_START_COL,
  ).col;

  // Đọc các đặc tính từ bảng
  for (let i = currentColumnIndex; ; i++) {
    const cell = sheet.getCell(colCache.encode(currentRow, i));
    // Break if cell is empty or undefined
    if (!cell || !cell.value) {
      break;
    }
    characteristics.push(cell.value);
  }

  // Đọc các bộ dữ liệu (sets)
  const individuals = [];
  const setEvaluateFunction = [];
  const individualSetIndices = [];
  const individualNames = [];
  const individualProperties = [];
  const individualRequirements = [];
  const individualWeights = [];
  const individualCapacities = [];

  const setNames = [];
  const setTypes = [];
  let individualNum = null;
  let setType = null;
  let setName = null;

  // Load evaluate functions for each set
  for (let j = 0; j < setNum; j++) {
    const evaluateFunction = getCellValueStr(sheet, `B${6 + j}`);
    setEvaluateFunction.push(evaluateFunction);
  }

  for (let g = 0; g < setNum; g++) {
    setName = sheet.getCell(`A${currentRow}`)?.value || "";
    setType = sheet.getCell(`B${currentRow}`)?.value || "";
    setNames.push(setName);
    setTypes.push(setType);

    individualNum = sheet.getCell(`D${currentRow}`)?.value || 0;

    for (let i = 0; i < individualNum; i++) {
      let name = sheet.getCell(`A${currentRow + 1}`)?.value;
      if (
        Object.is(name, undefined) ||
        Object.is(name, null) ||
        Object.is(name, "")
      ) {
        name = `no_name_${i + 1}`;
      }

      // Validate data in good shape
      const requirementLabel = getCellValueStr(sheet, `D${currentRow + 1}`);
      if (requirementLabel !== REQUIREMENT_ROW_NAME) {
        throw new Error(`Error when loading indiviudal ${name},
          row = ${currentRow}.
          Expected label at D${currentRow} to be ${REQUIREMENT_ROW_NAME}`);
      }

      const properties = [];
      const requirements = [];
      const weights = [];

      let r;
      let p;
      let w;

      let col;
      for (let k = 0; k < characteristicNum; k++) {
        col = k + 4;
        r = getPropertyRequirement(sheet, currentRow + 1, col);
        w = getPropertyWeight(sheet, currentRow + 2, col);
        p = getPropertyValue(sheet, currentRow + 3, col);
        requirements.push(r);
        weights.push(w);
        properties.push(p);
      }

      individualNames.push(name);
      individualSetIndices.push(g);
      individualProperties.push(properties);
      individualRequirements.push(requirements);
      individualWeights.push(weights);

      // Load capacity
      const capacityValue = sheet.getCell(`C${currentRow + 1}`)?.value;
      if (capacityValue !== undefined && capacityValue !== null) {
        individualCapacities.push(capacityValue);
      }

      currentRow += 3;
    }

    currentRow += 1;
  }

  return {
    problemName,
    characteristicNum,
    setNum,
    setNames,
    setTypes,
    totalNumberOfIndividuals,
    individualNames,
    characteristics,
    individualSetIndices,
    individualCapacities,
    individualRequirements,
    individualProperties,
    individualWeights,
    individuals,
    fitnessFunction,
    setEvaluateFunction,
  };
};

/**
 * Tải dữ liệu Exclude Pairs từ workbook
 * @param {ExcelJS.Workbook} workbook - Workbook Excel chứa dữ liệu bài toán
 * @param {number} sheetNumber - Số thứ tự sheet cần đọc
 * @returns {Object} -  Exclude Pairs
 */
export const loadExcludePairs = async (workbook, sheetNumber) => {
  const sheetName = workbook.worksheets[sheetNumber].name;
  const result = {};
  if (sheetName !== "Exclude Pairs") return result;
  const sheet = workbook.getWorksheet(sheetName);
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
 * @deprecated
 * @param workbook
 * @param sheetNumber
 * @returns {Promise<{totalNumberOfIndividuals: *, characteristics: *[], setNum: *, fitnessFunction: *, problemName: *, individuals: *[], characteristicNum: *, setEvaluateFunction: *[]}>}
 */
export const loadProblemDataOld = async (workbook, sheetNumber) => {
  const sheetName = workbook.SheetNames[sheetNumber];
  const sheet = workbook.Sheets[sheetName];

  // Đọc các giá trị trong Excel
  const problemName = sheet["B1"]?.v || "";
  const setNum = sheet["B2"]?.v || 0;
  const totalNumberOfIndividuals = sheet["B3"]?.v || 0;
  const characteristicNum = sheet["B4"]?.v || 0;
  const fitnessFunction = sheet["B5"]?.v || "";

  let currentRow = 6 + Number(setNum);
  // let currentIndividual = 0;
  const characteristics = [];
  let errorMessage = "";

  // LOAD CHARACTERISTICS
  for (let i1 = 4; i1 < characteristicNum + 4; i1++) {
    const characteristicName =
      await sheet[
        XLSX.utils.encode_cell({
          c: i1,
          r: currentRow - 1,
        })
      ];

    if (characteristicName) {
      characteristics.push(characteristicName["v"]);
    }
  }

  // LOAD SET
  const individuals = [];
  const setEvaluateFunction = [];
  // const row = characteristicNum;
  // const col = 3;
  let individualNum = null;
  // let argumentCell = null;
  let individualName = null;
  let setType = null;
  let capacity = null;
  let setName = null;

  // Add evaluate function
  for (let j = 0; j < setNum; j++) {
    // let evaluateFunction = await sheet[`B${6 + j}`]['v'];
    const evaluateFunction = getCellValueStr(sheet, `B${6 + j}`);
    setEvaluateFunction.push(evaluateFunction);
  }

  // Load individuals
  for (let g = 0; g < setNum; g++) {
    setName = sheet[`A${currentRow}`]?.v || "";
    setType = sheet[`B${currentRow}`]?.v || "";

    if (g === 0) {
      setType = 0;
    } else if (g === 1) {
      setType = 1;
    }

    individualNum = sheet[`D${currentRow}`]?.v || 0;

    if (typeof individualNum !== "number") {
      errorMessage = `Error when loading Set_${g + 1}, row = ${currentRow}. Number of individual is invalid`;
      throw new Error(errorMessage);
    }

    for (let i = 0; i < individualNum; i++) {
      individualName = sheet[`A${currentRow + 1}`]?.v || "";
      capacity = sheet[`C${currentRow + 1}`]?.v || 0;

      const argument = [];
      for (let k = 0; k < characteristicNum; k++) {
        argument[k] = [];
        for (let l = 0; l < 3; l++) {
          const argumentCell =
            sheet[XLSX.utils.encode_cell({ c: k + 4, r: currentRow + l })];
          if (argumentCell === undefined) {
            errorMessage = `Error when loading Individual_${i + 1}, row = ${currentRow}, column = ${k + 1}. Characteristic_ of strategy are invalid`;
            throw new Error(errorMessage);
          }
          argument[k][l] = argumentCell["v"];
        }
      }

      individuals.push({
        set: setName,
        setType,
        individualName,
        capacity,
        argument,
      });
      currentRow += 3;
    }
    currentRow += 1;
  }

  return {
    problemName,
    characteristicNum,
    setNum,
    totalNumberOfIndividuals,
    characteristics,
    individuals,
    fitnessFunction,
    setEvaluateFunction,
  };
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
 * @param {string} address
 * @returns {number}
 *
 * @throws error if error
 */
export const getCellValueNum = (sheet, address) => {
  const val = Number(sheet.getCell(address)?.value);
  if (Number.isNaN(val)) {
    throw new TypeError("Invalid number format, cell address: " + address);
  }
  return val;
};

export const getPropertyValue = (sheet, row, column) => {
  validateAddress(row, column);
  const fieldAddress = colCache.encode(row, column);
  try {
    const value = Number(sheet.getCell(fieldAddress).value);
    if (Number.isNaN(value)) {
      throw new TypeError(`Invalid type for property value: ${value},
        field address: ${fieldAddress},
        expected type: number`);
    } else {
      return value;
    }
  } catch (e) {
    console.error(e);
    throw new Error(`Error when reading Property Value at: ${fieldAddress}`);
  }
};

export const getPropertyWeight = (sheet, row, column) => {
  validateAddress(row, column);
  const fieldAddress = colCache.encode(row, column);
  try {
    const value = Number(sheet.getCell(fieldAddress).value);
    if (!Number.isNaN(value)) {
      if (value < 0 || value > 10) {
        throw new RangeError(`Invalid value for property Weight: ${value},
          field address: ${fieldAddress},
          expected value in range [0, 10] for Weight`);
      }
      return value;
    } else {
      throw new TypeError(`Invalid type for property Weight: ${value},
        field address: ${fieldAddress},
        expected type: number`);
    }
  } catch (e) {
    console.error(e);
    throw new Error(`Error when reading Property Weight at: ${fieldAddress}`);
  }
};

export const getPropertyRequirement = (sheet, row, column) => {
  validateAddress(row, column);
  let fieldAddress = XLSX.utils.encode_cell({ c: column, r: row });
  try {
    let value = sheet[fieldAddress].v;
    if (!Number(value).isNaN) {
      return value;
    } else if (typeof value === "string") {
      if (STABLE_MATCHING_REQ_REGEX.test(value)) {
        return value;
      } else {
        throw new TypeError(`Invalid string format for property Requirement: ${value},
          field address: ${fieldAddress},
          expected value in format: "number:number" or "number++" or "number--"`);
      }
    } else {
      throw new TypeError(`Invalid type for property Requirement: ${value},
        field address: ${fieldAddress},
        expected type: string, number`);
    }
  } catch (e) {
    console.error(e);
    throw new Error(`Error when reading Property Value at: ${fieldAddress}`);
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

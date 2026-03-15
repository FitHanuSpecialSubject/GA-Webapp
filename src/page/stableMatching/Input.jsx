/* eslint max-len: 0 */
import React, { useContext, useEffect, useState } from "react";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { Link, useNavigate } from "react-router-dom";
import { FaRegFileExcel } from "react-icons/fa6";
import Input from "../../module/core/component/input";
import Loading from "../../module/core/component/Loading";
import DataContext from "../../module/core/context/DataContext";
import PopupContext from "../../module/core/context/PopupContext";
import guidelines from "../../module/core/asset/workbook/guidelines.xlsx";
import "../../module/stableMatching/css/input.scss";
import { SMT } from "../../consts";
import { STABLE_MATCHING_WORKBOOK } from "../../const/excel_const";
import {
  loadExcludePairs,
  loadDataset,
  loadProblemInfoSMT,
} from "../../utils/excel_utils";
import { validateExcelFile } from "../../utils/file_utils";
import {
  buildValidationSummary,
  normalizeErrorMessage,
  parseIntegerInput,
  validateFormulaField,
  validateRequiredIntegerField,
} from "../../utils/input_validation";

const MAX_CHARACTERISTICS = 20;
const MAX_TOTAL_INDIVIDUALS = 10000;
const DEFAULT_FITNESS_FUNCTION = "default";

const resizeArray = (values, nextLength, fillValue = "") => {
  const nextValues = values.slice(0, nextLength);

  while (nextValues.length < nextLength) {
    nextValues.push(fillValue);
  }

  return nextValues;
};

const normalizeFunctionValue = (value, fallbackValue) => {
  const normalizedValue = value.trim();
  return normalizedValue.length > 0 ? normalizedValue : fallbackValue;
};

export default function InputPage() {
  const [excelFile, setExcelFile] = useState(null);
  const [problemName, setProblemName] = useState("");
  const [setNum, setSetNum] = useState("");
  const [characteristicsNum, setCharacteristicsNum] = useState("");
  const [totalIndividualsNum, setTotalIndividualsNum] = useState("");
  const [fitnessFunction, setFitnessFunction] = useState(DEFAULT_FITNESS_FUNCTION);
  const [setEvaluateFunctions, setSetEvaluateFunctions] = useState([]);
  const [setIndividuals, setSetIndividuals] = useState([]);
  const [tableColumnCount, setTableColumnCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [excelFileError, setExcelFileError] = useState("");
  const [problemNameError, setProblemNameError] = useState("");
  const [setNumError, setSetNumError] = useState("");
  const [characteristicsNumError, setCharacteristicsNumError] = useState("");
  const [totalIndividualsNumError, setTotalIndividualsNumError] = useState("");
  const [fitnessFunctionError, setFitnessFunctionError] = useState("");
  const [setEvaluateFunctionErrors, setSetEvaluateFunctionErrors] = useState(
    [],
  );
  const [setIndividualsErrors, setSetIndividualsErrors] = useState([]);
  const [setIndividualsSummaryError, setSetIndividualsSummaryError] =
    useState("");
  const { setAppData, setGuideSectionIndex, setFavicon } =
    useContext(DataContext);
  const { displayPopup } = useContext(PopupContext);
  const navigate = useNavigate();

  useEffect(() => {
    setFavicon("idle");
  }, [setFavicon]);

  useEffect(() => {
    if (!excelFile) {
      return;
    }

    if (!validateExcelFile(excelFile)) {
      const message =
        "Please select a valid Excel workbook (.xlsx or .xlsm).";
      setExcelFileError(message);
      displayPopup("Invalid file", message, true);
      return;
    }

    readExcelFile(excelFile);
  }, [excelFile]);

  const syncTableState = (nextCount) => {
    setSetEvaluateFunctions((prevState) => resizeArray(prevState, nextCount));
    setSetIndividuals((prevState) => resizeArray(prevState, nextCount));
    setSetEvaluateFunctionErrors((prevState) => resizeArray(prevState, nextCount));
    setSetIndividualsErrors((prevState) => resizeArray(prevState, nextCount));
  };

  const showBlockingPopup = (fields) => {
    const message = buildValidationSummary(fields);

    if (message) {
      displayPopup("Invalid Form!", message, true);
    }
  };

  const showExcelError = (message, title = "Excel Error") => {
    setIsLoading(false);
    setExcelFileError(message);
    displayPopup(title, message, true);
  };

  const validateProblemNameValue = (value) => {
    const trimmedValue = value.trim();

    if (trimmedValue.length === 0) {
      return "Problem name must not be empty";
    }

    if (trimmedValue.length > 255) {
      return "Problem name must not exceed 255 characters";
    }

    return "";
  };

  const validateSetNumValue = (value) =>
    validateRequiredIntegerField({
      label: "Number of set",
      value,
      min: SMT.MIN_SET,
      max: SMT.MAX_SET,
    });

  const validateCharacteristicsNumValue = (value) =>
    validateRequiredIntegerField({
      label: "Number of characteristics",
      value,
      min: 1,
      max: MAX_CHARACTERISTICS,
    });

  const validateTotalIndividualsValue = (value) =>
    validateRequiredIntegerField({
      label: "Number of total individuals",
      value,
      min: 3,
      max: MAX_TOTAL_INDIVIDUALS,
    });

  const validateFitnessFunctionValue = (value) =>
    validateFormulaField({
      label: "Fitness function",
      value,
    });

  const validateSetEvaluateFunctionValue = (value, index) =>
    validateFormulaField({
      label: `Evaluate function Set_${index + 1}`,
      value,
    });

  const validateSetIndividualsValue = (value, index, totalIndividualsValue) => {
    const countError = validateRequiredIntegerField({
      label: `Number of individuals in Set_${index + 1}`,
      value,
      min: 1,
    });

    if (countError) {
      return countError;
    }

    const parsedIndividuals = parseIntegerInput(value);
    const parsedTotalIndividuals = parseIntegerInput(totalIndividualsValue);

    if (
      parsedIndividuals.isValid &&
      parsedTotalIndividuals.isValid &&
      parsedIndividuals.value > parsedTotalIndividuals.value
    ) {
      return `Number of individuals in Set_${index + 1} must not exceed the total number of individuals`;
    }

    return "";
  };

  const validateSetIndividualsGroup = (
    setIndividualValues = setIndividuals,
    totalIndividualsValue = totalIndividualsNum,
    activeSetCount = tableColumnCount,
  ) => {
    const nextErrors = Array.from({ length: activeSetCount }, (_, index) =>
      validateSetIndividualsValue(
        setIndividualValues[index] ?? "",
        index,
        totalIndividualsValue,
      ),
    );

    let nextSummaryError = "";
    const parsedTotalIndividuals = parseIntegerInput(totalIndividualsValue);

    if (
      activeSetCount > 0 &&
      parsedTotalIndividuals.isValid &&
      nextErrors.every((error) => error.length === 0)
    ) {
      const totalSetIndividuals = setIndividualValues
        .slice(0, activeSetCount)
        .reduce((sum, currentValue) => {
          return sum + parseIntegerInput(currentValue).value;
        }, 0);

      if (totalSetIndividuals !== parsedTotalIndividuals.value) {
        nextSummaryError =
          "The total number of individuals across all sets must equal the total number of individuals";
      }
    }

    setSetIndividualsErrors(nextErrors);
    setSetIndividualsSummaryError(nextSummaryError);

    return {
      errors: nextErrors,
      summaryError: nextSummaryError,
    };
  };

  const validateSetEvaluateFunctionsGroup = (
    evaluateFunctions = setEvaluateFunctions,
    activeSetCount = tableColumnCount,
  ) => {
    const nextErrors = Array.from({ length: activeSetCount }, (_, index) =>
      validateSetEvaluateFunctionValue(evaluateFunctions[index] ?? "", index),
    );

    setSetEvaluateFunctionErrors(nextErrors);
    return nextErrors;
  };

  const validateManualForm = () => {
    const nextProblemNameError = validateProblemNameValue(problemName);
    const nextSetNumError = validateSetNumValue(setNum);
    const nextCharacteristicsNumError =
      validateCharacteristicsNumValue(characteristicsNum);
    const nextTotalIndividualsNumError =
      validateTotalIndividualsValue(totalIndividualsNum);
    const nextFitnessFunctionError =
      validateFitnessFunctionValue(fitnessFunction);

    setProblemNameError(nextProblemNameError);
    setSetNumError(nextSetNumError);
    setCharacteristicsNumError(nextCharacteristicsNumError);
    setTotalIndividualsNumError(nextTotalIndividualsNumError);
    setFitnessFunctionError(nextFitnessFunctionError);

    const activeSetCount = nextSetNumError.length === 0 ? Number(setNum) : 0;
    const nextSetEvaluateErrors = validateSetEvaluateFunctionsGroup(
      setEvaluateFunctions,
      activeSetCount,
    );
    const { errors: nextSetIndividualsErrors, summaryError } =
      validateSetIndividualsGroup(
        setIndividuals,
        totalIndividualsNum,
        activeSetCount,
      );

    const blockingFields = [];

    if (nextProblemNameError) {
      blockingFields.push("Problem name");
    }
    if (nextSetNumError) {
      blockingFields.push("Number of set");
    }
    if (nextCharacteristicsNumError) {
      blockingFields.push("Number of characteristics");
    }
    if (nextTotalIndividualsNumError) {
      blockingFields.push("Number of total individuals");
    }
    if (nextFitnessFunctionError) {
      blockingFields.push("Fitness function");
    }

    nextSetIndividualsErrors.forEach((error, index) => {
      if (error) {
        blockingFields.push(`Set_${index + 1} individuals`);
      }
    });

    nextSetEvaluateErrors.forEach((error, index) => {
      if (error) {
        blockingFields.push(`Set_${index + 1} evaluate function`);
      }
    });

    if (summaryError) {
      blockingFields.push("Set individual totals");
    }

    if (blockingFields.length > 0) {
      showBlockingPopup(blockingFields);
      return false;
    }

    return true;
  };

  const validateUploadedWorkbook = (problemInfo, dataset) => {
    const blockingFields = [];
    const workbookProblemNameError = validateProblemNameValue(
      problemInfo.problemName,
    );
    const workbookSetNumError = validateSetNumValue(problemInfo.setNum);
    const workbookCharacteristicsNumError = validateCharacteristicsNumValue(
      problemInfo.characteristicNum,
    );
    const workbookTotalIndividualsError = validateTotalIndividualsValue(
      problemInfo.totalNumberOfIndividuals,
    );
    const workbookFitnessFunctionError = validateFitnessFunctionValue(
      problemInfo.fitnessFunction,
    );
    const workbookEvaluateFunctionErrors = problemInfo.setEvaluateFunction.map(
      (value, index) => validateSetEvaluateFunctionValue(value ?? "", index),
    );

    if (workbookProblemNameError) {
      blockingFields.push("Problem name");
    }
    if (workbookSetNumError) {
      blockingFields.push("Number of set");
    }
    if (workbookCharacteristicsNumError) {
      blockingFields.push("Number of characteristics");
    }
    if (workbookTotalIndividualsError) {
      blockingFields.push("Number of total individuals");
    }
    if (workbookFitnessFunctionError) {
      blockingFields.push("Fitness function");
    }

    workbookEvaluateFunctionErrors.forEach((error, index) => {
      if (error) {
        blockingFields.push(`Evaluate function Set_${index + 1}`);
      }
    });

    if (dataset.individualNames.length !== problemInfo.totalNumberOfIndividuals) {
      blockingFields.push("Dataset individual counts");
    }

    if (blockingFields.length > 0) {
      throw new Error(buildValidationSummary(blockingFields));
    }
  };

  const readExcelFile = async (file) => {
    const reader = new FileReader();
    setIsLoading(true);

    reader.onerror = () => {
      showExcelError("Unable to read the selected Excel workbook.");
    };

    reader.onload = async () => {
      try {
        const workbook = await new ExcelJS.Workbook().xlsx.load(reader.result);
        const requiredSheets = [
          STABLE_MATCHING_WORKBOOK.PROBLEM_INFO_SHEET_NAME,
          STABLE_MATCHING_WORKBOOK.DATASET_SHEET_NAME,
        ];

        for (const sheetName of requiredSheets) {
          if (!workbook.getWorksheet(sheetName)) {
            throw new Error(
              `The sheet '${sheetName}' is missing. Please check the file.`,
            );
          }
        }

        const problemInfo = await loadProblemInfoSMT(workbook);
        const dataset = await loadDataset(
          workbook,
          problemInfo.characteristicNum,
          problemInfo.setNum,
        );
        const excludePairs = await loadExcludePairs(workbook);

        validateUploadedWorkbook(problemInfo, dataset);

        setExcelFileError("");
        setIsLoading(false);
        setAppData({
          problem: {
            nameOfProblem: problemInfo.problemName,
            numberOfSets: problemInfo.setNum,
            numberOfIndividuals: problemInfo.totalNumberOfIndividuals,
            fitnessFunction: problemInfo.fitnessFunction,
            evaluateFunctions: problemInfo.setEvaluateFunction,
            setNames: dataset.setNames,
            individualNames: dataset.individualNames,
            characteristics: dataset.characteristics,
            individualSetIndices: dataset.individualSetIndices,
            individualCapacities: dataset.individualCapacities,
            individualProperties: dataset.individualProperties,
            individualRequirements: dataset.individualRequirements,
            individualWeights: dataset.individualWeights,
            excludePairs,
          },
        });
        navigate("/matching-theory/input-processing");
      } catch (error) {
        console.error(error);
        showExcelError(
          normalizeErrorMessage(
            error,
            "The selected Excel workbook is invalid. Please review the file and try again.",
          ),
        );
      }
    };

    try {
      reader.readAsArrayBuffer(file);
    } catch (error) {
      console.error(error);
      showExcelError(
        normalizeErrorMessage(
          error,
          "Unable to open the selected Excel workbook.",
        ),
      );
    }
  };

  const downloadExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const parsedSetNum = parseIntegerInput(setNum).value;
    const parsedCharacteristicsNum = parseIntegerInput(characteristicsNum).value;
    const parsedTotalIndividualsNum =
      parseIntegerInput(totalIndividualsNum).value;
    const normalizedFitnessFunction = normalizeFunctionValue(
      fitnessFunction,
      DEFAULT_FITNESS_FUNCTION,
    );
    const normalizedEvaluateFunctions = Array.from(
      { length: parsedSetNum },
      (_, index) =>
        normalizeFunctionValue(
          setEvaluateFunctions[index] ?? "",
          DEFAULT_FITNESS_FUNCTION,
        ),
    );

    const problemWorksheet = workbook.addWorksheet(
      STABLE_MATCHING_WORKBOOK.PROBLEM_INFO_SHEET_NAME,
    );
    const datasetWorksheet = workbook.addWorksheet(
      STABLE_MATCHING_WORKBOOK.DATASET_SHEET_NAME,
    );
    const excludePairsWorksheet = workbook.addWorksheet(
      STABLE_MATCHING_WORKBOOK.EXCLUDE_PAIRS_SHEET_NAME,
    );

    problemWorksheet.addRow(["Problem name", problemName.trim()]);
    problemWorksheet.addRow(["Number of set", parsedSetNum]);
    problemWorksheet.addRow([
      "Number of individuals",
      parsedTotalIndividualsNum,
    ]);
    problemWorksheet.addRow([
      "Number of characteristics",
      parsedCharacteristicsNum,
    ]);
    problemWorksheet.addRow(["Fitness function", normalizedFitnessFunction]);

    normalizedEvaluateFunctions.forEach((evaluateFunction, index) => {
      problemWorksheet.addRow([
        `Evaluate Function Set_${index + 1}`,
        evaluateFunction,
      ]);
    });

    for (let setIndex = 0; setIndex < parsedSetNum; setIndex++) {
      const setIndividualCount = parseIntegerInput(
        setIndividuals[setIndex],
      ).value;

      if (setIndex === 0) {
        const rowSet = ["Set_1", "Capacity", setIndividualCount];

        for (let characteristicIndex = 0;
          characteristicIndex < parsedCharacteristicsNum;
          characteristicIndex++) {
          rowSet.push(`Characteristic_${characteristicIndex + 1}`);
        }

        datasetWorksheet.addRow(rowSet);
      } else {
        datasetWorksheet.addRow([
          `Set_${setIndex + 1}`,
          null,
          setIndividualCount,
        ]);
      }

      for (let individualIndex = 0;
        individualIndex < setIndividualCount;
        individualIndex++) {
        const rowIndividual = [`Individual_${individualIndex + 1}`];
        const rowWeights = [null, null, "Weights"];
        const rowProperties = [null, null, "Properties"];

        rowIndividual.push("Fill capacity > 0");
        rowIndividual.push("Requirements");

        for (let characteristicIndex = 0;
          characteristicIndex < parsedCharacteristicsNum;
          characteristicIndex++) {
          rowIndividual.push(`req_${characteristicIndex + 1}`);
          rowWeights.push(`w_${characteristicIndex + 1}`);
          rowProperties.push(`p_${characteristicIndex + 1}`);
        }

        datasetWorksheet.addRow(rowIndividual);
        datasetWorksheet.addRow(rowWeights);
        datasetWorksheet.addRow(rowProperties);
      }
    }

    excludePairsWorksheet.getCell("A1").value = "Individual";
    excludePairsWorksheet.getCell("B1").value = "Excluded from";

    try {
      const guidelinesWorkbook = new ExcelJS.Workbook();
      const response = await fetch(guidelines);
      const arrayBuffer = await response.arrayBuffer();
      await guidelinesWorkbook.xlsx.load(arrayBuffer);
      const guidelinesSheet = workbook.addWorksheet(
        STABLE_MATCHING_WORKBOOK.GUIDELINE_SHEET_NAME,
      );
      guidelinesSheet.model = guidelinesWorkbook.getWorksheet(
        STABLE_MATCHING_WORKBOOK.GUIDELINE_SHEET_NAME,
      ).model;
    } catch (error) {
      console.error(error);
      displayPopup(
        "Error",
        "Failed to load the guidelines workbook. Please try again.",
        true,
      );
      return;
    }

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: "application/octet-stream" });
    saveAs(blob, `${problemName.trim()}_stable_matching.xlsx`);
  };

  const handleGetExcelTemplate = () => {
    if (!validateManualForm()) {
      return;
    }

    downloadExcel().then();
  };

  const handleProblemNameBlur = () => {
    setProblemNameError(validateProblemNameValue(problemName));
  };

  const handleSetNumBlur = () => {
    setSetNumError(validateSetNumValue(setNum));
  };

  const handleCharacteristicsNumBlur = () => {
    setCharacteristicsNumError(validateCharacteristicsNumValue(characteristicsNum));
  };

  const handleTotalIndividualsBlur = () => {
    setTotalIndividualsNumError(
      validateTotalIndividualsValue(totalIndividualsNum),
    );
    validateSetIndividualsGroup(setIndividuals, totalIndividualsNum, tableColumnCount);
  };

  const handleFitnessFunctionBlur = () => {
    setFitnessFunctionError(validateFitnessFunctionValue(fitnessFunction));
  };

  const handleSetNumChange = (event) => {
    const nextValue = event.target.value;
    setSetNum(nextValue);
    
    // Add real-time validation
    setSetNumError(validateSetNumValue(nextValue));

    const parsedSetCount = parseIntegerInput(nextValue);

    if (
      parsedSetCount.isValid &&
      parsedSetCount.value >= SMT.MIN_SET &&
      parsedSetCount.value <= SMT.MAX_SET
    ) {
      setTableColumnCount(parsedSetCount.value);
      syncTableState(parsedSetCount.value);
      return;
    }

    if (nextValue.trim().length === 0) {
      setTableColumnCount(0);
      setSetIndividualsSummaryError("");
    }
  };

  const handleSetIndividualsChange = (index, value) => {
    setSetIndividuals((prevState) => {
      const nextState = [...prevState];
      nextState[index] = value;
      return nextState;
    });
    
    // Add real-time validation
    const nextError = validateSetIndividualsValue(value, index, totalIndividualsNum);
    setSetIndividualsErrors((prevState) => {
      const nextState = [...prevState];
      nextState[index] = nextError;
      return nextState;
    });
  };

  const handleSetIndividualsBlur = (index) => {
    const nextError = validateSetIndividualsValue(
      setIndividuals[index] ?? "",
      index,
      totalIndividualsNum,
    );
    setSetIndividualsErrors((prevState) => {
      const nextState = resizeArray(prevState, tableColumnCount);
      nextState[index] = nextError;
      return nextState;
    });
    validateSetIndividualsGroup(setIndividuals, totalIndividualsNum, tableColumnCount);
  };

  const handleSetEvaluateFunctionChange = (index, value) => {
    setSetEvaluateFunctions((prevState) => {
      const nextState = [...prevState];
      nextState[index] = value;
      return nextState;
    });
    
    // Add real-time validation
    const nextError = validateSetEvaluateFunctionValue(value, index);
    setSetEvaluateFunctionsErrors((prevState) => {
      const nextState = [...prevState];
      nextState[index] = nextError;
      return nextState;
    });
  };

  const handleSetEvaluateFunctionBlur = (index) => {
    const nextError = validateSetEvaluateFunctionValue(
      setEvaluateFunctions[index] ?? "",
      index,
    );
    setSetEvaluateFunctionErrors((prevState) => {
      const nextState = resizeArray(prevState, tableColumnCount);
      nextState[index] = nextError;
      return nextState;
    });
  };

  const handleDrop = (event) => {
    event.preventDefault();
    event.currentTarget.classList.remove("dragging");
    const [file] = event.dataTransfer.files;

    if (!file) {
      return;
    }

    setExcelFileError("");
    setExcelFile(file);
  };

  const handleOnDragEnter = (event) => {
    event.preventDefault();
    event.currentTarget.classList.add("dragging");
  };

  const handleOnDragLeave = (event) => {
    event.preventDefault();
    event.currentTarget.classList.remove("dragging");
  };

  const handleFileInput = (event) => {
    const [file] = event.target.files;
    event.target.value = null;

    if (!file) {
      return;
    }

    setExcelFileError("");
    setExcelFile(file);
  };

  const renderSetConfigurationTable = () => {
    if (!tableColumnCount) {
      return null;
    }

    return (
      <table>
        <tbody>
          <tr>
            {Array.from({ length: tableColumnCount }, (_, index) => (
              <th className="th" key={`set_header_${index}`}>
                {`Set_${index + 1}`}
              </th>
            ))}
          </tr>
          <tr>
            {Array.from({ length: tableColumnCount }, (_, index) => (
              <td className="td" key={`set_individuals_${index}`}>
                <div className="table-input-wrapper">
                  <input
                    type="number"
                    className={`input-table-data ${
                      setIndividualsErrors[index] ? "input-table-data-error" : ""
                    }`}
                    placeholder={`Num individuals Set_${index + 1}`}
                    onChange={(event) =>
                      handleSetIndividualsChange(index, event.target.value)
                    }
                    onBlur={() => handleSetIndividualsBlur(index)}
                    value={setIndividuals[index] ?? ""}
                  />
                  {setIndividualsErrors[index] ? (
                    <p className="table-input-error">
                      {setIndividualsErrors[index]}
                    </p>
                  ) : null}
                </div>
              </td>
            ))}
          </tr>
          <tr>
            {Array.from({ length: tableColumnCount }, (_, index) => (
              <td className="td" key={`set_evaluate_${index}`}>
                <div className="table-input-wrapper">
                  <input
                    type="text"
                    className={`input-table-data ${
                      setEvaluateFunctionErrors[index]
                        ? "input-table-data-error"
                        : ""
                    }`}
                    placeholder={`Evaluate Function Set_${index + 1}`}
                    onChange={(event) =>
                      handleSetEvaluateFunctionChange(index, event.target.value)
                    }
                    onBlur={() => handleSetEvaluateFunctionBlur(index)}
                    value={setEvaluateFunctions[index] ?? ""}
                  />
                  {setEvaluateFunctionErrors[index] ? (
                    <p className="table-input-error">
                      {setEvaluateFunctionErrors[index]}
                    </p>
                  ) : null}
                </div>
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    );
  };

  return (
    <div className="input-page">
      <Loading isLoading={isLoading} />
      <p className="header-text">Enter information about your problem</p>

      <div className="input-container">
        <div className="row">
          <Input
            message="Name of the problem"
            type="text"
            error={problemNameError}
            handleOnChange={(event) => {
              setProblemName(event.target.value);
              setProblemNameError(validateProblemNameValue(event.target.value));
            }}
            onBlur={handleProblemNameBlur}
            value={problemName}
            description="The name should be concise and meaningful, reflecting the nature of the game being analyzed"
            guideSectionIndex={1}
          />
        </div>

        <div className="row">
          <Input
            message="Number of set"
            type="number"
            error={setNumError}
            handleOnChange={handleSetNumChange}
            onBlur={handleSetNumBlur}
            value={setNum}
            min={SMT.MIN_SET}
            max={SMT.MAX_SET}
            description="A positive number that reflects the number of sets involved to ensure that the resulting template is valid"
            guideSectionIndex={2}
          />
        </div>

        {tableColumnCount ? (
          <div className="table">
            {renderSetConfigurationTable()}
            {setIndividualsSummaryError ? (
              <p className="table-summary-error">{setIndividualsSummaryError}</p>
            ) : null}
          </div>
        ) : null}

        <div className="row">
          <Input
            message="Number of characteristics"
            type="number"
            error={characteristicsNumError}
            handleOnChange={(event) => {
              setCharacteristicsNum(event.target.value);
              setCharacteristicsNumError(validateCharacteristicsNumValue(event.target.value));
            }}
            onBlur={handleCharacteristicsNumBlur}
            value={characteristicsNum}
            description="A characteristic is the requirements and the properties that an individual has that affect their weight during matching"
            guideSectionIndex={3}
            max={MAX_CHARACTERISTICS}
          />
          <Input
            message="Number of total individuals"
            type="number"
            error={totalIndividualsNumError}
            handleOnChange={(event) => {
              setTotalIndividualsNum(event.target.value);
              setTotalIndividualsNumError(validateTotalIndividualsValue(event.target.value));
            }}
            onBlur={handleTotalIndividualsBlur}
            value={totalIndividualsNum}
            description="A positive integer that represents the total number of individuals across all sets"
            guideSectionIndex={4}
            max={MAX_TOTAL_INDIVIDUALS}
          />
        </div>

        <div className="row mb-4">
          <Input
            message="Fitness function"
            type="text"
            error={fitnessFunctionError}
            handleOnChange={(event) => {
              setFitnessFunction(event.target.value);
              setFitnessFunctionError(validateFitnessFunctionValue(event.target.value));
            }}
            onBlur={handleFitnessFunctionBlur}
            value={fitnessFunction}
            description="The fitness function is a mathematical function that represents the payoff that a player receives for a specific combination of strategies played by all the players in the game"
            guideSectionIndex={5}
          />
        </div>

        <div
          className="btn btn-success d-flex justify-content-center border-1 p-3"
          onClick={handleGetExcelTemplate}
        >
          <FaRegFileExcel className="me-0 fs-4" />
          Get Excel Template
        </div>
      </div>

      <div className="guide-box">
        <p>
          Get the Excel file template, input your data, then drag & drop it to
          the box below
        </p>
        <Link
          to="/guide"
          className="guide-link"
          onClick={() => setGuideSectionIndex(9)}
        >
          Learn more on how to input to file Excel
        </Link>
      </div>

      {excelFileError ? <p className="file-error">{excelFileError}</p> : null}
      <div
        className={excelFileError ? "drag-area file-error" : "drag-area"}
        onDrop={handleDrop}
        onDragEnter={handleOnDragEnter}
        onDragLeave={handleOnDragLeave}
        onDragOver={handleOnDragEnter}
      >
        <p className="drag-text">
          {excelFile ? excelFile.name : "Drag and drop a file here"}
        </p>
        <label htmlFor="select-file" id="select-file-label">
          Choose a file
        </label>
        <input
          accept=".xlsx,.xlsm"
          type="file"
          id="select-file"
          onChange={handleFileInput}
        />
      </div>
    </div>
  );
}

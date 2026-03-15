import React, { useContext, useEffect, useState } from "react";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { Link, useNavigate } from "react-router-dom";
import { FaRegFileExcel } from "react-icons/fa6";
import "../../module/gameTheory/css/input.scss";
import SpecialPlayerInput from "../../module/gameTheory/component/specialPlayerInput";
import Input from "../../module/core/component/input";
import Loading from "../../module/core/component/Loading";
import MaxMinCheckbox from "../../module/core/component/MaxMinCheckbox";
import DataContext from "../../module/core/context/DataContext";
import PopupContext from "../../module/core/context/PopupContext";
import { validateExcelFile } from "../../utils/file_utils";
import {
  loadConflictSet,
  loadNormalPlayers,
  loadProblemInfoGT,
  loadSpecialPlayer,
} from "../../utils/excel_utils";
import { GAME_THEORY_WORKBOOK } from "../../const/excel_const";
import GT_GUIDELINE from "../../module/core/asset/workbook/gtguidelines.xlsx";
import {
  buildValidationSummary,
  normalizeErrorMessage,
  parseIntegerInput,
  validateFormulaField,
  validateOptionalIntegerField,
  validateRequiredIntegerField,
} from "../../utils/input_validation";

const DEFAULT_FUNCTION_NAME = "DEFAULT";

const normalizeFunctionValue = (value, fallbackValue) => {
  const normalizedValue = value.trim();
  return normalizedValue.length > 0 ? normalizedValue : fallbackValue;
};

export default function InputPage() {
  const [excelFile, setExcelFile] = useState(null);
  const [problemName, setProblemName] = useState("");
  const [specialPlayerExists, setSpecialPlayerExists] = useState(false);
  const [specialPlayerPropsNum, setSpecialPlayerPropsNum] = useState("");
  const [normalPlayerNum, setNormalPlayerNum] = useState("");
  const [normalPlayerPropsNum, setNormalPlayerPropsNum] = useState("");
  const [fitnessFunction, setFitnessFunction] = useState(DEFAULT_FUNCTION_NAME);
  const [playerPayoffFunction, setPlayerPayoffFunction] = useState(
    DEFAULT_FUNCTION_NAME,
  );
  const [isMaximizing, setIsMaximizing] = useState(false);
  const [defaultStrategy, setDefaultStrategy] = useState("");
  const [problemNameError, setProblemNameError] = useState("");
  const [specialPlayerPropsNumError, setSpecialPlayerPropsNumError] =
    useState("");
  const [normalPlayerNumError, setNormalPlayerNumError] = useState("");
  const [normalPlayerPropsNumError, setNormalPlayerPropsNumError] =
    useState("");
  const [defaultStrategyError, setDefaultStrategyError] = useState("");
  const [fitnessFunctionError, setFitnessFunctionError] = useState("");
  const [playerPayoffFunctionError, setPlayerPayoffFunctionError] =
    useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [excelFileError, setExcelFileError] = useState("");
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

  const validateSpecialPlayerPropsNumValue = (value, isRequired) => {
    if (!isRequired) {
      return "";
    }

    return validateRequiredIntegerField({
      label: "Number of properties of special player",
      value,
      min: 1,
      max: 20,
    });
  };

  const validateNormalPlayerNumValue = (value) =>
    validateRequiredIntegerField({
      label: "Number of normal players",
      value,
      min: 2,
      max: 1000,
    });

  const validateNormalPlayerPropsNumValue = (value) =>
    validateRequiredIntegerField({
      label: "Number of properties each strategy of normal player",
      value,
      min: 1,
      max: 20,
    });

  const validateDefaultStrategyValue = (value) =>
    validateOptionalIntegerField({
      label: "Default number of strategies",
      value,
      min: 1,
      max: 100,
    });

  const validateFitnessFunctionValue = (value) =>
    validateFormulaField({
      label: "Fitness function",
      value,
    });

  const validatePlayerPayoffFunctionValue = (value) =>
    validateFormulaField({
      label: "Player payoff function",
      value,
    });

  const validateManualForm = () => {
    const nextProblemNameError = validateProblemNameValue(problemName);
    const nextSpecialPlayerPropsNumError = validateSpecialPlayerPropsNumValue(
      specialPlayerPropsNum,
      specialPlayerExists,
    );
    const nextNormalPlayerNumError = validateNormalPlayerNumValue(
      normalPlayerNum,
    );
    const nextNormalPlayerPropsNumError = validateNormalPlayerPropsNumValue(
      normalPlayerPropsNum,
    );
    const nextDefaultStrategyError = validateDefaultStrategyValue(
      defaultStrategy,
    );
    const nextFitnessFunctionError =
      validateFitnessFunctionValue(fitnessFunction);
    const nextPlayerPayoffFunctionError = validatePlayerPayoffFunctionValue(
      playerPayoffFunction,
    );

    setProblemNameError(nextProblemNameError);
    setSpecialPlayerPropsNumError(nextSpecialPlayerPropsNumError);
    setNormalPlayerNumError(nextNormalPlayerNumError);
    setNormalPlayerPropsNumError(nextNormalPlayerPropsNumError);
    setDefaultStrategyError(nextDefaultStrategyError);
    setFitnessFunctionError(nextFitnessFunctionError);
    setPlayerPayoffFunctionError(nextPlayerPayoffFunctionError);

    const blockingFields = [];

    if (nextProblemNameError) {
      blockingFields.push("Problem name");
    }
    if (nextSpecialPlayerPropsNumError) {
      blockingFields.push("Special player properties");
    }
    if (nextNormalPlayerNumError) {
      blockingFields.push("Number of normal players");
    }
    if (nextNormalPlayerPropsNumError) {
      blockingFields.push("Normal player properties");
    }
    if (nextDefaultStrategyError) {
      blockingFields.push("Default number of strategies");
    }
    if (nextFitnessFunctionError) {
      blockingFields.push("Fitness function");
    }
    if (nextPlayerPayoffFunctionError) {
      blockingFields.push("Player payoff function");
    }

    if (blockingFields.length > 0) {
      showBlockingPopup(blockingFields);
      return false;
    }

    return true;
  };

  const validateWorkbookProblemInfo = (problemInfo) => {
    const blockingFields = [];
    const workbookProblemNameError = validateProblemNameValue(
      problemInfo.problemName,
    );
    const workbookSpecialPlayerFlagError =
      problemInfo.specialPlayerExists === 0 || problemInfo.specialPlayerExists === 1
        ? ""
        : "Special player exists must be 0 or 1";
    const workbookSpecialPlayerPropsError =
      validateSpecialPlayerPropsNumValue(
        problemInfo.specialPlayerPropsNum,
        problemInfo.specialPlayerExists === 1,
      );
    const workbookNormalPlayerNumError = validateNormalPlayerNumValue(
      problemInfo.normalPlayerNum,
    );
    const workbookNormalPlayerPropsError = validateNormalPlayerPropsNumValue(
      problemInfo.normalPlayerPropsNum,
    );
    const workbookFitnessFunctionError = validateFitnessFunctionValue(
      problemInfo.fitnessFunction,
    );
    const workbookPlayerPayoffFunctionError = validatePlayerPayoffFunctionValue(
      problemInfo.playerPayoffFunction,
    );

    if (workbookProblemNameError) {
      blockingFields.push("Problem name");
    }
    if (workbookSpecialPlayerFlagError) {
      blockingFields.push("Special player exists");
    }
    if (workbookSpecialPlayerPropsError) {
      blockingFields.push("Special player properties");
    }
    if (workbookNormalPlayerNumError) {
      blockingFields.push("Number of normal players");
    }
    if (workbookNormalPlayerPropsError) {
      blockingFields.push("Normal player properties");
    }
    if (workbookFitnessFunctionError) {
      blockingFields.push("Fitness function");
    }
    if (workbookPlayerPayoffFunctionError) {
      blockingFields.push("Player payoff function");
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
        const problemSheet = workbook.getWorksheet(
          GAME_THEORY_WORKBOOK.PROBLEM_INFO_SHEET_NAME,
        );

        if (!problemSheet) {
          throw new Error(
            `The sheet '${GAME_THEORY_WORKBOOK.PROBLEM_INFO_SHEET_NAME}' is missing. Please check the file.`,
          );
        }

        const problemInfo = await loadProblemInfoGT(workbook);
        validateWorkbookProblemInfo(problemInfo);

        let specialPlayers = null;
        let players = null;
        let conflictSet = null;

        if (problemInfo.specialPlayerExists === 1) {
          if (
            !workbook.getWorksheet(
              GAME_THEORY_WORKBOOK.SPECIAL_PLAYER_SHEET_NAME,
            )
          ) {
            throw new Error(
              `The sheet '${GAME_THEORY_WORKBOOK.SPECIAL_PLAYER_SHEET_NAME}' is missing. Please check the file.`,
            );
          }

          specialPlayers = await loadSpecialPlayer(
            workbook,
            problemInfo.specialPlayerPropsNum,
          );
        }

        if (
          !workbook.getWorksheet(GAME_THEORY_WORKBOOK.NORMAL_PLAYER_SHEET_NAME)
        ) {
          throw new Error(
            `The sheet '${GAME_THEORY_WORKBOOK.NORMAL_PLAYER_SHEET_NAME}' is missing. Please check the file.`,
          );
        }

        players = await loadNormalPlayers(
          workbook,
          problemInfo.normalPlayerNum,
          problemInfo.normalPlayerPropsNum,
        );

        if (
          !workbook.getWorksheet(
            GAME_THEORY_WORKBOOK.CONFLICT_MATRIX_SHEET_NAME,
          )
        ) {
          throw new Error(
            `The sheet '${GAME_THEORY_WORKBOOK.CONFLICT_MATRIX_SHEET_NAME}' is missing. Please check the file.`,
          );
        }

        conflictSet = await loadConflictSet(workbook);

        setExcelFileError("");
        setIsLoading(false);
        setAppData({
          problem: {
            name: problemInfo.problemName,
            specialPlayerExists: problemInfo.specialPlayerExists,
            specialPlayerPropsNum: problemInfo.specialPlayerPropsNum,
            normalPlayerNum: problemInfo.normalPlayerNum,
            normalPlayerPropsNum: problemInfo.normalPlayerPropsNum,
            fitnessFunction: problemInfo.fitnessFunction,
            playerPayoffFunction: problemInfo.playerPayoffFunction,
            isMaximizing: problemInfo.isMaximizing,
            specialPlayer: specialPlayers,
            players,
            conflictSet,
          },
        });
        navigate("/input-processing");
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
    const parsedSpecialPlayerPropsNum = specialPlayerExists
      ? parseIntegerInput(specialPlayerPropsNum).value
      : 0;
    const parsedNormalPlayerNum = parseIntegerInput(normalPlayerNum).value;
    const parsedNormalPlayerPropsNum =
      parseIntegerInput(normalPlayerPropsNum).value;
    const parsedDefaultStrategy =
      parseIntegerInput(defaultStrategy).isValid &&
      parseIntegerInput(defaultStrategy).value > 0
        ? parseIntegerInput(defaultStrategy).value
        : 1;
    const normalizedFitnessFunction = normalizeFunctionValue(
      fitnessFunction,
      DEFAULT_FUNCTION_NAME,
    );
    const normalizedPlayerPayoffFunction = normalizeFunctionValue(
      playerPayoffFunction,
      DEFAULT_FUNCTION_NAME,
    );

    const sheet1 = workbook.addWorksheet(
      GAME_THEORY_WORKBOOK.PROBLEM_INFO_SHEET_NAME,
    );
    sheet1.addRows([
      ["Problem name", problemName.trim()],
      ["Special Player exists (0 - No, 1 -Yes) ", specialPlayerExists ? 1 : 0],
      [
        "Number of properties of special player",
        parsedSpecialPlayerPropsNum,
      ],
      ["Number of normal players", parsedNormalPlayerNum],
      [
        "Number of properties of each normal player",
        parsedNormalPlayerPropsNum,
      ],
      ["Fitness function", normalizedFitnessFunction],
      ["Player payoff function", normalizedPlayerPayoffFunction],
    ]);

    sheet1.addRow([
      "Is maximzing problem",
      isMaximizing ? "True" : "False",
    ]);

    if (specialPlayerExists) {
      const sheet2 = workbook.addWorksheet(
        GAME_THEORY_WORKBOOK.SPECIAL_PLAYER_SHEET_NAME,
      );
      sheet2.addRow(["Properties", "Weights"]);
    }

    const sheet3 = workbook.addWorksheet(
      GAME_THEORY_WORKBOOK.NORMAL_PLAYER_SHEET_NAME,
    );
    let currentRow = 1;

    for (let playerIndex = 0;
      playerIndex < parsedNormalPlayerNum;
      playerIndex++) {
      sheet3.getCell(currentRow, 1).value = `Player ${playerIndex + 1}`;
      sheet3.getCell(currentRow, 2).value = parsedDefaultStrategy;

      for (let strategyIndex = 0;
        strategyIndex < parsedDefaultStrategy;
        strategyIndex++) {
        sheet3.getCell(currentRow + strategyIndex + 1, 1).value =
          `Strategy ${strategyIndex + 1}`;

        for (let propertyIndex = 0;
          propertyIndex < parsedNormalPlayerPropsNum;
          propertyIndex++) {
          sheet3.getCell(
            currentRow + strategyIndex + 1,
            propertyIndex + 2,
          ).value = `Property ${propertyIndex + 1}`;
        }
      }

      currentRow += parsedDefaultStrategy + 1;
    }

    workbook.addWorksheet(GAME_THEORY_WORKBOOK.CONFLICT_MATRIX_SHEET_NAME);

    try {
      const guidelinesWorkbook = new ExcelJS.Workbook();
      const response = await fetch(GT_GUIDELINE);
      const arrayBuffer = await response.arrayBuffer();
      await guidelinesWorkbook.xlsx.load(arrayBuffer);
      const guidelinesSheet = workbook.addWorksheet(
        GAME_THEORY_WORKBOOK.GUIDELINE_SHEET_NAME,
      );
      guidelinesSheet.model = guidelinesWorkbook.getWorksheet(
        GAME_THEORY_WORKBOOK.GUIDELINE_SHEET_NAME,
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

    const workbookBuffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([workbookBuffer]);
    saveAs(blob, `${problemName.trim()}_game_theory.xlsx`);
  };

  const handleGetExcelTemplate = () => {
    if (!validateManualForm()) {
      return;
    }

    downloadExcel().then();
  };

  const handleSpecialPlayerExistsChange = (checked) => {
    setSpecialPlayerExists(checked);

    if (!checked) {
      setSpecialPlayerPropsNumError("");
    }
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
            onBlur={() => setProblemNameError(validateProblemNameValue(problemName))}
            value={problemName}
            description="The name should be concise and meaningful, reflecting the nature of the game being analyzed"
            guideSectionIndex={1}
          />
        </div>
        <div className="row">
          <SpecialPlayerInput
            specialPlayerExists={specialPlayerExists}
            setSpecialPlayerExists={handleSpecialPlayerExistsChange}
            specialPlayerPropsNum={specialPlayerPropsNum}
            setSpecialPlayerPropsNum={setSpecialPlayerPropsNum}
            error={specialPlayerPropsNumError}
            onChange={(event) =>
              setSpecialPlayerPropsNumError(
                validateSpecialPlayerPropsNumValue(
                  event.target.value,
                  specialPlayerExists,
                ),
              )
            }
            onBlur={() =>
              setSpecialPlayerPropsNumError(
                validateSpecialPlayerPropsNumValue(
                  specialPlayerPropsNum,
                  specialPlayerExists,
                ),
              )
            }
          />
        </div>

        <div className="row">
          <Input
            type="number"
            message="Number of normal players"
            error={normalPlayerNumError}
            handleOnChange={(event) => {
              setNormalPlayerNum(event.target.value);
              setNormalPlayerNumError(validateNormalPlayerNumValue(event.target.value));
            }}
            onBlur={() =>
              setNormalPlayerNumError(
                validateNormalPlayerNumValue(normalPlayerNum),
              )
            }
            value={normalPlayerNum}
            description="A positive integer that reflects the number of players involved to ensure that the resulting Nash equilibrium is valid"
            guideSectionIndex={4}
          />
          <Input
            message="Number of properties each strategy of normal player"
            type="number"
            error={normalPlayerPropsNumError}
            handleOnChange={(event) => {
              setNormalPlayerPropsNum(event.target.value);
              setNormalPlayerPropsNumError(validateNormalPlayerPropsNumValue(event.target.value));
            }}
            onBlur={() =>
              setNormalPlayerPropsNumError(
                validateNormalPlayerPropsNumValue(normalPlayerPropsNum),
              )
            }
            value={normalPlayerPropsNum}
            description="A property is a characteristic or attribute that a player has that affects their actions or outcomes in the game"
            guideSectionIndex={5}
          />
        </div>

        <div className="row">
          <Input
            message="Default number of strategies"
            type="number"
            error={defaultStrategyError}
            handleOnChange={(event) => {
              setDefaultStrategy(event.target.value);
              setDefaultStrategyError(validateDefaultStrategyValue(event.target.value));
            }}
            onBlur={() =>
              setDefaultStrategyError(
                validateDefaultStrategyValue(defaultStrategy),
              )
            }
            value={defaultStrategy}
            description={
              "This value is only for generating your Excel template. You should use the number of strategies " +
              "that most of the players have, then manually edit any further exception. Leave it blank in " +
              "case you want an example dataset."
            }
            guideSectionIndex={7}
          />
        </div>

        <div className="row">
          <Input
            message="Fitness function"
            type="text"
            error={fitnessFunctionError}
            handleOnChange={(event) => {
              setFitnessFunction(event.target.value);
              setFitnessFunctionError(validateFitnessFunctionValue(event.target.value));
            }}
            onBlur={() =>
              setFitnessFunctionError(
                validateFitnessFunctionValue(fitnessFunction),
              )
            }
            value={fitnessFunction}
            description="The fitness function is a mathematical function that represents the payoff that a player receives for a specific combination of strategies played by all the players in the game"
            guideSectionIndex={6}
          />
        </div>

        <div className="row">
          <Input
            message="Player payoff function"
            type="text"
            error={playerPayoffFunctionError}
            handleOnChange={(event) => {
              setPlayerPayoffFunction(event.target.value);
              setPlayerPayoffFunctionError(validatePlayerPayoffFunctionValue(event.target.value));
            }}
            onBlur={() =>
              setPlayerPayoffFunctionError(
                validatePlayerPayoffFunctionValue(playerPayoffFunction),
              )
            }
            value={playerPayoffFunction}
            description="The player payoff function is a mathematical function that determines the outcome of the game by assigning a payoff value to each player based on the strategies chosen by all the players in the game"
            guideSectionIndex={7}
          />
        </div>

        <div className="row">
          <MaxMinCheckbox
            isMaximizing={isMaximizing}
            setIsMaximizing={setIsMaximizing}
          />
        </div>
      </div>
      <div
        className="btn btn-success d-flex justify-content-center border-1 p-3"
        onClick={handleGetExcelTemplate}
      >
        <FaRegFileExcel className="me-0 fs-4" />
        Get Excel Template
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

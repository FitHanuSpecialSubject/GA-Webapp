/* eslint max-len: 0 */
import React, { useContext, useEffect, useState } from "react";
import Input from "../../module/core/component/input";
import { saveAs } from "file-saver";
import DataContext from "../../module/core/context/DataContext";
import ExcelJS from "exceljs";
import { Link, useNavigate } from "react-router-dom";
import "../../module/stableMatching/css/input.scss";
import guidelines from "../../module/core/asset/workbook/guidelines.xlsx"; // Assuming the file is in the same folder

import Loading from "../../module/core/component/Loading";
import PopupContext from "../../module/core/context/PopupContext";
import { SMT } from "../../consts";
import { validateExcelFile } from "../../utils/file_utils";
import {
  loadExcludePairs,
  loadDataset,
  loadProblemInfoSMT,
} from "../../utils/excel_utils";
// import PropTypes from "prop-types";
import { STABLE_MATCHING_WORKBOOK } from "../../const/excel_const";
import { FaRegFileExcel } from "react-icons/fa6";

export default function InputPage() {
  // initialize from data
  const [excelFile, setExcelFile] = useState(null);
  const [problemName, setProblemName] = useState("");
  const [setNum, setSetNum] = useState(undefined);
  const [characteristicsNum, setCharacteristicsNum] = useState(undefined);
  const [totalIndividualsNum, setTotalIndividualsNum] = useState(undefined);
  const [fitnessFunction, setFitnessFunction] = useState("default");
  const [isLoading, setIsLoading] = useState(false);
  const [excelFileError, setExcelFileError] = useState("");
  const [problemType, setProblemType] = useState("");
  const [problemNameError, setProblemNameError] = useState("");
  const [setNumError, setSetNumError] = useState("");
  const [characteristicsNumError, setCharacteristicsNumError] = useState("");
  const [totalIndividualsNumError, setTotalIndividualsNumError] = useState("");
  const [fitnessFunctionError, setFitnessFunctionError] = useState("");
  const { setAppData, setGuideSectionIndex, setFavicon } =
    useContext(DataContext);
  const { displayPopup } = useContext(PopupContext);
  const [colNums, setColNums] = useState(0);
  const [setEvaluateFunction, setSetEvaluateFunction] = useState(
    Array.from({ length: colNums }, () => "default"),
  );
  const [setIndividuals, setSetIndividuals] = useState(
    Array.from({ length: colNums }, () => ""),
  );
  const navigate = useNavigate();

  // useEffect to validate and read file when it changes
  useEffect(() => {
    if (excelFile) {
      try {
        if (validateExcelFile(excelFile)) {
          readExcelFile(excelFile);
        } else {
          displayPopup(
            "Something went wrong!",
            "The file was not an Excel file!",
            true,
          );
          setExcelFileError("The file was not an Excel file!");
        }
      } catch (error) {
        console.error(error);
        setExcelFile(null);
        displayPopup("Error", error.message, true);
      }
    }
  }, [excelFile]);
  useEffect(() => {
    setFavicon("idle");
  }, []);
  // Function to read data from the Excel file
  const readExcelFile = async (file) => {
    const reader = new FileReader();
    setIsLoading(true);
    try {
      reader.readAsArrayBuffer(file);
      reader.onload = async () => {
        const data = reader.result;
        const workbook = await new ExcelJS.Workbook().xlsx.load(data);
        const importantSheet = [
          STABLE_MATCHING_WORKBOOK.PROBLEM_INFO_SHEET_NAME,
          STABLE_MATCHING_WORKBOOK.DATASET_SHEET_NAME,
        ];
        for (const sheetName of importantSheet) {
          if (!workbook.getWorksheet(sheetName)) {
            displayPopup(
              "Excel Error",
              `The sheet '${sheetName}' is missing. Please check the file.`,
              true,
            );
            setExcelFile(null);
            setIsLoading(false);
            return;
          }
        }

        let problemInfo;
        let excludePairs;
        let dataset;
        try {
          problemInfo = await loadProblemInfoSMT(workbook);
          dataset = await loadDataset(
            workbook,
            problemInfo.characteristicNum,
            problemInfo.setNum,
          );
          excludePairs = await loadExcludePairs(workbook);
        } catch (error) {
          console.error(error);
          setExcelFile(null);
          setIsLoading(false);
          displayPopup("Excel Error: ", error.message, true);
          return;
        }
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
      };
    } catch (error) {
      console.error(error);
      setExcelFile(null);
      setIsLoading(false);
      displayPopup(
        "Something went wrong!",
        "Check the input file again for contact the admin!",
        true,
      );
    }
  };
  useEffect(() => {
    if (problemType) {
      displayPopup("Invalid Form!", problemType, true);
      setProblemType("");
    }
  }, [problemType]);

  const handleGetExcelTemplate = () => {
    if (validateForm()) {
      downloadExcel().then();
    }
  };

  const validateForm = () => {
    let error = false;
    let msg = "";
    const maxSets = SMT.MAX_SET;
    const maxCharacteristics = 20;
    const maxTotalIndividuals = 10000;

    const validFunctionPattern = /^[a-zA-Z0-9s+\-*/^()]+$/;
    // check if the problem name is empty
    if (problemName.length === 0 || problemName.length > 255) {
      setProblemNameError(
        "Problem name must not be empty or exceed 255 characters",
      );
      msg = "Problem name must not be empty or exceed 255 characters";
      error = true;
    } else {
      setProblemNameError("");
    }

    // check if the number of set is empty
    if (!setNum) {
      setSetNumError("Number of set must not be empty");
      msg = "Number of set must not be empty";
      error = true;
    } else {
      setSetNumError("");
    }

    // check if the number of characteristics is empty
    if (!characteristicsNum) {
      setCharacteristicsNumError("Number of characteristics must not be empty");
      msg = "Number of characteristics must not be empty";
      error = true;
    } else {
      setCharacteristicsNumError("");
    }

    // check if the number of total individuals is empty
    if (!totalIndividualsNum) {
      setTotalIndividualsNumError(
        "Number of total individuals must not be empty",
      );
      error = true;
    } else {
      setTotalIndividualsNumError("");
    }

    if (
      !totalIndividualsNum ||
      totalIndividualsNum > maxTotalIndividuals ||
      totalIndividualsNum < 2
    ) {
      setTotalIndividualsNumError(
        `The number of individuals must be from 2 to ${maxTotalIndividuals}`,
      );
      msg = `The number of individuals must be from 2 to ${maxTotalIndividuals}`;
      error = true;
    } else {
      setTotalIndividualsNumError("");
    }

    if (!setNum || setNum > maxSets || setNum < 2) {
      setSetNumError(`Number of set must be from 2 to ${maxSets}`);
      msg = `Number of set must be from 2 to ${maxSets}`;
      error = true;
    } else {
      setSetNumError("");
    }

    if (!characteristicsNum || characteristicsNum > maxCharacteristics) {
      setCharacteristicsNumError(
        `The number of characteristics must be from 1 to ${maxCharacteristics}`,
      );
      msg = `The number of characteristics must be from 1 to ${maxCharacteristics}`;
      error = true;
    } else {
      setCharacteristicsNumError("");
    }

    if (fitnessFunction.length === 0) {
      setFitnessFunction("default");
    } else {
      if (!validFunctionPattern.test(fitnessFunction)) {
        setFitnessFunctionError(
          "Function value contains an invalid character or unsupported function",
        );
        msg =
          "Function value contains an invalid character or unsupported function";
        error = true;
      } else {
        setFitnessFunctionError("");
      }
    }

    // check hàm fitness của từng set
    setEvaluateFunction.forEach((evaluateFunction, index) => {
      if (!evaluateFunction) {
        setSetEvaluateFunction((prevState) => {
          const newState = [...prevState];
          newState[index] = "default";
          return newState;
        });
      } else {
        if (!validFunctionPattern.test(evaluateFunction)) {
          setSetEvaluateFunction((prevState) => {
            const newState = [...prevState];
            newState[index] = "Function value contains an invalid character";
            return newState;
          });
          msg = "Function value contains an invalid character";
          error = true;
        }
      }
    });

    // check từng indiviuals của từng thằng trong set hợp lệ chưa
    setIndividuals.forEach((element) => {
      if (element.length === 0) {
        msg = "The number of individuals in every set must not be empty";
        error = true;
      } else if (
        parseInt(element) < 0 ||
        parseInt(element) > totalIndividualsNum
      ) {
        msg =
          "The number of individuals is every set must not reach over the total individuals";
        error = true;
      }
    });

    setProblemType(msg);
    // if there is no error, return true
    return !error;
  };

  const downloadExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const problemWorksheet = workbook.addWorksheet(
      STABLE_MATCHING_WORKBOOK.PROBLEM_INFO_SHEET_NAME,
    );
    const datasetWorksheet = workbook.addWorksheet(
      STABLE_MATCHING_WORKBOOK.DATASET_SHEET_NAME,
    );
    const excludePairsWorksheet = workbook.addWorksheet(
      STABLE_MATCHING_WORKBOOK.EXCLUDE_PAIRS_SHEET_NAME,
    );

    // Add "Problem Information" worksheet
    problemWorksheet.addRow(["Problem name", problemName]);
    problemWorksheet.addRow(["Number of set", setNum]);
    problemWorksheet.addRow(["Number of individuals", totalIndividualsNum]);
    problemWorksheet.addRow(["Number of characteristics", characteristicsNum]);
    problemWorksheet.addRow(["Fitness function", fitnessFunction]);
    // Add evaluate function sets
    setEvaluateFunction.forEach((evaluateFunction, index) => {
      problemWorksheet.addRow([
        `Evaluate Function Set_${index + 1}`,
        evaluateFunction,
      ]);
    });
    for (let i = 0; i < Number(setNum); i++) {
      const numberSetIndividuals = Number(setIndividuals[i]);
      if (i === 0) {
        const rowSet = ["Set_1"];
        rowSet.push("Capacity");
        rowSet.push(numberSetIndividuals);
        for (let j = 0; j < Number(characteristicsNum); j++) {
          rowSet.push(`Characteristic_${j + 1}`);
        }

        datasetWorksheet.addRow(rowSet);
        for (let k = 0; k < numberSetIndividuals; k++) {
          const rowIndividual = [`Individual_${k + 1}`];
          rowIndividual.push("Fill capacity > 0");
          rowIndividual.push(`Requirements`);
          const rowWeights = [null, null, "Weights"];
          const rowProperties = [null, null, "Properties"];

          for (let h = 0; h < characteristicsNum; h++) {
            rowIndividual.push(String(`req_${h + 1}`));
            rowWeights.push(String(`w_${h + 1}`));
            rowProperties.push(String(`p_${h + 1}`));
          }

          datasetWorksheet.addRow(rowIndividual);
          datasetWorksheet.addRow(rowWeights);
          datasetWorksheet.addRow(rowProperties);
        }
      } else {
        const rowSet = [`Set_${i + 1}`];
        rowSet.push(null);
        rowSet.push(numberSetIndividuals);
        datasetWorksheet.addRow(rowSet);
        for (let k = 0; k < numberSetIndividuals; k++) {
          const rowIndividual = [`Individual_${k + 1}`];
          rowIndividual.push("Fill capacity > 0");
          rowIndividual.push(`Requirements`);
          const rowWeights = [null];
          rowWeights.push(null);
          rowWeights.push("Weights");
          const rowProperties = [null];
          rowProperties.push(null);
          rowProperties.push("Properties");

          for (let h = 0; h < characteristicsNum; h++) {
            rowIndividual.push(String(`req_${h + 1}`));
            rowWeights.push(String(`w_${h + 1}`));
            rowProperties.push(String(`p_${h + 1}`));
          }

          datasetWorksheet.addRow(rowIndividual);
          datasetWorksheet.addRow(rowWeights);
          datasetWorksheet.addRow(rowProperties);
        }
      }
    }
    // Add header to Exclude Pairs
    excludePairsWorksheet.getCell("A1").value = "Individual";
    excludePairsWorksheet.getCell("B1").value = "Excluded from";

    // Load the guidelines.xlsx file
    try {
      const guidelinesWorkbook = new ExcelJS.Workbook();
      const response = await fetch(guidelines); // Fetch the local guidelines.xlsx file
      const arrayBuffer = await response.arrayBuffer();
      await guidelinesWorkbook.xlsx.load(arrayBuffer);
      const guidelinesSheet = workbook.addWorksheet(
        STABLE_MATCHING_WORKBOOK.GUIDELINE_SHEET_NAME,
      );
      guidelinesSheet.model = guidelinesWorkbook.getWorksheet(
        STABLE_MATCHING_WORKBOOK.GUIDELINE_SHEET_NAME,
      ).model;
    } catch (error) {
      console.error("Error loading guidelines.xlsx:", error);
      setExcelFile(null);
      displayPopup(
        "Error",
        "Failed to load guidelines.xlsx. Please check the file and try again.",
        true,
      );
      return;
    }

    // Save the workbook
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: "application/octet-stream" });
    saveAs(blob, `${problemName}_stable_matching.xlsx`);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setExcelFile(event.dataTransfer.files[0]);
    event.target.classList.remove("dragging");
  };

  const handleOnDragEnter = (event) => {
    event.preventDefault();
    event.target.classList.add("dragging");
  };

  const handleOnDragLeave = (event) => {
    event.preventDefault();
    event.target.classList.remove("dragging");
  };

  const handleFileInput = (event) => {
    if (event.target.value == null) return;
    setExcelFile(event.target.files[0]);
    event.target.value = null;
  };

  // Initialize table of individual per set
  const handleFitnessFunctionChange = (e) => {
    const value = e.target.value;
    if (value.length === 0) {
      setFitnessFunction("default");
    } else {
      setFitnessFunction(value);
    }
  };
  const handleColumnsChange = (e) => {
    const value = e.target.value;
    setSetNum(value);
    setColNums(value);
    setSetIndividuals(Array.from({ length: value }, () => ""));
    setSetEvaluateFunction(Array.from({ length: value }, () => "default"));
  };

  const generateTable = () => {
    const table = [];
    for (let i = 0; i < 3; i++) {
      const row = [];
      if (i === 0) {
        for (let j = 0; j < colNums; j++) {
          row.push(<th className="th" key={j}>{` Set_${j + 1}`}</th>);
        }
      } else if (i === 1) {
        for (let k = 0; k < colNums; k++) {
          row.push(
            <td className="td" key={k}>
              <input
                type="text"
                className="input-table-data"
                placeholder={`Num individuals Set_${k + 1}`}
                onChange={(e) => {
                  const newSetIndividuals = [...setIndividuals];
                  newSetIndividuals[k] = e.target.value;
                  setSetIndividuals(newSetIndividuals);
                }}
              />
            </td>,
          );
        }
      } else if (i === 2) {
        for (let k = 0; k < colNums; k++) {
          row.push(
            <td className="td" key={k}>
              <input
                type="text"
                className="input-table-data"
                placeholder={`Evaluate Function Set_${k + 1}`}
                // Thiếu value nên ban đầu không render được default value
                // value={setEvaluateFunction[k]}
                onChange={(e) => {
                  const newSetEvaluateFunction = [...setEvaluateFunction];
                  newSetEvaluateFunction[k] = e.target.value;
                  setSetEvaluateFunction(newSetEvaluateFunction);
                }}
              />
            </td>,
          );
        }
      }
      table.push(<tr key={i}>{row}</tr>);
    }

    return (
      <table>
        <tbody>{table}</tbody>
      </table>
    );
  };

  return (
    <>
      <div className="input-page">
        <Loading isLoading={isLoading} />
        <p className="header-text">Enter information about your problem</p>

        <div className="input-container">
          <div className="row">
            <Input
              message="Name of the problem"
              type="text"
              error={problemNameError}
              handleOnChange={(e) => setProblemName(e.target.value)}
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
              handleOnChange={handleColumnsChange}
              value={setNum}
              min={SMT.MIN_SET}
              max={SMT.MAX_SET}
              description="A positive number that reflects the number of set involved to ensure that the resulting is valid"
              guideSectionIndex={2}
            />
          </div>
          {setNum ? <div className="table">{generateTable()}</div> : null}

          <div className="row">
            <Input
              message="Number of characteristics"
              text="number"
              error={characteristicsNumError}
              handleOnChange={(e) => setCharacteristicsNum(e.target.value)}
              value={characteristicsNum}
              description="A characteristic is the requirements and the properties that an individuals has that affects their weight during matching"
              guideSectionIndex={3}
              max={20}
            />
            <Input
              message="Number of total individuals"
              text="number"
              error={totalIndividualsNumError}
              handleOnChange={(e) => setTotalIndividualsNum(e.target.value)}
              value={totalIndividualsNum}
              description="A positive number that reflects the number of individuals in each set involved to ensure that the resulting is valid"
              guideSectionIndex={4}
              max={10000}
            />
          </div>

          <div className="row mb-4">
            <Input
              message="Fitness function"
              type="text"
              error={fitnessFunctionError}
              handleOnChange={(e) => setFitnessFunction(e.target.value)}
              onBlur={handleFitnessFunctionChange}
              value={fitnessFunction}
              description="The fitness function is a mathematical function that represents the payoff that a player receives for a specific combination of strategies played by all the players in the game"
              guideSectionIndex={5}
              // iconStyle={{fontSize: '1.2em', verticalAlign: 'center'}}
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
            {" "}
            Learn more on how to input to file Excel
          </Link>
        </div>
        {excelFileError && <p className="file-error">{excelFileError}</p>}
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
            accept=".xlsx"
            type="file"
            id="select-file"
            onChange={handleFileInput}
          />
        </div>
      </div>
    </>
  );
}

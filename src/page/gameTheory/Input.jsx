import React from "react";
import { useState, useEffect } from "react";
import "../../module/gameTheory/css/input.scss";
import SpecialPlayerInput from "../../module/gameTheory/component/specialPlayerInput";
import Input from "../../module/core/component/input";
import ExcelImage from "../../module/core/asset/image/excel.png";
import { saveAs } from "file-saver";
import * as XLSX from "@e965/xlsx";
import { useContext } from "react";
import DataContext from "../../module/core/context/DataContext";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import Loading from "../../module/core/component/Loading";
import MaxMinCheckbox from "../../module/core/component/MaxMinCheckbox";
import PopupContext from "../../module/core/context/PopupContext";
import { validateExcelFile } from "../../utils/file_utils";
import ExcelJS from "exceljs";
export default function InputPage() {
  // initialize form data
  const [excelFile, setExcelFile] = useState(null);

  const [problemName, setProblemName] = useState("");
  const [specialPlayerExists, setSpecialPlayerExists] = useState("");
  const [specialPlayerPropsNum, setSpecialPlayerPropsNum] = useState(null);
  const [normalPlayerNum, setNormalPlayerNum] = useState(null);
  const [normalPlayerPropsNum, setNormalPlayerPropsNum] = useState(null);
  const [fitnessFunction, setFitnessFunction] = useState("");
  const [playerPayoffFunction, setPlayerPayoffFunction] = useState("");
  const [isMaximizing, setIsMaximizing] = useState(false);

  const [problemNameError, setProblemNameError] = useState("");
  const [specialPlayerPropsNumError, setSpecialPlayerPropsNumError] =
    useState("");
  const [normalPlayerNumError, setNormalPlayerNumError] = useState("");
  const [normalPlayerPropsNumError, setNormalPlayerPropsNumError] =
    useState("");
  const [fitnessFunctionError, setFitnessFunctionError] = useState("");
  const [playerPayoffFunctionError, setPlayerPayoffFunctionError] =
    useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [excelFileError, setExcelFileError] = useState("");

  const { setAppData, setGuideSectionIndex } = useContext(DataContext);
  const { displayPopup } = useContext(PopupContext);

  const navigate = useNavigate();
  // check if the uploaded file is an excel file
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
        displayPopup("Error", error.message, true);
      }
    }
  }, [excelFile]);

  // read file
  const readExcelFile = async (file) => {
    const reader = new FileReader();
    setIsLoading(true);

    try {
      reader.readAsArrayBuffer(file);
      reader.onload = async () => {
        const data = reader.result;
        const workbook = await new ExcelJS.Workbook().xlsx.load(data);

        const problemInfo = await loadProblemInfo(workbook, 0);

        console.log("Problem Info: ");
        console.log(problemInfo);
        if (!problemInfo) return; // stop processing in case of error

        let specialPlayers = null;
        let players = null;
        let conflictSet = null;

        if (problemInfo.specialPlayerExists) {
          specialPlayers = await loadSpecialPlayer(workbook, 1); // sheet 1 is the special player sheet
          if (!specialPlayers) return; // stop processing in case of error

          players = await loadNormalPlayers(
            workbook,
            2,
            problemInfo.normalPlayerNum,
            problemInfo.normalPlayerPropsNum,
          ); // sheet 2 is the normal player sheet
          if (!players) return; // stop processing in case of error

          conflictSet = await loadConflictSet(workbook, 3); // sheet 3 is the conflict set sheet
          if (!conflictSet) return; // stop processing in case of error
        } else {
          players = await loadNormalPlayers(
            workbook,
            1,
            problemInfo.normalPlayerNum,
            problemInfo.normalPlayerPropsNum,
          ); // sheet 1 is the normal player sheet because there is no special player sheet
          if (!players) return; // stop processing in case of error

          conflictSet = await loadConflictSet(workbook, 2); // sheet 2 is the conflict set sheet
          if (!conflictSet) return; // stop processing in case of error
        }

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
            players: players,
            conflictSet: conflictSet,
          },
        });

        setIsLoading(false);
        navigate("/input-processing");
      };
    } catch (error) {
      console.error(error);
      setIsLoading(false);
      displayPopup(
        "Something went wrong!",
        "Check the input file again for contact the admin!",
        true,
      );
    }
  };

  const loadProblemInfo = async (workbook, sheetNumber) => {
    try {
      const sheetName = workbook.worksheets[sheetNumber].name;
      const problemInfoWorksheet = workbook.getWorksheet(sheetName);

      const problemName = problemInfoWorksheet.getCell("B1").value;
      const specialPlayerExists = problemInfoWorksheet.getCell("B2").value;
      const specialPlayerPropsNum = problemInfoWorksheet.getCell("B3").value;
      const normalPlayerNum = problemInfoWorksheet.getCell("B4").value;
      const normalPlayerPropsNum = problemInfoWorksheet.getCell("B5").value;
      const fitnessFunction = problemInfoWorksheet.getCell("B6").value;
      const playerPayoffFunction = problemInfoWorksheet.getCell("B7").value;
      const isMaximizing =
        (await problemInfoWorksheet.getCell("B8")?.value) &&
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
    } catch (error) {
      console.error(error);
      setIsLoading(false);
      displayPopup(
        "Something went wrong!",
        "Error when loading the Problem Information sheet",
        true,
      );
    }
  };

  const loadSpecialPlayer = async (workbook, sheetNumber) => {
    try {
      const sheetName = workbook.worksheets[sheetNumber].name;
      const specialPlayerWorkSheet = workbook.getWorksheet(sheetName);
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
    } catch (error) {
      console.error(error);
      setIsLoading(false);
      displayPopup(
        "Something went wrong!",
        "Error when loading the Special Player sheet",
        true,
      );
    }
  };

  const loadNormalPlayers = async (
    workbook,
    sheetNumber,
    normalPlayerNum,
    normalPlayerPropsNum,
  ) => {
    let currentRow = 1;
    const players = [];
    let errorMessage = null;
    try {
      const sheetName = workbook.worksheets[sheetNumber].name;
      const normalPlayerWorkSheet = workbook.getWorksheet(sheetName);
      let currentPlayer = 0;

      // LOAD PLAYERS
      while (players.length < normalPlayerNum) {
        const playerNameCell = normalPlayerWorkSheet.getCell(`A${currentRow}`);
        const playerName = playerNameCell
          ? playerNameCell.v
          : `Player ${currentPlayer + 1}`; // because the player name is optional
        const strategyNumber = normalPlayerWorkSheet.getCell(
          `B${currentRow}`,
        ).value;
        // console.log(`name address: A${currentRow}, name value: ${playerName} , strat number: B${currentRow}`);

        if (!strategyNumber || typeof strategyNumber !== "number") {
          errorMessage = `Error when loading player#${currentPlayer + 1}, row = ${currentRow} . Number of strategies is invalid`;
          throw new Error();
        }
        const payoffFunction = normalPlayerWorkSheet.getCell(`C${currentRow}`)
          ? await normalPlayerWorkSheet.getCell(`C${currentRow}`).value
          : null;

        const strategies = [];

        // LOAD STRATEGIES
        for (let i = 1; i <= strategyNumber; i++) {
          // currentRow + i because the current row is the player name and the strategy number
          const strategyNameCell = normalPlayerWorkSheet.getCell(
            `A${currentRow + i}`,
          );

          const strategyName = strategyNameCell
            ? strategyNameCell.value
            : `Strategy ${i}`; // because the strategy name is optional
          const properties = [];
          // LOAD PROPERTIES
          for (let j = 1; j <= normalPlayerPropsNum; j++) {
            // c (0-based): j starts from 1 because the first column is the strategy name
            // r (0-based): currentRow + i - 1 because currentRow + i is the row of the startegy, and minus 1 because the row in this method is 0-based (remove this -1 if you want to see the error)
            const propertyCell = normalPlayerWorkSheet.getCell(
              currentRow + i - 1,
              j,
            );
            if (propertyCell) {
              properties.push(propertyCell.value);
            }
          }

          // CHECK IF THE STRATEGY HAS PROPERTIES
          if (!properties.length) {
            errorMessage = `Error when loading player#${currentPlayer + 1}, row = ${currentRow + i}. Properties of strategy are invalid`;
            throw new Error();
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
          errorMessage = `Error when loading the player#${players.length + 1}. All strategies of a player must have the same number of properties!`;
          throw new Error();
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
    } catch (error) {
      console.error(error);
      if (!errorMessage) {
        errorMessage = `Error when loading Normal Player sheet, row = ${currentRow}.`;
      }
      setIsLoading(false);
      displayPopup("Something went wrong!", errorMessage, true);
    }
  };

  const loadConflictSet = async (workbook, sheetNumber) => {
    try {
      const sheetName = workbook.worksheets[sheetNumber].name;
      const conflictSetWorkSheet = workbook.getWorksheet(sheetName);
      const conflictSet = [];
      let row = 0;
      let col = 0;
      let currentCell = conflictSetWorkSheet.getCell(row, col);

      // loop until there is a cell contains data
      while (currentCell) {
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
    } catch (error) {
      console.error(error);
      setIsLoading(false);
      displayPopup(
        "Something went wrong!",
        "Error when loading the Conflict Matrix sheet",
        true,
      );
    }
  };

  const handleGetExcelTemplate = () => {
    if (validateForm()) {
      downloadExcel();
    }
  };

  const validateForm = () => {
    let error = false;

    // check if the problem name is empty
    if (!problemName) {
      setProblemNameError("Problem name must not be empty");
      error = true;
    } else {
      setProblemNameError("");
    }

    if (specialPlayerExists) {
      // if special player exists, then the number of special players must not be empty
      if (!specialPlayerPropsNum) {
        setSpecialPlayerPropsNumError(
          "Special player properties must not be empty",
        );
        error = true;
      } else {
        setSpecialPlayerPropsNumError("");
      }
    }

    // check if the number of normal players is empty
    if (!normalPlayerNum) {
      setNormalPlayerNumError("Normal player number must not be empty");
      error = true;
    } else {
      setNormalPlayerNumError("");
    }

    // check if the number of normal player properties is empty
    if (!normalPlayerPropsNum) {
      setNormalPlayerPropsNumError(
        "Normal player properties must not be empty",
      );
      error = true;
    } else {
      setNormalPlayerPropsNumError("");
    }

    // check if the number of strategies is empty
    if (!fitnessFunction) {
      setFitnessFunctionError("Fitness function must not be empty");
      error = true;
    } else {
      setFitnessFunctionError("");
    }

    // check if the number of strategies is empty
    if (!playerPayoffFunction) {
      setPlayerPayoffFunctionError("Player payoff function must not be empty");
      error = true;
    } else {
      setPlayerPayoffFunctionError("");
    }

    // if there is no error, return true
    return !error;
  };

  // tao file excel dua tren input
  const downloadExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const payoffFunction = playerPayoffFunction;

    // write problem information to sheet1
    const sheet1 = workbook.addWorksheet("Sheet 1");
    sheet1.addRows([
      ["Problem name", problemName],
      ["Special Player exists (0 - No, 1 -Yes) ", specialPlayerExists ? 1 : 0],
      ["Number of properties of special player", Number(specialPlayerPropsNum)],
      ["Number of normal players", Number(normalPlayerNum)],
      [
        "Number of properties of each normal player",
        Number(normalPlayerPropsNum),
      ],
      ["Fitness function", fitnessFunction],
      ["Player payoff function", payoffFunction],
    ]);

    let isMaximizingRow = ["Is maximzing problem", "False"];
    if (isMaximizing) {
      isMaximizingRow = ["Is maximzing problem", "True"];
    }
    // add isMaximizingRow to the end of sheet1
    sheet1.addRow(isMaximizingRow);

    // if user choose to add special player, add sheet2
    if (specialPlayerExists) {
      const sheet2 = workbook.addWorksheet("Special player");
      sheet2.addRow(["Properties", "Weights"]);
    }

    // Write the sheet3 with sample data
    const sheet3 = workbook.addWorksheet("Normal player");
    sheet3.addRow(["Player 1's Name", "2 (Number of strategies)"]);

    // add some  example data for sheet3 (base on the number of normal players user input)
    const row2 = ["Strategy 1's name"];
    const row3 = ["Strategy 2's name"];
    // input the property placeholder as the number of normal player properties
    for (let i = 0; i < Number(normalPlayerPropsNum); i++) {
      row2.push(`Property ${i + 1}`);
      row3.push(`Property ${i + 1}`);
    }

    // add the row2 and row3 to the end of sheet3
    sheet3.addRows([row2, row3]);
    // if the number of normal players is greater than 1, add one more player sample data
    if (Number(normalPlayerNum)) {
      const row4 = ["Player 2's Name", "3 (Number of strategies)"];
      const row5 = ["Strategy 1's name"];
      const row6 = ["Strategy 2's name"];
      const row7 = ["Strategy 3's name"];

      // input the property placeholder as the number of normal player properties
      for (let i = 0; i < Number(normalPlayerPropsNum); i++) {
        row5.push(`Property ${i + 1}`);
        row6.push(`Property ${i + 1}`);
        row7.push(`Property ${i + 1}`);
      }
      // add the row4, row5, row6, row7 to the end of sheet3
      sheet3.addRows([row4, row5, row6, row7]);
    }

    // Write the sheet4(blank sheet) for user to input conflict matrix
    workbook.addWorksheet("Conflict matrix");

    const wbout = await workbook.xlsx.writeBuffer();
    const blob = new Blob([wbout]);
    saveAs(blob, "input.xlsx");
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
    setExcelFile(event.target.files[0]);
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
            <SpecialPlayerInput
              specialPlayerExists={specialPlayerExists}
              setSpecialPlayerExists={setSpecialPlayerExists}
              specialPlayerPropsNum={specialPlayerPropsNum}
              setSpecialPlayerPropsNum={setSpecialPlayerPropsNum}
              error={specialPlayerPropsNumError}
            />
          </div>

          <div className="row">
            <Input
              type="number"
              message="Number of normal players"
              text="number"
              error={normalPlayerNumError}
              handleOnChange={(e) => setNormalPlayerNum(e.target.value)}
              value={normalPlayerNum}
              description="A positive number that reflects the number of players involved to ensure that the resulting Nash equilibrium is valid"
              guideSectionIndex={4}
            />
            <Input
              message="Number of properties each strategy of normal player"
              text="number"
              error={normalPlayerPropsNumError}
              handleOnChange={(e) => setNormalPlayerPropsNum(e.target.value)}
              value={normalPlayerPropsNum}
              description="A property is a characteristic or attribute that a player has that affects their actions or outcomes in the game"
              guideSectionIndex={5}
            />
          </div>

          <div className="row">
            <Input
              message="Fitness function"
              type="text"
              error={fitnessFunctionError}
              handleOnChange={(e) => setFitnessFunction(e.target.value)}
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
              handleOnChange={(e) => setPlayerPayoffFunction(e.target.value)}
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
        <div className="btn" onClick={handleGetExcelTemplate}>
          <p>Get Excel Template</p>
          <img src={ExcelImage} alt="" />
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
          <input type="file" id="select-file" onChange={handleFileInput} />
        </div>
      </div>
    </>
  );
}

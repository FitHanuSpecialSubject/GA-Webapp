import React from "react";
import { useState, useEffect } from "react";
import "../../module/gameTheory/css/input.scss";
import SpecialPlayerInput from "../../module/gameTheory/component/specialPlayerInput";
import Input from "../../module/core/component/input";
import ExcelImage from "../../module/core/asset/image/excel.png";
import { saveAs } from "file-saver";
import { useContext } from "react";
import DataContext from "../../module/core/context/DataContext";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import Loading from "../../module/core/component/Loading";
import MaxMinCheckbox from "../../module/core/component/MaxMinCheckbox";
import PopupContext from "../../module/core/context/PopupContext";
import { validateExcelFile } from "../../utils/file_utils";
import ExcelJS from "exceljs";
import {
  loadConflictSet,
  loadNormalPlayers,
  loadProblemInfoGT,
  loadSpecialPlayer,
} from "../../utils/excel_utils";
import { GAME_THEORY_WORKBOOK } from "../../const/excel_const";
import GT_GUIDELINE from "../../module/core/asset/workbook/gtguidelines.xlsx";

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

  const { setAppData, setGuideSectionIndex, setFavicon } =
    useContext(DataContext);
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
  useEffect(() => {
    setFavicon("idle");
  }, []);
  // read file
  const readExcelFile = async (file) => {
    const reader = new FileReader();
    setIsLoading(true);

    try {
      reader.readAsArrayBuffer(file);
      reader.onload = async () => {
        const data = reader.result;
        const workbook = await new ExcelJS.Workbook().xlsx.load(data);
        let problemInfo;
        try {
          problemInfo = await loadProblemInfoGT(workbook);
        } catch (e) {
          console.error(e);
          setIsLoading(false);
          displayPopup(
            "Something went wrong!",
            "Error when loading the Problem Information sheet",
            true,
          );
        }

        if (!problemInfo) return; // stop processing in case of error

        let specialPlayers = null;
        let players = null;
        let conflictSet = null;

        if (problemInfo.specialPlayerExists) {
          try {
            specialPlayers = await loadSpecialPlayer(
              workbook,
              specialPlayerPropsNum,
            ); // sheet 1 is the special player sheet
          } catch (e) {
            console.error(e);
            setIsLoading(false);
            displayPopup(
              "Something went wrong!",
              "Error when loading the Special Player sheet",
              true,
            );
          }
          if (!specialPlayers) return; // stop processing in case of error
          try {
            players = await loadNormalPlayers(
              workbook,
              problemInfo.normalPlayerNum,
              problemInfo.normalPlayerPropsNum,
            );
          } catch (error) {
            let errorMessage = error;
            console.error(error);
            if (!errorMessage) {
              errorMessage = `Error when loading Normal Player sheet.`;
            }
            setIsLoading(false);
            displayPopup("Something went wrong!", errorMessage, true);
          }
          if (!players) return; // stop processing in case of error
          try {
            conflictSet = await loadConflictSet(workbook); // sheet 3 is the conflict set sheet
          } catch (error) {
            console.error(error);
            setIsLoading(false);
            displayPopup(
              "Something went wrong!",
              "Error when loading the Conflict Matrix sheet",
              true,
            );
          }
          if (!conflictSet) return; // stop processing in case of error
        } else {
          players = await loadNormalPlayers(
            workbook,
            problemInfo.normalPlayerNum,
            problemInfo.normalPlayerPropsNum,
            setIsLoading,
            displayPopup,
          ); // sheet 1 is the normal player sheet because there is no special player sheet
          if (!players) return; // stop processing in case of error
          try {
            conflictSet = await loadConflictSet(workbook); // sheet 3 is the conflict set sheet
          } catch (error) {
            console.error(error);
            setIsLoading(false);
            displayPopup(
              "Something went wrong!",
              "Error when loading the Conflict Matrix sheet",
              true,
            );
          } // sheet 2 is the conflict set sheet
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
  const handleGetExcelTemplate = () => {
    if (validateForm()) {
      downloadExcel().then();
    } else {
      displayPopup(
        "Invalid Form!",
        "Make sure you have filled all the required fields.",
        true,
      );
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
    const sheet1 = workbook.addWorksheet(
      GAME_THEORY_WORKBOOK.PROBLEM_INFO_SHEET_NAME,
    );
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
      const sheet2 = workbook.addWorksheet(
        GAME_THEORY_WORKBOOK.SPECIAL_PLAYER_SHEET_NAME,
      );
      sheet2.addRow(["Properties", "Weights"]);
    }

    // Write the sheet3 with sample data
    const sheet3 = workbook.addWorksheet(
      GAME_THEORY_WORKBOOK.NORMAL_PLAYER_SHEET_NAME,
    );
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
        "Failed to load gtguidelines.xlsx. Please check the file and try again.",
        true,
      );
    }

    // Save workbooks
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
              description="A positive number that reflects the number of players involved
              to ensure that the resulting Nash equilibrium is valid"
              guideSectionIndex={4}
            />
            <Input
              message="Number of properties each strategy of normal player"
              text="number"
              error={normalPlayerPropsNumError}
              handleOnChange={(e) => setNormalPlayerPropsNum(e.target.value)}
              value={normalPlayerPropsNum}
              description="A property is a characteristic or attribute that a player
              has that affects their actions or outcomes in the game"
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
              description="The fitness function is a mathematical function that
                represents the payoff that a player receives for a specific
                combination of strategies played by all the players in the game"
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
              description="The player payoff function is a mathematical function that determines
              the outcome of the game by assigning a payoff value to each player based on the
              strategies chosen by all the players in the game"
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

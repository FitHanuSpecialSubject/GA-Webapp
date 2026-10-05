import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { getBackendAddress } from "../../utils/http_utils";
import DataContext from "../../module/core/context/DataContext";
import PopupContext from "../../module/core/context/PopupContext";
import { validateExcelFile } from "../../utils/file_utils";
import {
  loadProblemInfoGT,
  loadNormalPlayers,
  loadProblemInfoSMT,
  loadDataset,
} from "../../utils/excel_utils";
import ExcelJS from "exceljs";
import {
  FaCircleCheck,
  FaTriangleExclamation,
  FaCirclePlay,
  FaUpload,
  FaKeyboard,
  FaCalculator,
  FaLayerGroup,
  FaBolt,
} from "react-icons/fa6";
import "./FunctionCheck.scss";

export default function FunctionTestingPage() {
  const { appData } = useContext(DataContext);
  const { displayPopup } = useContext(PopupContext);

  // Main Tabs: 'GT' | 'SM'
  const [activeTab, setActiveTab] = useState("GT");

  // ==========================================
  // GAME THEORY STATE
  // ==========================================
  const [gtMode, setGtMode] = useState("manual"); // 'manual' | 'dataset'
  const [gtPayoffManualInput, setGtPayoffManualInput] = useState(
    "5, 10, 15, 20, 25, 30, 35, 40, 45, 50",
  );
  const [gtPlayers, setGtPlayers] = useState([]);
  const [gtChosenStrategies, setGtChosenStrategies] = useState([]);
  const [gtDefaultPayoffFn, setGtDefaultPayoffFn] = useState("p1 * p2");
  const [gtFitnessFn, setGtFitnessFn] = useState("u1 + u10");
  const [gtIsMaximizing, setGtIsMaximizing] = useState(true);
  const [gtCatalog, setGtCatalog] = useState(null);
  const [gtResult, setGtResult] = useState(null);
  const [gtLoading, setGtLoading] = useState(false);
  const [activeInputTarget, setActiveInputTarget] = useState("gtFitness"); // for click-to-insert variable

  // ==========================================
  // STABLE MATCHING STATE
  // ==========================================
  const [smMode, setSmMode] = useState("manual"); // 'manual' | 'dataset'
  const [smSubTab, setSmSubTab] = useState("evaluate"); // 'evaluate' | 'fitness'

  // Evaluate function check state
  const [smEvalFn, setSmEvalFn] = useState("P1 * W1 + R1");
  const [smEvalManualVars, setSmEvalManualVars] = useState(
    JSON.stringify({ P1: 3, W1: 5, R1: 1 }),
  );
  const [smEvaluatorIdx, setSmEvaluatorIdx] = useState(0);
  const [smEvaluatedIdx, setSmEvaluatedIdx] = useState(1);
  const [smEvalResult, setSmEvalResult] = useState(null);

  // Fitness function check state
  const [smFitnessFn, setSmFitnessFn] = useState("M1 + M2 * M3");
  const [smFitnessManualSatisfactions, setSmFitnessManualSatisfactions] =
    useState("10, 20, 30, 40");
  const [smFitnessManualSets, setSmFitnessManualSets] = useState("0, 0, 1, 1");
  const [smPermutationInput, setSmPermutationInput] = useState("");
  const [smMatchingType, setSmMatchingType] = useState("MTM");
  const [smFitnessResult, setSmFitnessResult] = useState(null);
  const [smLoading, setSmLoading] = useState(false);

  // SMT loaded dataset
  const [smtProblemDto, setSmtProblemDto] = useState(null);

  // Initial load from DataContext if user already loaded problem
  useEffect(() => {
    if (appData?.problem) {
      if (appData.problem.players) {
        // Game theory
        setGtPlayers(appData.problem.players);
        setGtMode("dataset");
        setGtFitnessFn(appData.problem.fitnessFunction || "DEFAULT");
        setGtDefaultPayoffFn(appData.problem.playerPayoffFunction || "DEFAULT");
        setGtIsMaximizing(Boolean(appData.problem.isMaximizing));
        fetchGtCatalog(appData.problem.players);
      } else if (appData.problem.individualSetIndices) {
        // Stable matching
        const dto = {
          problemName: appData.problem.nameOfProblem || "Imported SMT Problem",
          numberOfSets: appData.problem.numberOfSets,
          numberOfProperty: appData.problem.characteristics?.length || 2,
          numberOfIndividuals: appData.problem.numberOfIndividuals,
          individualSetIndices: appData.problem.individualSetIndices,
          individualCapacities: appData.problem.individualCapacities,
          individualRequirements: appData.problem.individualRequirements,
          individualWeights: appData.problem.individualWeights,
          individualProperties: appData.problem.individualProperties,
          evaluateFunctions: appData.problem.evaluateFunctions,
          fitnessFunction: appData.problem.fitnessFunction,
          excludedPairs: appData.problem.excludePairs || [],
        };
        setSmtProblemDto(dto);
        setSmMode("dataset");
        fetchSmCatalog(dto);
      }
    } else {
      // Default sample catalog for GT
      fetchGtCatalog(null);
    }
  }, [appData]);

  // Insert variable into active input field
  const handleInsertVariable = (token) => {
    if (activeTab === "GT") {
      if (activeInputTarget === "gtPayoff") {
        setGtDefaultPayoffFn((prev) => (prev ? `${prev} + ${token}` : token));
      } else {
        setGtFitnessFn((prev) => (prev ? `${prev} + ${token}` : token));
      }
    } else {
      if (smSubTab === "evaluate") {
        setSmEvalFn((prev) => (prev ? `${prev} + ${token}` : token));
      } else {
        setSmFitnessFn((prev) => (prev ? `${prev} + ${token}` : token));
      }
    }
  };

  // ==========================================
  // GAME THEORY HANDLERS
  // ==========================================
  const fetchGtCatalog = async (players) => {
    try {
      const res = await axios.post(
        `${getBackendAddress()}/api/function-testing/gt/inputs`,
        players || [],
      );
      if (res.data?.data) {
        setGtCatalog(res.data.data);
      }
    } catch (err) {
      console.warn("Cannot fetch GT inputs catalog:", err);
    }
  };

  const handleGtExcelUpload = async (file) => {
    if (!validateExcelFile(file)) {
      displayPopup(
        "File Error",
        "Please select a valid Excel file (.xlsx, .xls)",
        true,
      );
      return;
    }
    const reader = new FileReader();
    reader.readAsArrayBuffer(file);
    reader.onload = async () => {
      try {
        const workbook = await new ExcelJS.Workbook().xlsx.load(reader.result);
        const problemInfo = await loadProblemInfoGT(workbook);
        const players = await loadNormalPlayers(
          workbook,
          problemInfo.normalPlayerNum,
          problemInfo.normalPlayerPropsNum,
        );
        setGtPlayers(players);
        setGtMode("dataset");
        setGtChosenStrategies(new Array(players.length).fill(0));
        setGtDefaultPayoffFn(problemInfo.playerPayoffFunction || "p1 * p2");
        setGtFitnessFn(problemInfo.fitnessFunction || "DEFAULT");
        setGtIsMaximizing(Boolean(problemInfo.isMaximizing));
        fetchGtCatalog(players);
        displayPopup(
          "Success",
          `Successfully loaded ${players.length} players from Excel file!`,
          false,
        );
      } catch (err) {
        console.error(err);
        displayPopup("Excel Read Error", err.message, true);
      }
    };
  };

  const loadGtPreset = (presetType) => {
    if (presetType === "10players") {
      setGtMode("manual");
      setGtPayoffManualInput("5, 1, 1, 1, 1, 1, 1, 1, 1, 20");
      setGtFitnessFn("u1 + u10");
      setGtIsMaximizing(true);
      setGtPlayers([]);
      fetchGtCatalog(null);
    } else if (presetType === "30players") {
      setGtMode("manual");
      const pArr = new Array(30).fill(1);
      pArr[0] = 5;
      pArr[2] = 5;
      pArr[9] = 20;
      pArr[29] = 30;
      setGtPayoffManualInput(pArr.join(", "));
      setGtFitnessFn("u1 + u30");
      setGtIsMaximizing(true);
      setGtPlayers([]);
      fetchGtCatalog(null);
    } else if (presetType === "3players") {
      setGtMode("manual");
      setGtPayoffManualInput("2, 3, 4");
      setGtFitnessFn("u1 + u2 * u3");
      setGtIsMaximizing(false);
      setGtPlayers([]);
      fetchGtCatalog(null);
    } else if (presetType === "relative") {
      const p1 = {
        name: "Player 1 (Buyer)",
        strategies: [
          { name: "Strategy 1", properties: [1.0, 2.0] },
          { name: "Strategy 2", properties: [3.0, 4.0] },
        ],
        payoffFunction: "p1 + P2p2",
      };
      const p2 = {
        name: "Player 2 (Supplier)",
        strategies: [
          { name: "Strategy 1", properties: [2.0, 5.0] },
          { name: "Strategy 2", properties: [1.0, 3.0] },
        ],
        payoffFunction: "p1 * p2",
      };
      setGtMode("dataset");
      setGtPlayers([p1, p2]);
      setGtChosenStrategies([0, 0]);
      setGtDefaultPayoffFn("p1 * p2");
      setGtFitnessFn("u1 + u2");
      setGtIsMaximizing(true);
      fetchGtCatalog([p1, p2]);
    }
  };

  const handleCheckGt = async () => {
    setGtLoading(true);
    setGtResult(null);
    try {
      const payload = {
        defaultPayoffFunction: gtDefaultPayoffFn,
        fitnessFunction: gtFitnessFn,
        maximizing: gtIsMaximizing,
      };

      if (gtMode === "dataset" && gtPlayers.length > 0) {
        payload.normalPlayers = gtPlayers;
        payload.chosenStrategyIndices =
          gtChosenStrategies.length === gtPlayers.length
            ? gtChosenStrategies
            : new Array(gtPlayers.length).fill(0);
      } else {
        const payoffs = gtPayoffManualInput
          .split(",")
          .map((v) => parseFloat(v.trim()))
          .filter((v) => !isNaN(v));
        if (payoffs.length === 0) {
          displayPopup(
            "Input Error",
            "Please provide a valid comma-separated list of payoffs!",
            true,
          );
          setGtLoading(false);
          return;
        }
        payload.payoffs = payoffs;
      }

      const res = await axios.post(
        `${getBackendAddress()}/api/function-testing/gt`,
        payload,
      );
      setGtResult(res.data?.data);
      setTimeout(() => {
        document
          .getElementById("gt-results-anchor")
          ?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    } catch (err) {
      console.error(err);
      const errMsg = err.response?.data?.message || err.message;
      displayPopup("Game Theory Test Error", errMsg, true);
    } finally {
      setGtLoading(false);
    }
  };

  // ==========================================
  // STABLE MATCHING HANDLERS
  // ==========================================
  const fetchSmCatalog = async (dto) => {
    try {
      const res = await axios.post(
        `${getBackendAddress()}/api/function-testing/sm/inputs`,
        dto,
      );
      if (res.data?.data) {
        // catalog
      }
    } catch (err) {
      console.warn("Cannot fetch SM inputs catalog:", err);
    }
  };

  const handleSmExcelUpload = async (file) => {
    if (!validateExcelFile(file)) {
      displayPopup(
        "File Error",
        "Please select a valid Excel file (.xlsx, .xls)",
        true,
      );
      return;
    }
    const reader = new FileReader();
    reader.readAsArrayBuffer(file);
    reader.onload = async () => {
      try {
        const workbook = await new ExcelJS.Workbook().xlsx.load(reader.result);
        const problemInfo = await loadProblemInfoSMT(workbook);
        const dataset = await loadDataset(
          workbook,
          problemInfo.characteristicNum,
          problemInfo.setNum,
        );
        const dto = {
          problemName: problemInfo.problemName,
          numberOfSets: problemInfo.setNum,
          numberOfProperty: problemInfo.characteristicNum,
          numberOfIndividuals: problemInfo.totalNumberOfIndividuals,
          individualSetIndices: dataset.individualSetIndices,
          individualCapacities: dataset.individualCapacities,
          individualProperties: dataset.individualProperties,
          individualRequirements: dataset.individualRequirements,
          individualWeights: dataset.individualWeights,
          evaluateFunctions: problemInfo.setEvaluateFunction || [
            "default",
            "default",
          ],
          fitnessFunction: problemInfo.fitnessFunction || "default",
          excludedPairs: [],
        };
        setSmtProblemDto(dto);
        setSmMode("dataset");
        fetchSmCatalog(dto);
        displayPopup(
          "Success",
          `Successfully loaded ${dto.numberOfIndividuals} individuals from Excel file!`,
          false,
        );
      } catch (err) {
        console.error(err);
        displayPopup("Excel Read Error", err.message, true);
      }
    };
  };

  const handleCheckSmEvaluate = async () => {
    setSmLoading(true);
    setSmEvalResult(null);
    try {
      const payload = { function: smEvalFn };
      if (smMode === "dataset" && smtProblemDto) {
        payload.problem = smtProblemDto;
        payload.evaluatorIndex = parseInt(smEvaluatorIdx, 10);
        payload.evaluatedIndex = parseInt(smEvaluatedIdx, 10);
      } else {
        try {
          payload.variables = JSON.parse(smEvalManualVars);
        } catch {
          displayPopup(
            "JSON Format Error",
            "Invalid JSON syntax for manual variables input!",
            true,
          );
          setSmLoading(false);
          return;
        }
      }
      const res = await axios.post(
        `${getBackendAddress()}/api/function-testing/sm/evaluate`,
        payload,
      );
      setSmEvalResult(res.data?.data);
      setTimeout(() => {
        document
          .getElementById("sm-eval-results-anchor")
          ?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    } catch (err) {
      console.error(err);
      const errMsg = err.response?.data?.message || err.message;
      displayPopup("Evaluate Function Test Error", errMsg, true);
    } finally {
      setSmLoading(false);
    }
  };

  const handleCheckSmFitness = async () => {
    setSmLoading(true);
    setSmFitnessResult(null);
    try {
      const payload = { function: smFitnessFn };
      if (smMode === "dataset" && smtProblemDto) {
        payload.problem = smtProblemDto;
        payload.matchingType = smMatchingType;
        if (smPermutationInput.trim()) {
          payload.permutation = smPermutationInput
            .split(",")
            .map((v) => parseInt(v.trim(), 10))
            .filter((v) => !isNaN(v));
        }
      } else {
        const satisfactions = smFitnessManualSatisfactions
          .split(",")
          .map((v) => parseFloat(v.trim()))
          .filter((v) => !isNaN(v));
        if (satisfactions.length === 0) {
          displayPopup(
            "Input Error",
            "Please provide a valid comma-separated list of satisfactions!",
            true,
          );
          setSmLoading(false);
          return;
        }
        payload.satisfactions = satisfactions;
        if (smFitnessManualSets.trim()) {
          payload.setIndices = smFitnessManualSets
            .split(",")
            .map((v) => parseInt(v.trim(), 10))
            .filter((v) => !isNaN(v));
        }
      }
      const res = await axios.post(
        `${getBackendAddress()}/api/function-testing/sm/fitness`,
        payload,
      );
      setSmFitnessResult(res.data?.data);
      setTimeout(() => {
        document
          .getElementById("sm-fitness-results-anchor")
          ?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    } catch (err) {
      console.error(err);
      const errMsg = err.response?.data?.message || err.message;
      displayPopup("Fitness Function Test Error", errMsg, true);
    } finally {
      setSmLoading(false);
    }
  };

  // Keyboard shortcut: Ctrl + Enter / Cmd + Enter
  useEffect(() => {
    const handleGlobalKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        if (activeTab === "GT") {
          handleCheckGt();
        } else {
          handleCheckSmFitness();
        }
      }
    };
    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, [
    activeTab,
    gtDefaultPayoffFn,
    gtFitnessFn,
    gtPayoffManualInput,
    gtPlayers,
    gtChosenStrategies,
    gtMode,
    gtIsMaximizing,
    smFitnessFn,
    smFitnessManualSatisfactions,
    smFitnessManualSets,
    smMode,
    smtProblemDto,
    smMatchingType,
    smPermutationInput,
  ]);

  const manualPlayerCount = gtPayoffManualInput
    .split(",")
    .map((v) => v.trim())
    .filter((v) => v !== "" && !isNaN(Number(v))).length;

  return (
    <div className="function-check-page">
      {/* Header Section */}
      <div className="header-section">
        <div className="title-group">
          <span className="badge-tag">Verification Tool</span>
          <h2>Function Testing</h2>
          <p>
            Verify mathematical syntax and compute Payoff, Satisfaction, and
            Fitness functions on custom inputs or datasets{" "}
            <b>prior to executing MOEA algorithms</b>.
          </p>
        </div>

        <div className="main-tabs">
          <button
            className={activeTab === "GT" ? "active" : ""}
            onClick={() => setActiveTab("GT")}
          >
            <FaCalculator /> Game Theory (GT)
          </button>
          <button
            className={activeTab === "SM" ? "active" : ""}
            onClick={() => setActiveTab("SM")}
          >
            <FaLayerGroup /> Stable Matching (SM)
          </button>
        </div>
      </div>

      {/* ========================================================== */}
      {/* TAB 1: GAME THEORY */}
      {/* ========================================================== */}
      {activeTab === "GT" && (
        <>
          {/* Card: Input Mode & Presets */}
          <div className="card-box">
            <div className="card-title">
              <span>Data Source & Input Points</span>
              <span className="badge-info">
                {gtMode === "dataset" ? "Excel Dataset" : "Manual Input"}
              </span>
            </div>

            <div className="mode-switch-bar">
              <button
                className={`mode-btn ${gtMode === "manual" ? "active" : ""}`}
                onClick={() => setGtMode("manual")}
              >
                <FaKeyboard /> Manual Input (Syntax & Math Test)
              </button>
              <button
                className={`mode-btn ${gtMode === "dataset" ? "active" : ""}`}
                onClick={() => setGtMode("dataset")}
              >
                <FaUpload /> From Excel File / Dataset
              </button>

              <div className="preset-group">
                <span className="preset-label">Quick Presets:</span>
                <button
                  className="preset-chip"
                  onClick={() => loadGtPreset("10players")}
                  title="10 Players preset: u1=5, u10=20"
                >
                  10 Players (u1 + u10)
                </button>
                <button
                  className="preset-chip"
                  onClick={() => loadGtPreset("30players")}
                  title="30 Players preset: u1=5, u30=30"
                >
                  30 Players (u1 + u30)
                </button>
                <button
                  className="preset-chip"
                  onClick={() => loadGtPreset("3players")}
                  title="3 Players: u1 + u2 * u3"
                >
                  3 Players (u1 + u2 * u3)
                </button>
                <button
                  className="preset-chip"
                  onClick={() => loadGtPreset("relative")}
                  title="2 Players with Relative Payoff: p1 + P2p2"
                >
                  Relative (p1 + P2p2)
                </button>
              </div>
            </div>

            {/* If Excel Mode: file upload */}
            {gtMode === "dataset" && (
              <div className="form-group-custom mt-2">
                <label>
                  <span>Upload Game Theory Excel File (.xlsx):</span>
                  {gtPlayers.length > 0 && (
                    <span className="hint text-success">
                      {gtPlayers.length} players loaded and ready!
                    </span>
                  )}
                </label>
                <input
                  type="file"
                  accept=".xlsx, .xls"
                  onChange={(e) => {
                    if (e.target.files?.[0]) {
                      handleGtExcelUpload(e.target.files[0]);
                    }
                  }}
                />
              </div>
            )}

            {/* If Manual Mode: payoffs input */}
            {gtMode === "manual" && (
              <div className="form-group-custom">
                <label>
                  <span>Player Payoffs List (u1, u2, u3...):</span>
                  <span className="hint">
                    Currently <b>{manualPlayerCount} players</b> (u1 → u
                    {manualPlayerCount || 1})
                  </span>
                </label>
                <input
                  type="text"
                  className="formula-input"
                  value={gtPayoffManualInput}
                  onChange={(e) => setGtPayoffManualInput(e.target.value)}
                  placeholder="5, 10, 15, 20..."
                />
              </div>
            )}

            {/* Variables catalog chips */}
            <div className="variables-catalog">
              <div className="catalog-header">
                <span>Available Variables & Functions (Click to insert)</span>
                <span style={{ fontSize: "11px", color: "#6b7280" }}>
                  Active target:{" "}
                  <b>
                    {activeInputTarget === "gtPayoff"
                      ? "Payoff Function"
                      : "Fitness Function"}
                  </b>
                </span>
              </div>

              <div className="chip-container">
                {gtCatalog?.fitnessVariables?.map((v) => (
                  <span
                    key={v.name}
                    className="var-chip"
                    onClick={() => handleInsertVariable(v.name)}
                    title={v.description}
                  >
                    <span>{v.name}</span>
                    <span className="chip-desc">({v.description})</span>
                  </span>
                ))}
                {gtCatalog?.payoffVariables?.map((v) => (
                  <span
                    key={v.name}
                    className="var-chip"
                    onClick={() => handleInsertVariable(v.name)}
                    title={v.description}
                  >
                    <span>{v.name}</span>
                    <span className="chip-desc">({v.description})</span>
                  </span>
                ))}
                {/* Default functions */}
                {gtCatalog?.defaultFunctions?.map((fn) => (
                  <span
                    key={fn}
                    className="func-chip"
                    onClick={() => handleInsertVariable(fn)}
                  >
                    {fn}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Card: Strategy profile & Formulations */}
          <div className="card-box">
            <div className="card-title">
              <span>Function Configuration & Strategy Profile</span>
              <button
                className="btn-quick-check"
                disabled={gtLoading}
                onClick={handleCheckGt}
                title="Run test via API (Ctrl + Enter)"
              >
                <FaBolt /> {gtLoading ? "Testing..." : "Run Test (API)"}
              </button>
            </div>

            {/* If dataset mode, choose strategy profile */}
            {gtMode === "dataset" && gtPlayers.length > 0 && (
              <div className="form-group-custom">
                <label>
                  <span>Select Strategy for each Player (Strategy Profile):</span>
                  <span className="hint">
                    Each player chooses 1 strategy to generate payoff vector
                  </span>
                </label>
                <div className="players-table-wrapper">
                  <table>
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Player</th>
                        <th>Selected Strategy</th>
                        <th>Strategy Properties (p1, p2...)</th>
                        <th>Payoff Function</th>
                      </tr>
                    </thead>
                    <tbody>
                      {gtPlayers.map((p, idx) => {
                        const chosenIdx = gtChosenStrategies[idx] || 0;
                        const chosenStrat = p.strategies?.[chosenIdx];
                        return (
                          <tr key={idx}>
                            <td>{idx + 1}</td>
                            <td>
                              <b>{p.name || `Player ${idx + 1}`}</b>
                            </td>
                            <td>
                              <select
                                value={chosenIdx}
                                onChange={(e) => {
                                  const next = [...gtChosenStrategies];
                                  next[idx] = parseInt(e.target.value, 10);
                                  setGtChosenStrategies(next);
                                }}
                              >
                                {p.strategies?.map((s, sIdx) => (
                                  <option key={sIdx} value={sIdx}>
                                    {s.name || `Strategy ${sIdx + 1}`}
                                  </option>
                                ))}
                              </select>
                            </td>
                            <td>
                              <code>
                                {JSON.stringify(chosenStrat?.properties || [])}
                              </code>
                            </td>
                            <td>
                              <span
                                style={{
                                  color: p.payoffFunction
                                    ? "#2563eb"
                                    : "#9ca3af",
                                }}
                              >
                                {p.payoffFunction || "(Use default)"}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Payoff function formula */}
            <div className="form-group-custom">
              <label>
                <span>Default Payoff Function (Strategy score evaluation):</span>
                <span className="hint">
                  Use variables p1, p2... or relative Pjpi
                </span>
              </label>
              <input
                type="text"
                className="formula-input"
                value={gtDefaultPayoffFn}
                onFocus={() => setActiveInputTarget("gtPayoff")}
                onChange={(e) => setGtDefaultPayoffFn(e.target.value)}
                placeholder="e.g. p1 * p2 or p1 + P2p1 or SUM"
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleCheckGt();
                }}
              />
            </div>

            {/* Fitness function formula */}
            <div className="form-group-custom">
              <label>
                <span>Fitness Function (Aggregated objective):</span>
                <span className="hint">
                  Use variables u1, u2... or aggregators: DEFAULT, AVERAGE, SUM...
                </span>
              </label>
              <input
                type="text"
                className="formula-input"
                value={gtFitnessFn}
                onFocus={() => setActiveInputTarget("gtFitness")}
                onChange={(e) => setGtFitnessFn(e.target.value)}
                placeholder="e.g. u1 + u10 or (u1 + u2) / 2 or AVERAGE"
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleCheckGt();
                }}
              />
            </div>

            <div className="d-flex align-items-center gap-2">
              <input
                type="checkbox"
                id="gtMaximizing"
                checked={gtIsMaximizing}
                onChange={(e) => setGtIsMaximizing(e.target.checked)}
              />
              <label
                htmlFor="gtMaximizing"
                className="m-0"
                style={{ cursor: "pointer", fontSize: "13px" }}
              >
                <b>isMaximizing (Objective maximization)</b> — Inverted to
                -fitness when passed to MOEA minimization solvers
              </label>
            </div>

            <div className="action-btn-row">
              <button
                className="btn-check btn-check-primary"
                disabled={gtLoading}
                onClick={handleCheckGt}
              >
                <FaBolt />{" "}
                {gtLoading
                  ? "Evaluating via API..."
                  : "VERIFY SYNTAX & EVALUATE (RUN TEST)"}
              </button>
              <span className="shortcut-tip">
                Shortcut: <kbd>Ctrl</kbd> + <kbd>Enter</kbd> (or <kbd>Cmd</kbd> +{" "}
                <kbd>Enter</kbd>)
              </span>
            </div>
          </div>

          {/* Results section */}
          {gtResult && (
            <div className="card-box results-section" id="gt-results-anchor">
              <div className="card-title">
                <span>Evaluation Results & Diagnostics</span>
              </div>

              {/* Error Alert Box when not success */}
              {!gtResult.fitness?.success && gtResult.fitness?.error && (
                <div className="error-alert-box">
                  <FaTriangleExclamation className="alert-icon" />
                  <div className="alert-content">
                    <div className="alert-title">
                      Evaluation Error: {gtResult.fitness.error}
                    </div>
                    {gtResult.fitness?.notes?.length > 0 && (
                      <ul className="alert-notes mt-2 mb-1 ps-3">
                        {gtResult.fitness.notes.map((note, idx) => (
                          <li key={idx}>
                            <b>Details:</b> {note}
                          </li>
                        ))}
                      </ul>
                    )}
                    <div className="alert-tip mt-2">
                      💡 <b>Hint:</b> The payoff array currently contains{" "}
                      <b>{gtResult.payoffs?.length} players</b> (variables{" "}
                      <code>u1</code> through{" "}
                      <code>u{gtResult.payoffs?.length}</code>). Ensure all variables
                      used in the formula are within range.
                    </div>
                  </div>
                </div>
              )}

              {/* Success Badge */}
              {gtResult.fitness?.success && (
                <div className="success-alert-box">
                  <FaCircleCheck /> Formula and syntax valid! Result computed
                  successfully.
                </div>
              )}

              {/* Metrics Grid */}
              <div className="metrics-grid">
                <div className="metric-card">
                  <span className="metric-label">Fitness Value (BE)</span>
                  <span
                    className={`metric-value ${
                      gtResult.fitness?.success ? "text-success" : "text-danger"
                    }`}
                  >
                    {gtResult.fitness?.value !== null &&
                    gtResult.fitness?.value !== undefined
                      ? gtResult.fitness.value
                      : "N/A"}
                  </span>
                  <span className="metric-sub">
                    Formula: {gtResult.fitness?.function}
                  </span>
                </div>

                <div className="metric-card">
                  <span className="metric-label">Reference Value</span>
                  <span className="metric-value text-success">
                    {gtResult.fitness?.referenceValue !== null &&
                    gtResult.fitness?.referenceValue !== undefined
                      ? gtResult.fitness.referenceValue
                      : "N/A"}
                  </span>
                  <span className="metric-sub">
                    Computed via native exp4j
                  </span>
                </div>

                <div className="metric-card">
                  <span className="metric-label">MOEA Objective Value</span>
                  <span className="metric-value">
                    {gtResult.objective !== null &&
                    gtResult.objective !== undefined
                      ? gtResult.objective
                      : "N/A"}
                  </span>
                  <span className="metric-sub">
                    {gtIsMaximizing ? "Inverted (-)" : "Unchanged"}
                  </span>
                </div>

                <div className="metric-card">
                  <span className="metric-label">Variables Extracted</span>
                  <span className="metric-value" style={{ fontSize: "14px" }}>
                    {gtResult.fitness?.requiredVariables?.join(", ") || "None"}
                  </span>
                  <span className="metric-sub">Mapped successfully</span>
                </div>
              </div>

              {/* Per Player Breakdown Table */}
              {gtResult.players?.length > 0 && (
                <div className="mt-3">
                  <div className="fw-bold mb-2" style={{ fontSize: "13px" }}>
                    Player Payoff Breakdown:
                  </div>
                  <div className="players-table-wrapper">
                    <table>
                      <thead>
                        <tr>
                          <th>Player</th>
                          <th>Strategy</th>
                          <th>Payoff Formula</th>
                          <th>Variables Used</th>
                          <th>Payoff Value (u)</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {gtResult.players.map((p, idx) => (
                          <tr key={idx}>
                            <td>
                              <b>Player {idx + 1}</b>
                            </td>
                            <td>
                              {p.details?.strategyName ||
                                `Strategy ${p.details?.chosenStrategyIndex + 1}`}
                            </td>
                            <td>
                              <code>{p.function}</code>
                            </td>
                            <td>
                              <code>
                                {JSON.stringify(p.variablesUsed || {})}
                              </code>
                            </td>
                            <td>
                              <b
                                className={
                                  p.success ? "text-success" : "text-danger"
                                }
                              >
                                {p.value !== null && p.value !== undefined
                                  ? p.value
                                  : "Error"}
                              </b>
                            </td>
                            <td>
                              {p.success ? (
                                <span className="text-success">✔ Valid</span>
                              ) : (
                                <span className="text-danger">✖ Failed</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* ========================================================== */}
      {/* TAB 2: STABLE MATCHING */}
      {/* ========================================================== */}
      {activeTab === "SM" && (
        <>
          {/* Card: SMT Source & Setup */}
          <div className="card-box">
            <div className="card-title">
              <span>Data Source & Problem Setup</span>
              <span className="badge-info">
                {smMode === "dataset" ? "SMT Dataset" : "Manual Simulation"}
              </span>
            </div>

            <div className="mode-switch-bar">
              <button
                className={`mode-btn ${smMode === "manual" ? "active" : ""}`}
                onClick={() => setSmMode("manual")}
              >
                <FaKeyboard /> Manual (Variable Simulation)
              </button>
              <button
                className={`mode-btn ${smMode === "dataset" ? "active" : ""}`}
                onClick={() => setSmMode("dataset")}
              >
                <FaUpload /> From SMT Excel Dataset
              </button>
            </div>

            {smMode === "dataset" && (
              <div className="form-group-custom mt-2">
                <label>
                  <span>Upload SMT Problem Excel File (.xlsx):</span>
                  {smtProblemDto && (
                    <span className="hint text-success">
                      Loaded {smtProblemDto.numberOfIndividuals} individuals (
                      {smtProblemDto.numberOfSets} sets)!
                    </span>
                  )}
                </label>
                <input
                  type="file"
                  accept=".xlsx, .xls"
                  onChange={(e) => {
                    if (e.target.files?.[0]) {
                      handleSmExcelUpload(e.target.files[0]);
                    }
                  }}
                />
              </div>
            )}
          </div>

          {/* Sub Navigation for SM: Evaluate vs Fitness */}
          <div
            className="d-flex gap-2 mb-3"
            style={{ borderBottom: "1px solid #e5e7eb", paddingBottom: "12px" }}
          >
            <button
              className={`mode-btn ${smSubTab === "evaluate" ? "active" : ""}`}
              onClick={() => setSmSubTab("evaluate")}
              style={{ padding: "8px 16px", borderRadius: "6px" }}
            >
              1. Test Evaluate Function (Satisfaction P, W, R)
            </button>
            <button
              className={`mode-btn ${smSubTab === "fitness" ? "active" : ""}`}
              onClick={() => setSmSubTab("fitness")}
              style={{ padding: "8px 16px", borderRadius: "6px" }}
            >
              2. Test Fitness Function (Matching & Aggregations)
            </button>
          </div>

          {/* SM SUBTAB 1: EVALUATE FUNCTION */}
          {smSubTab === "evaluate" && (
            <div className="card-box" id="sm-eval-results-anchor">
              <div className="card-title">
                <span>Evaluate Function Test (Individual Satisfaction)</span>
              </div>

              <div className="form-group-custom">
                <label>
                  <span>Evaluate Function Formula:</span>
                  <span className="hint">
                    Uses variables P1, W1, R1... (Property, Weight, Requirement)
                  </span>
                </label>
                <input
                  type="text"
                  className="formula-input"
                  value={smEvalFn}
                  onChange={(e) => setSmEvalFn(e.target.value)}
                  placeholder="P1 * W1 + R1"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleCheckSmEvaluate();
                  }}
                />
              </div>

              {smMode === "manual" ? (
                <div className="form-group-custom">
                  <label>
                    <span>Input Variables (JSON Format):</span>
                    <span className="hint">
                      Values for variables present in formula
                    </span>
                  </label>
                  <input
                    type="text"
                    className="formula-input font-monospace"
                    value={smEvalManualVars}
                    onChange={(e) => setSmEvalManualVars(e.target.value)}
                    placeholder='{"P1": 3, "W1": 5, "R1": 1}'
                  />
                </div>
              ) : (
                <div className="row g-3">
                  <div className="col-md-6">
                    <label
                      className="form-label"
                      style={{ fontSize: "12px", fontWeight: 600 }}
                    >
                      Evaluator Index (Evaluator):
                    </label>
                    <input
                      type="number"
                      className="form-control"
                      value={smEvaluatorIdx}
                      onChange={(e) => setSmEvaluatorIdx(e.target.value)}
                      min="0"
                    />
                  </div>
                  <div className="col-md-6">
                    <label
                      className="form-label"
                      style={{ fontSize: "12px", fontWeight: 600 }}
                    >
                      Evaluated Target Index (Evaluated):
                    </label>
                    <input
                      type="number"
                      className="form-control"
                      value={smEvaluatedIdx}
                      onChange={(e) => setSmEvaluatedIdx(e.target.value)}
                      min="0"
                    />
                  </div>
                </div>
              )}

              <button
                className="btn-check btn-check-primary mt-3"
                disabled={smLoading}
                onClick={handleCheckSmEvaluate}
              >
                <FaCirclePlay />{" "}
                {smLoading ? "Evaluating..." : "Test Evaluate Function"}
              </button>

              {smEvalResult && (
                <div className="results-section mt-3">
                  {smEvalResult.success ? (
                    <div className="success-alert-box">
                      <FaCircleCheck /> Formula syntax valid! Satisfaction score:{" "}
                      <b className="ms-2" style={{ fontSize: "16px" }}>
                        {smEvalResult.value}
                      </b>
                    </div>
                  ) : (
                    <div className="error-alert-box">
                      <FaTriangleExclamation className="alert-icon" />
                      <div className="alert-content">
                        <div className="alert-title">Evaluation Error</div>
                        <div className="alert-desc">{smEvalResult.error}</div>
                      </div>
                    </div>
                  )}

                  <div className="metrics-grid">
                    <div className="metric-card">
                      <span className="metric-label">Satisfaction Score</span>
                      <span className="metric-value text-success">
                        {smEvalResult.value ?? "N/A"}
                      </span>
                    </div>
                    <div className="metric-card">
                      <span className="metric-label">Variables Used</span>
                      <span
                        className="metric-value"
                        style={{ fontSize: "13px" }}
                      >
                        <code>
                          {JSON.stringify(smEvalResult.variablesUsed || {})}
                        </code>
                      </span>
                    </div>
                    <div className="metric-card">
                      <span className="metric-label">Syntax Status</span>
                      <span className="metric-value text-success">
                        {smEvalResult.syntaxValid ? "Valid" : "Invalid"}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* SM SUBTAB 2: FITNESS FUNCTION */}
          {smSubTab === "fitness" && (
            <div className="card-box" id="sm-fitness-results-anchor">
              <div className="card-title">
                <span>Fitness Function Test (Aggregated SMT Objective)</span>
              </div>

              <div className="form-group-custom">
                <label>
                  <span>Fitness Function Formula:</span>
                  <span className="hint">
                    Supports matching metrics: M1, M2... or SIGMA&#123;S1&#125;,
                    SIGMA&#123;S2&#125;...
                  </span>
                </label>
                <input
                  type="text"
                  className="formula-input"
                  value={smFitnessFn}
                  onChange={(e) => setSmFitnessFn(e.target.value)}
                  placeholder="M1 + M2 * M3 or SIGMA{S1} + SIGMA{S2}"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleCheckSmFitness();
                  }}
                />
              </div>

              {smMode === "manual" ? (
                <>
                  <div className="form-group-custom">
                    <label>
                      <span>Individual Satisfactions (SIGMA&#123;S1&#125;):</span>
                      <span className="hint">
                        Comma-separated scores for each individual
                      </span>
                    </label>
                    <input
                      type="text"
                      className="formula-input"
                      value={smFitnessManualSatisfactions}
                      onChange={(e) =>
                        setSmFitnessManualSatisfactions(e.target.value)
                      }
                      placeholder="10, 20, 30, 40"
                    />
                  </div>
                  <div className="form-group-custom">
                    <label>
                      <span>Individual Set Indices (0-indexed):</span>
                      <span className="hint">
                        Which set each individual belongs to (e.g. 0, 0, 1, 1)
                      </span>
                    </label>
                    <input
                      type="text"
                      className="formula-input"
                      value={smFitnessManualSets}
                      onChange={(e) => setSmFitnessManualSets(e.target.value)}
                      placeholder="0, 0, 1, 1"
                    />
                  </div>
                </>
              ) : (
                <div className="row g-3">
                  <div className="col-md-6">
                    <label
                      className="form-label"
                      style={{ fontSize: "12px", fontWeight: 600 }}
                    >
                      Matching Algorithm:
                    </label>
                    <select
                      className="form-select"
                      value={smMatchingType}
                      onChange={(e) => setSmMatchingType(e.target.value)}
                    >
                      <option value="MTM">Many-to-Many (MTM)</option>
                      <option value="OTM">One-to-Many (OTM)</option>
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label
                      className="form-label"
                      style={{ fontSize: "12px", fontWeight: 600 }}
                    >
                      Proposal Order (Permutation):
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Default: 0, 1, 2, ..."
                      value={smPermutationInput}
                      onChange={(e) => setSmPermutationInput(e.target.value)}
                    />
                  </div>
                </div>
              )}

              <button
                className="btn-check btn-check-primary mt-3"
                disabled={smLoading}
                onClick={handleCheckSmFitness}
              >
                <FaCirclePlay />{" "}
                {smLoading ? "Evaluating..." : "Test Fitness Function"}
              </button>

              {smFitnessResult && (
                <div className="results-section mt-3">
                  {smFitnessResult.success ? (
                    <div className="success-alert-box">
                      <FaCircleCheck /> Formula syntax valid! Fitness score:{" "}
                      <b className="ms-2" style={{ fontSize: "16px" }}>
                        {smFitnessResult.value}
                      </b>
                    </div>
                  ) : (
                    <div className="error-alert-box">
                      <FaTriangleExclamation className="alert-icon" />
                      <div className="alert-content">
                        <div className="alert-title">Evaluation Error</div>
                        <div className="alert-desc">
                          {smFitnessResult.error}
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="metrics-grid">
                    <div className="metric-card">
                      <span className="metric-label">Fitness Value</span>
                      <span className="metric-value text-success">
                        {smFitnessResult.value ?? "N/A"}
                      </span>
                    </div>
                    {smFitnessResult.details?.satisfactions && (
                      <div className="metric-card">
                        <span className="metric-label">
                          Computed Satisfactions
                        </span>
                        <span
                          className="metric-value"
                          style={{ fontSize: "13px" }}
                        >
                          <code>
                            {JSON.stringify(
                              smFitnessResult.details.satisfactions,
                            )}
                          </code>
                        </span>
                      </div>
                    )}
                    {smFitnessResult.details?.matches && (
                      <div className="metric-card">
                        <span className="metric-label">Matching Output</span>
                        <span
                          className="metric-value"
                          style={{ fontSize: "13px" }}
                        >
                          <code>
                            {JSON.stringify(smFitnessResult.details.matches)}
                          </code>
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* Sticky Bottom Action Bar */}
      <div className="sticky-bottom-action-bar">
        <div className="bar-left">
          <span className="pulse-indicator"></span>
          <div className="bar-details">
            <div className="bar-title">
              {activeTab === "GT"
                ? "Mode: Game Theory (GT)"
                : "Mode: Stable Matching (SM)"}
            </div>
            <div className="bar-desc">
              {activeTab === "GT" ? (
                <>
                  Payoff: <code>{gtDefaultPayoffFn || "p1*p2"}</code> | Fitness:{" "}
                  <code>{gtFitnessFn || "u1+u2"}</code>
                </>
              ) : (
                <>
                  Evaluate: <code>{smEvalFn || "default"}</code> | Fitness:{" "}
                  <code>{smFitnessFn || "default"}</code>
                </>
              )}
            </div>
          </div>
        </div>
        <div className="bar-right">
          <button
            className="btn-sticky-call"
            disabled={activeTab === "GT" ? gtLoading : smLoading}
            onClick={activeTab === "GT" ? handleCheckGt : handleCheckSmFitness}
          >
            <FaBolt />{" "}
            <span>
              {activeTab === "GT"
                ? gtLoading
                  ? "Calling Backend..."
                  : "RUN FUNCTION TEST"
                : smLoading
                  ? "Calling Backend..."
                  : "RUN FITNESS TEST"}
            </span>
            <span className="shortcut-badge">Ctrl + ↵</span>
          </button>
        </div>
      </div>
    </div>
  );
}

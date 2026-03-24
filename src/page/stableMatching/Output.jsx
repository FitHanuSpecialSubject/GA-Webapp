import React, { useEffect } from "react";
import "../../module/stableMatching/css/output.scss";
import "../../module/core/asset/css/solve-charts.scss";
import { useContext, useState } from "react";
import DataContext from "../../module/core/context/DataContext";
import { useNavigate } from "react-router-dom";
import NothingToShow from "../../module/core/component/NothingToShow";
import Loading from "../../module/core/component/Loading";
import Popup from "../../module/core/component/Popup";
import axios from "axios";
import ParamSettingBox from "../../module/core/component/ParamSettingBox";
import PopupContext from "../../module/core/context/PopupContext";
import SockJS from "sockjs-client";
import { v4 } from "uuid";
import { over } from "stompjs";
import { saveAs } from "file-saver";
import Table from "react-bootstrap/Table";
import Button from "react-bootstrap/Button";
import { getBackendAddress } from "../../utils/http_utils";
import {
  createSystemInfoSheet,
  createParameterConfigSheet,
} from "../../utils/excel_utils.js";
import ExcelJS from "exceljs";
import { RESULT_WORKBOOK } from "../../const/excel_const";
import { FaChartLine } from "react-icons/fa6";
import { SMT } from "../../consts.js";
import StableMatchingCharts from "../../module/core/component/SolveCharts/StableMatchingCharts";

let stompClient = null;

export default function MatchingOutputPage() {
  const navigate = useNavigate();
  const { appData, setAppData, setFavicon } = useContext(DataContext);
  const [isLoading, setIsLoading] = useState(false);
  const [isShowPopup, setIsShowPopup] = useState(false);
  const { displayPopup } = useContext(PopupContext);
  const [sessionCode] = useState(v4());
  const [loadingMessage, setLoadingMessage] = useState(
    "Processing to get problem insights, please wait...",
  );
  const [loadingEstimatedTime, setLoadingEstimatedTime] = useState(null);
  const [loadingPercentage, setLoadingPercentage] = useState();
  const [distributedCoreParam, setDistributedCoreParam] = useState("all");
  const [populationSizeParam, setPopulationSizeParam] = useState(1000);
  const [generationParam, setGenerationParam] = useState(100);
  const [maxTimeParam, setMaxTimeParam] = useState(5000);
  const [selectedSet, setSelectedSet] = useState("all");
  const [runCountParam, setRunCountParam] = useState(
    SMT.DEFAULT_RUN_COUNT_PARAM,
  );

  if (appData == null) {
    return <NothingToShow />;
  }

  useEffect(() => {
    setFavicon("success");
  }, [setFavicon]);
    if (appData == null) return <NothingToShow />;
  }, []);

  const problemType = appData.problemType ?? SMT.DEFAULT_PROBLEM_TYPE;
  const matchesArray = appData.result.data.matches.matches;
  const leftOversArray = appData.result.data.matches.leftOvers;
  const problemData = appData.problem;

  const handleSetFilterChange = (event) => setSelectedSet(event.target.value);

  const scroll = (pos) => {
    document.body.scrollTop = pos;
    document.documentElement.scrollTop = pos;
  };

  const handleExportToExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const sheet1 = workbook.addWorksheet(RESULT_WORKBOOK.SOLUTION_SHEET_NAME);
    sheet1.addRows([
      ["Fitness value", appData.result.data.fitnessValue],
      ["Used algorithm", appData.result.params.usedAlgorithm],
      ["Runtime (in seconds)", appData.result.data.runtime],
      ["Individual Name", "Individual Matches", "Satisfaction value"],
    ]);
    matchesArray.forEach((match, index) => {
      const individualName = problemData.individualNames[index];
      let individualMatches = "";
      if (Object.values(match).length !== 0) {
        for (let i = 0; i < Object.values(match).length; i++) {
          const name = problemData.individualNames[Object.values(match)[i]];
          individualMatches +=
            i === Object.values(match).length - 1 ? name : name + ", ";
        }
        sheet1.addRow([
          individualName,
          individualMatches,
          appData.result.data.setSatisfactions[index].toFixed(3),
        ]);
      }
    });
    createParameterConfigSheet(workbook, appData);
    createSystemInfoSheet(workbook, appData);
    const wbout = await workbook.xlsx.writeBuffer();
    const blob = new Blob([wbout], { type: "application/octet-stream" });
    saveAs(blob, appData.problem.nameOfProblem + "_Result.xlsx");
  };

  const handleGetMoreInsights = () => setIsShowPopup(true);

  const handlePopupOk = async () => {
    try {
      setFavicon("running");
      const evaluateFunctions = appData.problem.evaluateFunctions || [];
      setIsShowPopup(false);
      const body = {
        problemName: appData.problem.nameOfProblem,
        numberOfSets: appData.problem.numberOfSets,
        numberOfIndividuals: appData.problem.numberOfIndividuals,
        numberOfProperty: appData.problem.characteristics.length,
        individualSetIndices: appData.problem.individualSetIndices,
        individualCapacities: appData.problem.individualCapacities,
        individualProperties: appData.problem.individualProperties,
        individualRequirements: appData.problem.individualRequirements,
        individualWeights: appData.problem.individualWeights,
        fitnessFunction: appData.problem.fitnessFunction,
        evaluateFunctions,
        distributedCores: distributedCoreParam,
        populationSize: populationSizeParam,
        generation: generationParam,
        maxTime: maxTimeParam,
        runCountPerAlgorithm: runCountParam,
      };
      const serviceEndpoint = appData.problemType.insightEndpoint;
      const endpoint = `${getBackendAddress()}${serviceEndpoint}/${sessionCode}`;
      setIsLoading(true);
      await connectWebSocket();
      const res = await axios.post(endpoint, body);
      setIsLoading(false);
      setFavicon("success");
      const insights = {
        data: res.data.data,
        params: {
          distributedCoreParam,
          populationSizeParam,
          generationParam,
          maxTimeParam,
        },
      };
      setAppData({ ...appData, insights });
      closeWebSocketConnection();
      navigate("/insights");
    } catch (err) {
      console.error(err);
      setIsLoading(false);
      displayPopup(
        "Something went wrong!",
        "Get insights failed!, please contact the admin!",
        true,
      );
      setFavicon("error");
    }
  };

  const connectWebSocket = async () => {
    const Sock = new SockJS(`${getBackendAddress()}/ws`);
    stompClient = over(Sock);
    await stompClient.connect({}, onConnected, onError);
  };

  const onConnected = () => {
    stompClient.subscribe(
      "/session/" + sessionCode + "/progress",
      onPrivateMessage,
    );
  };

  const onError = (err) => console.error(err);

  const closeWebSocketConnection = () => {
    if (stompClient) stompClient.disconnect();
  };

  const onPrivateMessage = (payload) => {
    const payloadData = JSON.parse(payload.body);
    if (payloadData.inProgress) {
      setLoadingEstimatedTime(payloadData.minuteLeft);
      setLoadingPercentage(payloadData.percentage);
    }
    setLoadingMessage(payloadData.message);
  };

  const fitnessValue = appData.result.data.fitnessValue.toFixed(3);
  const usedAlgorithm = appData.result.data.algorithm;
  const runtime = appData.result.data.runtime.toFixed(3);
  const htmlOutput = [];
  const htmlLeftOvers = [];
  let fileContent = "";

  matchesArray.forEach((match, index) => {
    const individualSet = appData.problem.individualSetIndices?.[index] ?? 0;
    if (selectedSet !== "all" && individualSet !== Number(selectedSet) - 1)
      return;
    const individualName = problemData.individualNames?.[index] || "Unknown";
    let individualMatches = "";
    if (!match || Object.keys(match).length === 0) {
      individualMatches = "There are no individual matches";
    } else {
      Object.values(match).forEach((matchIndex, i, arr) => {
        const name = problemData.individualNames?.[matchIndex] || "Unknown";
        individualMatches += name + (i === arr.length - 1 ? "" : ", ");
      });
    }
    fileContent += `${individualName} -> ${individualMatches}\n`;
    htmlOutput.push(
      <tr className="table-success" key={`C${index + 1}`}>
        <td>{individualName}</td>
        <td>{individualMatches}</td>
        <td>
          {appData.result?.data?.setSatisfactions?.[index]?.toFixed(3) || 0}
        </td>
        <td>Set {individualSet + 1}</td>
      </tr>,
    );
  });

  const leftoverArray = [];
  leftOversArray.forEach((individual, index) => {
    htmlLeftOvers.push(
      <tr className="table-danger" key={"L" + index}>
        <td>{index + 1}</td>
        <td>{problemData.individualNames[individual]}</td>
        <td>Set {problemData.individualSetIndices[individual] + 1}</td>
      </tr>,
    );
    leftoverArray.push(problemData.individualNames[individual]);
  });

  fileContent += `Left over = [${leftoverArray}]`;
  fileContent += `Fitness value: ${appData.result.data.fitnessValue}`;
  fileContent += `Runtime: ${appData.result.data.runtime}`;

  return (
    <div className="matching-output-page">
      <div className="scrollPanel">
        <button className="autoscrollButton" onClick={() => scroll(0)}>
          &#11165;
        </button>
        <button
          className="autoscrollButton"
          onClick={() => scroll(document.body.scrollHeight)}
        >
          &#11167;
        </button>
      </div>
      <h2 id="head-title">MATCHING THEORY OUTPUT PAGE</h2>
      <Popup
        isShow={isShowPopup}
        setIsShow={setIsShowPopup}
        title={"Get detailed insights"}
        message={`This process can take a while do you to continue?`}
        okCallback={handlePopupOk}
      />
      <Loading
        isLoading={isLoading}
        percentage={loadingPercentage}
        estimatedTime={loadingEstimatedTime}
        message={loadingMessage}
      />
      <br />
      <p className="below-headertext">Solution</p>
      <div className="output-container">
        <div className="param-box">
          <ParamSettingBox
            distributedCoreParam={distributedCoreParam}
            setDistributedCoreParam={setDistributedCoreParam}
            generationParam={generationParam}
            setGenerationParam={setGenerationParam}
            populationSizeParam={populationSizeParam}
            setPopulationSizeParam={setPopulationSizeParam}
            maxTimeParam={maxTimeParam}
            setMaxTimeParam={setMaxTimeParam}
            runCountParam={runCountParam}
            setRunCountParam={setRunCountParam}
          />
          <div
            className="align-self-center btn btn-outline-primary d-flex flex-column align-items-center justify-content-center border-1 p-3"
            onClick={handleGetMoreInsights}
          >
            <div className="d-flex align-items-center justify-content-center gap-2">
              <FaChartLine className="me-0 fs-4" />
              <span>Insights & Analysis</span>
            </div>
            <div className="small text-muted mt-1 text-center">
              Generate comparison charts, convergence plots, stability metrics
            </div>
          </div>
        </div>
        <div className="result-information">
          <p>Problem Type: {problemType.displayName}</p>
          <p>Fitness Value: {fitnessValue}</p>
          <p>Used Algorithm: {usedAlgorithm}</p>
          <p>Runtime: {runtime} ms</p>
        </div>
      </div>

      <StableMatchingCharts
        result={appData.result?.data}
        problemName={appData.problem?.nameOfProblem || appData.problem?.name}
      />
      <div className="view-1" style={{ display: "block" }}>
        <div className="d-flex">
          <Button
            variant="success"
            size="md"
            style={{ justifyContent: "center", margin: "auto", width: 150 }}
            onClick={handleExportToExcel}
          >
            Export result
          </Button>
        </div>
        <h3 style={{ marginBottom: 20, marginTop: 40 }}>
          THE COUPLES AFTER GALE-SHAPLEY ALGORITHM
        </h3>
        <div className="filter-container">
          <label htmlFor="setFilter">Filter by set: </label>
          <select
            id="setFilter"
            value={selectedSet}
            onChange={handleSetFilterChange}
            style={{ marginLeft: 10, marginBottom: 20 }}
          >
            <option value="all">All</option>
            <option value="leftovers">LEFTOVERS</option>
            {Array.from({ length: appData.problem.numberOfSets }, (_, i) => (
              <option key={`set-${i + 1}`} value={i + 1}>
                Set {i + 1}
              </option>
            ))}
          </select>
        </div>
        <Table striped bordered hover responsive>
          <thead>
            <tr className="table-success">
              <th>First Partner</th>
              <th>Second Partner</th>
              <th>Couple fitness</th>
              <th>First Partner Set</th>
            </tr>
          </thead>
          <tbody>{htmlOutput}</tbody>
        </Table>
        <h3 style={{ marginBottom: 20, marginTop: 40, textAlign: "center" }}>
          THE LEFTOVERS AFTER GALE-SHAPLEY ALGORITHM
        </h3>
        <Table striped bordered hover responsive>
          <thead>
            <tr className="table-danger">
              <th>No.</th>
              <th>Name</th>
              <th>Set</th>
            </tr>
          </thead>
          <tbody>{htmlLeftOvers}</tbody>
        </Table>
      </div>
    </div>
  );
}
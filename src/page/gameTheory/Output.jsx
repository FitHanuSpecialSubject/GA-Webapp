import React, { useEffect } from "react";
import "../../module/gameTheory/css/output.scss";
import PlayerResult from "../../module/gameTheory/component/PlayerResult";
import { useContext, useState } from "react";
import DataContext from "../../module/core/context/DataContext";
import { useNavigate } from "react-router-dom";
import NothingToShow from "../../module/core/component/NothingToShow";
import Loading from "../../module/core/component/Loading";
import { saveAs } from "file-saver";
import Popup from "../../module/core/component/Popup";
import axios from "axios";
import ParamSettingBox from "../../module/core/component/ParamSettingBox";
import PopupContext from "../../module/core/context/PopupContext";
import {
  createSystemInfoSheet,
  createParameterConfigSheet,
} from "../../utils/excel_utils.js";

import SockJS from "sockjs-client";
import { v4 } from "uuid";
import { over } from "stompjs";
import ExcelJS from "exceljs";
import { RESULT_WORKBOOK } from "../../const/excel_const";
import { getBackendAddress } from "../../utils/http_utils";
import { FaChartLine, FaRegFileExcel } from "react-icons/fa6";
import Button from "react-bootstrap/Button";

let stompClient = null;
export default function OutputPage() {
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
  const [runCountParam, setRunCountParam] = useState(10);
  const [isExportPopup, setIsExportPopup] = useState(false);

  if (appData == null) {
    return <NothingToShow />;
  }
  useEffect(() => {
    setFavicon("success");
  }, []);

  const getTimestampFileName = () => {
    const now = new Date();
    return `game_theory_exp_${now.toISOString().replace(/[:.]/g, "-")}`;
  };

  const handleOpenDrive = () =>
    window.open(
      "https://drive.google.com/drive/folders/1eMQS3nBJeRLoyhQE18VF4jHWmdkzk2BE",
      "_blank",
    );

  const handleExportToExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    // write result data to sheet 1
    const sheet1 = workbook.addWorksheet(RESULT_WORKBOOK.SOLUTION_SHEET_NAME);
    sheet1.addRows([
      ["Fitness value", appData.result.data.fitnessValue],
      ["Used algorithm", appData.result.params.usedAlgorithm],
      ["Runtime (in seconds)", appData.result.data.runtime],
      ["Player name", "Choosen strategy name", "Payoff value"],
    ]);

    // append players data to sheet 1
    appData.result.data.players.forEach((player) => {
      const row = [player.playerName, player.strategyName, player.payoff];
      sheet1.addRow(row);
    });

    // write parameter configurations to sheet 2
    createParameterConfigSheet(workbook, appData);
    // write computer specs to sheet 3
    createSystemInfoSheet(workbook, appData);
    // write workbook to file
    const wbout = await workbook.xlsx.writeBuffer();
    const blob = new Blob([wbout], { type: "application/octet-stream" });
    saveAs(blob, appData.problem.name + "_Result.xlsx");
  };

  const exportJSON = () => {
    const parameterSet = {
      timestamp: new Date().toISOString(),
      problemName: appData.problem.name,
      parameters: { ...appData.problem },
      result: appData.result,
    };
    saveAs(
      new Blob([JSON.stringify(parameterSet, null, 2)], {
        type: "application/json",
      }),
      `${getTimestampFileName()}.json`,
    );
  };

  const exportCSV = () => {
    let csv = `Timestamp,${new Date().toISOString()}\nProblem Name,${
      appData.problem.name
    }\nAlgorithm,${appData.result.params.usedAlgorithm}\nFitness Value,${
      appData.result.data.fitnessValue
    }\n\nPlayer Name,Chosen Strategy,Payoff\n`;
    appData.result.data.players.forEach((player) => {
      csv += `"${player.playerName}","${player.strategyName}",${player.payoff}\n`;
    });
    saveAs(
      new Blob([csv], { type: "text/csv;charset=utf-8;" }),
      `${getTimestampFileName()}.csv`,
    );
  };

  const exportLatex = () => {
    let latex = `\\section*{Result: ${appData.problem.name}}\n\\begin{tabular}{|l|l|c|}\n\\hline\nPlayer Name & Strategy & Payoff \\\\\n\\hline\n`;
    appData.result.data.players.forEach((player) => {
      latex += `${player.playerName} & ${player.strategyName} & ${player.payoff} \\\\\n`;
    });
    latex += `\\hline\n\\end{tabular}`;
    saveAs(
      new Blob([latex], { type: "text/plain" }),
      `${getTimestampFileName()}.tex`,
    );
  };

  const handleGetMoreInsights = () => {
    setIsShowPopup(true);
  };

  const handlePopupOk = async () => {
    try {
      setFavicon("running");
      setIsShowPopup(false);
      const body = {
        specialPlayer: appData.problem.specialPlayer,
        normalPlayers: appData.problem.players,
        fitnessFunction: appData.problem.fitnessFunction,
        defaultPayoffFunction: appData.problem.playerPayoffFunction,
        conflictSet: appData.problem.conflictSet,
        distributedCores: distributedCoreParam,
        populationSize: populationSizeParam,
        generation: generationParam,
        maxTime: maxTimeParam,
        runCountPerAlgorithm: runCountParam,
      };

      setIsLoading(true);
      await connectWebSocket(); // connect to websocket to get the progress percentage
      const res = await axios.post(
        `${getBackendAddress()}/api/problem-result-insights/${sessionCode}`,
        body,
      );
      setIsLoading(false);

      const insights = {
        data: res.data.data,
        params: {
          distributedCoreParam: distributedCoreParam,
          populationSizeParam: populationSizeParam,
          generationParam: generationParam,
          maxTimeParam: maxTimeParam,
        },
      };
      setAppData({ ...appData, insights });
      closeWebSocketConnection();
      setFavicon("success");
      navigate("/insights"); // navigate to insights page
    } catch (err) {
      setFavicon("error");
      console.error(err);
      setIsLoading(false);
      displayPopup(
        "Something went wrong!",
        "Get insights failed!, please contact the admin!",
        true,
      );
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

  const onError = (err) => {
    console.error(err);
    // displayPopup("Something went wrong!", "Connect to server failed!, please contact the admin!", true)
  };

  const closeWebSocketConnection = () => {
    if (stompClient) {
      stompClient.disconnect();
    }
  };

  const onPrivateMessage = (payload) => {
    const payloadData = JSON.parse(payload.body);

    // some return data are to show the progress, some are not
    // if the data is to show the progress, then it will have the estimated time and percentage
    if (payloadData.inProgress) {
      setLoadingEstimatedTime(payloadData.minuteLeft);
      setLoadingPercentage(payloadData.percentage);
    }

    setLoadingMessage(payloadData.message);
  };

  return (
    <div className="output-page">
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
      <h1 className="problem-name">{appData.problem.name}</h1>
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
      </div>

      <div className="action-buttons-layout mt-4">
        <div className="d-flex justify-content-center mb-3">
          <Button
            variant="success"
            className="excel-full-btn d-flex align-items-center"
            onClick={handleExportToExcel}
            style={{ width: "300px", justifyContent: "center" }}
          >
            <FaRegFileExcel className="me-2 fs-5" />
            <span>Get Excel Template</span>
          </Button>
        </div>
        <div className="d-flex gap-3 justify-content-center">
          <Button
            variant="outline-primary"
            style={{ width: "180px" }}
            onClick={() => setIsExportPopup(true)}
          >
            Save Parameter Set
          </Button>
          <Button
            variant="outline-secondary"
            style={{ width: "180px" }}
            onClick={handleOpenDrive}
          >
            Open Google Drive
          </Button>
        </div>
      </div>

      <p className="below-headertext">
        {" "}
        Fitness value: {appData.result.data.fitnessValue}
      </p>
      <br />

      <div className="table-container">
        <div className="grid-container">
          <div className="column head-column">No</div>
          <div className="column head-column">Player Name</div>
          <div className="column head-column">Choosen strategy name</div>
          <div className="column head-column">Payoff value</div>
        </div>

        {appData.result.data.players?.map((player, index) => (
          <PlayerResult key={index} player={player} index={index + 1} />
        ))}
      </div>

      {isExportPopup && (
        <div
          className="export-modal"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1050,
          }}
        >
          <div
            className="export-popup"
            style={{
              backgroundColor: "white",
              padding: "25px",
              borderRadius: "10px",
              width: "320px",
              textAlign: "center",
            }}
          >
            <h5 className="mb-4">Choose export format</h5>
            <div className="d-flex flex-column gap-2">
              <Button
                onClick={() => {
                  exportJSON();
                  setIsExportPopup(false);
                }}
              >
                JSON
              </Button>
              <Button
                variant="info"
                className="text-white"
                onClick={() => {
                  exportCSV();
                  setIsExportPopup(false);
                }}
              >
                CSV
              </Button>
              <Button
                variant="dark"
                onClick={() => {
                  exportLatex();
                  setIsExportPopup(false);
                }}
              >
                LaTeX
              </Button>
              <Button
                variant="light"
                className="mt-2"
                onClick={() => setIsExportPopup(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

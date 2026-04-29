import React, { useEffect } from "react";
import "../../module/stableMatching/css/output.scss";
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
import { FaChartLine, FaRegFileExcel } from "react-icons/fa6";  
import { SMT } from "../../consts.js";

let stompClient = null;
const insightButtonClassName =
  "align-self-center btn btn-outline-primary d-flex flex-column " +
  "align-items-center justify-content-center border-1 p-3";

function getRequestedAlgorithm(appData) {
  return (
    appData?.result?.params?.requestedAlgorithm ||
    appData?.problem?.requestedAlgorithm ||
    appData?.problem?.inputAlgorithm ||
    appData?.result?.params?.usedAlgorithm ||
    appData?.result?.data?.algorithm
  );
}

export default function MatchingOutputPage() {
  const navigate = useNavigate();
  const { appData, setAppData, setFavicon } = useContext(DataContext);

  if (!appData || !appData.result) {
    return <NothingToShow />;
  }

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
  const [isExportPopup, setIsExportPopup] = useState(false);

  useEffect(() => {
    setFavicon("success");
  }, []);

  const problemType = appData.problemType ?? SMT.DEFAULT_PROBLEM_TYPE;
  const matchesArray = appData.result.data.matches.matches;
  const leftOversArray = appData.result.data.matches.leftOvers;
  const problemData = appData.problem;
  const handleSetFilterChange = (event) => {
    setSelectedSet(event.target.value); 
  };


  const scroll = (pos) => {
    document.body.scrollTop = pos; 
    document.documentElement.scrollTop = pos;
  };
  const getTimestampFileName = () => {
    const now = new Date();
    return `matching_exp_${now.toISOString().replace(/[:.]/g, "-")}`;
  };
  const handleOpenDrive = () => window.open("https://drive.google.com/drive/folders/1eMQS3nBJeRLoyhQE18VF4jHWmdkzk2BE", "_blank");

  const handleExportToExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const sheet1 = workbook.addWorksheet(RESULT_WORKBOOK.SOLUTION_SHEET_NAME);

    sheet1.addRows([
      ["Problem Name:", problemData.nameOfProblem],
      ["Fitness Value:", appData.result.data.fitnessValue.toFixed(3)],
      ["Used Algorithm:", appData.result.params.usedAlgorithm],
      ["Runtime:", `${appData.result.data.runtime.toFixed(3)} ms`],
      ["Exported At:", new Date().toLocaleString()],
      []
    ]);

    const headerRow = sheet1.addRow([
      "No",
      "First Partner",
      "Second Partner",
      "Couple Satisfaction",
      "Set Info"
    ]);

    headerRow.eachCell((cell) => {
      cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF2E75B6' }
      };
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
    });

    matchesArray.forEach((match, index) => {
      const p1Name = problemData.individualNames[index];
      let p2Names = "No match";
      const matchValues = Object.values(match);

      if (matchValues.length > 0) {
        p2Names = matchValues
          .map(mIdx => problemData.individualNames[mIdx])
          .join(", ");
      }

      const satisfaction = appData.result.data.setSatisfactions[index] || 0;
      const setIdx = (problemData.individualSetIndices?.[index] ?? 0) + 1;

      sheet1.addRow([
        index + 1,
        p1Name,
        p2Names,
        satisfaction.toFixed(3),
        `Set ${setIdx}`
      ]);
    });

    sheet1.columns.forEach((column) => {
      let maxColumnLength = 0;
      column.eachCell({ includeEmpty: true }, (cell) => {
        const length = cell.value ? cell.value.toString().length : 10;
        if (length > maxColumnLength) maxColumnLength = length;
      });
      column.width = maxColumnLength < 12 ? 12 : maxColumnLength + 5;
    });

    // write parameter configurations to sheet 2
    createParameterConfigSheet(workbook, appData);
    // write computer specs to sheet 3
    createSystemInfoSheet(workbook, appData);
    // write workbook to file
    const wbout = await workbook.xlsx.writeBuffer();
    const blob = new Blob([wbout], { type: "application/octet-stream" });
    saveAs(blob, appData.problem.nameOfProblem + "_Result.xlsx");
  };

  const exportJSON = () => {
    const parameterSet = {
      timestamp: new Date().toISOString(),
      problemName: appData.problem.nameOfProblem,
      parameters: { ...appData.problem },
      result: appData.result,
    };
    saveAs(new Blob([JSON.stringify(parameterSet, null, 2)], { type: "application/json" }), `${getTimestampFileName()}.json`);
  };

  const exportCSV = () => {
    let csv = `Timestamp,${new Date().toISOString()}\nProblem Name,${appData.problem.nameOfProblem}\nAlgorithm,${appData.result.data.algorithm}\nFitness Value,${appData.result.data.fitnessValue}\n\nPartner 1,Partner 2,Satisfaction,Set\n`;
    matchesArray.forEach((match, index) => {
      const p1 = problemData.individualNames[index];
      const p2 = Object.values(match).map(mIdx => problemData.individualNames[mIdx]).join("; ");
      const sat = appData.result.data.setSatisfactions[index].toFixed(3);
      const setIdx = (problemData.individualSetIndices?.[index] ?? 0) + 1;
      csv += `"${p1}","${p2}",${sat},Set ${setIdx}\n`;
    });
    saveAs(new Blob([csv], { type: "text/csv;charset=utf-8;" }), `${getTimestampFileName()}.csv`);
  };

  const exportLatex = () => {
    let latex = `\\section*{Result: ${problemData.nameOfProblem}}\n\\begin{tabular}{|l|l|c|c|}\n\\hline\nPartner 1 & Partner 2 & Sat & Set \\\\\n\\hline\n`;
    matchesArray.forEach((match, index) => {
      const p1 = problemData.individualNames[index];
      const p2 = Object.values(match).map(mIdx => problemData.individualNames[mIdx]).join(", ");
      const sat = appData.result.data.setSatisfactions[index].toFixed(3);
      const setIdx = (problemData.individualSetIndices?.[index] ?? 0) + 1;
      latex += `${p1} & ${p2} & ${sat} & Set ${setIdx} \\\\\n`;
    });
    latex += `\\hline\n\\end{tabular}`;
    saveAs(new Blob([latex], { type: "text/plain" }), `${getTimestampFileName()}.tex`);
  };
  const handleGetMoreInsights = () => {
    setIsShowPopup(true);
  };

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
        evaluateFunctions: evaluateFunctions,
        algorithm: getRequestedAlgorithm(appData),

        distributedCores: distributedCoreParam,
        populationSize: populationSizeParam,
        generation: generationParam,
        maxTime: maxTimeParam,
        runCountPerAlgorithm: runCountParam,
      };

      const problemType = appData.problemType;
      const serviceEndpoint = problemType.insightEndpoint;
      const endpoint = `${getBackendAddress()}${serviceEndpoint}/${sessionCode}`;

      setIsLoading(true);
      await connectWebSocket();
      const res = await axios.post(endpoint, body);
      setIsLoading(false);
      setFavicon("success");
      const insights = {
        data: res.data.data,
        params: {
          distributedCoreParam: distributedCoreParam,
          populationSizeParam: populationSizeParam,
          generationParam: generationParam,
          maxTimeParam: maxTimeParam,
          algorithm: getRequestedAlgorithm(appData),
          inputAlgorithm: appData?.problem?.inputAlgorithm,
        },
      };
      setAppData({ ...appData, insights });
      closeWebSocketConnection();
      navigate("/insights"); // navigate to insights page
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

  // Get data from sever

  const fitnessValue = appData.result.data.fitnessValue.toFixed(3);
  const requestedAlgorithm = getRequestedAlgorithm(appData);
  const usedAlgorithm = appData.result.data.algorithm;
  const runtime = appData.result.data.runtime.toFixed(3);
  const htmlOutput = [];
  const htmlLeftOvers = [];
  // Loop through result

  let fileContent = "";

  // Success couple
  matchesArray.forEach((match, index) => {
    // Lấy individualSet từ individualSetIndices (mặc định là 0 nếu không có)
    const individualSet = appData.problem.individualSetIndices?.[index] ?? 0;

    // Kiểm tra nếu set đã chọn không phải là "all" và không khớp với individualSet
    if (selectedSet !== "all" && individualSet !== Number(selectedSet) - 1) {
      return; // Bỏ qua phần tử không thuộc set đã chọn
    }

    const individualName = problemData.individualNames?.[index] || "Unknown";

    let individualMatches = "";

    // Kiểm tra nếu match tồn tại và có giá trị
    if (!match || Object.keys(match).length === 0) {
      individualMatches = "There are no individual matches";
    } else {
      Object.values(match).forEach((matchIndex, i, arr) => {
        // Lấy tên cá nhân từ individualNames
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
        <td>Set {individualSet + 1}</td> {/* Hiển thị set đúng như "Set 1" */}
      </tr>,
    );
  });

  // LeftOves
  const leftoverArray = [];
  leftOversArray.forEach((individual, index) => {
    htmlLeftOvers.push(
      <tr className="table-danger" key={"L" + index}>
        <td>{index + 1}</td>
        <td>{problemData.individualNames[individual]}</td>
        <td>Set {problemData.individualSetIndices[individual] + 1}</td>{" "}
        {/* Hiển thị set */}
      </tr>,
    );
    leftoverArray.push(problemData.individualNames[individual]);
  });
  fileContent += `Left over = [${leftoverArray}]`;

  fileContent += `Fitness value: ${appData.result.data.fitnessValue}`;
  fileContent += `Runtime: ${appData.result.data.runtime}`;
  // Create a Blob with the content
  const blob = new Blob([fileContent], { type: "text/plain" });

  // Define your state variables here
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
            className={insightButtonClassName}
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

        <div className="d-flex align-items-center justify-content-center"></div>
        <div className="result-information">
          <p>Problem Type: {problemType.displayName}</p>
          <p>Fitness Value: {fitnessValue}</p>
          <p>Requested Algorithm: {requestedAlgorithm}</p>
          <p>Used Algorithm: {usedAlgorithm}</p>
          <p>Runtime: {runtime} ms</p>
        </div>
      </div>
      <div className="action-buttons-layout mt-4">
        <div className="d-flex justify-content-center mb-3">
          <Button variant="success" className="excel-full-btn d-flex align-items-center" onClick={handleExportToExcel} style={{ width: "300px", justifyContent: "center" }}>
            <FaRegFileExcel className="me-2 fs-5" />
            <span>Get Excel Template</span>
          </Button>
        </div>
        <div className="d-flex gap-3 justify-content-center">
          <Button variant="outline-primary" style={{ width: "180px" }} onClick={() => setIsExportPopup(true)}>
            Save Parameter Set
          </Button>
          <Button variant="outline-secondary" style={{ width: "180px" }} onClick={handleOpenDrive}>
            Open Google Drive
          </Button>
        </div>
      </div>

      <h3 style={{ marginBottom: 20, marginTop: 40 }}>
        THE COUPLES AFTER GALE-SHAPLEY ALGORITHM s
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
            {/* <th>#</th> */}
            <th>First Partner</th>
            <th>Second Partner</th>
            <th>Couple fitness</th>
            <th>First Partner Set</th>
            {/* Thêm cột mới */}
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
      {/* {console.log(appData.result.data.individuals)} */}

      {isExportPopup && (
        <div className="export-modal" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1050 }}>
          <div className="export-popup" style={{ backgroundColor: 'white', padding: '25px', borderRadius: '10px', width: '320px', textAlign: 'center' }}>
            <h5 className="mb-4">Choose export format</h5>
            <div className="d-flex flex-column gap-2">
              <Button onClick={() => { exportJSON(); setIsExportPopup(false); }}>JSON</Button>
              <Button variant="info" className="text-white" onClick={() => { exportCSV(); setIsExportPopup(false); }}>CSV</Button>
              <Button variant="dark" onClick={() => { exportLatex(); setIsExportPopup(false); }}>LaTeX</Button>
              <Button variant="light" className="mt-2" onClick={() => setIsExportPopup(false)}>Cancel</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

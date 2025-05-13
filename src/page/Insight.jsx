import React, { useContext, useState } from "react";
import "../module/core/asset/css/insight.scss";
import NothingToShow from "../module/core/component/NothingToShow";
import { Chart, registerables } from "chart.js";
import DataContext from "../module/core/context/DataContext";
import { saveAs } from "file-saver";
import { exportInsights } from "../utils/excel_utils";
import InsightsGraph from "../module/core/component/InsightsGraph";
import InsightsTable from "../module/core/component/InsightsTable";
import RuntimeGraphSelector, { GRAPH_TYPES } from "../module/core/component/RuntimeGraphSelector";
import { FaRegFileExcel } from "react-icons/fa6";

export default function InsightPage() {
  const { appData } = useContext(DataContext);
  const [selectedGraphType, setSelectedGraphType] = useState('horizontal-bar'); // Default to horizontal bar chart

  Chart.register(...registerables);

  const handleExportToExcel = async () => {
    const blob = await exportInsights(
      appData.insights.data.fitnessValues,
      appData.insights.data.runtimes,
      appData.insights.data.computerSpecs,
      appData.insights.params,
    );
    saveAs(blob, "insights.xlsx");
  };

  if (!appData || !appData.problem || !appData.insights) {
    return <NothingToShow />;
  }

  // Determine problem name
  const isProblemStableMatching = appData.problem.type === "stableMatching";
  const problemTitle = isProblemStableMatching ? "Stable Matching" : "Game Theory";

  return (
    <div className="insight-page">
      <div className="text-center small px-5">
        {appData.problem.nameOfProblem}
      </div>
      <div className="fs-1 fw-bold">Insights</div>
      <div
        className="btn btn-success d-flex align-self-center justify-content-center border-1 p-3"
        onClick={handleExportToExcel}
      >
        <FaRegFileExcel className="me-0 fs-4" />
        Export Result
      </div>
      <div className="fitness-table">
        <InsightsTable fitnessValues={appData.insights.data.fitnessValues} />
        <p className="figure-description">
          Comparison of Fitness Values across different algorithms
        </p>
      </div>
      <div className="d-flex justify-content-center align-items-center my-3">
        <div className="graph-selector p-2">
          <span className="me-3">Graph type:</span>
          <select
            className="form-select"
            value={selectedGraphType}
            onChange={(e) => setSelectedGraphType(e.target.value)}
            style={{ width: "auto", minWidth: "220px" }}
          >
            {GRAPH_TYPES.map(graph => (
              <option key={graph.id} value={graph.id}>
                {graph.name}
              </option>
            ))}
          </select>
        </div>
      </div>
      {/* Runtime graph with selector */}
      <div className="runtime-graph">
        <RuntimeGraphSelector
          graphType={selectedGraphType}
          data={appData.insights.data.runtimes}
          title={`${problemTitle} - Runtime Comparison`}
        />
        <p className="figure-description">
          Comparison of runtime (in seconds) across various algorithms
        </p>
      </div>
    </div>
  );
}

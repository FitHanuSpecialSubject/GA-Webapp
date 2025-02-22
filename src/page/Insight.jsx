import React, { useContext } from "react";
import "../module/core/asset/css/insight.scss";
import NothingToShow from "../module/core/component/NothingToShow";
import { Chart, registerables } from "chart.js";
import DataContext from "../module/core/context/DataContext";
import { saveAs } from "file-saver";
import { exportInsights } from "../utils/excel_utils";
import InsightsGraph from "../module/core/component/InsightsGraph";
import InsightsTable from "../module/core/component/InsightsTable";
import { FaRegFileExcel } from "react-icons/fa6";

export default function InsightPage() {
  const { appData } = useContext(DataContext);

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
        Get Excel Template
      </div>
      <div className="fitness-table">
        <InsightsTable fitnessValues={appData.insights.data.fitnessValues} />
        <p className="figure-description">
          Comparison of Fitness Values across different algorithms
        </p>
      </div>
      <div className="runtime-graph">
        <InsightsGraph runtimes={appData.insights.data.runtimes} />
        <p className="figure-description">
          Comparison of runtime (in seconds) across various algorithms
        </p>
      </div>
    </div>
  );
}

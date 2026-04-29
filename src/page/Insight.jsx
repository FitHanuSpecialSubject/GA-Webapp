import React, { useContext } from "react";
import "../module/core/asset/css/insight.scss";
import NothingToShow from "../module/core/component/NothingToShow";
import { Chart, registerables } from "chart.js";
import DataContext from "../module/core/context/DataContext";
import { saveAs } from "file-saver";
import { exportInsights } from "../utils/excel_utils";
import InsightsTable from "../module/core/component/InsightsTable";
import { FaRegFileExcel } from "react-icons/fa6";
import RuntimeGraphSelector from "../module/core/component/RuntimeGraphSelector";
import ResultSummaryTable from "../module/core/component/ResultSummaryTable";

const MOEAD_ALGORITHM = "MOEAD";

function isMoeadSelected(selectedAlgorithm) {
  return (
    selectedAlgorithm
      ?.toString()
      .replace(/[^a-z0-9]/gi, "")
      .toUpperCase() === MOEAD_ALGORITHM
  );
}

function filterMoeadInsightData(data, selectedAlgorithm) {
  if (isMoeadSelected(selectedAlgorithm)) {
    return data;
  }

  const withoutMoead = (values = {}) =>
    Object.fromEntries(
      Object.entries(values).filter(([name]) => name !== MOEAD_ALGORITHM),
    );

  return {
    ...data,
    fitnessValues: withoutMoead(data?.fitnessValues),
    runtimes: withoutMoead(data?.runtimes),
  };
}

export default function InsightPage() {
  const { appData } = useContext(DataContext);

  Chart.register(...registerables);

  const handleExportToExcel = async () => {
    const selectedAlgorithm =
      appData?.insights?.params?.algorithm ||
      appData?.result?.params?.requestedAlgorithm ||
      appData?.problem?.requestedAlgorithm ||
      appData?.insights?.params?.inputAlgorithm ||
      appData?.problem?.inputAlgorithm ||
      appData?.result?.params?.usedAlgorithm ||
      appData?.result?.data?.algorithm;
    const visibleInsightData = filterMoeadInsightData(
      appData.insights.data,
      selectedAlgorithm,
    );
    const blob = await exportInsights(
      visibleInsightData.fitnessValues,
      visibleInsightData.runtimes,
      visibleInsightData.computerSpecs,
      appData.insights.params,
    );
    saveAs(blob, "insights.xlsx");
  };

  if (!appData || !appData.problem || !appData.insights) {
    return <NothingToShow />;
  }

  const gameTheoryResults =
    appData?.insights?.data?.gameTheoryResults ?? appData?.gameTheoryResults;
  const stabilityReference =
    appData?.insights?.data?.stabilityReference ?? appData?.stabilityReference;

  const isStableMatching = !!appData.problemType;
  const selectedAlgorithm =
    appData?.insights?.params?.algorithm ||
    appData?.result?.params?.requestedAlgorithm ||
    appData?.problem?.requestedAlgorithm ||
    appData?.insights?.params?.inputAlgorithm ||
    appData?.problem?.inputAlgorithm ||
    appData?.result?.params?.usedAlgorithm ||
    appData?.result?.data?.algorithm;
  const visibleInsightData = filterMoeadInsightData(
    appData.insights.data,
    selectedAlgorithm,
  );
  const hasVisibleInsightData =
    Object.keys(visibleInsightData?.fitnessValues || {}).length > 0;
  const requestedMoead = isMoeadSelected(selectedAlgorithm);
  const responseHasMoead = Boolean(
    appData?.insights?.data?.fitnessValues?.[MOEAD_ALGORITHM],
  );

  return (
    <div className="insight-page">
      <div className="text-center small px-5">
        {appData.problem.nameOfProblem}
      </div>
      <div className="fs-1 fw-bold">Insights</div>
      {selectedAlgorithm && (
        <div className="small text-muted mb-3">
          Requested algorithm: {selectedAlgorithm}
        </div>
      )}
      {requestedMoead && !responseHasMoead && (
        <div className="moead-missing-warning">
          Input requested MOEAD, but this insights response does not include
          MOEAD data. Please regenerate insights after the backend has restarted.
        </div>
      )}
      <div
        className="btn btn-success d-flex align-self-center justify-content-center border-1 p-3"
        onClick={handleExportToExcel}
      >
        <FaRegFileExcel className="me-0 fs-4" />
        Export Result
      </div>

      <div className="result-summary-table">
        {isStableMatching ? (
          <ResultSummaryTable
            mode="stableMatching"
            stabilityReference={stabilityReference}
          />
        ) : (
          <ResultSummaryTable
            mode="gameTheory"
            gameTheoryResults={gameTheoryResults}
          />
        )}
      </div>
      <div className="fitness-table">
        <InsightsTable
          fitnessValues={visibleInsightData.fitnessValues}
          selectedAlgorithm={selectedAlgorithm}
        />
      </div>
      {hasVisibleInsightData && (
        <div className="runtime-graph">
          <RuntimeGraphSelector data={visibleInsightData} />
        </div>
      )}
    </div>
  );
}

import React, { useState } from "react";
import PropTypes from "prop-types";

const RANK_COLORS = {
  6: { bg: "#c8ead3", label: "Rank 6", labelBg: "#159447" },
  5: { bg: "#d4edda", label: "Rank 5", labelBg: "#28a745" },
  4: { bg: "#e8f5e9", label: "Rank 4", labelBg: "#66bb6a" },
  3: { bg: "#fff9c4", label: "Rank 3", labelBg: "#fdd835" },
  2: { bg: "#ffe0b2", label: "Rank 2", labelBg: "#ffa726" },
  1: { bg: "#f8d7da", label: "Rank 1", labelBg: "#e57373" },
};

const MOEAD_ALGORITHM = "MOEAD";
const DEFAULT_INSIGHT_ALGORITHMS = ["eMOEA", "VEGA", "NSGAII", "NSGAIII", "PESA2"];

function isMoeadSelected(selectedAlgorithm) {
  return (
    selectedAlgorithm
      ?.toString()
      .replace(/[^a-z0-9]/gi, "")
      .toUpperCase() === MOEAD_ALGORITHM
  );
}

function getRankColor(rank, totalAlgorithms) {
  if (totalAlgorithms <= 1) return RANK_COLORS[1];
  const cappedRank = Math.max(1, Math.min(rank, 6));
  return RANK_COLORS[cappedRank] || RANK_COLORS[3];
}

export default function InsightsTable({ fitnessValues, selectedAlgorithm }) {
  const shouldShowMoead = isMoeadSelected(selectedAlgorithm);
  const availableAlgorithms = new Set(Object.keys(fitnessValues || {}));
  const algorithms = DEFAULT_INSIGHT_ALGORITHMS.filter((name) =>
    availableAlgorithms.has(name),
  );

  if (shouldShowMoead && availableAlgorithms.has(MOEAD_ALGORITHM)) {
    algorithms.splice(3, 0, MOEAD_ALGORITHM);
  }

  const [selectedAlgo, setSelectedAlgo] = useState(null);

  if (algorithms.length === 0) {
    return (
      <div className="insights-table-wrapper insights-table-wrapper--empty">
        No insight data is available for the selected algorithm set.
      </div>
    );
  }

  // Calculate averages
  const averages = {};
  algorithms.forEach((name) => {
    const values = fitnessValues[name];
    averages[name] = values.reduce((sum, v) => sum + v, 0) / values.length;
  });

  // Rank algorithms (lower average = better = higher rank number)
  const sorted = [...algorithms].sort((a, b) => averages[a] - averages[b]);
  const ranks = {};
  sorted.forEach((name, i) => {
    ranks[name] = algorithms.length - i; // best gets highest rank
  });

  const bestAlgo = sorted[0];
  const worstAlgo = sorted[sorted.length - 1];

  // Auto-select best algorithm initially
  const effectiveSelected = selectedAlgo || bestAlgo;

  const numIterations = Math.max(
    ...algorithms.map((name) => fitnessValues[name]?.length || 0),
  );
  const hasMoeadColumn = algorithms.includes(MOEAD_ALGORITHM);
  const tableClassName = hasMoeadColumn
    ? "insights-ranked-table insights-ranked-table--with-moead"
    : "insights-ranked-table";

  // Find max value per column (algorithm)
  const maxPerColumn = {};
  algorithms.forEach((name) => {
    maxPerColumn[name] = Math.max(...fitnessValues[name]);
  });

  return (
    <div className="insights-table-wrapper">
      {/* Performance Ranking Scale Legend */}
      <div className="ranking-legend">
        <div className="ranking-legend-title">Performance Ranking Scale</div>
        <div className="ranking-legend-items">
          {Array.from({ length: algorithms.length }, (_, i) => algorithms.length - i).map((rank, i) => (
            <React.Fragment key={rank}>
              <span
                className="ranking-legend-color"
                style={{ background: RANK_COLORS[rank].bg }}
              />
              <span className="ranking-legend-label">
                {rank === algorithms.length
                  ? `Rank ${rank} (Best)`
                  : rank === 1
                    ? "Rank 1 (Worst)"
                    : `Rank ${rank}`}
              </span>
              {i < algorithms.length - 1 && (
                <span className="ranking-legend-arrow">→</span>
              )}
            </React.Fragment>
          ))}
        </div>
        <div className="ranking-legend-note">
          * Highest values in each column are marked in bold red
        </div>
      </div>

      {/* Table */}
      {hasMoeadColumn && (
        <div className="moead-insight-note">
          MOEAD is included because the selected input algorithm is MOEAD.
        </div>
      )}
      <div className="insights-table-scroll" data-columns={algorithms.length}>
        <table className={tableClassName}>
          <thead>
            <tr>
              <th className="iter-col">Iteration</th>
              {algorithms.map((name) => {
                const rankInfo = getRankColor(ranks[name], algorithms.length);
                const isBest = name === bestAlgo;
                const isWorst = name === worstAlgo;
                const isSelected = name === effectiveSelected;
                return (
                  <th
                    key={name}
                    className={`algo-header ${isSelected ? "selected" : ""}`}
                    style={{ backgroundColor: rankInfo.bg, cursor: "pointer" }}
                    onClick={() => setSelectedAlgo(name)}
                  >
                    <div className="algo-name">{name}</div>
                    <div className="algo-badges">
                      <span
                        className="badge rank-badge"
                        style={{ backgroundColor: rankInfo.labelBg }}
                      >
                        {rankInfo.label}
                      </span>
                      {isBest && <span className="badge best-badge">Best</span>}
                      {isWorst && (
                        <span className="badge worst-badge">Worst</span>
                      )}
                      {isSelected && (
                        <span className="badge selected-badge">Selected</span>
                      )}
                    </div>
                    <div className="algo-avg">
                      Avg: {averages[name].toFixed(2)}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: numIterations }, (_, rowIdx) => {
              return (
                <tr key={rowIdx}>
                  <td className="iter-col">{rowIdx + 1}</td>
                  {algorithms.map((name) => {
                    const val = fitnessValues[name]?.[rowIdx];
                    const rankInfo = getRankColor(
                      ranks[name],
                      algorithms.length,
                    );
                    const isMax = val === maxPerColumn[name];
                    return (
                      <td
                        key={name}
                        style={{ backgroundColor: rankInfo.bg }}
                        className={isMax ? "max-value" : ""}
                      >
                        {Number.isFinite(val) ? val.toFixed(2) : "-"}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Summary */}
      <div className="insights-summary">
        <div className="insights-summary-title">Summary</div>
        <ul>
          <li>
            <strong>Best performing algorithm:</strong> {bestAlgo} (Average:{" "}
            {averages[bestAlgo].toFixed(2)})
          </li>
          <li>
            <strong>Worst performing algorithm:</strong> {worstAlgo} (Average:{" "}
            {averages[worstAlgo].toFixed(2)})
          </li>
        </ul>
        <div className="insights-summary-note">
          * Lower values indicate better performance. Click on any algorithm
          header to select it.
        </div>
      </div>
    </div>
  );
}

InsightsTable.propTypes = {
  fitnessValues: PropTypes.object.isRequired,
  selectedAlgorithm: PropTypes.string,
};

InsightsTable.defaultProps = {
  selectedAlgorithm: "",
};

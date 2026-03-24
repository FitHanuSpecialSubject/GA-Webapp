import React, { useState } from "react";
import PropTypes from "prop-types";

const RANK_COLORS = {
  5: { bg: "#d4edda", label: "Rank 5", labelBg: "#28a745" },
  4: { bg: "#e8f5e9", label: "Rank 4", labelBg: "#66bb6a" },
  3: { bg: "#fff9c4", label: "Rank 3", labelBg: "#fdd835" },
  2: { bg: "#ffe0b2", label: "Rank 2", labelBg: "#ffa726" },
  1: { bg: "#f8d7da", label: "Rank 1", labelBg: "#e57373" },
};

function getRankColor(rank, totalAlgorithms) {
  if (totalAlgorithms <= 1) return RANK_COLORS[5];
  const normalized = Math.round(((rank - 1) / (totalAlgorithms - 1)) * 4) + 1;
  return RANK_COLORS[normalized] || RANK_COLORS[3];
}

export default function InsightsTable({ fitnessValues }) {
  const algorithms = Object.keys(fitnessValues);
  const [selectedAlgo, setSelectedAlgo] = useState(null);

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

  const numIterations = fitnessValues[algorithms[0]].length;

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
          {[5, 4, 3, 2, 1].map((rank, i) => (
            <React.Fragment key={rank}>
              <span
                className="ranking-legend-color"
                style={{ background: RANK_COLORS[rank].bg }}
              />
              <span className="ranking-legend-label">
                {rank === 5
                  ? "Rank 5 (Best)"
                  : rank === 1
                    ? "Rank 1 (Worst)"
                    : `Rank ${rank}`}
              </span>
              {i < 4 && <span className="ranking-legend-arrow">→</span>}
            </React.Fragment>
          ))}
        </div>
        <div className="ranking-legend-note">
          * Highest values in each column are marked in bold red
        </div>
      </div>

      {/* Table */}
      <table className="insights-ranked-table">
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
                    {isBest && (
                      <span className="badge best-badge">Best</span>
                    )}
                    {isWorst && (
                      <span className="badge worst-badge">Worst</span>
                    )}
                    {isSelected && (
                      <span className="badge selected-badge">Selected</span>
                    )}
                  </div>
                  <div className="algo-avg">Avg: {averages[name].toFixed(2)}</div>
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
                  const val = fitnessValues[name][rowIdx];
                  const rankInfo = getRankColor(ranks[name], algorithms.length);
                  const isMax = val === maxPerColumn[name];
                  return (
                    <td
                      key={name}
                      style={{ backgroundColor: rankInfo.bg }}
                      className={isMax ? "max-value" : ""}
                    >
                      {val.toFixed(2)}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>

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
};

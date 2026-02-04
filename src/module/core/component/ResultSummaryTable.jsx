import React from "react";
import PropTypes from "prop-types";

function formatValue(value, fallback = "—") {
  if (value === null || value === undefined || value === "") return fallback;
  if (typeof value === "number" && Number.isFinite(value)) return value;
  return String(value);
}

export default function ResultSummaryTable({
  mode = "gameTheory",
  gameTheoryResults,
  stabilityReference,
}) {
  if (mode === "stableMatching") {
    const smt = stabilityReference ?? {};

    const stabilityRows = [
      {
        key: "matchingRate",
        metric: "Matching Rate (%)",
        value: formatValue(smt.matchingRate),
        explanation: "Percentage of users successfully matched.",
      },
      {
        key: "blockingPairs",
        metric: "Blocking Pairs",
        value: formatValue(smt.blockingPairs),
        explanation: "Number of unstable pairs remaining.",
      },
      {
        key: "stabilityScore",
        metric: "Stability Score",
        value: formatValue(smt.stabilityScore),
        explanation: "Overall stability level of the matching.",
      },
    ];

    return (
      <div className="result-summary-card">
        <div className="result-summary-header">
          Result Summary - Stable Matching (Stability Reference)
        </div>
        <div className="result-summary-subtitle">
          (Reference only – detailed stability analysis is shown on the SMT
          page)
        </div>

        <div className="result-summary-table-wrap">
          <table className="result-summary-table">
            <thead>
              <tr>
                <th style={{ width: "30%" }}>Metric</th>
                <th style={{ width: "20%" }}>Value</th>
                <th style={{ width: "50%" }}>Explanation</th>
              </tr>
            </thead>
            <tbody>
              {stabilityRows.map((row) => (
                <tr key={row.key}>
                  <td className="metric-cell">{row.metric}</td>
                  <td className="value-cell">{row.value}</td>
                  <td className="explanation-cell">{row.explanation}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  const gt = gameTheoryResults ?? {};

  const rows = [
    {
      key: "averageRank",
      metric: "Average Rank",
      value: formatValue(gt.averageRank),
      explanation: "Average preference level achieved by users.",
    },
    {
      key: "worstCaseRank",
      metric: "Worst-case Rank",
      value: formatValue(gt.worstCaseRank),
      explanation: "Lowest satisfaction among all users.",
    },
    {
      key: "fairnessIndex",
      metric: "Fairness Index",
      value: formatValue(gt.fairnessIndex),
      explanation: "How evenly satisfaction is distributed across users.",
    },
    {
      key: "socialWelfare",
      metric: "Social Welfare",
      value: formatValue(gt.socialWelfare),
      explanation: "Total benefit achieved by all participants.",
    },
  ];

  return (
    <div className="result-summary-card">
      <div className="result-summary-header">
        Result Summary - Game Theory outcome quality
      </div>

      <div className="result-summary-table-wrap">
        <table className="result-summary-table">
          <thead>
            <tr>
              <th style={{ width: "30%" }}>Metric</th>
              <th style={{ width: "20%" }}>Value</th>
              <th style={{ width: "50%" }}>Explanation</th>
            </tr>
          </thead>
          <tbody>
            <tr className="section-row">
              <td colSpan={3}>
                <span className="section-title">
                  Game Theory – Outcome Quality
                </span>
              </td>
            </tr>
            {rows.map((row) => (
              <tr key={row.key}>
                <td className="metric-cell">{row.metric}</td>
                <td className="value-cell">{row.value}</td>
                <td className="explanation-cell">{row.explanation}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

ResultSummaryTable.propTypes = {
  mode: PropTypes.oneOf(["gameTheory", "stableMatching"]),
  gameTheoryResults: PropTypes.object,
  stabilityReference: PropTypes.object,
};

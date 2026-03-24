import React from "react";
import PropTypes from "prop-types";

function formatValue(value, fallback = "—") {
  if (value === null || value === undefined || value === "") return fallback;
  if (typeof value === "number" && Number.isFinite(value)) {
    return parseFloat(value.toFixed(3));
  }
  return String(value);
}

export default function ResultSummaryTable({ mode = "gameTheory", gameTheoryResults, smtResults }) {
  if (mode === "stableMatching") {
    const smt = smtResults ?? {};
    const rows = [
      { key: "socialWelfare", metric: "Social Welfare", value: formatValue(smt.socialWelfare), explanation: "Total satisfaction achieved by all participants." },
      { key: "averageRank", metric: "Average Rank", value: formatValue(smt.averageRank), explanation: "Average satisfaction level across all individuals." },
      { key: "worstCaseRank", metric: "Worst-case Rank", value: formatValue(smt.worstCaseRank), explanation: "Lowest satisfaction among all individuals." },
      { key: "fairnessIndex", metric: "Fairness Index", value: formatValue(smt.fairnessIndex), explanation: "How evenly satisfaction is distributed (Jain's Index, 0–1, higher = more fair)." },
    ];
    return (
      <div className="result-summary-card">
        <div className="result-summary-header">Result Summary – Stable Matching Outcome Quality</div>
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
                <td colSpan={3}><span className="section-title">Stable Matching – Outcome Quality</span></td>
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

  const gt = gameTheoryResults ?? {};
  const rows = [
    { key: "socialWelfare", metric: "Social Welfare", value: formatValue(gt.socialWelfare), explanation: "Total benefit achieved by all participants." },
    { key: "averageRank", metric: "Average Rank", value: formatValue(gt.averageRank), explanation: "Average preference level achieved by users." },
    { key: "worstCaseRank", metric: "Worst-case Rank", value: formatValue(gt.worstCaseRank), explanation: "Lowest satisfaction among all users." },
    { key: "fairnessIndex", metric: "Fairness Index", value: formatValue(gt.fairnessIndex), explanation: "How evenly satisfaction is distributed (Jain's Index, 0–1, higher = more fair)." },
  ];
  return (
    <div className="result-summary-card">
      <div className="result-summary-header">Result Summary – Game Theory Outcome Quality</div>
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
              <td colSpan={3}><span className="section-title">Game Theory – Outcome Quality</span></td>
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
  smtResults: PropTypes.object,
};
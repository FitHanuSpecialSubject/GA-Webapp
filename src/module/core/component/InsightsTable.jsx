import React from "react";
import PropTypes from "prop-types";

export default function InsightsTable({ fitnessValues }) {
  const algorithms = Object.keys(fitnessValues);
  const headers = algorithms.map((name) => <th key={name}>{name}</th>);
  const rows = fitnessValues[algorithms[0]].map((_, index) => {
    return (
      <tr key={index}>
        <td className="first-col">{index + 1}</td>
        {algorithms.map((name) => (
          <td key={name}>{fitnessValues[name][index]}</td>
        ))}
      </tr>
    );
  });
  return (
    <table>
      <thead>
        <tr>
          <th className="first-col">Iteration</th>
          {headers}
        </tr>
      </thead>
      <tbody>{rows}</tbody>
    </table>
  );
}

InsightsTable.propTypes = {
  fitnessValues: PropTypes.object.isRequired,
};

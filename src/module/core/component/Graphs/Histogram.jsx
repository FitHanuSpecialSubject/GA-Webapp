import React from "react";
import PropTypes from "prop-types";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const colors = [
  "#262A56",
  "#45CFDD",
  "#6527BE",
  "#E11299",
  "#EBB02D",
  "hotpink",
  "crimson",
  "steelblue",
  "lime",
];

export default function Histogram({ data }) {
  const runtimes = data.runtimes;
  const algorithms = Object.keys(runtimes);

  const averageRuntimes = algorithms.map((alg) => {
    const values = runtimes[alg];
    const sum = values.reduce((acc, val) => acc + val, 0);
    const average = sum / values.length;
    return average;
  });

  const chartData = {
    labels: algorithms,
    datasets: [
      {
        label: "Average Runtime (s)",
        data: averageRuntimes,
        backgroundColor: algorithms.map((_, i) => colors[i % colors.length]),
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: {
        display: true,
        text: "Average Runtime per Algorithm",
      },
    },
    scales: {
      y: {
        title: {
          display: true,
          text: "Runtime (seconds)",
        },
        beginAtZero: true,
      },
      x: {
        title: {
          display: true,
          text: "Algorithms",
        },
      },
    },
  };

  return (
    <div style={{ height: "400px" }}>
      <Bar data={chartData} options={chartOptions} />
    </div>
  );
}

Histogram.propTypes = {
  data: PropTypes.shape({
    runtimes: PropTypes.objectOf(PropTypes.arrayOf(PropTypes.number)).isRequired,
  }).isRequired,
};

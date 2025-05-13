import React from "react";
import PropTypes from "prop-types";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";

// Register necessary components for AreaChart
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend
);

// Define reusable colors (with transparency for background)
const colors = [
  { border: "#262A56", background: "rgba(38, 42, 86, 0.4)" },
  { border: "#45CFDD", background: "rgba(69, 207, 221, 0.4)" },
  { border: "#6527BE", background: "rgba(101, 39, 190, 0.4)" },
  { border: "#E11299", background: "rgba(225, 18, 153, 0.4)" },
  { border: "#EBB02D", background: "rgba(235, 176, 45, 0.4)" },
  { border: "hotpink", background: "rgba(255, 105, 180, 0.4)" },
  { border: "crimson", background: "rgba(220, 20, 60, 0.4)" },
  { border: "steelblue", background: "rgba(70, 130, 180, 0.4)" },
  { border: "lime", background: "rgba(0, 255, 0, 0.4)" },
];

export default function AreaChart({ data }) {
  const runtimes = data.runtimes;
  const algorithms = Object.keys(runtimes);
  const labels = runtimes[algorithms[0]].map((_, index) => index + 1);

  const datasets = algorithms.map((name, index) => {
    const color = colors[index % colors.length];
    return {
      label: name,
      data: runtimes[name],
      fill: true, // Enable area fill
      borderColor: color.border,
      backgroundColor: color.background,
      tension: 0.3,
      pointRadius: 0,
    };
  });

  const graphData = {
    labels,
    datasets,
  };

  const graphOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: "Runtime Comparison (Area Chart)",
      },
    },
  };

  return (
    <>
      <div style={{ height: "400px" }}>
        <Line data={graphData} options={graphOptions} />
      </div>
      <p className="mt-4 small">
        Comparison of Fitness Value across various algorithms
      </p>
    </>
  );
}

AreaChart.propTypes = {
  data: PropTypes.shape({
    runtimes: PropTypes.object.isRequired,
  }).isRequired,
};

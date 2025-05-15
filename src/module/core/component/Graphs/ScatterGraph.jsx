import React from "react";
import { Scatter } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(LinearScale, PointElement, Tooltip, Legend);

const ScatterChart = ({ data }) => {
  const algorithms = data.runtimes;
  const characters = [
    {
      label: "eMOEA",
      pointStyle: "circle",
      color: "#FFB6C1",
    },
    {
      label: "VEGA",
      pointStyle: "rect",
      color: "#87CEFA",
    },
    {
      label: "NSGAII",
      pointStyle: "rectRot",
      color: "#FFD700",
    },
    {
      label: "NSGAIII",
      pointStyle: "triangle",
      color: "#98FB98",
    },
    {
      label: "IBEA",
      pointStyle: "star",
      color: "#DDA0DD",
    },
    {
      label: "PESA2",
      pointStyle: "crossRot",
      color: "#FFA07A",
    },
  ];

  const dataSet = {
    datasets: Object.keys(algorithms).map((algorithm) => {
      const char = characters.find((c) => c.label === algorithm) || {};
      return {
        label: algorithm,
        data: algorithms[algorithm].map((runtime, index) => ({
          x: runtime,
          y: data.fitnessValues[algorithm][index],
          index: index + 1,
        })),
        pointStyle: char.pointStyle || "circle",
        backgroundColor: char.color || "#ccc",
        borderColor: char.color || "#ccc",
        pointRadius: 8,
      };
    }),
  };

  const options = {
    scales: {
      x: {
        title: {
          display: true,
          text: "Runtime (s)",
        },
      },
      y: {
        title: {
          display: true,
          text: "Fitness Value",
        },
      },
    },
    plugins: {
      tooltip: {
        callbacks: {
          label: (context) => {
            return `${context.dataset.label} interation ${context.raw.index}: ${context.parsed.x}s (Fitness value: ${context.parsed.y * 100})`;
          },
        },
      },
      legend: {
        position: "top",
        labels: {
          usePointStyle: true,
          generateLabels: (chart) => {
            return chart.data.datasets.map((dataset, i) => {
              const algo = characters.find(char => char.label === dataset.label);
              return {
                text: dataset.label,
                pointStyle: algo.pointStyle,
                fillStyle: algo.color,
                strokeStyle: algo.color,
                lineWidth: 1,
              };
            });
          },
        },
      },
    },
  };

  return (
    <div style={{ width: "800px", margin: "0 auto" }}>
      <Scatter data={dataSet} options={options} />
      <h2>Comparing the performance of algorithms</h2>

    </div>
  );
};

export default ScatterChart;
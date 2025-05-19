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
  const iconStyled = [
    {
      pointStyle: "circle",
      color: "#0002FF",
    },
    {
      pointStyle: "rect",
      color: "#22CE83",
    },
    {
      pointStyle: "rectRot",
      color: "#E2F516",
    },
    {
      pointStyle: "triangle",
      color: "#FFA500",
    },
    {
      pointStyle: "star",
      color: "#FD1C03",
    },
    {
      pointStyle: "rectRounded",
      color: "#FF00FF",
    },
    {
      pointStyle: "rectRot",
      color: "#FF6347",
    },
    {
      pointStyle: "circle",
      color: "#9370DB",
    },
    {
      pointStyle: "triangle",
      color: "#4B0082",
    },
    {
      pointStyle: "star",
      color: "#800000",
    },
  ];

  const characters = Object.keys(algorithms).map((algorithmName, index) => ({
    label: algorithmName,
    ...iconStyled[index % iconStyled.length]
  }));

  const dataSet = {
    datasets: Object.keys(algorithms).map((algorithm, i) => {
      const char = characters.find((c) => c.label === algorithm) || {
        pointStyle: "circle",
        color: "#ccc"
      };
      return {
        label: algorithm,
        data: algorithms[algorithm].map((runtime, index) => ({
          x: runtime,
          y: data.fitnessValues[algorithm][index],
          index: index + 1,
        })),
        pointStyle: char.pointStyle,
        backgroundColor: char.color,
        borderColor: char.color,
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
        ticks: {
          callback: function (value) {
            return value;
          }
        },
      },
    },
    plugins: {
      tooltip: {
        callbacks: {
          label: (context) => {
            return `${context.dataset.label} interation ${context.raw.index}: ${context.parsed.x}s (Fitness value: ${context.parsed.y})`;
          },
        },
      },
      legend: {
        display: true,
        position: "top",
        labels: {
          display: true,
          usePointStyle: true,
          generateLabels: (chart) => {
            return chart.data.datasets.map((dataset, i) => {
              const algo = characters.find(char => char.label === dataset.label) || {
                color: "#ccc"
              };
              return {
                text: dataset.label,
                datasetIndex: i,
                hidden: !chart.isDatasetVisible(i),
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
      <h3>Algorithms’s performance</h3>
    </div>
  );
};

export default ScatterChart;
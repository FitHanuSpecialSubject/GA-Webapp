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
      color: "#0002FF",
    },
    {
      label: "VEGA",
      pointStyle: "rect",
      color: "#22CE83",
    },
    {
      label: "NSGAII",
      pointStyle: "rectRot",
      color: "#E2F516",
    },
    {
      label: "NSGAIII",
      pointStyle: "triangle",
      color: "#FFA500",
    },
    {
      label: "IBEA",
      pointStyle: "star",
      color: "#FD1C03",
    },
    {
      label: "PESA2",
      pointStyle: "rectRounded",
      color: "#FF00FF",
    },
    {
      label: "SMPSO",
      pointStyle: "rectRot",
      color: "#FF6347",
    },
    {
      label: "OMOPSO",
      pointStyle: "circle",
      color: "#9370DB",
    },
  ];

  const dataSet = {
    datasets: Object.keys(algorithms).map((algorithm) => {
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
        position: "top",
        labels: {
          usePointStyle: true,
          generateLabels: (chart) => {
            return chart.data.datasets.map((dataset) => {
              const algo = characters.find(char => char.label === dataset.label) || {
                color: "#ccc"
              };
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
      <h3>Algorithms’s performance</h3>
    </div>
  );
};

export default ScatterChart;
import React from "react";
import { Bar } from "react-chartjs-2";
import PropTypes from "prop-types";

export default function HorizontalBarChart({ data }) {
  // Prepare data for the chart
  const algorithms = Object.keys(data);
  
  const minValues = algorithms.map((algo) => Math.min(...data[algo]));
  const meanValues = algorithms.map((algo) => {
    const values = data[algo];
    return values.reduce((sum, value) => sum + value, 0) / values.length;
  });
  const maxValues = algorithms.map((algo) => Math.max(...data[algo]));
  
  const meanMinValues = meanValues.map(
    (mean, index) => mean - minValues[index],
  );
  
  const maxMeanValues = maxValues.map((max, index) => max - meanValues[index]);
  
  // Chart data
  const chartData = {
    labels: algorithms,
    datasets: [
      {
        label: "Min",
        data: minValues,
        backgroundColor: "rgba(46, 204, 113, 0.8)",
        borderColor: "rgba(39, 174, 96, 1)",
        borderWidth: 1,
        stack: "Stack 0",
      },
      {
        label: "Mean",
        data: meanMinValues,
        backgroundColor: "rgba(241, 196, 15, 0.8)",
        borderColor: "rgba(243, 156, 18, 1)",
        borderWidth: 1,
        stack: "Stack 0",
      },
      {
        label: "Max",
        data: maxMeanValues,
        backgroundColor: "rgba(231, 76, 60, 0.8)",
        borderColor: "rgba(192, 57, 43, 1)",
        borderWidth: 1,
        stack: "Stack 0",
      },
    ],
  };
  
  // Chart configuration
  const options = {
    indexAxis: "y", // Horizontal bar chart
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      title: {
        display: true,
        text: "Runtime Comparison",
        font: { size: 16 },
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            const index = context.dataIndex;
            const datasetIndex = context.datasetIndex;
            
            if (datasetIndex === 0) {
              return `Min: ${minValues[index].toFixed(2)}s`;
            } else if (datasetIndex === 1) {
              return `Mean: ${meanValues[index].toFixed(2)}s`;
            } else {
              return `Max: ${maxValues[index].toFixed(2)}s`;
            }
          },
        },
      },
      legend: {
        display: true,
        position: "top",
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: "Runtime (seconds)",
          font: { size: 14 },
        },
        beginAtZero: true,
        stacked: true,
      },
      y: {
        title: {
          display: true,
          text: "Algorithms",
          font: { size: 14 },
        },
        stacked: true,
      },
    },
  };
  
  return (
    <div className="horizontal-bar-chart-container" style={{ height: "400px" }}>
      <Bar data={chartData} options={options} />
    </div>
  );
}

HorizontalBarChart.propTypes = {
  data: PropTypes.object.isRequired,
}; 

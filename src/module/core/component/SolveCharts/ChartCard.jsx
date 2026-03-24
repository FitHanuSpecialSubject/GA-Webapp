import React from "react";
import PropTypes from "prop-types";

export default function ChartCard({
  title,
  description,
  filename,
  chartRef,
  children,
  actions,
}) {
  const handleDownload = () => {
    if (!chartRef?.current || typeof chartRef.current.toBase64Image !== "function") {
      return;
    }
    const url = chartRef.current.toBase64Image();
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
  };

  return (
    <div className="chart-card">
      <div className="chart-card-header">
        <div className="chart-card-title-block">
          <div className="chart-card-title-row">
            <div className="chart-card-title">{title}</div>
            {actions}
          </div>
          {description && <div className="chart-card-desc">{description}</div>}
        </div>
        <button className="chart-download-btn" onClick={handleDownload}>
          Download PNG
        </button>
      </div>
      <div className="chart-card-body">{children}</div>
    </div>
  );
}

ChartCard.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string,
  filename: PropTypes.string.isRequired,
  chartRef: PropTypes.shape({ current: PropTypes.any }),
  children: PropTypes.node.isRequired,
  actions: PropTypes.node,
};

ChartCard.defaultProps = {
  description: "",
  chartRef: null,
  actions: null,
};

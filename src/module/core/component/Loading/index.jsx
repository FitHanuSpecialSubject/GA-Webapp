import React from "react";
import "./style.scss";
import PropTypes from "prop-types";
export default function Loading({
  isLoading,
  message,
  estimatedTime,
  percentage,
}) {
  if (!isLoading) return <></>;
  return (
    <div className="loading">
      <div className="background"></div>
      <div className="lds-grid">
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
      </div>
      <div className="loading-content">
        {estimatedTime && (
          <p className="estimated-time">
            Total estimated {estimatedTime} minute(s) left
          </p>
        )}
        {percentage && <p className="percentage">{percentage}%</p>}
        {message && <p className="message">{message}</p>}
      </div>
    </div>
  );
}

Loading.propTypes = {
  isLoading: PropTypes.bool.isRequired,
  message: PropTypes.string,
  estimatedTime: PropTypes.number,
  percentage: PropTypes.number,
};

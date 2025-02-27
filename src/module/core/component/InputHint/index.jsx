import React from "react";
import PropTypes from "prop-types";
import "./style.scss";

export default function InputHint({
  showHint,
  setShowHint,
  heading,
  description,
}) {
  const handleMouseLeave = () => {
    setShowHint(false);
  };
  return (
    showHint && (
      <div className="input-hint p-3" onMouseLeave={handleMouseLeave}>
        <h1 className="fw-bold mb-1">{heading}</h1>
        <div className="small">{description}</div>
      </div>
    )
  );
}

InputHint.propTypes = {
  showHint: PropTypes.bool.isRequired,
  setShowHint: PropTypes.func.isRequired,
  heading: PropTypes.string,
  description: PropTypes.string,
};

import React from "react";
import PropTypes from "prop-types";
import "./style.scss";
import InputHint from "../InputHint";
import { useState } from "react";

function MaxMinCheckbox({ isMaximizing, setIsMaximizing }) {
  const [showHint, setShowHint] = useState(false);
  const handleMouseOver = () => {
    setShowHint(true);
  };

  const handleMouseLeave = () => {
    setShowHint(false);
  };
  return (
    <div className="max-min-checkbox">
      <label htmlFor="checkbox" className="max-min-label">
        <input
          type="checkbox"
          placeholder="You problem name"
          id="checkbox"
          onChange={(e) => setIsMaximizing(e.target.checked)}
          value={isMaximizing}
        />
        <p id="text">Is maximizing problem</p>
        <i
          className="info fa-solid fa-info"
          onMouseOver={handleMouseOver}
          onMouseLeave={handleMouseLeave}
        ></i>
      </label>

      <InputHint
        showHint={showHint}
        setShowHint={setShowHint}
        heading="Maximizing - Minimizing Problem"
        // eslint-disable-next-line max-len
        description="Maximizing means trying to achieve the best outcome, while minimizing means trying to avoid the worst outcome"
        guideSectionIndex={8}
      />
    </div>
  );
}

MaxMinCheckbox.propTypes = {
  isMaximizing: PropTypes.bool.isRequired,
  setIsMaximizing: PropTypes.func.isRequired,
};

MaxMinCheckbox.displayName = "MaxMinCheckbox";

export default MaxMinCheckbox;

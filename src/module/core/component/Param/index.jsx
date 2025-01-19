import React from "react";
import PropTypes from "prop-types";
import "./style.scss";
import InputHint from "../InputHint";
import { useState } from "react";

function Param({ inputText, paramVal, setParamVal, hintTitle, hintContent }) {
  // const playerHolder = error ? message: message
  const [showHint, setShowHint] = useState(false);

  const handleMouseOver = () => {
    setShowHint(true);
  };
  const handleMouseLeave = () => {
    setShowHint(false);
  };

  return (
    <div className="Param">
      <InputHint
        showHint={showHint}
        setShowHint={setShowHint}
        heading={hintTitle}
        description={hintContent}
        guideSectionIndex={8}
      />
      <div className="text">
        <i
          className="info fa-solid fa-info"
          onMouseOver={handleMouseOver}
          onMouseLeave={handleMouseLeave}
        ></i>
        <p className="bold">{inputText}</p>
      </div>

      <input
        type="number"
        className="param-input"
        value={paramVal}
        onChange={(e) => setParamVal(e.target.value)}
      />
    </div>
  );
}

Param.propTypes = {
  inputText: PropTypes.string.isRequired,
  paramVal: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
    .isRequired,
  setParamVal: PropTypes.func.isRequired,
  hintTitle: PropTypes.string.isRequired,
  hintContent: PropTypes.string.isRequired,
};

Param.displayName = "Param";

export default Param;

import React from "react";
import InputHint from "../InputHint";
import "./style.scss";
import { useState } from "react";
import PropTypes from "prop-types";

export default function Input({
  type,
  message,
  error,
  handleOnChange,
  value,
  description,
  guideSectionIndex,
  min,
  max,
}) {
  // const playerHolder = error ? message: message;
  const style = error ? "error" : "";
  const [showHint, setShowHint] = useState(false);
  const inputType = type === "number" ? "number" : "text";

  const handleMouseOver = () => {
    setShowHint(true);
  };

  const handleMouseLeave = () => {
    setShowHint(false);
  };

  const internalOnchangeEvent = (e) => {
    if (Number.isSafeInteger(max) && e.target.value > max) e.target.value = max;
    if (Number.isSafeInteger(min) && e.target.value < min) e.target.value = min;
    handleOnChange(e);
  };

  return (
    <>
      <div className={`input ${style}`}>
        <input
          min={min}
          max={max}
          type={inputType}
          placeholder={message}
          onChange={internalOnchangeEvent}
          value={value == null ? undefined : value}
          className="pe-2"
        />
        <i
          className="info fa-solid fa-info"
          onMouseOver={handleMouseOver}
          onMouseLeave={handleMouseLeave}
        ></i>
        <InputHint
          showHint={showHint}
          setShowHint={setShowHint}
          heading={message}
          guideSectionIndex={guideSectionIndex}
          description={description}
        />
      </div>
    </>
  );
}

Input.propTypes = {
  type: PropTypes.string,
  message: PropTypes.string,
  error: PropTypes.string,
  handleOnChange: PropTypes.func,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  description: PropTypes.string,
  guideSectionIndex: PropTypes.number,
  min: PropTypes.number,
  max: PropTypes.number,
};

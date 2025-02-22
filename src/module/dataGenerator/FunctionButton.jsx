import React, { useState } from "react";
import PropTypes from "prop-types";
import "./css/functionButton.css";

export default function FunctionButton({
  className,
  callback,
  callbackParams,
  disableCondition,
  icon,
  desc,
}) {
  const [popoverHidden, setPopoverHidden] = useState(true);
  return (
    <>
      <button
        disabled={disableCondition}
        onClick={() => callback(...callbackParams)}
        onMouseEnter={() => setPopoverHidden(false)}
        onMouseLeave={() => setPopoverHidden(true)}
        className={className}
      >
        <div className={"popover " + (popoverHidden ? "d-none" : "")}>
          {desc}
        </div>
        {icon}
      </button>
    </>
  );
}

FunctionButton.propTypes = {
  className: PropTypes.string,
  callback: PropTypes.func,
  callbackParams: PropTypes.array,
  disableCondition: PropTypes.bool,
  icon: React.ReactNode,
  desc: PropTypes.string,
};

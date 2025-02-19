import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";

const MinMaxInput = ({ field, index, setRange, setType, set }) => {
  const [virtualRange, setVirtualRange] = useState({
    min: NaN,
    max: NaN,
  });
  const [valid, setValid] = useState(false);
  useEffect(() => {
    if (
      !Number.isNaN(virtualRange.min) &&
      !Number.isNaN(virtualRange.max) &&
      virtualRange.min <= virtualRange.max
    ) {
      setRange(field, index, set, virtualRange.min, virtualRange.max);
      setValid(true);
    } else {
      setRange(field, index, set, -1907, -1907);
      setValid(false);
    }
  }, [virtualRange]);
  return (
    <>
      <div className="input-group mb-1">
        <input
          min={0}
          className={
            "form-control " + (valid ? "border-black" : "border-danger")
          }
          type="number"
          placeholder="min"
          onChange={(e) =>
            setVirtualRange({
              ...virtualRange,
              min: Number(e.target.value === "" ? NaN : e.target.value),
            })
          }
        />
        <input
          min={0}
          className={
            "form-control " + (valid ? "border-black" : "border-danger")
          }
          type="number"
          placeholder="max"
          onChange={(e) =>
            setVirtualRange({
              ...virtualRange,
              max: Number(e.target.value === "" ? NaN : e.target.value),
            })
          }
        />
      </div>
      <div className="small">
        <label className="d-flex align-items-center justify-content-center">
          <input
            type="checkbox"
            className="form-check-input mt-0 me-1 border-primary"
            onChange={(e) => setType(field, index, set, e.target.checked)}
          />
          Decimal value
        </label>
      </div>
    </>
  );
};

MinMaxInput.propTypes = {
  field: PropTypes.string,
  index: PropTypes.number,
  setRange: PropTypes.func,
  setType: PropTypes.func,
  set: PropTypes.number,
};

export default MinMaxInput;

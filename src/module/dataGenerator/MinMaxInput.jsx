import React, { useContext, useEffect, useState } from "react";
import PropTypes from "prop-types";
import { GameTheoryGeneratorContext } from "./SMTGenerator";

const MinMaxInput = ({ field, index, setType, set }) => {
  const [validation, setValidation] = useState(false);
  const { range, setRange } = useContext(GameTheoryGeneratorContext);
  useEffect(() => {
    if (range.length === 0) return;
    if (range[set][field][index].filter((e) => e !== undefined).length === 0) {
      return;
    }
    setValidation(
      Number(range[set][field][index][0]) <=
        Number(range[set][field][index][1]),
    );
  }, [range]);
  const validateInput = (e) => {
    if (
      Number(e.target.value) < Number(e.target.min) ||
      e.target.value === ""
    ) {
      return e.target.min;
    }
    if (Number(e.target.value) > Number(e.target.max)) {
      return e.target.max;
    }
    return e.target.value;
  };
  return (
    <>
      <div className="input-group mb-1">
        <input
          min={0}
          max={field === "w" ? 10 : Number.POSITIVE_INFINITY}
          className={
            "form-control " + (validation ? "border-black" : "border-danger")
          }
          value={
            range.length > 0 && range[set][field][index] !== undefined
              ? range[set][field][index][0]
              : ""
          }
          type="number"
          placeholder="Lower bound"
          onChange={(e) => {
            const val = validateInput(e);
            const clone = [...range];
            clone[set][field][index][0] = Number(val);
            setRange(clone);
            e.target.value = val;
          }}
        />
        <input
          min={0}
          className={
            "form-control " + (validation ? "border-black" : "border-danger")
          }
          max={field === "w" ? 10 : Number.POSITIVE_INFINITY}
          value={
            range.length > 0 && range[set][field][index] !== undefined
              ? range[set][field][index][1]
              : ""
          }
          type="number"
          placeholder="Upper bound"
          onChange={(e) => {
            const val = validateInput(e);
            const clone = [...range];
            clone[set][field][index][1] = Number(val);
            setRange(clone);
            e.target.value = val;
          }}
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
  range: PropTypes.array,
};

export default MinMaxInput;

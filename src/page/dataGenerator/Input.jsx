import PropTypes from "prop-types";
import React from "react";

export default function InputPage({ setFile, setProblemType, problemType }) {
  const handleFileChange = (e) => {
    e.preventDefault();
    setFile(e.target.files[0]);
    e.target.value = null;
  };
  return (
    <div>
      <select
        className="form-select mb-4"
        onChange={(e) => setProblemType(e.target.value)}
      >
        <option value="">Choose problem type</option>
        <option value="SMT">Stable Matching Theory</option>
        <option value="GT">Game Theory</option>
      </select>
      <input
        className={"form-control " + (problemType === "" ? "d-none" : "")}
        type="file"
        id="select-file"
        accept=".xlsx"
        onChange={handleFileChange}
      />
    </div>
  );
};

InputPage.propTypes = {
  setFile: PropTypes.func,
  setProblemType: PropTypes.func,
  problemType: PropTypes.string,
};

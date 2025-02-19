import React, { createContext, useState } from "react";
import PropTypes from "prop-types";
import ExcelJS from "exceljs";
import { GTProblemInfo } from "../../page/dataGenerator/ProblemInfo";

export const GameTheoryGeneratorContext = createContext(null);

export default function GTGenerator({ data, workbook }) {
  const [infoVisible, setInfoVisible] = useState(true);
  return (
    <GameTheoryGeneratorContext.Provider value={{}}>
      <div className="container">
        <a
          role="button"
          className="d-inline-flex m-auto text-center mb-2 text-decoration-none pointer-event"
          onClick={() => setInfoVisible(!infoVisible)}
        >
          Hide/show problem information
        </a>
        <GTProblemInfo data={data} infoVisible={infoVisible} />
      </div>
    </GameTheoryGeneratorContext.Provider>
  );
}

GTGenerator.propTypes = {
  data: PropTypes.object,
  workbook: ExcelJS.Workbook,
};

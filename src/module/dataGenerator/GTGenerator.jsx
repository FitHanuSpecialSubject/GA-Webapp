import React, { createContext, useContext, useEffect, useState } from "react";
import PropTypes from "prop-types";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { GTProblemInfo } from "../../page/dataGenerator/ProblemInfo";
import { GTMinMaxInput } from "./MinMaxInput";
import PopupContext from "../core/context/PopupContext";
import { generatorGTWriter } from "../../utils/excel_utils";
import { FaCopy, FaDeleteLeft, FaFileExport, FaPaste } from "react-icons/fa6";
import FunctionButton from "./FunctionButton";

export const GameTheoryGeneratorContext = createContext(null);

export default function GTGenerator({ data, workbook }) {
  const [infoVisible, setInfoVisible] = useState(true);
  const [range, setRange] = useState([]);
  const [type, setType] = useState([]);
  const [clipboard, setClipboard] = useState(null);
  const { displayPopup } = useContext(PopupContext);
  const generateFile = async () => {
    for (let i = 0; i < data.numberOfProperty; i++) {
      if (
        range[i].filter((e) => e !== undefined).length < 2 ||
        range[i][0] > [i][1]
      ) {
        return displayPopup(
          "Oops! Did you miss something?",
          "Please make sure all the input have valid value. For instance: 0 <= min <= max",
          true,
        );
      }
    }
    const processedWorkbook = generatorGTWriter(workbook, range, type, data);
    const buffer = await processedWorkbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: "application/octet-stream" });
    saveAs(blob, data.problemName + ".xlsx");
  };
  const copyValue = (index) => {
    setClipboard(range[index]);
  };
  const pasteValue = (index) => {
    if (clipboard === null) {
      return;
    }
    const clone = [...range];
    clone[index] = [...clipboard];
    setRange(clone);
  };
  const sameProperty = (index) => {
    const propertyRange = range[index];
    const clone = [...range];
    for (let i = 0; i < data.numberOfProperty; i++) {
      clone[i] = [...propertyRange];
    }
    setRange(clone);
  };
  const clearValue = (index) => {
    const clone = [...range];
    clone[index] = [];
    setRange(clone);
  };
  const functionButtons = [
    {
      icon: <FaCopy />,
      disableCondition: false,
      desc: "Copy value",
      callback: copyValue,
    },
    {
      icon: <FaPaste />,
      disableCondition: clipboard === null,
      desc: "Paste value",
      callback: pasteValue,
    },
    {
      icon: <FaFileExport />,
      disableCondition: false,
      desc: "Same for other properties",
      callback: sameProperty,
    },
    {
      icon: <FaDeleteLeft />,
      disableCondition: false,
      desc: "Clear value for this characteristic",
      callback: clearValue,
    },
  ];
  useEffect(() => {
    if (Object.keys(data).length === 0 || range.length > 0 || type.length > 0) {
      return;
    }
    const rangeInit = [];
    for (let i = 0; i < data.numberOfProperty; i++) {
      rangeInit.push([]);
    }
    const typeInit = new Array(data.numberOfProperty).fill(false);
    setRange(rangeInit);
    setType(typeInit);
  }, [data]);
  return (
    <GameTheoryGeneratorContext.Provider
      value={{ range, setRange, type, setType }}
    >
      <div className="container">
        <a
          role="button"
          className="d-inline-flex m-auto text-center mb-2 text-decoration-none pointer-event"
          onClick={() => setInfoVisible(!infoVisible)}
        >
          Hide/show problem information
        </a>
        <GTProblemInfo data={data} infoVisible={infoVisible} />
        <div className="row mb-4">
          {new Array(data.numberOfProperty).fill(0).map((p, i) => {
            return (
              <div className="col-4 mb-4" key={i}>
                <div className="card">
                  <div className="card-body p-4">
                    <div className="btn-group w-100 mb-4">
                      {functionButtons.map((e) => {
                        return (
                          <FunctionButton
                            key={e.desc}
                            callback={e.callback}
                            callbackParams={[i]}
                            className="btn btn-outline-dark"
                            icon={e.icon}
                            disableCondition={e.disableCondition}
                            desc={e.desc}
                          />
                        );
                      })}
                    </div>
                    <div className="h5 fw-bold text-center mb-3">
                      {"Property " + (i + 1)}
                    </div>
                    <GTMinMaxInput index={i} />
                    <div className="row mt-3">
                      <div className="col-6 mb-2">
                        <button
                          className="btn btn-outline-primary w-100"
                          onClick={() => copyValue(i)}
                        >
                          Copy
                        </button>
                      </div>
                      <div className="col-6 mb-2">
                        <button
                          className="btn btn-outline-primary w-100"
                          onClick={() => pasteValue(i)}
                        >
                          Paste
                        </button>
                      </div>
                      <div className="col-12 mb-2">
                        <button
                          className="btn btn-outline-primary w-100"
                          onClick={() => sameProperty(i)}
                        >
                          Same for all property
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <button
          className="btn btn-primary w-100"
          onClick={() => generateFile()}
        >
          Generate data
        </button>
      </div>
    </GameTheoryGeneratorContext.Provider>
  );
}

GTGenerator.propTypes = {
  data: PropTypes.object,
  workbook: ExcelJS.Workbook,
};

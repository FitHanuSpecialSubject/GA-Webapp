import React, { createContext, useContext, useEffect, useState } from "react";
import PropTypes from "prop-types";
import ExcelJS from "exceljs";
import MinMaxInput from "./MinMaxInput";
import PopupContext from "../core/context/PopupContext";
import { saveAs } from "file-saver";
import { generatorSMTWriter } from "../../utils/excel_utils";
import { SMTProblemInfo } from "../../page/dataGenerator/ProblemInfo";

export const GameTheoryGeneratorContext = createContext(null);

export default function SMTGenerator({ data, workbook }) {
  const [infoVisible, setInfoVisible] = useState(true);
  const { displayPopup } = useContext(PopupContext);
  const [rwpRange, setRwpRange] = useState([]);
  const [valueType, setValueType] = useState([]);
  const [clipboard, setClipboard] = useState(null);
  const setType = (field, index, set, value) => {
    const clone = [...valueType];
    clone[set][field][index] = value;
    setValueType(clone);
  };
  const generateFile = async () => {
    // Validation
    for (let j = 0; j < data.numberOfSet; j++) {
      for (let i = 0; i < data.characteristic.length; i++) {
        for (const field of ["r", "w", "p"]) {
          if (
            rwpRange[j][field][i].filter((e) => e !== undefined).length < 2 ||
            rwpRange[j][field][i][0] > rwpRange[j][field][i][1]
          ) {
            return displayPopup(
              "Oops! Did you miss something?",
              "Please make sure all the input have valid value. For instance: 0 <= min <= max",
              true,
            );
          }
        }
      }
    }
    const processedWorkbook = generatorSMTWriter(
      workbook,
      rwpRange,
      valueType,
      data,
    );
    const buffer = await processedWorkbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: "application/octet-stream" });
    saveAs(blob, data.problemName + ".xlsx");
  };
  const copyValue = (set, index) => {
    try {
      setClipboard({
        r: rwpRange[set]["r"][index],
        w: rwpRange[set]["w"][index],
        p: rwpRange[set]["p"][index],
      });
    } catch (_) {
      // Do nothing
    }
  };
  const pasteValue = (set, index) => {
    try {
      const range = [...rwpRange];
      for (const field of ["r", "w", "p"]) {
        range[set][field][index] = [...clipboard[field]];
      }
      setRwpRange(range);
    } catch (_) {
      // Do nothing
    }
  };
  useEffect(() => {
    if (data == null || rwpRange.length > 0 || valueType.length > 0) return;
    const valueTypeInit = [];
    const rangeInit = [];
    for (let i = 0; i < data.numberOfSet; i++) {
      valueTypeInit[i] = {
        r: [],
        w: [],
        p: [],
      };
      rangeInit[i] = {
        r: [],
        w: [],
        p: [],
      };
    }
    for (let i = 0; i < data.characteristic.length; i++) {
      for (let j = 0; j < data.numberOfSet; j++) {
        for (const field of ["r", "w", "p"]) {
          valueTypeInit[j][field][i] = false;
          rangeInit[j][field][i] = [];
        }
      }
    }
    setRwpRange(rangeInit);
    setValueType(valueTypeInit);
  }, [data]);
  return (
    <GameTheoryGeneratorContext.Provider
      value={{
        data,
        range: rwpRange,
        setRange: setRwpRange,
      }}
    >
      <div className="container">
        <a
          role="button"
          className="d-inline-flex m-auto text-center mb-2 text-decoration-none pointer-event"
          onClick={() => setInfoVisible(!infoVisible)}
        >
          Hide/show problem information
        </a>
        <SMTProblemInfo data={data} infoVisible={infoVisible} />
        <div className="w-100 mb-4">
          {new Array(data.numberOfSet)
            .fill(0)
            .map((e, i) => i)
            .map((s) => (
              <div key={s} className={"d-block"}>
                <div className="fs-4 fw-bold mb-3">
                  Configuration |{" "}
                  <span className="text-secondary">{"Set " + (s + 1)}</span>
                </div>
                <div className="row">
                  {data.characteristic.map((c, i) => {
                    return (
                      <div className="col-4" key={String(s) + " " + c}>
                        <div className="card mb-4 bg-light-subtle border-2 rounded-4">
                          <div className="card-body text-center p-4">
                            <p className="fs-5 fw-bold">{c}</p>
                            <div className="mb-2">
                              <div className="mb-1">Requirements</div>
                              <MinMaxInput
                                field="r"
                                set={s}
                                index={i}
                                setType={setType}
                              />
                            </div>
                            <div className="mb-2">
                              <div className="mb-1">Weights</div>
                              <MinMaxInput
                                field="w"
                                set={s}
                                index={i}
                                setType={setType}
                              />
                            </div>
                            <div className="mb-4">
                              <div className="mb-1">Properties</div>
                              <MinMaxInput
                                field="p"
                                set={s}
                                index={i}
                                setType={setType}
                              />
                            </div>
                            <div className="btn-group w-100">
                              <button
                                className="btn btn-outline-primary"
                                onClick={() => copyValue(s, i)}
                              >
                                Copy value
                              </button>
                              <button
                                className="btn btn-primary"
                                onClick={() => pasteValue(s, i)}
                              >
                                Paste value
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
        </div>
        <button className="w-100 btn btn-primary" onClick={generateFile}>
          Generate
        </button>
      </div>
    </GameTheoryGeneratorContext.Provider>
  );
}

SMTGenerator.propTypes = {
  data: PropTypes.object,
  workbook: ExcelJS.Workbook,
};

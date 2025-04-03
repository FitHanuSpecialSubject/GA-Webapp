import React, { createContext, useContext, useEffect, useState } from "react";
import PropTypes from "prop-types";
import ExcelJS from "exceljs";
import { SMTMinMaxInput } from "./MinMaxInput";
import PopupContext from "../core/context/PopupContext";
import { saveAs } from "file-saver";
import { generatorSMTWriter } from "../../utils/excel_utils";
import { SMTProblemInfo } from "../../page/dataGenerator/ProblemInfo";
import {
  FaCopy,
  FaFileArrowDown,
  FaFileExport,
  FaPaste,
} from "react-icons/fa6";
import FunctionButton from "./FunctionButton";

export const StableMatchingGeneratorContext = createContext(null);

export default function SMTGenerator({ data, workbook }) {
  const [infoVisible, setInfoVisible] = useState(true);
  const { displayPopup } = useContext(PopupContext);
  const [rwpRange, setRwpRange] = useState([]);
  const [valueType, setValueType] = useState([]);
  const [clipboard, setClipboard] = useState(null);
  const [setCapacity, setSetCapacity] = useState([]);
  const setType = (field, index, set, value) => {
    const clone = [...valueType];
    clone[set][field][index] = value;
    setValueType(clone);
  };
  const generateFile = async () => {
    // Validation
    for (let j = 0; j < data.numberOfSet; j++) {
      if (setCapacity[j][0] > setCapacity[j][1]) {
        return displayPopup(
          "Oops! Did you miss something?",
          "Please make sure all the input have valid value. For instance: 0 <= min <= max",
          true,
        );
      }
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
      setCapacity,
    );
    const buffer = await processedWorkbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: "application/octet-stream" });
    saveAs(blob, data.problemName + "_stable_matching.generated.xlsx");
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
    if (clipboard === null) {
      return;
    }
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
  const sameSet = (set, index) => {
    const range = [...rwpRange];
    for (let i = 0; i < data.characteristic.length; i++) {
      for (const field of ["r", "w", "p"]) {
        range[set][field][i] = [...range[set][field][index]];
      }
    }
    setRwpRange(range);
  };
  const sameCharacteristic = (set, index) => {
    const range = [...rwpRange];
    for (let i = 0; i < data.numberOfSet; i++) {
      for (const field of ["r", "w", "p"]) {
        range[i][field][index] = [...range[set][field][index]];
      }
    }
    setRwpRange(range);
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
    const setCapacityArr = [];
    for (let i = 0; i < data.numberOfSet; i++) {
      setCapacityArr.push([1, 1]);
    }
    setSetCapacity(setCapacityArr);
  }, [data]);
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
      desc: "Same for other characteristics in this set",
      callback: sameSet,
    },
    {
      icon: <FaFileArrowDown />,
      disableCondition: false,
      desc: "Same for this characteristic in other sets",
      callback: sameCharacteristic,
    },
  ];
  return (
    <StableMatchingGeneratorContext.Provider
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
          {setCapacity.length > 0 &&
            new Array(data.numberOfSet)
              .fill(0)
              .map((e, i) => i)
              .map((s) => (
                <div key={s} className="d-block">
                  <div className="fs-4 fw-bold mb-3">
                    Configuration |{" "}
                    <span className="text-secondary">{"Set " + (s + 1)}</span>
                  </div>
                  <div className="py-3">
                    <div className="mb-2 fw-bold text-secondary">
                      Capacity RNG range [x, y]
                    </div>
                    <div className="input-group w-25">
                      <input
                        type="number"
                        className="form-control border-3"
                        placeholder="Lower bound"
                        value={setCapacity[s][0]}
                        onChange={(e) => {
                          const clone = [...setCapacity];
                          clone[s][0] = Number(e.target.value);
                          setSetCapacity(clone);
                        }}
                      />
                      <input
                        type="number"
                        className="form-control border-3 border-start-0"
                        placeholder="Upper bound"
                        value={setCapacity[s][1]}
                        onChange={(e) => {
                          const clone = [...setCapacity];
                          clone[s][1] = Number(e.target.value);
                          setSetCapacity(clone);
                        }}
                      />
                    </div>
                  </div>
                  <div className="row">
                    {data.characteristic.map((c, i) => {
                      return (
                        <div className="col-4" key={String(s) + " " + c}>
                          <div className="card mb-4 bg-light-subtle border-2 rounded-4">
                            <div className="card-body text-center p-4">
                              <div className="btn-group w-100 mb-4">
                                {functionButtons.map((e) => {
                                  return (
                                    <FunctionButton
                                      key={e.desc}
                                      callback={e.callback}
                                      callbackParams={[s, i]}
                                      className="btn btn-outline-dark"
                                      icon={e.icon}
                                      disableCondition={e.disableCondition}
                                      desc={e.desc}
                                    />
                                  );
                                })}
                              </div>
                              <p className="fs-5 fw-bold">{c}</p>
                              <div className="mb-2">
                                <div className="mb-1">Requirements</div>
                                <SMTMinMaxInput
                                  field="r"
                                  set={s}
                                  index={i}
                                  setType={setType}
                                />
                              </div>
                              <div className="mb-2">
                                <div className="mb-1">Weights</div>
                                <SMTMinMaxInput
                                  field="w"
                                  set={s}
                                  index={i}
                                  setType={setType}
                                />
                              </div>
                              <div className="mb-4">
                                <div className="mb-1">Properties</div>
                                <SMTMinMaxInput
                                  field="p"
                                  set={s}
                                  index={i}
                                  setType={setType}
                                />
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
    </StableMatchingGeneratorContext.Provider>
  );
}

SMTGenerator.propTypes = {
  data: PropTypes.object,
  workbook: ExcelJS.Workbook,
};

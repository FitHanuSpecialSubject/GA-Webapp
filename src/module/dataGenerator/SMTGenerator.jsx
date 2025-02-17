import React, { useContext, useEffect, useState } from "react";
import PropTypes from "prop-types";
import ExcelJS from "exceljs";
import MinMaxInput from "./MinMaxInput";
import PopupContext from "../core/context/PopupContext";
import { saveAs } from "file-saver";
import { generatorSMTWriter } from "../../utils/excel_utils";

export default function SMTGenerator({ data, workbook }) {
  const [infoVisible, setInfoVisible] = useState(true);
  const { displayPopup } = useContext(PopupContext);
  const [rwpRange, setRwpRange] = useState([]);
  const [valueType, setValueType] = useState([]);
  const setRange = (field, index, set, min, max) => {
    if (rwpRange.length === 0) return;
    const clone = [...rwpRange];
    if (min === max && max === -1907) {
      clone[set][field][index] = undefined;
    } else {
      clone[set][field][index] = [min, max];
    }
    setRwpRange(clone);
  };
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
          if (!rwpRange[j][field][i]) {
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
  useEffect(() => {
    if (data == null || rwpRange.length > 0 || valueType.length > 0) return;
    const clone = [];
    const clone2 = [];
    for (let i = 0; i < data.numberOfSet; i++) {
      clone[i] = {
        r: [],
        w: [],
        p: [],
      };
      clone2[i] = {
        r: [],
        w: [],
        p: [],
      };
    }
    setRwpRange(clone);
    for (let i = 0; i < data.characteristic.length; i++) {
      for (let j = 0; j < data.numberOfSet; j++) {
        clone2[j].r[i] = false;
        clone2[j].w[i] = false;
        clone2[j].p[i] = false;
      }
    }
    setValueType(clone2);
  }, [data]);
  return (
    <div className="container">
      <a
        role="button"
        className="d-inline-flex m-auto text-center mb-2 text-decoration-none pointer-event"
        onClick={() => setInfoVisible(!infoVisible)}
      >
        Hide/show problem information
      </a>
      <div
        className={
          "card border-secondary mb-4 border-3 rounded-4 shadow-sm bg-light" +
          (infoVisible ? "" : " d-none")
        }
      >
        <div className="card-body px-5 py-4">
          <div className="mb-2">
            <div className="fw-bold">Problem name</div>
            <span className="small">{data.problemName}</span>
          </div>
          <div className="row">
            <div className="col">
              <div className="fw-bold">Number of set</div>
              <div className="small">{data.numberOfSet}</div>
            </div>
            <div className="col">
              <div className="fw-bold">
                Characteristics [<span>{data.characteristic.length}</span>]
              </div>
              <div className="small">
                {data.characteristic.map((e, i) =>
                  i === data.characteristic.length - 1 ? e : e + ", ",
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="row w-100 mb-4">
        {new Array(data.numberOfSet)
          .fill(0)
          .map((e, i) => i)
          .map((s) => (
            <>
              <div className="fs-4 fw-bold mb-2">
                Configuration |{" "}
                <span className="text-secondary">{"Set " + (s+1)}</span>
              </div>
              {data.characteristic.map((c, i) => {
                return (
                  <div className="col-4" key={c}>
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
                            setRange={setRange}
                          />
                        </div>
                        <div className="mb-2">
                          <div className="mb-1">Weights</div>
                          <MinMaxInput
                            field="w"
                            set={s}
                            index={i}
                            setType={setType}
                            setRange={setRange}
                          />
                        </div>
                        <div className="mb-2">
                          <div className="mb-1">Properties</div>
                          <MinMaxInput
                            field="p"
                            set={s}
                            index={i}
                            setType={setType}
                            setRange={setRange}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </>
          ))}
      </div>
      <button className="w-100 btn btn-primary" onClick={generateFile}>
        Generate
      </button>
    </div>
  );
}

SMTGenerator.propTypes = {
  data: PropTypes.object,
  workbook: ExcelJS.Workbook,
};

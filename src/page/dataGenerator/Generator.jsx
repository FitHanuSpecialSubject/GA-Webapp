import React, { useContext, useEffect, useState } from "react";
import PopupContext from "../../module/core/context/PopupContext";
import ExcelJS from "exceljs";
import PropTypes from "prop-types";
import { generatorSMTReader } from "../../utils/excel_utils";
import SMTGenerator from "../../module/dataGenerator/SMTGenerator";

export default function GeneratingPage({ file, setFile, problemType }) {
  const { displayPopup } = useContext(PopupContext);
  const [info, setInfo] = useState({});
  const [workbook, setWorkbook] = useState(null);
  const readFile = (f) => {
    const reader = new FileReader();
    try {
      reader.readAsArrayBuffer(f);
      reader.onload = async () => {
        try {
          const data = reader.result;
          const workbook = await new ExcelJS.Workbook().xlsx.load(data);
          if (problemType === "SMT") {
            const info = generatorSMTReader(workbook);
            setWorkbook(workbook);
            setInfo(info);
          } else {
            null;
          }
        } catch (e) {
          console.error(e);
          setFile(null);
          displayPopup("Error", e.message, true);
        }
      };
    } catch (e) {
      console.error(e);
      setFile(null);
      displayPopup("Error", e.message, true);
    }
  };

  useEffect(() => {
    if (file == null) return;
    readFile(file);
  }, [file]);
  return (
    <>
      <button
        className="m-auto mb-2 btn btn-danger"
        onClick={() => setFile(null)}
      >
        Import another problem
      </button>
      {Object.keys(info).length === 0 ? (
        <></>
      ) : problemType === "SMT" ? (
        <SMTGenerator
          data={info}
          workbook={workbook}
          setWorkbook={setWorkbook}
        />
      ) : (
        "Game Theory currently unsupported."
      )}
    </>
  );
}

GeneratingPage.propTypes = {
  file: PropTypes.object,
  setFile: PropTypes.func,
  problemType: PropTypes.string,
};

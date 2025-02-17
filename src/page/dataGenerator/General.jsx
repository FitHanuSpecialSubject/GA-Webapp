import React, { useState } from "react";
import InputPage from "./Input";
import GeneratingPage from "./Generator";

export default function General() {
  const [file, setFile] = useState(null);
  const [problemType, setProblemType] = useState("");
  return (
    <>
      <div className="d-flex flex-column align-items-center justify-content-center">
        <div className="h1 fw-bold mb-4">Data Generator</div>
        {file == null ? (
          <InputPage
            setFile={setFile}
            setProblemType={setProblemType}
            problemType={problemType}
          />
        ) : (
          <GeneratingPage
            file={file}
            setFile={setFile}
            problemType={problemType}
          />
        )}
      </div>
    </>
  );
}
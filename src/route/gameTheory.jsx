import React from "react";
import { Route } from "react-router-dom";
import InputPage from "../page/gameTheory/Input";
import GuidePage from "../page/Guide";
import InputProcessingPage from "../page/gameTheory/Processing";
import OutputPage from "../page/gameTheory/Output";

export default function gameTheoryRouter() {
  return (
    <>
      <Route path="/" element={<InputPage />} />
      <Route path="/input" element={<InputPage />} />
      <Route path="/guide" element={<GuidePage />} />
      <Route path="/input-processing" element={<InputProcessingPage />} />
      <Route path="/result" element={<OutputPage />} />
    </>
  );
}

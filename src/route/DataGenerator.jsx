import { Route } from "react-router-dom";
import InputPage from "../page/dataGenerator/General";
import React from "react";

export default function dataGeneratorRouter() {
  return (
    <>
      <Route path="/generator/" element={<InputPage />} />
    </>
  );
}

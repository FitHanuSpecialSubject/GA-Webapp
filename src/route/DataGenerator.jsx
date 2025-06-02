import { Route } from "react-router-dom";
import InputPage from "../page/dataGenerator/General";
import React from "react";
import AppRoutes from "./route.constants";

export default function dataGeneratorRouter() {
  return (
    <>
      <Route
        path    = {AppRoutes.GeneratorHome}
        element = {<InputPage />} />
    </>
  );
}

import React from "react";
import { Route } from "react-router-dom";
import HomePage from "../page/home";
import InputPage from "../page/gameTheory/Input";
import GuidePage from "../page/Guide";
import InputProcessingPage from "../page/gameTheory/Processing";
import OutputPage from "../page/gameTheory/Output";
import AppRoutes from "./route.constants";

export default function gameTheoryRouter() {
  return (
    <>
      <Route
        path    = {AppRoutes.GameTheoryHome}
        element = {<HomePage />}
      />
      <Route
        path    = {AppRoutes.GameTheoryInput}
        element = {<InputPage />}
      />
      <Route
        path    = {AppRoutes.GameTheoryGuide}
        element = {<GuidePage />}
      />
      <Route
        path    = {AppRoutes.GameTheoryProcessing}
        element = {<InputProcessingPage />}
      />
      <Route
        path    = {AppRoutes.GameTheoryResult}
        element = {<OutputPage />}
      />
    </>
  );
}

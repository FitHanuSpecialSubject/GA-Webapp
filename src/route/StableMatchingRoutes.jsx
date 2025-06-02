import React from "react";
import InputPageMatchingTheory from "../page/stableMatching/Input";
import { Route } from "react-router-dom";
import AppRoutes from "./route.constants";
import InputProcessingPageMatchingTheory from "../page/stableMatching/Processing";
import MatchingTheoryOutputPage from "../page/stableMatching/Output";

export default function stableMatchingRouter() {
  return (
    <>
      <Route
        path    = {AppRoutes.MatchingHome}
        element = {<InputPageMatchingTheory />} />
      <Route
        path    = {AppRoutes.MatchingInput}
        element = {<InputPageMatchingTheory />}
      />
      <Route
        path    = {AppRoutes.MatchingProcessing}
        element = {<InputProcessingPageMatchingTheory />}
      />
      <Route
        path    = {AppRoutes.MatchingResult}
        element = {<MatchingTheoryOutputPage />}
      />
    </>
  );
}

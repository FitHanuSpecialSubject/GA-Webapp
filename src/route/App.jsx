import React, { useEffect } from "react";
import Navbar from "../module/core/component/Navbar";
import Footer from "../module/core/component/Footer";
import HomePage from "../page/home";
import "../module/core/asset/css/index.scss";
import { Routes, Route, useLocation } from "react-router-dom";
import { useState } from "react";
import DataContext from "../module/core/context/DataContext";
import InsightPage from "../page/Insight";
import PopupContext from "../module/core/context/PopupContext";
import Popup from "../module/core/component/Popup";
import stableMatchingRouter from "./StableMatchingRoutes";
import gameTheoryRouter from "./GameTheoryRoutes";
import dataGeneratorRouter from "./DataGenerator";
import AppRoutes from "./route.constants";

function App() {
  const location = useLocation();
  const [appData, setAppData] = useState(null);
  const [guideSectionIndex, setGuideSectionIndex] = useState(0);
  const [popupError, setPopupError] = useState(false);
  const [popupTitle, setPopupTitle] = useState("");
  const [popupMessage, setPopupMessage] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [popupOkCallBack] = useState();
  const [favicon, setFavicon] = useState("idle");
  const displayPopup = (title, message, error) => {
    setShowPopup(true);
    setPopupTitle(title);
    setPopupMessage(message);
    if (error) {
      setPopupError(error);
    }
  };
  const StableMatchingRouter = stableMatchingRouter();
  const GameTheoryRouter = gameTheoryRouter();
  const DataGeneratorRouter = dataGeneratorRouter();
  const isGameTheoryInput = location.pathname === AppRoutes.GameTheoryInput;
  const isGameTheoryResult = location.pathname === AppRoutes.GameTheoryResult;
  const isGameTheoryRoute = [
    AppRoutes.GameTheoryInput,
    AppRoutes.GameTheoryGuide,
    AppRoutes.GameTheoryProcessing,
    AppRoutes.GameTheoryResult,
  ].includes(location.pathname);
  const isStableMatchingRoute = [
    AppRoutes.MatchingHome,
    AppRoutes.MatchingInput,
    AppRoutes.MatchingProcessing,
    AppRoutes.MatchingResult,
  ].includes(location.pathname);
  const mainClassName = isGameTheoryResult
    ? "game-theory-shell flex flex-1 min-h-0 flex-col overflow-hidden"
    : isGameTheoryInput
      ? "game-theory-shell flex flex-1"
      : isGameTheoryRoute
        ? "game-theory-shell flex-1"
        : isStableMatchingRoute
          ? "matching-shell flex-1"
          : "flex-1";

  useEffect(() => {
    document.querySelector("link[rel~='icon']").href = `/${favicon}.svg`;
  }, [favicon]);
  useEffect(() => {
    setFavicon("idle");
  }, []);
  return (
    <DataContext.Provider
      value={{
        appData,
        setAppData,
        guideSectionIndex,
        setGuideSectionIndex,
        setFavicon,
      }}
    >
      <PopupContext.Provider value={{ displayPopup }}>
        <div
          className={
            isGameTheoryResult
              ? "App flex h-full flex-col overflow-hidden"
              : "App flex min-h-screen flex-col"
          }
        >
          <Navbar />
          <main className={mainClassName}>
            <Routes>
              {StableMatchingRouter}
              {GameTheoryRouter}
              {DataGeneratorRouter}
              <Route path={AppRoutes.Home} element={<HomePage />} />
              <Route path={AppRoutes.Insights} element={<InsightPage />} />
              <Route path={AppRoutes.Fallback} element={<HomePage />} />
            </Routes>
          </main>
          <Footer />
        </div>

        <Popup
          isShow={showPopup}
          setIsShow={setShowPopup}
          title={popupTitle}
          message={popupMessage}
          error={popupError}
          okCallback={popupOkCallBack}
        />
      </PopupContext.Provider>
    </DataContext.Provider>
  );
}

export default App;

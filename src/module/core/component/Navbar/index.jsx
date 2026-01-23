import React from "react";
import "./style.scss";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useState, useEffect } from "react";

/** MOEA: subtle converging-arrows SVG (no broken images). */
function MoeaIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="moea-svg"
      aria-hidden
    >
      <path d="M7 17L2 12l5-5" />
      <path d="M17 7l5 5-5 5" />
      <path d="M2 12h20" />
    </svg>
  );
}

export default function Header() {
  const location = useLocation();
  const [path, setPath] = useState("");
  const navigate = useNavigate();
  const backToHome = () => {
    navigate("/");
  };

  useEffect(() => {
    setPath(location.pathname);
  }, [location]);
  return (
    <>
      <header className="Navbar">
        <div className="container">
          <div
            className="app-name fw-semibold d-flex align-items-center"
            onClick={backToHome}
          >
            {/* Logo: use the same MOEA icon as the strip below */}
            <span className="logo-moea-icon" aria-hidden>
              <MoeaIcon />
            </span>
            <span className="app-title">Game Theory & Matching Theory Solver</span>
          </div>
          <div className="nav-item-container">
            <Link
              to="/"
              className={path === "/" ? "nav-item highlight" : "nav-item"}
            >
              Home
            </Link>
            <Link
              to="/input"
              className={
                ["/input", "/input-processing", "/result"].includes(path)
                  ? "nav-item highlight"
                  : "nav-item"
              }
            >
              Game Theory
            </Link>
            <Link
              to="/matching-theory/input"
              className={
                path === "/matching-theory/input"
                  ? "nav-item highlight"
                  : "nav-item"
              }
            >
              Matching Problem
            </Link>
            <Link
              to="/generator"
              className={
                path === "/generator" ? "nav-item highlight" : "nav-item"
              }
            >
              Data Generator
            </Link>
            <Link
              to="/guide"
              className={path === "/guide" ? "nav-item highlight" : "nav-item"}
            >
              Guide
            </Link>
          </div>
        </div>
      </header>
      <a
        className="app-info"
        href="http://moeaframework.org/"
        target="_blank"
        rel="noreferrer"
      >
        <span className="moea-brand-text">
          <MoeaIcon /> Powered by MOEA Framework
        </span>
      </a>
    </>
  );
}

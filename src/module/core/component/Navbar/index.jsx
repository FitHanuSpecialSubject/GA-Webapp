import React, { useEffect, useState } from "react";
import "./style.scss";
import { useLocation, useNavigate, Link } from "react-router-dom";

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

  const isActive = (to) => path === to;

  return (
    <>
      <header className="Navbar">
        <div className="Navbar__inner">
          <a
            href="http://moeaframework.org/"
            target="_blank"
            rel="noreferrer"
            className="Navbar__brand"
            aria-label="MOEA Framework"
          >
            <img
              src="/logo.svg"
              alt="MOEAs Platform"
              className="Navbar__brand-logo"
            />
            <span className="Navbar__brand-text">MOEAs Framework</span>
          </a>

          <nav className="Navbar__nav" aria-label="Primary">
            <Link
              to="/"
              className={
                isActive("/")
                  ? "Navbar__link Navbar__link--active"
                  : "Navbar__link"
              }
              onClick={backToHome}
            >
              Home
            </Link>
            <span className="Navbar__dot">·</span>
            <Link
              to="/input"
              className={
                isActive("/input")
                  ? "Navbar__link Navbar__link--active"
                  : "Navbar__link"
              }
            >
              Game Theory
            </Link>
            <span className="Navbar__dot">·</span>
            <Link
              to="/matching-theory/input"
              className={
                isActive("/matching-theory/input")
                  ? "Navbar__link Navbar__link--active"
                  : "Navbar__link"
              }
            >
              Matching Problem
            </Link>
            <span className="Navbar__dot">·</span>
            <Link
              to="/generator"
              className={
                isActive("/generator")
                  ? "Navbar__link Navbar__link--active"
                  : "Navbar__link"
              }
            >
              Data Generator
            </Link>
            <span className="Navbar__dot">·</span>
            <Link
              to="/guide"
              className={
                isActive("/guide")
                  ? "Navbar__link Navbar__link--active"
                  : "Navbar__link"
              }
            >
              Guide
            </Link>
          </nav>
        </div>
      </header>

    </>
  );
}

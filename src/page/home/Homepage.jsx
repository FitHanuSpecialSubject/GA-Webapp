import React from "react";
import { Link } from "react-router-dom";
import {
  FaUsers,
  FaBullseye,
  FaDownload,
  FaBook,
  FaChess,
  FaPeopleGroup,
  FaDatabase,
  FaFileExcel,
  FaSliders,
  FaPlay,
  FaChartLine,
  FaFlask,
  FaGraduationCap,
  FaBookOpen,
  FaChevronDown,
} from "react-icons/fa6";
import "../../module/core/asset/css/homepage.scss";

const ADMIN_EMAIL = "ngoctb@hanu.vn";
const MAILTO_FEEDBACK = `mailto:${ADMIN_EMAIL}?subject=MOEA Platform - Feedback`;
const INTRO_IMAGE = "/logo.png";

export default function Homepage() {
  const scrollToTools = () => {
    document.querySelector(".tools-section")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="homepage-moea">
      {/* 1. Hero Section */}
      <section className="hero">
        <div
          className="hero-bg"
          style={{ "--hero-bg-image": `url(${INTRO_IMAGE})` }}
        />
        <div className="hero-overlay" />
        <div className="hero-floats">
          <span className="hero-float hero-float--1" aria-hidden>f(x)</span>
          <span className="hero-float hero-float--2" aria-hidden>Pareto</span>
          <span className="hero-float hero-float--3" aria-hidden>NSGA-II</span>
          <span className="hero-float hero-float--4" aria-hidden>Nash</span>
          <span className="hero-float hero-float--5" aria-hidden>PSO</span>
        </div>
        <div className="hero-inner">
          <h1 className="hero-title">
            Multi-Objective Evolutionary Algorithms Platform
          </h1>
          <p className="hero-subtitle">
            Advanced computational tools for solving complex optimization problems
            using Game Theory and Stable Matching – Designed for academic research
            and education.
          </p>
          <div className="hero-cta">
            <button type="button" className="btn-hero btn-hero--primary" onClick={scrollToTools}>
              Explore Tools <FaChevronDown className="hero-cta-icon" />
            </button>
            <Link to="/guide" className="btn-hero btn-hero--secondary">
              Learn More
            </Link>
          </div>
        </div>
      </section>

      {/* 2. About the Platform — 4 cards */}
      <section className="about-section">
        <div className="section-inner">
          <h2 className="section-title">About the Platform</h2>
          <div className="about-grid">
            <div className="card-glass">
              <div className="card-glass-icon">
                <FaUsers />
              </div>
              <h3>Our Lab</h3>
              <p>
                Developed by the MOEAs research lab, focusing on multi-objective
                optimization, game theory, and stable matching for research and
                education.
              </p>
            </div>
            <div className="card-glass">
              <div className="card-glass-icon">
                <FaBullseye />
              </div>
              <h3>Purpose</h3>
              <p>
                Solve Nash equilibria, stable matching (one-to-one, one-to-many,
                many-to-many), and generate synthetic data using NSGA-II, PSO,
                and other metaheuristics.
              </p>
            </div>
            <div className="card-glass">
              <div className="card-glass-icon">
                <FaDownload />
              </div>
              <h3>Getting Started</h3>
              <p>
                Run the app locally or use the deployed version. Backend (e.g.
                Java/Spring Boot) is required for Game Theory and Matching
                modules—see the Guide.
              </p>
            </div>
            <div className="card-glass">
              <div className="card-glass-icon">
                <FaBook />
              </div>
              <h3>Documentation &amp; References</h3>
              <p>
                <Link to="/guide">Guide</Link> for input format, Excel templates,
                and step-by-step instructions. Download guidelines from each
                module.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Optimization Tools — 3 large cards */}
      <section className="tools-section">
        <div className="section-inner">
          <h2 className="section-title">Optimization Tools</h2>
          <div className="tools-grid">
            <div className="card-tool">
              <div className="card-tool-icon">
                <FaChess />
              </div>
              <h3>Game Theory Solver</h3>
              <p>
                Define players, strategies, fitness and payoff functions. Upload
                Excel or use the form. MOEA finds Nash equilibria.
              </p>
              <Link to="/input" className="card-tool-link">
                Get Started →
              </Link>
            </div>
            <div className="card-tool">
              <div className="card-tool-icon">
                <FaPeopleGroup />
              </div>
              <h3>Stable Matching</h3>
              <p>
                Configure sets, individuals, and evaluation functions. Solve
                one-to-one, one-to-many, or many-to-many matching problems.
              </p>
              <Link to="/matching-theory/input" className="card-tool-link">
                Get Started →
              </Link>
            </div>
            <div className="card-tool">
              <div className="card-tool-icon">
                <FaDatabase />
              </div>
              <h3>Data Generator</h3>
              <p>
                Generate synthetic datasets for game theory and stable matching
                experiments.
              </p>
              <Link to="/generator" className="card-tool-link">
                Get Started →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 4. How to Use — timeline 4 steps */}
      <section className="howto-section">
        <div className="section-inner">
          <h2 className="section-title">How to Use</h2>
          <div className="howto-timeline">
            <div className="howto-step">
              <div className="howto-step-icon">
                <FaFileExcel />
              </div>
              <h3>Upload Your Data (Excel)</h3>
              <p>Prepare your problem in Excel using our templates.</p>
            </div>
            <div className="howto-step">
              <div className="howto-step-icon">
                <FaSliders />
              </div>
              <h3>Configure Algorithm</h3>
              <p>Choose algorithm (NSGA-II, PSO, etc.) and parameters.</p>
            </div>
            <div className="howto-step">
              <div className="howto-step-icon">
                <FaPlay />
              </div>
              <h3>Run Optimization</h3>
              <p>Run the solver and monitor progress.</p>
            </div>
            <div className="howto-step">
              <div className="howto-step-icon">
                <FaChartLine />
              </div>
              <h3>Analyze Results</h3>
              <p>Explore Pareto fronts, matchings, and insights.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Designed For — 3 icons */}
      <section className="designed-section">
        <div className="section-inner">
          <h2 className="section-title">Designed For</h2>
          <div className="designed-grid">
            <div className="card-designed">
              <div className="card-designed-icon">
                <FaFlask />
              </div>
              <h3>Academic Research</h3>
              <p>Experiments and publications in optimization and game theory.</p>
            </div>
            <div className="card-designed">
              <div className="card-designed-icon">
                <FaGraduationCap />
              </div>
              <h3>Educational Purposes</h3>
              <p>Teaching game theory and stable matching.</p>
            </div>
            <div className="card-designed">
              <div className="card-designed-icon">
                <FaBookOpen />
              </div>
              <h3>Thesis &amp; Projects</h3>
              <p>Capstone projects and thesis support.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Footer — university feel */}
      <footer className="homepage-footer-moea">
        <div className="footer-inner">
          <div className="footer-brand">
            <img src="/logo.svg" className="footer-logo" alt="Lab" />
            <span className="footer-brand-name">MOEAs Platform</span>
          </div>
          <div className="footer-links">
            <div className="footer-block">
              <h4>Feedback &amp; Contact</h4>
              <a href={MAILTO_FEEDBACK} className="footer-email">
                {ADMIN_EMAIL}
              </a>
            </div>
            <div className="footer-block">
              <h4>Contribution</h4>
              <p>Developed and maintained by the MOEAs lab. Contact via email for collaboration.</p>
            </div>
          </div>
          <div className="footer-bottom">
            <a
              href="http://moeaframework.org/"
              target="_blank"
              rel="noreferrer"
              className="footer-moea-link"
            >
              Powered by MOEA Framework
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

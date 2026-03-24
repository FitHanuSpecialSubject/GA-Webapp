/**
 * This file (home/index.jsx) serves as the default homepage at /.
 * Root route loads this main introduction/homepage content.
 * 
 * Modern, clean design using Tailwind CSS.
 * Professional academic portal for Game Theory & Matching Theory Solver.
 */
import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  FaCodeBranch,
  FaExternalLinkAlt,
  FaGithub,
  FaRegCommentDots,
  FaTimes,
} from "react-icons/fa";

// Intro image (lab/office). You can swap this URL anytime.
const HERO_IMAGE_URL =
  "https://images.unsplash.com/photo-1551434678-e076c223a692?auto=format&fit=crop&q=80&w=2340";

/**
 * MOEA Framework Icon: Subtle converging arrows (evolutionary / Pareto front theme)
 * SVG/text-based only — no broken images.
 */
function MoeaIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="flex-shrink-0"
      aria-hidden="true"
    >
      <path d="M7 17L2 12l5-5" />
      <path d="M17 7l5 5-5 5" />
      <path d="M2 12h20" />
    </svg>
  );
}

export default function Home() {
  const [imageError, setImageError] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [anonymous, setAnonymous] = useState(false);
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState(false);

  const pagePath = useMemo(() => window.location.pathname, []);

  const openFeedback = () => {
    setFormError("");
    setFormSuccess(false);
    setShowFeedback(true);
  };

  const closeFeedback = () => {
    setShowFeedback(false);
    setFeedback("");
    setName("");
    setEmail("");
    setAnonymous(false);
    setFormError("");
    setFormSuccess(false);
  };

  const handleFeedbackSubmit = (e) => {
    e.preventDefault();
    setFormError("");
    const text = (feedback || "").trim();
    if (!text) {
      setFormError("Please enter your feedback/suggestion/bug report.");
      return;
    }
    const payload = {
      feedback: text,
      name: name.trim() || undefined,
      email: email.trim() || undefined,
      anonymous: !!anonymous,
      timestamp: new Date().toISOString(),
      page: pagePath,
    };
    console.log("Feedback:", payload);
    setFormSuccess(true);
    setTimeout(closeFeedback, 1500);
  };

  return (
    <>
      <div className="flex flex-col min-h-screen bg-white">
        <main className="flex-1">
      {/* ============================= */}
      {/* 1) Introduction Section */}
      {/* ============================= */}
      {/* Goal: introduce the lab & platform, purpose, quick setup, and references */}
      <section className="relative overflow-hidden bg-white">
        {/* subtle background */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-indigo-50/50 via-white to-white" />

        <div className="relative max-w-7xl mx-auto px-6 md:px-12 lg:px-20 py-16">
          {/* Image FIRST (centered), then intro text */}
          <div className="space-y-10">
            {/* Lab image (centered, balanced size) */}
            <div className="mx-auto w-full max-w-3xl">
              <div className="rounded-3xl overflow-hidden shadow-2xl border border-gray-200/50 bg-white">
                {imageError ? (
                  <div className="h-[260px] sm:h-[320px] lg:h-[380px] w-full bg-gradient-to-br from-indigo-100 via-slate-50 to-white flex items-center justify-center text-indigo-700 font-semibold">
                    Lab Visualization
                  </div>
                ) : (
                  <img
                    src={HERO_IMAGE_URL}
                    alt="Research lab with screens and graphs"
                    className="h-[260px] sm:h-[320px] lg:h-[380px] w-full object-cover"
                    onError={() => setImageError(true)}
                  />
                )}
              </div>
            </div>

            {/* Intro text (after image) */}
            <div className="mx-auto w-full max-w-3xl space-y-6 text-center">
              <div className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-1 text-sm text-gray-600">
                <span className="inline-flex items-center gap-1.5 italic text-gray-600">
                  <MoeaIcon />
                  Powered by MOEA Framework
                </span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-gray-900 font-sans">
                Game Theory &amp; Matching Theory Solver
              </h1>

              <p className="text-lg lg:text-xl leading-relaxed text-gray-600 font-sans">
                An academic, research-oriented web platform for solving
                <span className="font-semibold text-gray-800"> Game Theory</span> problems (payoff matrices, Nash equilibria)
                and <span className="font-semibold text-gray-800">Matching Theory</span> problems (stable matching, assignment).
                The workflow is designed to be research-friendly: structured input, reproducible runs, and clear result inspection.
              </p>

              {/* Lab introduction (English) */}
              <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                <h2 className="text-xl font-bold text-gray-900">About the Lab</h2>
                <p className="mt-2 text-gray-600 leading-relaxed">
                Welcome to Dr. Ngoc’s Lab, where we explore the frontiers of Game Theory and Matching Theory. Our research focuses on payoff matrices, Nash equilibria, and stable matching algorithms, providing a collaborative environment for students and researchers to solve real-world optimization challenges through the MOEA Framework.
                </p>
              </div>

              {/* Reference links */}
              <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  References
                </h3>
                <div className="flex flex-col sm:flex-row gap-3">
                  <a
                    href="http://moeaframework.org/"
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 inline-flex items-center justify-center min-h-[52px] px-4 rounded-xl border border-gray-200 bg-white text-sm sm:text-base font-medium text-gray-800 shadow-sm hover:bg-gray-50 hover:shadow transition-all duration-150"
                  >
                    <FaExternalLinkAlt className="mr-2 text-gray-500" />
                    MOEA Framework
                  </a>
                  <Link
                    to="/insights"
                    className="flex-1 inline-flex items-center justify-center min-h-[52px] px-4 rounded-xl border border-gray-200 bg-white text-sm sm:text-base font-medium text-gray-800 shadow-sm hover:bg-gray-50 hover:shadow transition-all duration-150"
                  >
                    Input Format
                  </Link>
                  <Link
                    to="/guide"
                    className="flex-1 inline-flex items-center justify-center min-h-[52px] px-4 rounded-xl border border-gray-200 bg-white text-sm sm:text-base font-medium text-gray-800 shadow-sm hover:bg-gray-50 hover:shadow transition-all duration-150"
                  >
                    Guide
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      </main>

    </div>

    {/* Feedback Modal (Custom Tailwind Modal) */}
    {showFeedback && (
      <div className="fixed inset-0 z-50 overflow-y-auto">
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-black/50 transition-opacity"
          onClick={closeFeedback}
          aria-hidden="true"
        />
        
        {/* Modal Container */}
        <div className="flex min-h-full items-center justify-center p-4">
          <div className="relative bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 transform transition-all">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900">Send feedback</h3>
              <button
                onClick={closeFeedback}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1"
                aria-label="Close"
              >
                <FaTimes size={22} />
              </button>
            </div>

            {/* Body */}
            <div>
              {formSuccess ? (
                <div className="text-center py-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
                    <FaRegCommentDots size={28} className="text-green-600" />
                  </div>
                  <p className="text-green-600 font-semibold text-lg">
                    Thank you. Your feedback has been recorded.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleFeedbackSubmit} className="space-y-4">
                  {/* Feedback Textarea */}
                  <div>
                    <label htmlFor="feedback" className="block text-sm font-medium text-gray-700 mb-2">
                      Feedback / Suggestion / Bug <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      id="feedback"
                      rows={4}
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                      placeholder="Describe your feedback, suggestion, or bug report..."
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors"
                      required
                    />
                    {formError && (
                      <p className="mt-1 text-sm text-red-600">{formError}</p>
                    )}
                  </div>

                  {/* Name */}
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                      Name (optional)
                    </label>
                    <input
                      id="name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your name"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      Email (optional)
                    </label>
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="email@domain.com"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors"
                    />
                  </div>

                  {/* Anonymous Checkbox */}
                  <div className="flex items-center">
                    <input
                      id="anonymous"
                      type="checkbox"
                      checked={anonymous}
                      onChange={(e) => setAnonymous(e.target.checked)}
                      className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                    />
                    <label htmlFor="anonymous" className="ml-2 text-sm text-gray-700">
                      Submit anonymously
                    </label>
                  </div>

                  {/* Actions */}
                  <div className="flex justify-end gap-3 pt-4">
                    <button
                      type="button"
                      onClick={closeFeedback}
                      className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium shadow-md hover:shadow-lg transition-all duration-200"
                    >
                      Submit
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    )}
    </>
  );
}

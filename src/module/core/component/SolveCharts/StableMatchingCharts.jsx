import React, { useMemo, useRef, useState, useEffect } from "react";
import PropTypes from "prop-types";
import { Bar, Scatter } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import ChartCard from "./ChartCard";
import {
  isSkewed,
  log1pTransform,
  buildHistogram,
  makeJitter,
  sampleArray,
  sanitizeFilename,
} from "../../../../utils/solve_chart_utils";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
);

const MAX_SCATTER_POINTS = 2000;

export default function StableMatchingCharts({ result, problemName }) {
  const matches = result?.matches ?? {};
  const matchLists = matches.matches ?? [];
  const leftOvers = matches.leftOvers ?? [];
  const satisfactions = result?.setSatisfactions ?? [];
  const safeName = sanitizeFilename(problemName);
  const logAllowed = useMemo(() => {
    if (!satisfactions.length) {
      return false;
    }
    return satisfactions.every((v) => v > -1);
  }, [satisfactions]);
  const logSuggested = useMemo(() => {
    if (!satisfactions.length) {
      return false;
    }
    return logAllowed && isSkewed(satisfactions);
  }, [satisfactions, logAllowed]);
  const [useLogSatisfaction, setUseLogSatisfaction] = useState(false);
  const [useLogScatter, setUseLogScatter] = useState(false);

  useEffect(() => {
    setUseLogSatisfaction(logSuggested);
    setUseLogScatter(logSuggested);
  }, [logSuggested]);

  const matchedRef = useRef(null);
  const matchCountRef = useRef(null);
  const satisfactionRef = useRef(null);
  const matchCountScatterRef = useRef(null);

  const matchedCount = Math.max(0, (matches.size ?? matchLists.length) - leftOvers.length);
  const unmatchedCount = leftOvers.length;

  const { matchedData, matchedOptions } = useMemo(() => {
    return {
      matchedData: {
        labels: [""],
        datasets: [
          {
            label: "Matched",
            data: [matchedCount],
            backgroundColor: "#4C78A8",
          },
          {
            label: "Unmatched",
            data: [unmatchedCount],
            backgroundColor: "#E45756",
          },
        ],
      },
      matchedOptions: {
        indexAxis: "y",
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: { display: true, text: "Matched vs Unmatched" },
        },
        scales: {
          x: {
            stacked: true,
            title: { display: true, text: "Individuals" },
            beginAtZero: true,
          },
          y: { stacked: true, display: false },
        },
      },
    };
  }, [matchedCount, unmatchedCount]);

  const { matchCountData, matchCountOptions, matchCounts } = useMemo(() => {
    const counts = matchLists.map((m) => (m ? m.length : 0));
    const maxCount = counts.length ? Math.max(...counts) : 0;
    const frequencies = Array.from({ length: maxCount + 1 }, () => 0);
    counts.forEach((count) => {
      frequencies[count] += 1;
    });
    const labels = frequencies.map((_, i) => i);
    return {
      matchCounts: counts,
      matchCountData: {
        labels,
        datasets: [
          {
            label: "Individuals",
            data: frequencies,
            backgroundColor: "#72B7B2",
          },
        ],
      },
      matchCountOptions: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          title: { display: true, text: "Match Count per Individual" },
        },
        scales: {
          x: {
            title: { display: true, text: "Match Count" },
            ticks: { precision: 0 },
          },
          y: { title: { display: true, text: "Individuals" }, beginAtZero: true },
        },
      },
    };
  }, [matchLists]);

  const { satisfactionData, satisfactionOptions } = useMemo(() => {
    if (!satisfactions.length) {
      return { satisfactionData: null, satisfactionOptions: null };
    }
    const useLog = logAllowed && useLogSatisfaction;
    const values = useLog ? log1pTransform(satisfactions) : satisfactions;
    const label = useLog ? "log1p(Satisfaction)" : "Satisfaction";
    const { labels, counts } = buildHistogram(values, 30);
    return {
      satisfactionData: {
        labels,
        datasets: [
          {
            label: "Individuals",
            data: counts,
            backgroundColor: "#F58518",
          },
        ],
      },
      satisfactionOptions: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          title: {
            display: true,
            text: useLog
              ? "Satisfaction Distribution (log1p)"
              : "Satisfaction Distribution",
          },
        },
        scales: {
          x: {
            title: { display: true, text: label },
            ticks: { maxTicksLimit: 6 },
          },
          y: { title: { display: true, text: "Individuals" }, beginAtZero: true },
        },
      },
    };
  }, [satisfactions, logAllowed, useLogSatisfaction]);

  const { matchScatterData, matchScatterOptions } = useMemo(() => {
    if (!matchCounts.length || !satisfactions.length) {
      return { matchScatterData: null, matchScatterOptions: null };
    }
    const paired = matchCounts.map((count, idx) => ({
      x: count,
      y: satisfactions[idx] ?? 0,
    }));
    const sampled = sampleArray(paired, MAX_SCATTER_POINTS, 42);
    const uniqueCountValues = Array.from(new Set(sampled.map((p) => p.x))).sort(
      (a, b) => a - b,
    );
    const minCount = uniqueCountValues.length
      ? uniqueCountValues[0]
      : Infinity;
    const maxCount = uniqueCountValues.length
      ? uniqueCountValues[uniqueCountValues.length - 1]
      : -Infinity;
    const hasRange = Number.isFinite(minCount) && Number.isFinite(maxCount) && minCount !== maxCount;
    const usePaddingX = hasRange;
    const addJitter = hasRange;
    const jitter = addJitter ? makeJitter(sampled.length, 0.12) : [];

    const useLog = logAllowed && useLogScatter;

    const xMin = Number.isFinite(minCount) ? minCount : 0;
    const xMax = Number.isFinite(maxCount)
      ? (hasRange ? maxCount : maxCount + 1)
      : 1;
    const displayMin = usePaddingX ? xMin - 1 : xMin;
    const displayMax = usePaddingX ? xMax + 1 : xMax;

    const points = sampled.map((point, idx) => {
      const jitteredX = point.x + (addJitter ? jitter[idx] : 0);
      const clampedX = Math.min(displayMax, Math.max(displayMin, jitteredX));
      return {
        x: clampedX,
        y: useLog ? Math.log1p(point.y) : point.y,
        count: point.x,
      };
    });

    return {
      matchScatterData: {
        datasets: [
          {
            label: "Individuals",
            data: points,
            backgroundColor: "#4C78A8",
            pointRadius: 4,
          },
        ],
      },
      matchScatterOptions: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (context) => {
                const raw = context.raw ?? {};
                const countValue = raw.count ?? raw.x;
                const yValue = raw.y;
                const yLabel = useLog ? "log1p(Satisfaction)" : "Satisfaction";
                return `Match Count: ${countValue}, ${yLabel}: ${yValue}`;
              },
            },
          },
          title: {
            display: true,
            text: useLog
              ? "Match Count vs Satisfaction (Sampled, log1p)"
              : "Match Count vs Satisfaction (Sampled)",
          },
        },
        scales: {
          x: {
            title: { display: true, text: "Match Count" },
            min: displayMin,
            max: displayMax,
            ticks: { precision: 0, stepSize: 1 },
            grace: 0.2,
            grid: { offset: false },
          },
          y: {
            title: {
              display: true,
              text: useLog ? "log1p(Satisfaction)" : "Satisfaction",
            },
          },
        },
      },
    };
  }, [matchCounts, satisfactions, logAllowed, useLogScatter]);
  const satisfactionLogWarning = useLogSatisfaction && !logAllowed
    ? "log1p unavailable (values ≤ -1). Showing linear scale."
    : "";
  const scatterLogWarning = useLogScatter && !logAllowed
    ? "log1p unavailable (values ≤ -1). Showing linear scale."
    : "";

  if (!matchLists.length) {
    return null;
  }

  return (
    <div className="solve-charts">
      <ChartCard
        title="Matched vs Unmatched"
        description={`Matched: ${matchedCount} | Unmatched: ${unmatchedCount}`}
        filename={`${safeName}_matched_vs_unmatched.png`}
        chartRef={matchedRef}
      >
        <div className="chart-card-graph">
          <Bar ref={matchedRef} data={matchedData} options={matchedOptions} />
        </div>
      </ChartCard>

      <ChartCard
        title="Match Count per Individual"
        filename={`${safeName}_match_count.png`}
        chartRef={matchCountRef}
      >
        <div className="chart-card-graph">
          <Bar ref={matchCountRef} data={matchCountData} options={matchCountOptions} />
        </div>
      </ChartCard>

      {satisfactionData && (
        <ChartCard
          title="Satisfaction Distribution"
          filename={
            useLogSatisfaction
              ? `${safeName}_satisfaction_distribution_log1p.png`
              : `${safeName}_satisfaction_distribution.png`
          }
          chartRef={satisfactionRef}
          description={satisfactionLogWarning}
          actions={
            <label className="chart-toggle" title="Toggle log1p scaling">
              <input
                type="checkbox"
                checked={useLogSatisfaction}
                onChange={(event) =>
                  setUseLogSatisfaction(event.target.checked)
                }
              />
              log1p
            </label>
          }
        >
          <div className="chart-card-graph">
            <Bar ref={satisfactionRef} data={satisfactionData} options={satisfactionOptions} />
          </div>
        </ChartCard>
      )}

      {matchScatterData && (
        <ChartCard
          title="Match Count vs Satisfaction"
          filename={
            useLogScatter
              ? `${safeName}_match_count_vs_satisfaction_log1p.png`
              : `${safeName}_match_count_vs_satisfaction.png`
          }
          chartRef={matchCountScatterRef}
          description={scatterLogWarning}
          actions={
            <label className="chart-toggle" title="Toggle log1p scaling">
              <input
                type="checkbox"
                checked={useLogScatter}
                onChange={(event) => setUseLogScatter(event.target.checked)}
              />
              log1p
            </label>
          }
        >
          <div className="chart-card-graph">
            <Scatter ref={matchCountScatterRef} data={matchScatterData} options={matchScatterOptions} />
          </div>
        </ChartCard>
      )}
    </div>
  );
}

StableMatchingCharts.propTypes = {
  result: PropTypes.shape({
    matches: PropTypes.shape({
      size: PropTypes.number,
      matches: PropTypes.arrayOf(PropTypes.array),
      leftOvers: PropTypes.arrayOf(PropTypes.number),
    }),
    setSatisfactions: PropTypes.arrayOf(PropTypes.number),
  }),
  problemName: PropTypes.string,
};

StableMatchingCharts.defaultProps = {
  result: null,
  problemName: "stable_matching",
};

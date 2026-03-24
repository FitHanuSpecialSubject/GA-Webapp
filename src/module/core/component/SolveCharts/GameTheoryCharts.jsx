import React, {
  useMemo,
  useRef,
  useState,
  useEffect,
  useId,
} from "react";
import PropTypes from "prop-types";
import { Bar, Scatter } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import ChartCard from "./ChartCard";
import {
  normalizeLabel,
  topN as getTopN,
  isSkewed,
  log1pTransform,
  buildHistogram,
  makeJitter,
  sanitizeFilename,
} from "../../../../utils/solve_chart_utils";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
);

const TOP_N = 20;
const formatPayoffLabel = (value) => {
  if (!Number.isFinite(value)) {
    return "0";
  }
  return value.toLocaleString(undefined, { maximumFractionDigits: 2 });
};

export default function GameTheoryCharts({ result, problemName }) {
  const players = result?.players ?? [];
  const safeName = sanitizeFilename(problemName);
  const maxTopN = Math.max(1, players.length);
  const [topNValue, setTopNValue] = useState(TOP_N);
  const [topNInput, setTopNInput] = useState(String(TOP_N));
  const topNInputId = useId();
  const payoffs = useMemo(() => players.map((p) => p.payoff ?? 0), [players]);
  const logAllowed = useMemo(() => {
    if (!payoffs.length) {
      return false;
    }
    return payoffs.every((v) => v > -1);
  }, [payoffs]);
  const logSuggested = useMemo(() => {
    if (!payoffs.length) {
      return false;
    }
    return logAllowed && isSkewed(payoffs);
  }, [payoffs, logAllowed]);
  const [useLogPayoff, setUseLogPayoff] = useState(false);
  const [useLogStrategy, setUseLogStrategy] = useState(false);

  useEffect(() => {
    setUseLogPayoff(logSuggested);
    setUseLogStrategy(logSuggested);
  }, [logSuggested]);

  useEffect(() => {
    setTopNValue((prev) => Math.min(Math.max(1, prev), maxTopN));
    setTopNInput((prev) => {
      const numeric = Number(prev);
      if (Number.isFinite(numeric)) {
        const clamped = Math.min(Math.max(1, numeric), maxTopN);
        return String(clamped);
      }
      return String(Math.min(TOP_N, maxTopN));
    });
  }, [maxTopN]);

  const payoffByPlayerRef = useRef(null);
  const payoffDistRef = useRef(null);
  const strategyCountRef = useRef(null);
  const payoffByStrategyRef = useRef(null);

  const {
    payoffByPlayerData,
    payoffByPlayerOptions,
    remainingPlayers,
    topCount,
  } = useMemo(() => {
    const { top, remaining } = getTopN(players, topNValue, "payoff");
    const topCount = Math.min(topNValue, players.length);
    return {
      remainingPlayers: remaining,
      topCount,
      payoffByPlayerData: {
        labels: top.map((p) => p.playerName || "Unknown"),
        datasets: [
          {
            label: "Payoff",
            data: top.map((p) => p.payoff ?? 0),
            backgroundColor: "#4C78A8",
          },
        ],
      },
      payoffByPlayerOptions: {
        indexAxis: "y",
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          title: {
            display: true,
            text: `Payoff by Player (Top-${topCount})`,
          },
        },
        scales: {
          x: {
            title: { display: true, text: "Payoff" },
            beginAtZero: true,
          },
        },
      },
    };
  }, [players, topNValue]);
  const payoffByPlayerLayout = useMemo(() => {
    const rows = Math.max(topCount, 1);
    const rowHeight = 22;
    const basePadding = 140;
    const contentHeight = rows * rowHeight + basePadding;
    const maxVisibleHeight = 720;
    const visibleHeight = Math.max(260, Math.min(maxVisibleHeight, contentHeight));
    return {
      contentHeight,
      visibleHeight,
      needsScroll: contentHeight > maxVisibleHeight,
    };
  }, [topCount]);
  const payoffByPlayerChartKey = useMemo(
    () =>
      `payoff-by-player-${topCount}-${payoffByPlayerLayout.contentHeight}`,
    [topCount, payoffByPlayerLayout.contentHeight],
  );

  const { payoffDistributionData, payoffDistributionOptions } = useMemo(() => {
    if (!payoffs.length) {
      return { payoffDistributionData: null, payoffDistributionOptions: null };
    }

    const canApplyLog = logAllowed && useLogPayoff;
    const useLog = canApplyLog;
    const values = useLog ? log1pTransform(payoffs) : payoffs;
    const label = useLog ? "log1p(Payoff)" : "Payoff";

    const { labels, counts } = buildHistogram(values, 30);
    const maxCount = counts.length ? Math.max(...counts) : 0;
    const yTicks = { precision: 0 };
    if (maxCount <= 5) {
      yTicks.stepSize = 1;
    }
    return {
      payoffDistributionData: {
        labels,
        datasets: [
          {
            label: "Count",
            data: counts,
            backgroundColor: "#72B7B2",
          },
        ],
      },
      payoffDistributionOptions: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          title: {
            display: true,
            text: useLog
              ? "Payoff Distribution (log1p)"
              : "Payoff Distribution",
          },
        },
        scales: {
          x: {
            title: { display: true, text: label },
            ticks: { maxTicksLimit: 6 },
          },
          y: {
            title: { display: true, text: "Count" },
            beginAtZero: true,
            ticks: yTicks,
          },
        },
      },
    };
  }, [payoffs, logAllowed, useLogPayoff]);

  const {
    strategyCountData,
    strategyCountOptions,
    payoffByStrategyData,
    payoffByStrategyOptions,
  } = useMemo(() => {
      const grouped = {};
      players.forEach((player) => {
        const strategy = normalizeLabel(player.strategyName);
        if (!grouped[strategy]) {
          grouped[strategy] = [];
        }
        grouped[strategy].push(player.payoff ?? 0);
      });
      const strategyLabels = Object.keys(grouped);

      const counts = strategyLabels.map((label) => grouped[label].length);
      const payoffValues = strategyLabels.flatMap((label) =>
        grouped[label].map((value) => ({
          strategy: label,
          payoff: value,
        })),
      );
      const useLog = logAllowed && useLogStrategy;
      const xLabel = useLog ? "log1p(Payoff)" : "Payoff";
      const chartTitle = useLog
        ? "Payoff by Strategy (Points, log1p)"
        : "Payoff by Strategy (Points)";
      const jitter = makeJitter(payoffValues.length, 0.08);
      let index = 0;
      const points = payoffValues.map((entry) => {
        const y = strategyLabels.indexOf(entry.strategy) + jitter[index];
        const transformedPayoff = useLog
          ? Math.log1p(entry.payoff)
          : entry.payoff;
        const point = { x: entry.payoff, y, strategy: entry.strategy };
        index += 1;
        return {
          ...point,
          x: transformedPayoff,
          rawPayoff: entry.payoff,
        };
      });

      return {
        strategyCountData: {
          labels: strategyLabels,
          datasets: [
            {
              label: "Player Count",
              data: counts,
              backgroundColor: "#F58518",
            },
          ],
        },
        strategyCountOptions: {
          indexAxis: "y",
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            title: { display: true, text: "Strategy Counts" },
          },
          scales: {
            x: {
              title: { display: true, text: "Player Count" },
              beginAtZero: true,
            },
          },
        },
        payoffByStrategyData: {
          datasets: [
            {
              label: "Payoff",
              data: points,
              backgroundColor: "#54A24B",
              pointRadius: 5,
            },
          ],
        },
        payoffByStrategyOptions: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            title: { display: true, text: chartTitle },
            tooltip: {
              callbacks: {
                label: (context) => {
                  const strategy =
                    context.raw?.strategy || strategyLabels[context.raw?.y];
                  const rawPayoff =
                    context.raw?.rawPayoff ?? context.parsed.x;
                  return `${strategy}: ${rawPayoff}`;
                },
              },
            },
          },
          scales: {
            x: {
              title: { display: true, text: xLabel },
              beginAtZero: true,
            },
            y: {
              ticks: {
                stepSize: 1,
                callback: (value) => strategyLabels[value] ?? "",
              },
            },
          },
        },
      };
    }, [players, logAllowed, useLogStrategy]);
  const payoffLogWarning = useLogPayoff && !logAllowed
    ? "log1p unavailable (values ≤ -1). Showing linear scale."
    : "";
  const strategyLogWarning = useLogStrategy && !logAllowed
    ? "log1p unavailable (values ≤ -1). Showing linear scale."
    : "";

  if (!players.length) {
    return null;
  }

  return (
    <div className="solve-charts">
      <ChartCard
        title={`Payoff by Player (Top-${topCount})`}
        description={
          remainingPlayers > 0
            ? `Remaining players: ${remainingPlayers}`
            : ""
        }
        filename={`${safeName}_payoff_by_player.png`}
        chartRef={payoffByPlayerRef}
        actions={
          <div className="chart-control">
            <input
              id={topNInputId}
              className="chart-number-input"
              type="number"
              min={1}
              max={maxTopN}
              value={topNInput}
              aria-label="Top N"
              onChange={(event) => {
                const value = event.target.value;
                setTopNInput(value);
                const numeric = parseInt(value, 10);
                if (Number.isNaN(numeric)) {
                  return;
                }
                const clamped = Math.min(Math.max(1, numeric), maxTopN);
                setTopNValue(clamped);
              }}
              onBlur={() => {
                const numeric = parseInt(topNInput, 10);
                const fallback = Math.min(TOP_N, maxTopN);
                const clamped = Number.isNaN(numeric)
                  ? topNValue || fallback
                  : Math.min(Math.max(1, numeric), maxTopN);
                setTopNValue(clamped);
                setTopNInput(String(clamped));
              }}
            />
            <span className="chart-control-hint">of {maxTopN}</span>
          </div>
        }
      >
        <div
          className={`chart-card-graph ${
            payoffByPlayerLayout.needsScroll ? "chart-card-graph--scroll" : ""
          }`}
          style={{ height: payoffByPlayerLayout.visibleHeight }}
        >
          <div style={{ height: payoffByPlayerLayout.contentHeight }}>
            <Bar
              key={payoffByPlayerChartKey}
              ref={payoffByPlayerRef}
              data={payoffByPlayerData}
              options={payoffByPlayerOptions}
              height={payoffByPlayerLayout.contentHeight}
              redraw
            />
          </div>
        </div>
      </ChartCard>

      {payoffDistributionData && (
        <ChartCard
          title="Payoff Distribution"
        filename={
          useLogPayoff
            ? `${safeName}_payoff_distribution_log1p.png`
            : `${safeName}_payoff_distribution.png`
        }
        chartRef={payoffDistRef}
        description={payoffLogWarning}
        actions={
          <label className="chart-toggle" title="Toggle log1p scaling">
            <input
              type="checkbox"
              checked={useLogPayoff}
              onChange={(event) => setUseLogPayoff(event.target.checked)}
            />
            log1p
          </label>
        }
      >
        <div className="chart-card-graph">
            {payoffDistributionData.datasets[0]?.data?.[0]?.x !== undefined ? (
              <Scatter ref={payoffDistRef} data={payoffDistributionData} options={payoffDistributionOptions} />
            ) : (
              <Bar ref={payoffDistRef} data={payoffDistributionData} options={payoffDistributionOptions} />
            )}
          </div>
        </ChartCard>
      )}

      <ChartCard
        title="Strategy Counts"
        filename={`${safeName}_strategy_counts.png`}
        chartRef={strategyCountRef}
      >
        <div className="chart-card-graph">
          <Bar ref={strategyCountRef} data={strategyCountData} options={strategyCountOptions} />
        </div>
      </ChartCard>

      <ChartCard
        title="Payoff by Strategy (Points)"
        filename={
          useLogStrategy
            ? `${safeName}_payoff_by_strategy_log1p.png`
            : `${safeName}_payoff_by_strategy.png`
        }
        chartRef={payoffByStrategyRef}
        description={strategyLogWarning}
        actions={
          <label className="chart-toggle" title="Toggle log1p scaling">
            <input
              type="checkbox"
              checked={useLogStrategy}
              onChange={(event) => setUseLogStrategy(event.target.checked)}
            />
            log1p
          </label>
        }
      >
        <div className="chart-card-graph">
          <Scatter ref={payoffByStrategyRef} data={payoffByStrategyData} options={payoffByStrategyOptions} />
        </div>
      </ChartCard>
    </div>
  );
}

GameTheoryCharts.propTypes = {
  result: PropTypes.shape({
    players: PropTypes.arrayOf(
      PropTypes.shape({
        playerName: PropTypes.string,
        strategyName: PropTypes.string,
        payoff: PropTypes.number,
      }),
    ),
  }),
  problemName: PropTypes.string,
};

GameTheoryCharts.defaultProps = {
  result: null,
  problemName: "game_theory",
};

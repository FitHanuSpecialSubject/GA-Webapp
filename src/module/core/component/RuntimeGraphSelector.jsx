import React, { useState, Suspense, lazy } from "react";

const ScatterChart        = lazy(() => import("./Graphs/ScatterGraph"));
const AreaChart           = lazy(() => import("./Graphs/AreaChart"));
const InsightsGraph       = lazy(() => import("./Graphs/InsightsGraph"));
const HorizontalBarChart  = lazy(() => import("./Graphs/HorizontalBarChart"));
const Histogram           = lazy(() => import("./Graphs/Histogram"));

const GRAPH_TYPES = {
  0: {
    name: "Line plot",
    component: InsightsGraph,
  },
  1: {
    name: "Horizontal bar chart",
    component: HorizontalBarChart,
  },
  2: {
    name: "Histogram",
    component: Histogram,
  },
  3: {
    name: "Scatter plots",
    component: ScatterChart,
  },
  4: {
    name: "Area chart",
    component: AreaChart,
  },
};

const RuntimeGraphSelector = ({ data }) => {
  const ordinalOptions = Object.keys(GRAPH_TYPES).map(Number);
  const [selectedGraphType, setSelectedType] = useState(0);

  const handleGraphChange = (e) => {
    const type = parseInt(e.target.value, 10);
    if (isNaN(type) || !ordinalOptions.includes(type)) {
      setSelectedType(0);
    } else {
      setSelectedType(type);
    }
  };

  const SelectedGraphComponent = GRAPH_TYPES[selectedGraphType].component;
  return (
    <div>
      <div className="runtime-graph-selector">
        <label htmlFor="graphSelector">Graph type: </label>
        <select
          id="graphSelector"
          value={selectedGraphType}
          onChange={handleGraphChange}
          style={{ marginLeft: 10, marginBottom: 20 }}
        >
          {Object.entries(GRAPH_TYPES).map(([key, { name }]) => (
            <option key={key} value={key}>
              {name}
            </option>
          ))}
        </select>
      </div>

      <div style={{ marginTop: "1rem" }}>
        {SelectedGraphComponent && (
          <Suspense fallback={<div>Loading graph...</div>}>
            <SelectedGraphComponent data={data} />
          </Suspense>
        )}
      </div>
    </div>
  );
};

export default RuntimeGraphSelector;
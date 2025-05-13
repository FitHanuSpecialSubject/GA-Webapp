import React from 'react';
import PropTypes from 'prop-types';
import InsightsGraph from './InsightsGraph';
import HorizontalBarChart from './Graphs/HorizontalBarChart';

// Array of available graph types
export const GRAPH_TYPES = [
  {
    id: 'line',
    name: 'Line Chart',
    component: InsightsGraph
  },
  {
    id: 'horizontal-bar',
    name: 'Horizontal Bar Chart',
    component: HorizontalBarChart
  }
];

export default function RuntimeGraphSelector({ graphType, data, title }) {
  // Find the selected graph type
  const selectedGraph = GRAPH_TYPES.find(graph => graph.id === graphType) || GRAPH_TYPES[0];
  const GraphComponent = selectedGraph.component;
  
  // Handle data for each graph type
  if (GraphComponent === InsightsGraph) {
    // InsightsGraph expects "runtimes" prop
    return (
      <div className="runtime-graph-selector">
        <InsightsGraph runtimes={data} />
      </div>
    );
  } else {
    // HorizontalBarChart expects "data" and "title" props
    return (
      <div className="runtime-graph-selector">
        <GraphComponent data={data} title={title} />
      </div>
    );
  }
}

RuntimeGraphSelector.propTypes = {
  graphType: PropTypes.string,
  data: PropTypes.object.isRequired,
  title: PropTypes.string
}; 
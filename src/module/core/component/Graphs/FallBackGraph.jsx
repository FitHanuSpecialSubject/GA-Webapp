import React from "react";
import PropTypes from "prop-types";
import { Line } from "react-chartjs-2";

export default function FallBackGraph({ data }) {
  const runtimes = data.runtimes;
  const fitnessValues = data.fitnessValues;
  return <pre>{JSON.stringify(runtimes, null, 2)}</pre>;
}

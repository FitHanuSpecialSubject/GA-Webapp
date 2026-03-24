import React, { useState, useEffect, useCallback } from "react";
import PropTypes from "prop-types";
import {
  getAlgorithmConfig,
  getDefaultParams,
} from "../../../../const/algorithmParamsConfig";
import "./style.scss";

function Tooltip({ text }) {
  const [visible, setVisible] = useState(false);

  return (
    <span
      className="acp-tooltip-wrapper"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
    >
      <i className="acp-tooltip-icon fa-solid fa-circle-info" />
      {visible && <span className="acp-tooltip-text">{text}</span>}
    </span>
  );
}

Tooltip.propTypes = {
  text: PropTypes.string.isRequired,
};

function SliderInput({ paramKey, config, value, onChange }) {
  return (
    <div className="acp-param-row">
      <div className="acp-param-label">
        <span>{config.displayName}</span>
        <Tooltip text={config.tooltip} />
      </div>
      <div className="acp-slider-group">
        <input
          type="range"
          className="acp-slider"
          min={config.min}
          max={config.max}
          step={config.step}
          value={value}
          onChange={(e) => onChange(paramKey, Number(e.target.value))}
        />
        <input
          type="number"
          className="acp-slider-value"
          min={config.min}
          max={config.max}
          step={config.step}
          value={value}
          onChange={(e) => {
            const val = Number(e.target.value);
            if (val >= config.min && val <= config.max) {
              onChange(paramKey, val);
            }
          }}
        />
      </div>
    </div>
  );
}

SliderInput.propTypes = {
  paramKey: PropTypes.string.isRequired,
  config: PropTypes.object.isRequired,
  value: PropTypes.number.isRequired,
  onChange: PropTypes.func.isRequired,
};

function DropdownInput({ paramKey, config, value, onChange }) {
  return (
    <div className="acp-param-row">
      <div className="acp-param-label">
        <span>{config.displayName}</span>
        <Tooltip text={config.tooltip} />
      </div>
      <select
        className="acp-dropdown"
        value={value}
        onChange={(e) => onChange(paramKey, e.target.value)}
      >
        {config.options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </div>
  );
}

DropdownInput.propTypes = {
  paramKey: PropTypes.string.isRequired,
  config: PropTypes.object.isRequired,
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
};

function CheckboxInput({ paramKey, config, value, onChange }) {
  return (
    <div className="acp-param-row">
      <div className="acp-param-label">
        <span>{config.displayName}</span>
        <Tooltip text={config.tooltip} />
      </div>
      <label className="acp-checkbox-label">
        <input
          type="checkbox"
          className="acp-checkbox"
          checked={value}
          onChange={(e) => onChange(paramKey, e.target.checked)}
        />
        <span>{value ? "Enabled" : "Disabled"}</span>
      </label>
    </div>
  );
}

CheckboxInput.propTypes = {
  paramKey: PropTypes.string.isRequired,
  config: PropTypes.object.isRequired,
  value: PropTypes.bool.isRequired,
  onChange: PropTypes.func.isRequired,
};

function NumberInput({ paramKey, config, value, onChange }) {
  return (
    <div className="acp-param-row">
      <div className="acp-param-label">
        <span>{config.displayName}</span>
        <Tooltip text={config.tooltip} />
      </div>
      <input
        type="number"
        className="acp-number-input"
        min={config.min}
        max={config.max}
        step={config.step}
        value={value}
        placeholder={config.default === "" ? "Leave empty for default" : ""}
        onChange={(e) => {
          const raw = e.target.value;
          onChange(paramKey, raw === "" ? "" : Number(raw));
        }}
      />
    </div>
  );
}

NumberInput.propTypes = {
  paramKey: PropTypes.string.isRequired,
  config: PropTypes.object.isRequired,
  value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  onChange: PropTypes.func.isRequired,
};

const INPUT_COMPONENTS = {
  slider: SliderInput,
  dropdown: DropdownInput,
  checkbox: CheckboxInput,
  number: NumberInput,
};

export default function AlgorithmConfigurationPanel({
  algorithm,
  onParamsChange,
}) {
  const [paramValues, setParamValues] = useState({});
  const algorithmConfig = getAlgorithmConfig(algorithm);

  // Reset params when algorithm changes
  useEffect(() => {
    const defaults = getDefaultParams(algorithm);
    setParamValues(defaults);
  }, [algorithm]);

  // Notify parent of param changes (compute maxEvaluations as derived)
  useEffect(() => {
    if (onParamsChange && Object.keys(paramValues).length > 0) {
      const output = { ...paramValues };
      // Compute derived maxEvaluations
      if (output.populationSize && output.generation) {
        output.maxEvaluations = output.populationSize * output.generation;
      }
      // Remove empty randomSeed
      if (output.randomSeed === "" || output.randomSeed === undefined) {
        delete output.randomSeed;
      }
      onParamsChange(output);
    }
  }, [paramValues, onParamsChange]);

  const handleParamChange = useCallback((key, value) => {
    setParamValues((prev) => ({ ...prev, [key]: value }));
  }, []);

  const handleResetDefaults = useCallback(() => {
    const defaults = getDefaultParams(algorithm);
    setParamValues(defaults);
  }, [algorithm]);

  if (!algorithmConfig) {
    return null;
  }

  return (
    <div className="acp-container">
      <div className="acp-header">
        <h3 className="acp-title">
          <i className="fa-solid fa-sliders" />
          {algorithmConfig.displayName} Parameters
        </h3>
        <button
          type="button"
          className="acp-reset-btn"
          onClick={handleResetDefaults}
          title="Reset to default values"
        >
          <i className="fa-solid fa-rotate-left" /> Reset
        </button>
      </div>

      <div className="acp-params-grid">
        {Object.entries(algorithmConfig.params).map(([key, config]) => {
          const InputComponent = INPUT_COMPONENTS[config.type];
          if (!InputComponent) return null;

          const value =
            paramValues[key] !== undefined ? paramValues[key] : config.default;

          return (
            <InputComponent
              key={`${algorithm}-${key}`}
              paramKey={key}
              config={config}
              value={value}
              onChange={handleParamChange}
            />
          );
        })}
      </div>
    </div>
  );
}

AlgorithmConfigurationPanel.propTypes = {
  algorithm: PropTypes.string.isRequired,
  onParamsChange: PropTypes.func.isRequired,
};

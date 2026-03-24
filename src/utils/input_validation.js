const INTEGER_PATTERN = /^-?\d+$/;
const FORMULA_ALLOWED_PATTERN = /^[a-zA-Z0-9\s+\-*/^(),.{}]+$/;

const normalizeValue = (value) => {
  if (typeof value === "string") {
    return value.trim();
  }
  if (value == null) {
    return "";
  }
  return String(value).trim();
};

export const parseIntegerInput = (value) => {
  const normalizedValue = normalizeValue(value);

  if (normalizedValue.length === 0) {
    return {
      isEmpty: true,
      isValid: false,
      value: null,
    };
  }

  if (!INTEGER_PATTERN.test(normalizedValue)) {
    return {
      isEmpty: false,
      isValid: false,
      value: null,
    };
  }

  return {
    isEmpty: false,
    isValid: true,
    value: Number(normalizedValue),
  };
};

export const validateRequiredIntegerField = ({ label, value, min, max }) => {
  const parsed = parseIntegerInput(value);

  if (parsed.isEmpty) {
    return `${label} must not be empty`;
  }

  if (!parsed.isValid) {
    return `${label} must be an integer`;
  }

  if (Number.isInteger(min) && parsed.value < min) {
    return `${label} must be at least ${min}`;
  }

  if (Number.isInteger(max) && parsed.value > max) {
    return `${label} must be at most ${max}`;
  }

  return "";
};

export const validateOptionalIntegerField = ({ label, value, min, max }) => {
  const parsed = parseIntegerInput(value);

  if (parsed.isEmpty) {
    return "";
  }

  if (!parsed.isValid) {
    return `${label} must be an integer`;
  }

  if (Number.isInteger(min) && parsed.value < min) {
    return `${label} must be at least ${min}`;
  }

  if (Number.isInteger(max) && parsed.value > max) {
    return `${label} must be at most ${max}`;
  }

  return "";
};

const hasBalancedDelimiters = (value) => {
  const closingPairs = {
    ")": "(",
    "}": "{",
  };
  const stack = [];

  for (const char of value) {
    if (char === "(" || char === "{") {
      stack.push(char);
    }

    if (char === ")" || char === "}") {
      if (stack.pop() !== closingPairs[char]) {
        return false;
      }
    }
  }

  return stack.length === 0;
};

export const validateFormulaField = ({ label, value }) => {
  const normalizedValue = normalizeValue(value);

  if (normalizedValue.length === 0) {
    return "";
  }

  if (!FORMULA_ALLOWED_PATTERN.test(normalizedValue)) {
    return `${label} contains unsupported characters`;
  }

  if (!hasBalancedDelimiters(normalizedValue)) {
    return `${label} has invalid syntax`;
  }

  return "";
};

export const buildValidationSummary = (fields) => {
  const uniqueFields = [...new Set(fields.filter(Boolean))];

  if (!uniqueFields.length) {
    return "";
  }

  return `Please fix the highlighted fields before continuing: ${uniqueFields.join(", ")}.`;
};

export const normalizeErrorMessage = (error, fallbackMessage) => {
  if (typeof error === "string" && error.trim().length > 0) {
    return error.trim();
  }

  if (error instanceof Error && error.message.trim().length > 0) {
    return error.message.trim();
  }

  return fallbackMessage;
};

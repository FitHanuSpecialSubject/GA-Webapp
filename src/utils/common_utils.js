export const isNullOrUndefined = (obj) => {
  return obj === null || obj === undefined;
};

export const genRandom = (range, isDecimal) => {
  if (range[0] === range[1]) return range[0];
  if (isDecimal) return range[0] + Math.random() * (range[1] - range[0]);
  else return Math.round(range[0] + Math.random() * (range[1] - range[0]));
};

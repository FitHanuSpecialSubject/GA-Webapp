export const validateExcelFile = (file) => {
  if (!file?.name || !file.name.includes(".")) {
    return false;
  }

  const extension = file.name.split(".").pop().toLowerCase();
  return extension === "xlsx" || extension === "xlsm";
};

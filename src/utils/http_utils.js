import { isStringNullOrEmpty } from "./string_utils";

export function getBackendAddress() {
  const protocol = process.env.REACT_APP_BACKEND_PROTOCOL;
  const url = process.env.REACT_APP_BACKEND_URL;
  const port = isStringNullOrEmpty(process.env.REACT_APP_BACKEND_PORT)
    ? ""
    : `:${process.env.REACT_APP_BACKEND_PORT}`;
  return `${protocol}://${url}${port}`;
}

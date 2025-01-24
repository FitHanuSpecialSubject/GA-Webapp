import { isStringNullOrEmpty } from "./string_utils";

export function getBackendAddress() {
  const protocol = import.meta.env.VITE_BACKEND_PROTOCOL;
  const url = import.meta.env.VITE_BACKEND_URL;
  const port = isStringNullOrEmpty(import.meta.env.VITE_BACKEND_PORT)
    ? ""
    : `:${import.meta.env.VITE_BACKEND_PORT}`;
  return `${protocol}://${url}${port}`;
}

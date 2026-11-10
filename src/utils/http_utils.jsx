import { isStringNullOrEmpty } from "./string_utils";
import axios, { AxiosError } from "axios";
import { ERROR } from "../const/error_const";
import React from "react";

const JOB_POLL_INTERVAL_MS = 3000;
const JOB_POLL_MAX_FAILURES = 5;

export function getBackendAddress() {
  const protocol = import.meta.env.VITE_BACKEND_PROTOCOL;
  const url = import.meta.env.VITE_BACKEND_URL;
  const port = isStringNullOrEmpty(import.meta.env.VITE_BACKEND_PORT)
    ? ""
    : `:${import.meta.env.VITE_BACKEND_PORT}`;
  return `${protocol}://${url}${port}`;
}

/**
 * Solve a problem as a background job, so no single HTTP request has to stay
 * open until the computation finishes (proxies like Cloudflare cut requests
 * after ~120s). Submits to /api/jobs/<solver> then polls until it is done.
 *
 * @param {string} path synchronous endpoint, e.g. "/api/game-theory-solver".
 * @param {object} body request body of that endpoint.
 * @returns {Promise<{data: object}>} same shape as `axios.post(path, body)`.
 */
export async function solveAsync(path, body) {
  const base = getBackendAddress();
  const submitted = await axios.post(
    `${base}${path.replace(/^\/api\//, "/api/jobs/")}`,
    body,
  );
  const jobId = submitted.data.data.jobId;

  let failures = 0;
  for (;;) {
    await new Promise((resolve) => setTimeout(resolve, JOB_POLL_INTERVAL_MS));
    try {
      const poll = await axios.get(`${base}/api/jobs/${jobId}`);
      failures = 0;
      const { status, result } = poll.data.data;
      if (status === "DONE" || status === "ERROR") {
        return { data: result };
      }
    } catch (err) {
      // Tolerate short network / proxy hiccups, give up on real client errors.
      const transient = !err.response || err.response.status >= 500;
      if (!transient || ++failures >= JOB_POLL_MAX_FAILURES) {
        throw err;
      }
    }
  }
}

export function axiosErrorHandler(err) {
  console.error(err);
  // Handle Errors
  if (err instanceof AxiosError) {
    let title;
    let message;
    if (err.response) {
      title = `Error ${err.response.status}`;
      message = err.response.data.message;
      if (err.response.status === 400) {
        title = err.response.data.message;
        message = (
          <>
            <div className="fw-bold fs-6 mb-1">Error details:</div>
            <div>
              {err.response.data.details.map((detail, index) => {
                return (
                  <div className="mb-1" key={"errDetail_" + index}>
                    <span className="fw-bold">{"- " + detail.field}</span>
                    {": "}
                    <span className="text-danger">{detail.message}</span>.
                    <div>
                      Current value:{" "}
                      <span style={{ color: "#a9bc07" }}>
                        {typeof detail.value === "object"
                          ? detail.value.join(", ")
                          : detail.value}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        );
      } else if (err.response.status in ERROR) {
        message = ERROR[err.response.status].message;
      } else {
        message = "Please contact admin.";
      }
    } else if (err.request) {
      title = "No response received";
      message = "Server maybe down at the moment!";
    } else {
      title = "Error setting up request";
      message = `${err.message}`;
    }
    return { title, message };
  } else {
    return {
      title: "Running failed",
      message: "An unknown error occurred! Please contact the admin!",
    };
  }
}

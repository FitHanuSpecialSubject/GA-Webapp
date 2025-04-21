import { isStringNullOrEmpty } from "./string_utils";
import { AxiosError } from "axios";
import { ERROR } from "../const/error_const";
import React from "react";

export function getBackendAddress() {
  const protocol = import.meta.env.VITE_BACKEND_PROTOCOL;
  const url = import.meta.env.VITE_BACKEND_URL;
  const port = isStringNullOrEmpty(import.meta.env.VITE_BACKEND_PORT)
    ? ""
    : `:${import.meta.env.VITE_BACKEND_PORT}`;
  return `${protocol}://${url}${port}`;
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

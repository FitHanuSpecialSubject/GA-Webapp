export const ERROR = {
  400: {
    message:
      "Bad Request: The server couldn't understand your request. Please verify your data format and try again.",
  },
  404: {
    message:
      "Not Found: The requested resource could not be found. Please check the URL or input parameters.",
  },
  408: {
    message:
      "Request Timeout: The server timed out waiting for the request. Please check your network and try again.",
  },
  409: {
    message:
      "Conflict: There was a conflict with the current state of the resource. Someone may have modified the data.",
  },
  413: {
    message:
      "Payload Too Large: Your request data is too large. Please reduce the size of your input file.",
  },
  422: {
    message:
      "Unprocessable Entity: The request data is valid but cannot be processed. Please check your input format.",
  },
  429: {
    message:
      "Too Many Requests: You've sent too many requests in a given time. Please try again later.",
  },
  500: {
    message:
      "Internal Server Error: Something went wrong on the server. Make sure the backend is running and try again.",
  },
  502: {
    message:
      "Bad Gateway: The server received an invalid response from the upstream server. Please try again later.",
  },
  503: {
    message:
      "Service Unavailable: The backend server is temporarily unavailable. Please try again later.",
  },
  504: {
    message:
      "Gateway Timeout: The backend took too long to respond. Please try again later or contact support.",
  },
};

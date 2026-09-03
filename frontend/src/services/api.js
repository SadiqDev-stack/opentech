/**
 * The single API client for OpenTech.
 *
 * Every service file in src/services uses this. Nothing else should call fetch
 * directly, and no component should ever hardcode a backend URL.
 */

export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
export const USE_MOCK_DATA = String(import.meta.env.VITE_USE_MOCK_DATA ?? "true") !== "false";

const TOKEN_KEY = "opentech_token";

export function getToken() {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  if (typeof window === "undefined") return;
  if (token) window.localStorage.setItem(TOKEN_KEY, token);
  else window.localStorage.removeItem(TOKEN_KEY);
}

/** Error object thrown by the client so pages can branch on status. */
export class ApiError extends Error {
  constructor(status, message, errors) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.errors = errors || null;
  }
}

/** Friendly copy for each status the backend documents. */
export function messageForStatus(status, fallback) {
  switch (status) {
    case 401:
      return "Your session has expired. Please sign in again.";
    case 403:
      return "This action is not allowed.";
    case 404:
      return "We could not find what you were looking for.";
    case 409:
      return fallback || "That already exists.";
    case 422:
      return fallback || "Please check the highlighted fields and try again.";
    case 429:
      return "Too many attempts. Please wait a moment and try again.";
    case 500:
    case 502:
    case 503:
      return "Something went wrong on our end. Please try again shortly.";
    default:
      return fallback || "Something went wrong. Please try again.";
  }
}

export async function request(path, options = {}) {
  const { method = "GET", body, params, headers = {} } = options;

  let url = `${API_URL}${path}`;
  if (params) {
    const search = new URLSearchParams(
      Object.entries(params).filter(
        ([, value]) => value !== undefined && value !== "" && value !== null,
      ),
    ).toString();
    if (search) url += `?${search}`;
  }

  const token = getToken();

  let response;
  try {
    response = await fetch(url, {
      method,
      credentials: "include",
      headers: {
        Accept: "application/json",
        ...(body ? { "Content-Type": "application/json" } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...headers,
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });
  } catch {
    throw new ApiError(0, "Network error. Check your connection and try again.");
  }

  if (response.status === 204) return { success: true, data: null };

  let payload = null;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (!response.ok) {
    throw new ApiError(
      response.status,
      messageForStatus(response.status, payload?.message),
      payload?.errors,
    );
  }

  return payload;
}

export const api = {
  get: (path, params) => request(path, { method: "GET", params }),
  post: (path, body) => request(path, { method: "POST", body }),
  patch: (path, body) => request(path, { method: "PATCH", body }),
  put: (path, body) => request(path, { method: "PUT", body }),
  delete: (path) => request(path, { method: "DELETE" }),
};

/** Wraps mock data in the same envelope the backend returns. */
export function mockResponse(data, message = "Request successful", delay = 350) {
  return new Promise((resolve) => {
    setTimeout(() => resolve({ success: true, message, data }), delay);
  });
}

/** Lets a service reject with the same shape as a real API failure. */
export function mockError(status, message) {
  return Promise.reject(new ApiError(status, messageForStatus(status, message)));
}

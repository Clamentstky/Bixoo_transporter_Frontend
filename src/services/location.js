import { errorMessage } from "./session";

export function locationError(error) {
  if (error.code === "ECONNABORTED") return "The location server timed out. Check your connection and try again.";
  if (error.code === "ERR_NETWORK") return "Cannot reach the location server. Check your connection; live updates will retry.";
  if (error.response?.status >= 500) return "The location server is unavailable. Please try again shortly.";
  if (error.response?.status === 401) return "Your session expired. Sign in again to continue tracking.";
  return errorMessage(error);
}

export function clearAccountCache() {
  for (const key of Object.keys(localStorage)) {
    if (key.startsWith("transporter_") || key.startsWith("trip_documents_") || key === "active_trip") localStorage.removeItem(key);
  }
}
export function clearSession() {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
  clearAccountCache();
}
export function storeTokens(data) {
  localStorage.setItem("access_token", data.access_token);
  localStorage.setItem("refresh_token", data.refresh_token);
}
export function errorMessage(error, fallback = "Unable to complete the request. Please try again.") {
  const detail = error.response?.data?.detail || error.detail;
  if (Array.isArray(detail)) return detail.map(item => item.msg).join(". ");
  return (typeof detail === "string" && detail) || error.response?.data?.message || error.message || fallback;
}

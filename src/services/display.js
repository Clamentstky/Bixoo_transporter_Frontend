// MySQL DATETIME values in this application are stored as UTC.
export function formatDate(value) {
  if (!value) return "Not recorded";
  const date = new Date(/(?:Z|[+-]\d{2}:\d{2})$/i.test(value) ? value : `${value}Z`);
  return Number.isNaN(date.getTime()) ? "Not recorded" : date.toLocaleString();
}

export function pageNumber(value) {
  const number = Number(value);
  return Number.isSafeInteger(number) && number > 0 ? number : 1;
}

export const API_HOST =
  import.meta.env.VITE_API_URL || "http://localhost:5000";

export const apiFile = (url?: string) => {
  if (!url) return "";
  if (url.startsWith("http")) return url;
  return `${API_HOST}${url}`;
};

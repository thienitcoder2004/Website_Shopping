const IMG_FALLBACK =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(`
  <svg xmlns="http://www.w3.org/2000/svg" width="96" height="96">
    <defs>
      <linearGradient id="g" x1="0" x2="1" y1="0" y2="1">
        <stop stop-color="#e2e8f0" offset="0"/>
        <stop stop-color="#f1f5f9" offset="1"/>
      </linearGradient>
    </defs>
    <rect width="100%" height="100%" rx="18" fill="url(#g)"/>
    <text x="50%" y="52%" dominant-baseline="middle" text-anchor="middle"
      font-family="Arial" font-size="14" fill="#64748b">No Image</text>
  </svg>
`);

export function getFallbackImage() {
  return IMG_FALLBACK;
}

/** ghép url ảnh từ backend nếu DB lưu dạng "/uploads/..." */
export function resolveImgUrl(url?: string) {
  if (!url) return "";

  const isAbsolute =
    /^(https?:)?\/\//.test(url) || url.startsWith("data:") || url.startsWith("blob:");

  if (isAbsolute) return url;

  const base = import.meta.env.VITE_API_URL; // ✅ không any
  const normalized = url.startsWith("/") ? url : `/${url}`;
  return `${base}${normalized}`;
}

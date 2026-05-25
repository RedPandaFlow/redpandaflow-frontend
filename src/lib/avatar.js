const apiBase = import.meta.env.VITE_API_URL ?? "http://localhost:5090/api";
const apiOrigin = apiBase.replace(/\/api\/?$/, "");

export function resolveAvatarUrl(src) {
  if (!src) return null;
  if (/^https?:\/\//.test(src)) return src;
  return `${apiOrigin}${src}`;
}

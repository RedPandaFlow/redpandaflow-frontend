import { resolveAvatarUrl } from "@/lib/avatar";

export function UserAvatar({ name, src, size = 36 }) {
  const initial = (name || "?").charAt(0).toUpperCase();
  const resolved = resolveAvatarUrl(src);

  if (resolved) {
    return (
      <img
        src={resolved}
        alt={name}
        className="rounded-full border border-[#EDE0D4] object-cover"
        style={{ width: size, height: size }}
      />
    );
  }

  return (
    <div
      className="flex items-center justify-center rounded-full border border-orange-100 bg-orange-100 font-bold text-[#EA580C]"
      style={{ width: size, height: size, fontSize: Math.round(size * 0.42) }}
    >
      {initial}
    </div>
  );
}

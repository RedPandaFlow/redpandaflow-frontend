export function UserAvatar({ name, src, size = 36 }) {
  const initial = (name || "?").charAt(0).toUpperCase();

  if (src) {
    return (
      <img
        src={src}
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

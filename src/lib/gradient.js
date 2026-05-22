const gradients = [
  "from-orange-400 to-orange-600",
  "from-amber-400 to-orange-500",
  "from-rose-400 to-orange-500",
  "from-orange-500 to-red-500",
  "from-amber-500 to-rose-500",
];

export const gradientFor = (key) => {
  const text = String(key ?? "");
  let sum = 0;
  for (let i = 0; i < text.length; i += 1) sum += text.charCodeAt(i);
  return gradients[sum % gradients.length];
};

import { useEffect } from "react";
import { X } from "@phosphor-icons/react";

const sizeClasses = {
  md: "max-w-md",
  xl: "max-w-4xl",
};

export function Dialog({ open, onClose, title, description, children, size = "md" }) {
  useEffect(() => {
    if (!open) return;
    const handleKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className={`relative z-10 w-full ${sizeClasses[size] ?? sizeClasses.md} rounded-2xl border border-[#EDE0D4] bg-white shadow-2xl`}>
        <div className="flex items-start justify-between gap-4 px-6 pt-6 pb-2">
          <div className="min-w-0">
            <h2 className="text-lg font-bold text-[#1C1410]">{title}</h2>
            {description && (
              <p className="mt-0.5 text-sm text-[#9C8170]">{description}</p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer"
            className="rounded-lg p-1 text-[#9C8170] transition-colors hover:bg-orange-50 hover:text-[#EA580C]"
          >
            <X size={20} />
          </button>
        </div>
        <div className="px-6 pb-6 pt-2">{children}</div>
      </div>
    </div>
  );
}

import { createContext, useContext, useEffect, useRef, useState } from "react";

const MenuContext = createContext(() => {});

export function DropdownMenu({ trigger, children, align = "end", className = "" }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const handlePointer = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    const handleKey = (e) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", handlePointer);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handlePointer);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex items-center rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
      >
        {trigger}
      </button>
      {open && (
        <MenuContext.Provider value={() => setOpen(false)}>
          <div
            role="menu"
            className={`absolute ${align === "end" ? "right-0" : "left-0"} mt-2 z-50 min-w-60 overflow-hidden rounded-xl border border-[#EDE0D4] bg-white py-1.5 shadow-xl ${className}`}
          >
            {children}
          </div>
        </MenuContext.Provider>
      )}
    </div>
  );
}

export function DropdownItem({
  icon: Icon,
  children,
  onClick,
  disabled = false,
  destructive = false,
  hint,
}) {
  const close = useContext(MenuContext);

  return (
    <button
      type="button"
      role="menuitem"
      disabled={disabled}
      onClick={() => {
        onClick?.();
        close();
      }}
      className={`flex w-full items-center gap-3 px-4 py-2 text-left text-sm transition-colors disabled:pointer-events-none disabled:opacity-40 ${
        destructive
          ? "text-red-600 hover:bg-red-50"
          : "text-[#1C1410] hover:bg-orange-50"
      }`}
    >
      {Icon && (
        <Icon
          size={18}
          className={`shrink-0 ${destructive ? "text-red-500" : "text-[#9C8170]"}`}
        />
      )}
      <span className="flex-1">{children}</span>
      {hint && (
        <span className="rounded bg-[#FFF8F2] px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[#9C8170]">
          {hint}
        </span>
      )}
    </button>
  );
}

export function DropdownLabel({ children }) {
  return (
    <p className="px-4 pt-2 pb-1 text-[10px] font-semibold uppercase tracking-widest text-[#9C8170]">
      {children}
    </p>
  );
}

export function DropdownSeparator() {
  return <div className="my-1.5 h-px bg-[#EDE0D4]" />;
}

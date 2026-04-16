import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ─── Types ────────────────────────────────────────────────────────────────────

interface UserMenuMobileProps {
  user: {
    first_name?: string;
    username?: string;
    email?: string;
  } | null;
  onLogout: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * Mobile avatar button with a dropdown popover.
 * Shows user info and a "Cerrar sesión" action.
 * Visible only in the mobile/tablet header (lg:hidden zone).
 */
export default function UserMenuMobile({ user, onLogout }: UserMenuMobileProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const initial = user?.first_name?.[0] || user?.username?.[0]?.toUpperCase() || "U";
  const displayName = user?.first_name || user?.username || "Usuario";

  // ── Close on click outside ──────────────────────────────────────────────
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [isOpen]);

  // ── Close on Escape ─────────────────────────────────────────────────────
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isOpen]);

  const handleLogout = () => {
    setIsOpen(false);
    onLogout();
  };

  return (
    <div ref={menuRef} className="relative">
      {/* ── Avatar trigger ── */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label="Menú de usuario"
        aria-expanded={isOpen}
        className="h-9 w-9 rounded-full border border-white/10 overflow-hidden shadow-lg shadow-primary/10 flex items-center justify-center bg-linear-to-tr from-primary/40 to-blue-600 text-sm font-bold transition-transform active:scale-95"
      >
        {initial}
      </button>

      {/* ── Dropdown popover ── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -8 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="absolute right-0 top-full mt-2 w-56 z-50 rounded-2xl overflow-hidden border border-white/10 shadow-2xl"
            style={{
              backgroundColor: "rgba(3, 0, 20, 0.95)",
              backdropFilter: "blur(24px)",
            }}
          >
            {/* User info */}
            <div className="px-4 py-4 border-b border-white/5">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 shrink-0 rounded-full bg-linear-to-tr from-primary/40 to-blue-600 flex items-center justify-center text-sm font-bold border border-white/10">
                  {initial}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate leading-none mb-1">
                    {displayName}
                  </p>
                  {user?.email && (
                    <p className="text-[10px] text-slate-500 truncate">
                      {user.email}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Logout action */}
            <div className="p-2">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200"
              >
                <span className="material-symbols-outlined text-lg">logout</span>
                Cerrar sesión
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";

// ─── Types ────────────────────────────────────────────────────────────────────

export type ModalConfirmVariant = "danger" | "warning" | "info";

interface ModalConfirmProps {
  /** Controls modal visibility */
  isOpen: boolean;
  /** Main heading */
  title: string;
  /** Descriptive text below the heading */
  description?: string;
  /** Material Symbol icon name shown in the icon badge */
  icon?: string;
  /** Visual variant — affects icon badge and confirm button color */
  variant?: ModalConfirmVariant;
  /** Label for the confirm (destructive) button */
  confirmLabel?: string;
  /** Label for the cancel button */
  cancelLabel?: string;
  /** Shows a loading spinner on the confirm button */
  isLoading?: boolean;
  /** Called when the user confirms the action */
  onConfirm: () => void;
  /** Called when the user cancels (click outside, Escape, or Cancel button) */
  onCancel: () => void;
}

// ─── Variant config ───────────────────────────────────────────────────────────

const VARIANT_CONFIG: Record<
  ModalConfirmVariant,
  {
    bgColor: string;
    borderColor: string;
    iconColor: string;
    btnBg: string;
    btnGlow: string;
  }
> = {
  danger: {
    bgColor: "rgba(239,68,68,0.08)",
    borderColor: "rgba(239,68,68,0.25)",
    iconColor: "#ef4444",
    btnBg: "#ef4444",
    btnGlow: "rgba(239,68,68,0.35)",
  },
  warning: {
    bgColor: "rgba(234,179,8,0.08)",
    borderColor: "rgba(234,179,8,0.25)",
    iconColor: "#eab308",
    btnBg: "#eab308",
    btnGlow: "rgba(234,179,8,0.35)",
  },
  info: {
    bgColor: "rgba(139,92,246,0.08)",
    borderColor: "rgba(139,92,246,0.25)",
    iconColor: "#8b5cf6",
    btnBg: "#8b5cf6",
    btnGlow: "rgba(139,92,246,0.35)",
  },
};

// ─── Spinner (self-contained, no external dep) ────────────────────────────────

function Spinner() {
  return (
    <svg
      className="animate-spin w-4 h-4 shrink-0"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * Generic confirmation modal rendered via React Portal (always centered on screen).
 *
 * Usage:
 * ```tsx
 * <ModalConfirm
 *   isOpen={showModal}
 *   variant="danger"
 *   icon="delete"
 *   title="¿Eliminar proyecto?"
 *   description="Esta acción no se puede deshacer."
 *   confirmLabel="Sí, eliminar"
 *   onConfirm={handleDelete}
 *   onCancel={() => setShowModal(false)}
 * />
 * ```
 */
export default function ModalConfirm({
  isOpen,
  title,
  description,
  icon = "help",
  variant = "danger",
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  isLoading = false,
  onConfirm,
  onCancel,
}: ModalConfirmProps) {
  const cancelRef = useRef<HTMLButtonElement>(null);
  const cfg = VARIANT_CONFIG[variant];

  // ── Close on Escape ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isLoading) onCancel();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, isLoading, onCancel]);

  // ── Focus safe button on open ────────────────────────────────────────────
  useEffect(() => {
    if (isOpen) {
      // Defer so AnimatePresence has time to mount the element
      const id = setTimeout(() => cancelRef.current?.focus(), 50);
      return () => clearTimeout(id);
    }
  }, [isOpen]);

  // ── Prevent body scroll while open ──────────────────────────────────────
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          {/* ── Backdrop ── */}
          <motion.div
            key="modal-backdrop"
            className="fixed inset-0 z-[9998] bg-black/70 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={() => !isLoading && onCancel()}
            aria-hidden="true"
          />

          {/* ── Panel ── */}
          <motion.div
            key="modal-panel"
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
            // pointer-events-none on wrapper so backdrop click still works
            style={{ pointerEvents: "none" }}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
          >
            <div
              role="alertdialog"
              aria-modal="true"
              aria-labelledby="modal-confirm-title"
              aria-describedby={description ? "modal-confirm-desc" : undefined}
              className="w-full max-w-sm rounded-3xl p-8 flex flex-col gap-6"
              style={{
                pointerEvents: "auto",
                backgroundColor: "rgba(3,0,20,0.97)",
                border: "1px solid rgba(255,255,255,0.08)",
                boxShadow:
                  "0 0 0 1px rgba(255,255,255,0.04), 0 24px 64px rgba(0,0,0,0.85)",
              }}
            >
              {/* Icon badge */}
              <div className="flex justify-center">
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center"
                  style={{
                    backgroundColor: cfg.bgColor,
                    border: `1px solid ${cfg.borderColor}`,
                  }}
                >
                  <span
                    className="material-symbols-outlined text-4xl"
                    style={{ color: cfg.iconColor }}
                  >
                    {icon}
                  </span>
                </div>
              </div>

              {/* Text */}
              <div className="text-center">
                <h2
                  id="modal-confirm-title"
                  className="text-xl font-bold mb-2 text-white"
                >
                  {title}
                </h2>
                {description && (
                  <p
                    id="modal-confirm-desc"
                    className="text-sm leading-relaxed"
                    style={{ color: "rgba(148,163,184,0.75)" }}
                  >
                    {description}
                  </p>
                )}
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-3">
                {/* Confirm */}
                <button
                  onClick={onConfirm}
                  disabled={isLoading}
                  className="w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-60 text-white"
                  style={{
                    background: cfg.btnBg,
                    boxShadow: `0 0 20px ${cfg.btnGlow}`,
                  }}
                >
                  {isLoading ? (
                    <Spinner />
                  ) : (
                    <span className="material-symbols-outlined text-base">
                      {icon}
                    </span>
                  )}
                  {isLoading ? "Procesando…" : confirmLabel}
                </button>

                {/* Cancel (default focus — the safe option) */}
                <button
                  ref={cancelRef}
                  onClick={onCancel}
                  disabled={isLoading}
                  className="w-full py-3.5 rounded-xl font-semibold text-sm transition-all active:scale-[0.98] disabled:opacity-60"
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    color: "rgba(148,163,184,0.9)",
                  }}
                >
                  {cancelLabel}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body,
  );
}

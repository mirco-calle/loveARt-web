import { useState, useRef } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import { TrackingImage } from "../../api/ImageTracking";

interface ActivationKitModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: TrackingImage | null;
}

export default function ActivationKitModal({
  isOpen,
  onClose,
  project,
}: ActivationKitModalProps) {
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const printableRef = useRef<HTMLDivElement>(null);

  if (!isOpen || !project) return null;

  const pin = project.activation_pin || "------";
  const qrUrl = project.qr_code_url || "";

  const handleCopyPin = async () => {
    if (!project.activation_pin) return;
    try {
      await navigator.clipboard.writeText(project.activation_pin);
      setCopied(true);
      toast.success("PIN copiado al portapapeles");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("No se pudo copiar el PIN");
    }
  };

  const handleDownloadQr = async () => {
    if (!qrUrl) {
      toast.error("El código QR no está disponible");
      return;
    }
    setDownloading(true);
    try {
      const response = await fetch(qrUrl);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `loveARt_QR_${pin}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
      toast.success("Código QR descargado");
    } catch {
      // Fallback: abrir en nueva pestaña
      window.open(qrUrl, "_blank");
    } finally {
      setDownloading(false);
    }
  };

  const handlePrintCard = () => {
    window.print();
  };

  return createPortal(
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/80 backdrop-blur-md print:hidden"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ type: "spring", duration: 0.35, bounce: 0.2 }}
          className="relative w-full max-w-xl bg-slate-900/95 border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-purple-500/10 text-white z-10 max-h-[92vh] overflow-y-auto print:hidden"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 text-slate-400 hover:text-white p-2 rounded-full hover:bg-white/5 transition-colors"
            aria-label="Cerrar"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>

          {/* Header */}
          <div className="flex items-center gap-3.5 mb-6">
            <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-purple-500/25 shrink-0">
              <span className="material-symbols-outlined text-2xl">
                qr_code_2
              </span>
            </div>
            <div>
              <h3 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                Kit de Activación para Cliente
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  Listo
                </span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Entrega este código QR o PIN junto con la obra física.
              </p>
            </div>
          </div>

          {/* Main Card Content */}
          <div className="flex flex-col gap-5">
            {/* Project Summary Banner */}
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/5">
              <div className="h-12 w-12 rounded-xl overflow-hidden bg-slate-800 shrink-0 border border-white/10">
                <img
                  src={project.image_url}
                  alt={project.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-semibold text-white truncate">
                  {project.title}
                </h4>
                <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                  <span className="bg-purple-500/20 text-purple-300 px-1.5 py-0.2 rounded font-mono">
                    {project.aspect_ratio}
                  </span>
                  <span>•</span>
                  <span>Recuerdo en Realidad Aumentada</span>
                </div>
              </div>
            </div>

            {/* QR & PIN Spotlight */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center bg-gradient-to-b from-white/[0.04] to-transparent p-5 rounded-2xl border border-white/10">
              {/* QR Image Box */}
              <div className="flex flex-col items-center justify-center p-3 bg-white rounded-2xl shadow-xl shadow-black/40">
                {qrUrl ? (
                  <img
                    src={qrUrl}
                    alt={`QR de ${project.title}`}
                    className="w-40 h-40 object-contain rounded-lg"
                  />
                ) : (
                  <div className="w-40 h-40 flex flex-col items-center justify-center text-slate-400 gap-2">
                    <span className="material-symbols-outlined text-4xl animate-spin">
                      sync
                    </span>
                    <span className="text-[10px]">Generando QR...</span>
                  </div>
                )}
                <span className="text-[10px] font-mono font-bold text-slate-700 mt-1 uppercase tracking-wider">
                  Escanear con App loveARt
                </span>
              </div>

              {/* PIN Code Box */}
              <div className="flex flex-col gap-3">
                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Código PIN de Activación
                  </span>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-black/40 border border-purple-500/30 px-3.5 py-2.5 rounded-xl font-mono text-xl sm:text-2xl font-bold tracking-widest text-purple-300 text-center select-all">
                      {pin}
                    </div>
                    <button
                      onClick={handleCopyPin}
                      className="p-3 bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 rounded-xl transition-all active:scale-95 shrink-0"
                      title="Copiar PIN"
                    >
                      <span className="material-symbols-outlined text-lg">
                        {copied ? "check" : "content_copy"}
                      </span>
                    </button>
                  </div>
                </div>

                <p className="text-[11px] text-slate-400 leading-relaxed">
                  💡 <strong>Opción de respaldo:</strong> Si tu cliente no puede
                  escanear la cámara o prefiere digitar, ingresa este PIN directo en
                  la app.
                </p>
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <button
                onClick={handleDownloadQr}
                disabled={downloading || !qrUrl}
                className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-white font-medium text-sm transition-all active:scale-98 disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-lg">
                  download
                </span>
                {downloading ? "Descargando..." : "Descargar QR (PNG)"}
              </button>

              <button
                onClick={handlePrintCard}
                className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-medium text-sm shadow-lg shadow-purple-500/20 transition-all active:scale-98"
              >
                <span className="material-symbols-outlined text-lg">print</span>
                Imprimir Tarjeta Cliente
              </button>
            </div>
          </div>
        </motion.div>

        {/* 🖨️ PRINTABLE ACTIVATION CARD (Visible only during window.print()) */}
        <div
          ref={printableRef}
          className="hidden print:block fixed inset-0 bg-white text-black p-8 font-sans"
        >
          <div className="max-w-md mx-auto border-2 border-dashed border-gray-400 rounded-3xl p-8 flex flex-col items-center text-center">
            {/* Header */}
            <div className="mb-4">
              <h1 className="text-2xl font-black tracking-tight text-gray-900">
                love<span className="text-purple-600">AR</span>t
              </h1>
              <p className="text-xs text-gray-500 uppercase tracking-widest mt-0.5">
                Experiencia en Realidad Aumentada
              </p>
            </div>

            {/* Project info */}
            <h2 className="text-lg font-bold text-gray-800 mb-1">
              {project.title}
            </h2>
            <p className="text-xs text-gray-400 mb-5">
              Formato: {project.aspect_ratio} • Recuerdo Interactivo
            </p>

            {/* QR Code */}
            <div className="p-3 bg-gray-50 border border-gray-200 rounded-2xl mb-4 shadow-sm">
              {qrUrl ? (
                <img
                  src={qrUrl}
                  alt={`QR ${project.title}`}
                  className="w-44 h-44 object-contain"
                />
              ) : (
                <div className="w-44 h-44 flex items-center justify-center text-gray-400">
                  QR Code
                </div>
              )}
            </div>

            {/* PIN Code Box */}
            <div className="w-full bg-gray-100 rounded-xl py-2 px-4 mb-6 border border-gray-200">
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">
                CÓDIGO DE ACTIVACIÓN
              </span>
              <span className="text-2xl font-mono font-black tracking-widest text-purple-700">
                {pin}
              </span>
            </div>

            {/* 3 Steps instructions */}
            <div className="w-full text-left space-y-2.5 text-xs text-gray-600 border-t border-gray-200 pt-5">
              <p className="font-bold text-gray-800 text-center mb-2">
                ¿CÓMO ACTIVAR TU RECUERDO?
              </p>
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-purple-600 text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                  1
                </span>
                <span>
                  Descarga gratis la app <strong>loveARt</strong> en tu teléfono.
                </span>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-purple-600 text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                  2
                </span>
                <span>
                  Abre la app y selecciona <strong>Escanear QR</strong> o ingresa
                  el PIN: <strong>{pin}</strong>.
                </span>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-purple-600 text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                  3
                </span>
                <span>
                  ¡Apunta la cámara a tu cuadro y mira cómo cobra vida!
                </span>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-6 pt-4 border-t border-gray-100 w-full text-[10px] text-gray-400">
              loveart.mircodev.com • Todos los derechos reservados
            </div>
          </div>
        </div>
      </div>
    </AnimatePresence>,
    document.body
  );
}

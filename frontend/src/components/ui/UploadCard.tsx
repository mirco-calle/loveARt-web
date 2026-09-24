import { useCallback, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import GlassCard from "./GlassCard";

interface UploadCardProps {
  icon: string;
  title: string;
  formats: string;
  onFileSelect: (file: File) => void;
  accept: string;
  disabled?: boolean;
  previewUrl?: string | null;
  isVideoPreview?: boolean;
  aspectRatio?: "16:9" | "9:16" | "1:1" | "4:3" | "940:788";
}

const ASPECT_CLASSES: Record<string, string> = {
  "16:9": "aspect-[16/9] min-h-[200px]",
  "9:16": "aspect-[9/16] min-h-[340px] max-h-[500px]",
  "1:1": "aspect-square min-h-[220px]",
  "4:3": "aspect-[4/3] min-h-[220px]",
  "940:788": "aspect-[940/788] min-h-[220px]",
};

/**
 * Drag-and-drop upload card with file picker fallback and preview support.
 * Dynamically adjusts its aspect ratio to match the selected format.
 */
export default function UploadCard({
  icon,
  title,
  formats,
  onFileSelect,
  accept,
  disabled = false,
  previewUrl,
  isVideoPreview = false,
  aspectRatio = "16:9",
}: UploadCardProps) {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) onFileSelect(file);
    },
    [onFileSelect]
  );

  const handleClick = () => {
    if (disabled) return;
    const input = document.createElement("input");
    input.type = "file";
    input.accept = accept;
    input.onchange = () => {
      const file = input.files?.[0];
      if (file) onFileSelect(file);
    };
    input.click();
  };

  const aspectClass = ASPECT_CLASSES[aspectRatio] || "aspect-[16/9]";

  return (
    <GlassCard
      hover
      onClick={handleClick}
      className={`group relative w-full ${aspectClass} p-4 sm:p-6 flex flex-col items-center justify-center gap-3 sm:gap-4 cursor-pointer transition-all duration-500 border-2 border-dashed overflow-hidden rounded-3xl ${
        isDragOver
          ? "border-primary bg-primary/10 scale-[1.02] shadow-[0_0_40px_rgba(139,92,246,0.25)]"
          : previewUrl
          ? "border-primary/40 bg-black/40 hover:border-primary shadow-xl"
          : "border-white/10 bg-white/2 hover:border-white/20"
      } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
    >
      {/* Full Visible Preview */}
      <AnimatePresence>
        {previewUrl && (
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 z-0 overflow-hidden bg-black/60 flex items-center justify-center"
          >
            {isVideoPreview ? (
              <video
                src={previewUrl}
                autoPlay
                muted
                loop
                playsInline
                className="w-full h-full object-cover"
              />
            ) : (
              <img
                src={previewUrl}
                className="w-full h-full object-cover"
                alt="Preview"
              />
            )}
            
            {/* Subtle Gradient Overlay on Hover for change action */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center gap-2 pointer-events-none">
              <span className="material-symbols-outlined text-3xl text-white drop-shadow-md">
                sync
              </span>
              <p className="text-xs font-bold text-white uppercase tracking-wider bg-black/50 px-3 py-1 rounded-full border border-white/20">
                Cambiar {isVideoPreview ? "Video" : "Imagen"}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Drag & Drop Overlay */}
      <div
        className="absolute inset-0 z-20"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      />

      {/* Format Badge Top Left */}
      <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-md border border-white/10 text-[10px] font-mono font-bold text-slate-300">
        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
        {aspectRatio}
      </div>

      {/* Empty State Content (Hidden or minimized when preview exists) */}
      {!previewUrl && (
        <>
          <motion.div
            className="h-14 w-14 sm:h-16 sm:w-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary border border-primary/20 shadow-xl z-10 shrink-0"
            animate={{ scale: isDragOver ? 1.1 : 1 }}
          >
            <span className="material-symbols-outlined text-3xl sm:text-4xl">{icon}</span>
          </motion.div>

          <div className="text-center z-10 px-2">
            <h3 className="font-bold text-base sm:text-lg text-white leading-tight">
              {isDragOver ? "¡Suelta aquí!" : title}
            </h3>
            <p className="text-[11px] sm:text-xs text-slate-400 mt-1 uppercase tracking-widest font-medium">
              {isDragOver ? "Detectado" : formats}
            </p>
          </div>

          {!isDragOver && (
            <div className="text-[10px] text-slate-500 font-bold uppercase tracking-tight opacity-60 z-10 text-center">
              Haz clic o arrastra aquí
            </div>
          )}
        </>
      )}

      {/* Top Right Action Icon */}
      <motion.div
        className="absolute top-3 right-3 text-primary z-10"
        animate={{
          opacity: isDragOver ? 1 : previewUrl ? 0.7 : 0.4,
          scale: isDragOver ? 1.2 : 1,
        }}
      >
        <span className="material-symbols-outlined text-xl sm:text-2xl">
          {isDragOver ? "download" : previewUrl ? "check_circle" : "add_circle"}
        </span>
      </motion.div>
    </GlassCard>
  );
}

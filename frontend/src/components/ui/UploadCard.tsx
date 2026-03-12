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
}

/**
 * Drag-and-drop upload card with file picker fallback and preview support.
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

  return (
    <GlassCard
      hover
      onClick={handleClick}
      className={`relative p-8 flex flex-col items-center justify-center gap-4 cursor-pointer transition-all duration-300 border-2 border-dashed overflow-hidden ${
        isDragOver
          ? "border-primary bg-primary/10 scale-[1.02] shadow-[0_0_40px_rgba(139,92,246,0.2)]"
          : "border-white/10 bg-white/2 hover:border-white/20"
      } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
    >
      {/* Background Preview */}
      <AnimatePresence>
        {previewUrl && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-0"
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
            <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]" />
          </motion.div>
        )}
      </AnimatePresence>

      <div
        className="absolute inset-0 z-20"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      />

      <motion.div
        className="h-16 w-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary border border-primary/20 shadow-xl z-10"
        animate={{ scale: isDragOver ? 1.1 : 1 }}
      >
        <span className="material-symbols-outlined text-4xl">{icon}</span>
      </motion.div>

      <div className="text-center z-10">
        <h3 className="font-bold text-lg text-white">
          {isDragOver ? "¡Suelta aquí!" : title}
        </h3>
        <p className="text-xs text-slate-400 mt-1 uppercase tracking-widest font-medium">
          {isDragOver ? "Detectado" : formats}
        </p>
      </div>

      {!isDragOver && (
        <div className="mt-2 text-[10px] text-slate-500 font-bold uppercase tracking-tighter opacity-50 z-10">
          Arrastra y suelta o haz clic para buscar
        </div>
      )}

      <motion.div
        className="absolute top-4 right-4 text-primary z-10"
        animate={{
          opacity: isDragOver ? 1 : 0.3,
          scale: isDragOver ? 1.2 : 1,
        }}
      >
        <span className="material-symbols-outlined text-2xl">
          {isDragOver ? "download" : "add_circle"}
        </span>
      </motion.div>
    </GlassCard>
  );
}

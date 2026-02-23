import { motion } from "framer-motion";

interface ProgressBarProps {
  filename: string;
  progress: number;
  sizeText?: string;
  icon?: string;
  onCancel?: () => void;
}

/**
 * Upload progress bar with file info.
 * Matches the mockup design with neon cyan progress fill.
 */
export default function ProgressBar({
  filename,
  progress,
  sizeText,
  icon = "video_file",
  onCancel,
}: ProgressBarProps) {
  return (
    <div className="bg-card-dark border border-white/5 p-4 rounded-xl">
      <div className="flex items-center gap-3 mb-3">
        <div className="h-10 w-10 bg-white/5 rounded-lg flex items-center justify-center text-slate-300">
          <span className="material-symbols-outlined text-xl">{icon}</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-center">
            <h4 className="text-sm font-medium truncate">{filename}</h4>
            <span className="text-xs font-mono text-primary">{progress}%</span>
          </div>
          {sizeText && (
            <p className="text-[10px] text-slate-500 mt-0.5">{sizeText}</p>
          )}
        </div>
        {onCancel && (
          <button
            onClick={onCancel}
            className="text-slate-500 hover:text-red-400 transition-colors"
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        )}
      </div>
      <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-secondary glow-secondary"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}

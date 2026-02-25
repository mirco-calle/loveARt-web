import { motion } from "framer-motion";
import { formatBytes } from "../../utils/formatters";

interface AssetLibraryItemProps {
  title: string;
  thumbnailUrl?: string;
  type: "tracking" | "architecture";
  aspectRatio?: string;
  fileSize?: number;
  width?: number;
  height?: number;
  originalFormat?: string;
  createdAt: string;
  isPublic: boolean;
  videoSize?: number;
  model3dSize?: number;
  onOptions?: () => void;
  onDelete?: () => void;
}

export default function AssetLibraryItem({
  title,
  thumbnailUrl,
  type,
  aspectRatio,
  fileSize,
  width,
  height,
  originalFormat,
  createdAt,
  isPublic,
  videoSize,
  model3dSize,
  onOptions,
  onDelete,
}: AssetLibraryItemProps) {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="group relative flex flex-col sm:flex-row gap-4 bg-white/2 hover:bg-white/5 p-4 rounded-3xl border border-white/5 hover:border-white/10 transition-all duration-300 shadow-xl"
    >
      {/* Thumbnail Area */}
      <div className="relative h-32 sm:h-24 w-full sm:w-24 shrink-0 bg-white/5 rounded-2xl overflow-hidden border border-white/5">
        {thumbnailUrl ? (
          <img
            src={thumbnailUrl}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-600">
            <span className="material-symbols-outlined text-3xl">
              {type === "tracking" ? "image" : "deployed_code"}
            </span>
          </div>
        )}

        {/* Type Icon Badge */}
        <div className="absolute top-2 left-2 p-1 bg-black/40 backdrop-blur-md rounded-lg border border-white/10">
          <span className="material-symbols-outlined text-xs text-secondary leading-none">
            {type === "tracking" ? "image" : "architecture"}
          </span>
        </div>
      </div>

      {/* Info Area */}
      <div className="flex-1 min-w-0 flex flex-col justify-between py-1">
        <div>
          <div className="flex items-center justify-between gap-2">
            <h4 className="text-sm font-bold text-white truncate tracking-tight">
              {title}
            </h4>
            <div className="flex items-center gap-2 shrink-0">
              <span
                className={`text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded-md border ${
                  isPublic
                    ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                    : "bg-slate-500/10 text-slate-500 border-white/5"
                }`}
              >
                {isPublic ? "Public" : "Private"}
              </span>

              {/* Action Buttons inside the header flow */}
              <div className="flex items-center gap-1 ml-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                {onOptions && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onOptions();
                    }}
                    className="p-1 px-1.5 rounded-lg bg-white/5 border border-white/5 text-slate-400 hover:text-white hover:border-white/10 transition-all"
                    title="Ajustes"
                  >
                    <span className="material-symbols-outlined text-[16px]">
                      settings
                    </span>
                  </button>
                )}
                {onDelete && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete();
                    }}
                    className="p-1 px-1.5 rounded-lg bg-red-500/5 border border-red-500/10 text-red-500/60 hover:text-red-500 hover:border-red-500/30 transition-all"
                    title="Eliminar"
                  >
                    <span className="material-symbols-outlined text-[16px]">
                      delete
                    </span>
                  </button>
                )}
              </div>
            </div>
          </div>

          <p className="text-[10px] text-slate-500 font-medium uppercase tracking-widest mt-1">
            {new Date(createdAt).toLocaleDateString(undefined, {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </p>
        </div>

        {/* Technical Data Grid */}
        <div className="flex flex-wrap gap-x-4 gap-y-2 mt-3 pt-3 border-t border-white/5">
          {/* Resolution / Format */}
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[14px] text-slate-600">
              aspect_ratio
            </span>
            <span className="text-[10px] text-slate-400 font-mono">
              {width && height ? `${width}x${height}` : aspectRatio || "N/A"}
              {originalFormat && ` • ${originalFormat}`}
            </span>
          </div>

          {/* Main File Size */}
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[14px] text-slate-600">
              database
            </span>
            <span className="text-[10px] text-slate-400 font-mono">
              {fileSize ? formatBytes(fileSize) : "---"}
            </span>
          </div>

          {/* Linked Asset (Video or 3D Model) */}
          {(videoSize || model3dSize) && (
            <div className="flex items-center gap-1.5 px-2 py-0.5 bg-primary/10 rounded-full border border-primary/20">
              <span className="material-symbols-outlined text-[14px] text-primary">
                {type === "tracking" ? "movie" : "deployed_code"}
              </span>
              <span className="text-[10px] text-primary font-bold font-mono">
                {videoSize
                  ? formatBytes(videoSize)
                  : model3dSize
                    ? formatBytes(model3dSize)
                    : "---"}
              </span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

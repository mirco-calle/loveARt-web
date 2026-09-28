interface CompletedItemProps {
  filename: string;
  meta: string;
  icon?: string;
  thumbnailUrl?: string;
  pin?: string;
  onOpenKit?: () => void;
  onOptions?: () => void;
}

/**
 * Completed upload item with thumbnail, PIN pill and QR Kit action button.
 */
export default function CompletedItem({
  filename,
  meta,
  icon = "check_circle",
  thumbnailUrl,
  pin,
  onOpenKit,
  onOptions,
}: CompletedItemProps) {
  return (
    <div className="flex items-center gap-3.5 bg-surface-dark/60 p-3 rounded-2xl border border-white/5 hover:border-white/10 transition-all group">
      <div className="h-11 w-11 shrink-0 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-500 overflow-hidden border border-white/10">
        {thumbnailUrl ? (
          <img
            src={thumbnailUrl}
            alt={filename}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="material-symbols-outlined text-xl">{icon}</span>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-semibold truncate text-slate-200 group-hover:text-white transition-colors">
          {filename}
        </h4>
        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
          <p className="text-[10px] text-slate-500">{meta}</p>
          {pin && (
            <span className="text-[10px] font-mono px-1.5 py-0.5 bg-purple-500/15 text-purple-300 border border-purple-500/25 rounded-md font-semibold tracking-wider">
              PIN: {pin}
            </span>
          )}
        </div>
      </div>

      {onOpenKit && (
        <button
          onClick={onOpenKit}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-purple-600/15 hover:bg-purple-600/25 border border-purple-500/30 text-purple-300 text-xs font-medium transition-all active:scale-95 shrink-0"
          title="Ver QR y Kit de Activación"
        >
          <span className="material-symbols-outlined text-base">qr_code_2</span>
          <span className="hidden sm:inline">Kit QR</span>
        </button>
      )}

      {onOptions && (
        <button
          onClick={onOptions}
          className="text-slate-500 p-1.5 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
        >
          <span className="material-symbols-outlined text-lg">more_vert</span>
        </button>
      )}
    </div>
  );
}

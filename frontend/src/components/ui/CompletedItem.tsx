interface CompletedItemProps {
  filename: string;
  meta: string;
  icon?: string;
  onOptions?: () => void;
}

/**
 * Completed upload item with green check icon.
 * Matches the "Completed" section from the mockups.
 */
export default function CompletedItem({
  filename,
  meta,
  icon = "check_circle",
  onOptions,
}: CompletedItemProps) {
  return (
    <div className="flex items-center gap-4 bg-surface-dark/50 p-3 rounded-xl border border-white/5">
      <div className="h-10 w-10 flex-shrink-0 bg-emerald-500/10 rounded-lg flex items-center justify-center text-emerald-500">
        <span className="material-symbols-outlined text-xl">{icon}</span>
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-medium truncate text-slate-300">
          {filename}
        </h4>
        <p className="text-[10px] text-slate-500 mt-0.5">{meta}</p>
      </div>
      {onOptions && (
        <button
          onClick={onOptions}
          className="text-slate-500 p-1 hover:text-white transition-colors"
        >
          <span className="material-symbols-outlined text-lg">more_vert</span>
        </button>
      )}
    </div>
  );
}

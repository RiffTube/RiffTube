interface Props {
  message: string;
  onUndo: () => void;
}

/** A short-lived notice with a way back, shown after something was removed. */
function UndoToast({ message, onUndo }: Props) {
  return (
    <div
      role="status"
      className="fixed bottom-6 left-1/2 z-20 flex -translate-x-1/2 items-center gap-4 rounded-xl border border-white/10 bg-reel-dust px-4 py-3 text-sm shadow-lg"
    >
      <span>{message}</span>
      <button
        type="button"
        onClick={onUndo}
        className="cursor-pointer rounded-lg px-2 py-1 font-semibold underline hover:bg-white/10 focus:ring-2 focus:ring-white/30 focus:outline-none"
      >
        Undo
      </button>
    </div>
  );
}

export default UndoToast;

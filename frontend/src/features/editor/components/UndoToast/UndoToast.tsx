interface Props {
  message: string;
  onUndo: () => void;
}

/** A short-lived notice with a way back, shown after something was removed. */
function UndoToast({ message, onUndo }: Props) {
  return (
    <div
      role="status"
      className="fixed bottom-6 left-1/2 z-20 flex -translate-x-1/2 items-center gap-4 rounded-[8px] border border-rule-dark bg-charcoal px-4 py-3 text-sm text-paper shadow-xl shadow-black/50"
    >
      <span>{message}</span>
      <button
        type="button"
        onClick={onUndo}
        className="cursor-pointer rounded-[6px] px-2 py-1 font-semibold underline underline-offset-4 hover:bg-white/10"
      >
        Undo
      </button>
    </div>
  );
}

export default UndoToast;

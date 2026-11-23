/*
 * Shared look for the editor's form controls, so the name, time fields, riff
 * text and styling controls read as one set. Fields sit darker than the
 * charcoal inspector with a ≥3:1 border, so they stay distinct from it.
 * Keyboard focus comes from the global :focus-visible outline (gold on dark).
 */

/** Label above a field. */
export const fieldLabel = 'mb-1.5 block text-sm font-medium text-muted-dark';

/** Text-like inputs, textareas and selects. */
export const fieldControl =
  'rounded-[6px] border border-smoke bg-ink text-paper placeholder:text-[#8f877f] ' +
  'transition-colors hover:border-muted-dark focus:border-gold ' +
  'disabled:cursor-not-allowed disabled:opacity-60';

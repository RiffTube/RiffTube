import { roundTime } from '@/features/riffs/types';

/** 83.44 -> "01:23.4" */
export function formatTime(secs: number): string {
  const tenths = Math.round(Math.max(0, secs) * 10);
  const mm = Math.floor(tenths / 600)
    .toString()
    .padStart(2, '0');
  const ss = (Math.floor(tenths / 10) % 60).toString().padStart(2, '0');
  return `${mm}:${ss}.${tenths % 10}`;
}

/**
 * Reads what a person would type for a time: "83.4", "1:23", "01:23.4" or
 * "1:02:03". Returns seconds rounded to a tenth, or null when it is not a time.
 */
export function parseTime(input: string): number | null {
  const text = input.trim();
  if (!/^\d+(:\d{1,2}){0,2}(\.\d+)?$/.test(text)) return null;

  const parts = text.split(':').map(Number);
  // Only the first part may run past 59 ("90" seconds is fine, "1:90" is not).
  if (parts.slice(1).some(part => part >= 60)) return null;

  const seconds = parts.reduce((total, part) => total * 60 + part, 0);
  return roundTime(seconds);
}

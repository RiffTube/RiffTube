/** 83.4 -> "01:23" */
export function secondsToTimestamp(secs: number): string {
  const mm = Math.floor(secs / 60)
    .toString()
    .padStart(2, '0');
  const ss = Math.floor(secs % 60)
    .toString()
    .padStart(2, '0');
  return `${mm}:${ss}`;
}

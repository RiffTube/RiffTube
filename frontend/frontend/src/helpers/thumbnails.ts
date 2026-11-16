export function seededThumb(seed: string, w = 560, h = 315) {
  const s = encodeURIComponent(seed.toLowerCase().trim().replace(/\s+/g, '-'));
  return `https://picsum.photos/seed/${s}/${w}/${h}`;
}

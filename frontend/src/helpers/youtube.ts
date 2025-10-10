const YT_REGEX =
  /https?:\/\/(?:www\.)?(?:youtube\.com\/(?:watch\?v=[\w-]+|shorts\/[\w-]+|live\/[\w-]+|embed\/[\w-]+)|youtu\.be\/[\w-]+)/i;

const YT_OTHER_PREFIXES = ['/shorts/', '/live/', '/embed/'] as const;

function isYouTubeHost(host: string): boolean {
  const h = host.toLowerCase().replace(/^www\./, '');
  return h === 'youtube.com' || h === 'youtu.be' || h.endsWith('.youtube.com');
}

/** Returns a valid YouTube URL from arbitrary input (URL or free text), or null. */
export function candidateYouTubeUrl(raw: string): string | null {
  const value = raw.trim();

  // Direct URL path
  try {
    const u = new URL(value);
    if (!isYouTubeHost(u.hostname)) return null;

    if (u.hostname.includes('youtu.be'))
      return u.pathname.length > 1 ? u.toString() : null;
    if (u.pathname === '/watch')
      return u.searchParams.get('v') ? u.toString() : null;
    return YT_OTHER_PREFIXES.some(p => u.pathname.startsWith(p))
      ? u.toString()
      : null;
  } catch {
    // not a URL; fall through
  }

  // Extract from free text
  const m = value.match(YT_REGEX);
  return m ? m[0] : null;
}

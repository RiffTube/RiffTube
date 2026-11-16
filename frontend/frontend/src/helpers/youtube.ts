const YT_REGEX =
  /https?:\/\/(?:www\.)?(?:youtube\.com\/(?:watch\?v=[\w-]+|shorts\/[\w-]+|live\/[\w-]+|embed\/[\w-]+)|youtu\.be\/[\w-]+)/i;

const YT_ID_REGEX = /^[\w-]{11}$/;

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

/** Returns the 11-char video id from a bare id or a YouTube URL/free text, or null. */
export function extractYouTubeVideoId(raw: string): string | null {
  const value = raw.trim();
  if (YT_ID_REGEX.test(value)) return value;

  const url = candidateYouTubeUrl(value);
  if (!url) return null;

  const u = new URL(url);
  const isValidId = (id: string | null): id is string =>
    id !== null && YT_ID_REGEX.test(id);
  if (u.hostname.includes('youtu.be')) {
    const id = u.pathname.slice(1);
    return isValidId(id) ? id : null;
  }
  if (u.pathname === '/watch') {
    const id = u.searchParams.get('v');
    return isValidId(id) ? id : null;
  }

  const prefix = YT_OTHER_PREFIXES.find(p => u.pathname.startsWith(p));
  const id = prefix ? u.pathname.slice(prefix.length) : null;
  return isValidId(id) ? id : null;
}

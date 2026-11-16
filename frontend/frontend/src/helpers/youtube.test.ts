import { extractYouTubeVideoId } from './youtube';

describe('extractYouTubeVideoId', () => {
  it('returns a bare 11-char id as-is', () => {
    expect(extractYouTubeVideoId('dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ');
  });

  it('extracts the id from a watch URL', () => {
    expect(
      extractYouTubeVideoId('https://www.youtube.com/watch?v=dQw4w9WgXcQ'),
    ).toBe('dQw4w9WgXcQ');
  });

  it('extracts the id from a youtu.be short link', () => {
    expect(extractYouTubeVideoId('https://youtu.be/dQw4w9WgXcQ')).toBe(
      'dQw4w9WgXcQ',
    );
  });

  it('extracts the id from shorts/live/embed links', () => {
    expect(
      extractYouTubeVideoId('https://www.youtube.com/shorts/dQw4w9WgXcQ'),
    ).toBe('dQw4w9WgXcQ');
    expect(
      extractYouTubeVideoId('https://www.youtube.com/embed/dQw4w9WgXcQ'),
    ).toBe('dQw4w9WgXcQ');
  });

  it('returns null for non-YouTube input', () => {
    expect(extractYouTubeVideoId('https://example.com/watch?v=abc')).toBeNull();
    expect(extractYouTubeVideoId('not a url or id')).toBeNull();
    expect(extractYouTubeVideoId('')).toBeNull();
  });
});

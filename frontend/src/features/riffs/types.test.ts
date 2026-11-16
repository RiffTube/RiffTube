import {
  overlappingRiffIds,
  overlayStyle,
  riffDuration,
  roundTime,
  sortByStart,
} from './types';

const span = (id: string, start: number, end: number) => ({ id, start, end });

describe('roundTime and riffDuration', () => {
  it('keep times to a tenth of a second without float drift', () => {
    expect(roundTime(0.1 + 0.2)).toBe(0.3);
    expect(riffDuration({ start: 0.1, end: 0.4 })).toBe(0.3);
  });
});

describe('sortByStart', () => {
  it('orders by start, then end, without touching the input', () => {
    const input = [span('c', 9, 12), span('b', 2, 8), span('a', 2, 5)];

    expect(sortByStart(input).map(riff => riff.id)).toEqual(['a', 'b', 'c']);
    expect(input.map(riff => riff.id)).toEqual(['c', 'b', 'a']);
  });
});

describe('overlappingRiffIds', () => {
  it('is empty when riffs only touch end to start', () => {
    const ids = overlappingRiffIds([span('a', 0, 3), span('b', 3, 6)]);

    expect(ids.size).toBe(0);
  });

  it('flags both riffs of an overlapping pair, whatever their order', () => {
    const ids = overlappingRiffIds([
      span('c', 20, 22),
      span('b', 4, 8),
      span('a', 1, 5),
    ]);

    expect([...ids].sort()).toEqual(['a', 'b']);
  });

  it('catches a long riff spanning several short ones', () => {
    const ids = overlappingRiffIds([
      span('long', 0, 30),
      span('x', 2, 4),
      span('y', 10, 12),
      span('z', 40, 42),
    ]);

    expect([...ids].sort()).toEqual(['long', 'x', 'y']);
  });

  it('copes with zero or one riff', () => {
    expect(overlappingRiffIds([]).size).toBe(0);
    expect(overlappingRiffIds([span('a', 0, 3)]).size).toBe(0);
  });
});

describe('overlayStyle', () => {
  it('fills in the defaults for missing or malformed values', () => {
    expect(overlayStyle({ bgColor: 7, fontSize: '20' })).toEqual({
      bgColor: '#000000',
      textColor: '#ffffff',
      fontSize: 16,
    });
  });

  it('keeps what the riff sets', () => {
    expect(
      overlayStyle({ bgColor: '#112233', textColor: '#ffcc00', fontSize: 24 }),
    ).toEqual({ bgColor: '#112233', textColor: '#ffcc00', fontSize: 24 });
  });
});

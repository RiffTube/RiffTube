import { formatTime, parseTime } from './time';

describe('formatTime', () => {
  it.each([
    [0, '00:00.0'],
    [5, '00:05.0'],
    [83.44, '01:23.4'],
    [59.96, '01:00.0'],
    [3723.5, '62:03.5'],
    [-2, '00:00.0'],
  ])('formats %s seconds as %s', (seconds, expected) => {
    expect(formatTime(seconds)).toBe(expected);
  });
});

describe('parseTime', () => {
  it.each([
    ['83.4', 83.4],
    ['1:23', 83],
    ['01:23.4', 83.4],
    [' 0:05.25 ', 5.3],
    ['90', 90],
    ['1:02:03', 3723],
    ['00:00.0', 0],
  ])('reads %j as %s seconds', (text, expected) => {
    expect(parseTime(text)).toBe(expected);
  });

  it.each(['', 'abc', '1:90', '-5', '1:2:3:4', '12:', ':30', '1.5.2'])(
    'rejects %j',
    text => {
      expect(parseTime(text)).toBeNull();
    },
  );

  it('round-trips what formatTime produces', () => {
    for (const seconds of [0, 0.1, 9.9, 61.5, 600, 3599.9]) {
      expect(parseTime(formatTime(seconds))).toBe(seconds);
    }
  });
});

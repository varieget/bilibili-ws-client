import Client from '../src';

describe('Client', () => {
  it('should throw if roomId not sent', () => {
    // @ts-expect-error: expect roomId not sent
    expect(() => new Client()).toThrow();
  });

  it('should throw if maxConnectTimes equal 0', () => {
    expect(() => new Client(1, true, 0)).toThrow();
  });
});
import Client from '../src';

describe('Client', () => {
  it('should throw if roomId not sent', () => {
    // @ts-expect-error: expect roomId not sent
    expect(() => new Client()).toThrow();
  });

  it('should throw if maxConnectTimes equal 0', () => {
    expect(() => new Client(1, true, 0)).toThrow();
  });

  it('should receive op 8', (done) => {
    const sub = new Client(1);

    sub.on('open', (body) => {
      expect(JSON.parse(body).code).toEqual(0);
      sub.close();
    });

    sub.on('close', () => done());
  });

  it(
    'should receive heartbeat per 30s',
    (done) => {
      const sub = new Client(1);

      sub.on('message', ({ op }) => {
        if (op === 3) sub.close();
      });

      sub.on('close', () => done());
    },
    35 * 1000
  );
});

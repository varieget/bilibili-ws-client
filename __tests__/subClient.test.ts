/* eslint-disable @typescript-eslint/ban-ts-comment */
import SubClient from '../src/subClient';

describe('SubClient', () => {
  it('encode', () => {
    const sub = new SubClient();

    // @ts-ignore
    expect(sub.convertToArrayBuffer('', 2)).toEqual(
      new Uint8Array([
        0x00, 0x00, 0x00, 0x10, 0x00, 0x10, 0x00, 0x01, 0x00, 0x00, 0x00, 0x02,
        0x00, 0x00, 0x00, 0x01,
      ]).buffer
    );
  });

  it('decode op equal 3', () => {
    const sub = new SubClient();

    const Op3 = new Uint8Array([
      0x00, 0x00, 0x00, 0x14, 0x00, 0x10, 0x00, 0x01, 0x00, 0x00, 0x00, 0x03,
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x01,
    ]);

    // @ts-ignore
    expect(sub.convertToObject(Op3.buffer)).toMatchObject({
      packetLen: 20,
      headerLen: 16,
      ver: 1,
      op: 3,
      seq: 0,
      body: 1,
    });
  });

  it('decode op not equal 3', () => {
    const sub = new SubClient();

    const Op8 = new Uint8Array([
      0x00, 0x00, 0x00, 0x1a, 0x00, 0x10, 0x00, 0x01, 0x00, 0x00, 0x00, 0x08,
      0x00, 0x00, 0x00, 0x01, 0x7b, 0x22, 0x63, 0x6f, 0x64, 0x65, 0x22, 0x3a,
      0x30, 0x7d,
    ]);

    // @ts-ignore
    expect(sub.convertToObject(Op8.buffer)).toMatchObject({
      packetLen: 26,
      headerLen: 16,
      ver: 1,
      op: 8,
      seq: 1,
      body: '{"code":0}',
    });
  });
});

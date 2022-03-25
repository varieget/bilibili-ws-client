import WebSocket from 'ws';
import zlib from 'zlib';

import { headerOffset, verOffset } from './constants';
import type { Ver, Op } from './constants';
import SubClient from './subClient';

interface Options {
  roomId: number;
  enableLog?: boolean;
}

interface Client {
  // Events
  on(event: 'close', listener: (this: Client) => void): this;
  on(event: 'error', listener: (this: Client, err: Error) => void): this;
  on(
    event: 'message',
    listener: (
      this: Client,
      body: {
        ver: Ver;
        op: Op;
        cmd?: unknown;
        body: string | number;
        ts: number;
      }
    ) => void
  ): this;
  on(event: 'open', listener: (this: Client, body: string) => void): this;

  once(event: 'close', listener: (this: Client) => void): this;
  once(event: 'error', listener: (this: Client, err: Error) => void): this;
  once(
    event: 'message',
    listener: (
      this: Client,
      body: {
        ver: Ver;
        op: Op;
        cmd?: unknown;
        body: string | number;
        ts: number;
      }
    ) => void
  ): this;
  once(event: 'open', listener: (this: Client, body: string) => void): this;

  off(event: 'close', listener: (this: Client) => void): this;
  off(event: 'error', listener: (this: Client, err: Error) => void): this;
  off(
    event: 'message',
    listener: (
      this: Client,
      body: {
        ver: Ver;
        op: Op;
        cmd?: unknown;
        body: string | number;
        ts: number;
      }
    ) => void
  ): this;
  off(event: 'open', listener: (this: Client, body: string) => void): this;

  addListener(event: 'close', listener: (this: Client) => void): this;
  addListener(
    event: 'error',
    listener: (this: Client, err: Error) => void
  ): this;
  addListener(
    event: 'message',
    listener: (
      this: Client,
      body: {
        ver: Ver;
        op: Op;
        cmd?: unknown;
        body: string | number;
        ts: number;
      }
    ) => void
  ): this;
  addListener(
    event: 'open',
    listener: (this: Client, body: string) => void
  ): this;

  removeListener(event: 'close', listener: (this: Client) => void): this;
  removeListener(
    event: 'error',
    listener: (this: Client, err: Error) => void
  ): this;
  removeListener(
    event: 'message',
    listener: (
      this: Client,
      body: {
        ver: Ver;
        op: Op;
        cmd?: unknown;
        body: string | number;
        ts: number;
      }
    ) => void
  ): this;
  removeListener(
    event: 'open',
    listener: (this: Client, body: string) => void
  ): this;
}

class Client extends SubClient {
  private options: Options;

  /**
   * 直播客户端
   * @constructor
   * @param {number} roomId - 房间号
   */
  constructor(roomId: number);

  /**
   * 直播客户端
   * @constructor
   * @param {number} roomId - 房间号
   * @param {boolean} enableLog - 记录日志，通过 console.log
   */
  constructor(roomId: number, enableLog?: boolean);

  /**
   * 直播客户端
   * @constructor
   * @param {number} roomId - 房间号
   * @param {boolean} enableLog - 记录日志，通过 console.log
   * @param {number} maxConnectTimes - 最多重试次数，默认为 10
   */
  constructor(roomId: number, enableLog?: boolean, maxConnectTimes?: number);

  /**
   * 直播客户端
   * @constructor
   * @param {number} roomId - 房间号
   * @param {boolean} enableLog - 记录日志，通过 console.log
   * @param {number} maxConnectTimes - 最多重试次数，默认为 10
   * @param {number} delay - 重试间隔，默认为 15000
   */
  constructor(
    roomId: number,
    enableLog?: boolean,
    maxConnectTimes?: number,
    delay?: number
  );

  constructor(
    roomId: number,
    enableLog?: boolean,
    maxConnectTimes?: number,
    delay?: number
  ) {
    super();

    if (!roomId) {
      throw new Error('miss roomId.');
    }

    const MAX_CONNECT_TIMES = maxConnectTimes ?? 10; // 最多重试次数
    const DELAY = delay ?? 15000; // 重试间隔

    this.options = { roomId, enableLog };

    this.connect(MAX_CONNECT_TIMES, DELAY);
  }

  private connect(max: number, delay: number) {
    if (max === 0) return;

    const ws = new WebSocket('wss://broadcastlv.chat.bilibili.com:2245/sub');
    ws.binaryType = 'arraybuffer';

    const { roomId, enableLog } = this.options;

    ws.on('open', () => {
      enableLog && console.log('auth start');

      const token = JSON.stringify({
        roomid: roomId,
        protover: 2,
        platform: 'web',
      });

      ws.send(this.convertToArrayBuffer(token, 7));
    });

    let heartbeatInterval: NodeJS.Timer;

    ws.on('message', (data: ArrayBuffer) => {
      const dataView = new DataView(data, 0);

      const ts = Math.floor(Date.now() / 1000);

      const { body, packetLen, headerLen, ver, op, seq } =
        this.convertToObject(data);

      if (op !== 3 && op !== 5) {
        enableLog &&
          console.log('receiveHeader:', {
            packetLen,
            headerLen,
            ver,
            op,
            seq,
            body,
          });
      }

      switch (op) {
        case 8:
          // 进房
          this.emit('open', body);

          // send heartbeat
          heartbeatInterval = setInterval(() => {
            ws.send(this.convertToArrayBuffer('', 2));

            enableLog && console.log('send: heartbeat;');
          }, 30 * 1000);
          break;
        case 3:
          // 人气
          // heartbeat reply
          enableLog && console.log('receive: heartbeat;', { online: body });

          this.messageReceived(ver, op, body, ts);
          break;
        case 5:
          // batch message
          for (
            let offset = 0, packetLen: number, body;
            offset < data.byteLength;
            offset += packetLen
          ) {
            // parse
            packetLen = dataView.getInt32(offset);
            const headerLen = dataView.getInt16(offset + headerOffset);
            const ver = dataView.getInt16(offset + verOffset) as Ver;

            try {
              if (ver === 2) {
                const msgBody = data.slice(
                  offset + headerLen,
                  offset + packetLen
                );
                const bufBody = zlib.inflateSync(new Uint8Array(msgBody));

                body = this.convertToObject(bufBody.buffer).body as string;
              } else {
                body = this.textDecoder.decode(
                  data.slice(offset + headerLen, offset + packetLen)
                );
              }

              this.messageReceived(ver, op, body, ts);

              enableLog && console.log('messageReceived:', { ver, body });
            } catch (e) {
              this.emit('error', e);
              enableLog && console.error('decode body error:', e);
            }
          }

          break;
      }
    });

    ws.on('close', () => {
      enableLog && console.log('closed');
      this.emit('close');

      if (heartbeatInterval) {
        clearInterval(heartbeatInterval);
      }

      setTimeout(reConnect, delay);
    });

    ws.on('error', (e) => {
      this.emit('error', e);
    });

    const reConnect = () => this.connect(--max, delay * 2);
  }

  private messageReceived(ver: Ver, op: Op, body: string | number, ts: number) {
    let cmd;
    if (typeof body === 'string') {
      ({ cmd } = JSON.parse(body) as Record<string, unknown>);
    }

    this.emit('message', { ver, op, ...(cmd ? { cmd } : {}), body, ts });
  }
}

export default Client;

import WebSocket from 'isomorphic-ws';
import zlib from 'zlib';
import { Buffer } from 'buffer';

import { headerOffset, verOffset } from './constants.ts';
import type { Token, LoggerFn, LoggerOption, Ver, Op } from './constants.ts';
import SubClient from './subClient.ts';

interface Options {
  token: Token;
  logger?: LoggerOption;
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
  private ws?: WebSocket;

  private log: LoggerFn;

  private MAX_CONNECT_TIMES: number;
  private DELAY: number;

  /**
   * 直播客户端
   * @constructor
   * @param {Token} token - 房间号或令牌
   */
  constructor(token: Token);

  /**
   * 直播客户端
   * @constructor
   * @param {Token} token - 房间号或令牌
   */
  constructor(token: Token);

  /**
   * 直播客户端
   * @constructor
   * @param {Token} token - 房间号或令牌
   * @param {LoggerOption} logger - 记录日志
   */
  constructor(token: Token, logger?: LoggerOption);

  /**
   * 直播客户端
   * @constructor
   * @param {Token} token - 房间号或令牌
   * @param {LoggerOption} logger - 记录日志
   * @param {number} maxConnectTimes - 最多重试次数，达到上限后重置，默认为 6
   */
  constructor(token: Token, logger?: LoggerOption, maxConnectTimes?: number);

  /**
   * 直播客户端
   * @constructor
   * @param {Token} token - 房间号或令牌
   * @param {LoggerOption} logger - 记录日志
   * @param {number} maxConnectTimes - 最多重试次数，达到上限后重置，默认为 6
   * @param {number} delay - 重试间隔，默认为 3000
   */
  constructor(
    token: Token,
    logger?: LoggerOption,
    maxConnectTimes?: number,
    delay?: number
  );

  constructor(
    token: Token,
    logger?: LoggerOption,
    maxConnectTimes?: number,
    delay?: number
  ) {
    super();

    if (!token) {
      throw new Error('miss token.');
    }

    this.MAX_CONNECT_TIMES = maxConnectTimes ?? 6; // 最多重试次数
    this.DELAY = delay ?? 3000; // 重试间隔

    this.options = { token, logger };
    if (typeof logger === 'function') {
      this.log = logger.bind(this);
    } else if (logger) {
      this.log = console.log.bind(console);
    } else {
      this.log = () => {};
    }

    this.connect(this.MAX_CONNECT_TIMES, this.DELAY);
  }

  private connect(max: number, delay: number) {
    this.ws = new WebSocket('wss://broadcastlv.chat.bilibili.com:2245/sub');
    this.ws.binaryType = 'arraybuffer';

    const { token: roomId } = this.options;

    this.ws.onopen = () => {
      this.log('auth start');

      const token = JSON.stringify(
        typeof roomId === 'number'
          ? {
              roomid: roomId,
              protover: 2,
              platform: 'web',
            }
          : roomId // token
      );

      this.ws?.send(this.convertToArrayBuffer(token, 7));
    };

    let heartbeatInterval: NodeJS.Timeout;

    this.ws.onmessage = (event) => {
      const { data } = event as { data: ArrayBuffer };
      const dataView = new DataView(data, 0);

      const ts = Math.floor(Date.now() / 1000);

      const { body, packetLen, headerLen, ver, op, seq } =
        this.convertToObject(data);

      if (op !== 3 && op !== 5) {
        this.log('receiveHeader:', {
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
            this.ws?.send(this.convertToArrayBuffer('', 2));

            this.log('send: heartbeat;');
          }, 30 * 1000);
          break;
        case 3:
          // 人气
          // heartbeat reply
          this.log('receive: heartbeat;', { online: body });

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
                const bufBody = zlib.inflateSync(Buffer.from(msgBody));

                body = this.convertToObject(
                  bufBody.buffer.slice(
                    bufBody.byteOffset,
                    bufBody.byteOffset + bufBody.byteLength
                  ) as ArrayBuffer
                ).body as string;
              } else if (ver === 3) {
                const msgBody = data.slice(
                  offset + headerLen,
                  offset + packetLen
                );
                const bufBody = zlib.brotliDecompressSync(Buffer.from(msgBody));

                body = this.convertToObject(
                  bufBody.buffer.slice(
                    bufBody.byteOffset,
                    bufBody.byteOffset + bufBody.byteLength
                  ) as ArrayBuffer
                ).body as string;
              } else {
                body = this.textDecoder.decode(
                  data.slice(offset + headerLen, offset + packetLen)
                );
              }

              this.messageReceived(ver, op, body, ts);

              this.log('messageReceived:', { ver, body });
            } catch (e) {
              this.emit('error', e);
              this.log('decode body error:', e);
            }
          }

          break;
      }
    };

    this.ws.onclose = ({ code }) => {
      this.log('closed');
      this.emit('close');

      if (heartbeatInterval) {
        clearInterval(heartbeatInterval);
      }

      if (code !== 1000 && !!max) setTimeout(reConnect, delay);
    };

    this.ws.onerror = (e) => {
      this.emit('error', e);
    };

    const reConnect = () => {
      if (--max === 0) {
        this.log('maxConnectTimes reached, reset delay.');

        max = this.MAX_CONNECT_TIMES - 1;
        delay = this.DELAY;
      }

      this.log('reConnect:', { max, delay });

      this.connect(max, delay * 2);
    };
  }

  private messageReceived(ver: Ver, op: Op, body: string | number, ts: number) {
    let cmd: string;
    switch (op) {
      case 3:
        this.emit('message', { ver, op, body, ts });
        break;
      case 5:
        ({ cmd } = JSON.parse(body as string));
        this.emit('message', { ver, op, cmd, body, ts });
        break;
      default:
        break;
    }
  }

  /**
   * 断开直播客户端
   */
  public close() {
    this.ws?.close(1000);
  }
}

export default Client;

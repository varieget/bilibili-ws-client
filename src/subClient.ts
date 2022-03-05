import EventEmitter from 'events';
import { TextEncoder, TextDecoder } from 'util';
import WebSocket from 'ws';
import zlib from 'zlib';

const packetOffset = 0; // 数据包
const headerOffset = 4; // 数据包头部
const rawHeaderLen = 16; // 数据包头部长度（固定为 16）
const verOffset = 6; // 协议版本
const opOffset = 8; // 操作类型
const seqOffset = 12; // 数据包头部

type Ver = 1 | 2;
type Op = 2 | 3 | 5 | 7 | 8;

type PacketStruct = {
  packetLen?: number;
  headerLen?: number;
  ver: Ver;
  seq?: number;
};

type DataPack =
  | (PacketStruct & { op: 2; body: never }) // send heartbeat
  | (PacketStruct & { op: 3; body: number }) // heartbeat reply
  | (PacketStruct & { op: 5; body: string }) // batch message
  | (PacketStruct & { op: 7; body: never }) // auth start
  | (PacketStruct & { op: 8; body: string }); // authorized

type Options = {
  roomId: number;
  enableLog?: boolean;
  maxConnectTimes?: number;
  delay?: number;
};

interface Client {
  options: Options;
  textDecoder: TextDecoder;
  textEncoder: TextEncoder;
}

class Client extends EventEmitter {
  constructor(options: Options) {
    super();

    if (!options.roomId) {
      throw new Error('miss roomId.');
    }

    const MAX_CONNECT_TIMES = options.maxConnectTimes ?? 10; // 最多重试次数
    const DELAY = options.delay ?? 15000; // 重试间隔

    this.options = { enableLog: true, ...options };

    this.textDecoder = new TextDecoder('utf-8');
    this.textEncoder = new TextEncoder();

    this.connect(MAX_CONNECT_TIMES, DELAY);
  }

  connect(max: number, delay: number) {
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

              this.messageReceived(ver, op, JSON.parse(body), ts);

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

  messageReceived(ver: Ver, op: Op, body: unknown, ts: number) {
    const { cmd } = body as Record<string, unknown>;

    this.emit('message', { ver, op, ...(cmd ? { cmd } : {}), body, ts });
  }

  convertToObject(data: ArrayBuffer) {
    // decode
    const dataView = new DataView(data, 0);
    const packetLen = dataView.getInt32(packetOffset);
    const headerLen = dataView.getInt16(headerOffset);
    const ver = dataView.getInt16(verOffset) as Ver;
    const op = dataView.getInt32(opOffset) as Op;
    const seq = dataView.getInt32(seqOffset);
    const msgBody = this.textDecoder.decode(data.slice(headerLen, packetLen));

    const result = { packetLen, headerLen, ver, op, seq } as DataPack;

    if (op === 3) {
      result.body = dataView.getInt32(rawHeaderLen);
    } else {
      result.body = msgBody;
    }

    return result;
  }

  convertToArrayBuffer(token = '', op: Op) {
    // encode
    const headerBuf = new ArrayBuffer(rawHeaderLen);
    const headerView = new DataView(headerBuf, 0);
    const bodyBuf = this.textEncoder.encode(token);

    headerView.setInt32(packetOffset, rawHeaderLen + bodyBuf.byteLength); // 数据包长度
    headerView.setInt16(headerOffset, rawHeaderLen);
    headerView.setInt16(verOffset, 1); // 协议版本 为1
    headerView.setInt32(opOffset, op); // op 操作码
    headerView.setInt32(seqOffset, 1); // 数据包头部长度（固定为 1）

    return this.mergeArrayBuffer(headerBuf, bodyBuf);
  }

  mergeArrayBuffer(ab1: ArrayBuffer, ab2: Uint8Array) {
    const u81 = new Uint8Array(ab1),
      u82 = new Uint8Array(ab2),
      res = new Uint8Array(ab1.byteLength + ab2.byteLength);

    res.set(u81, 0);
    res.set(u82, ab1.byteLength);

    return res.buffer;
  }
}

export default Client;

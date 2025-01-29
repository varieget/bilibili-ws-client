import EventEmitter from 'events';

import * as constants from './constants.ts';
import type { Ver, Op } from './constants.ts';

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

class SubClient extends EventEmitter {
  protected textDecoder = new TextDecoder('utf-8');
  protected textEncoder = new TextEncoder();

  protected convertToObject(data: ArrayBuffer) {
    // decode
    const dataView = new DataView(data, 0);
    const packetLen = dataView.getInt32(constants.packetOffset);
    const headerLen = dataView.getInt16(constants.headerOffset);
    const ver = dataView.getInt16(constants.verOffset) as Ver;
    const op = dataView.getInt32(constants.opOffset) as Op;
    const seq = dataView.getInt32(constants.seqOffset);
    const msgBody = this.textDecoder.decode(data.slice(headerLen, packetLen));

    const result = { packetLen, headerLen, ver, op, seq } as DataPack;

    if (op === 3) {
      result.body = dataView.getInt32(constants.rawHeaderLen);
    } else {
      result.body = msgBody;
    }

    return result;
  }

  protected convertToArrayBuffer(token = '', op: Op) {
    // encode
    const headerBuf = new ArrayBuffer(constants.rawHeaderLen);
    const headerView = new DataView(headerBuf, 0);
    const bodyBuf = this.textEncoder.encode(token);

    headerView.setInt32(
      constants.packetOffset,
      constants.rawHeaderLen + bodyBuf.byteLength
    ); // 数据包长度
    headerView.setInt16(constants.headerOffset, constants.rawHeaderLen);
    headerView.setInt16(constants.verOffset, 1); // 协议版本 为1
    headerView.setInt32(constants.opOffset, op); // op 操作码
    headerView.setInt32(constants.seqOffset, 1); // 数据包头部长度（固定为 1）

    return this.mergeArrayBuffer(headerBuf, bodyBuf);
  }

  private mergeArrayBuffer(ab1: ArrayBuffer, ab2: Uint8Array) {
    const u81 = new Uint8Array(ab1),
      u82 = new Uint8Array(ab2),
      res = new Uint8Array(ab1.byteLength + ab2.byteLength);

    res.set(u81, 0);
    res.set(u82, ab1.byteLength);

    return res.buffer;
  }
}

export default SubClient;

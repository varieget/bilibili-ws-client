/// <reference types="node" />
import EventEmitter from 'events';
import { TextEncoder, TextDecoder } from 'util';
import type { Ver, Op, DataPack, Options, SubClient } from './subClient';
declare class Client extends EventEmitter implements SubClient {
    options: Options;
    textDecoder: TextDecoder;
    textEncoder: TextEncoder;
    constructor(options: Options);
    connect(max: number, delay: number): void;
    messageReceived(ver: Ver, op: Op, body: unknown, ts: number): void;
    convertToObject(data: ArrayBuffer): DataPack;
    convertToArrayBuffer(token: string | undefined, op: Op): ArrayBufferLike;
    mergeArrayBuffer(ab1: ArrayBuffer, ab2: Uint8Array): ArrayBufferLike;
}
export default Client;

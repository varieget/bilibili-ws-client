/// <reference types="node" />
import { TextEncoder, TextDecoder } from 'util';
declare type Ver = 1 | 2;
declare type Op = 2 | 3 | 5 | 7 | 8;
declare type PacketStruct = {
    packetLen?: number;
    headerLen?: number;
    ver: Ver;
    seq?: number;
};
declare type DataPack = (PacketStruct & {
    op: 2;
    body: never;
}) | (PacketStruct & {
    op: 3;
    body: number;
}) | (PacketStruct & {
    op: 5;
    body: string;
}) | (PacketStruct & {
    op: 7;
    body: never;
}) | (PacketStruct & {
    op: 8;
    body: never;
});
declare type Options = {
    roomId: number;
    log(...rest: unknown[]): void;
    notify(msgBody: {
        ver: Ver;
        op: Op;
        cmd?: string;
        body: unknown;
        ts: number;
    }): void;
};
interface Client {
    options: Options;
    textDecoder: TextDecoder;
    textEncoder: TextEncoder;
}
declare class Client {
    constructor(options: Options);
    connect(max: number, delay: number): void;
    messageReceived(ver: Ver, op: Op, body: unknown, ts: number): void;
    convertToObject(data: ArrayBuffer): DataPack;
    convertToArrayBuffer(token: string | undefined, op: Op): ArrayBufferLike;
    mergeArrayBuffer(ab1: ArrayBuffer, ab2: Uint8Array): ArrayBufferLike;
}
export default Client;

/// <reference types="node" />
import type { TextEncoder, TextDecoder } from 'util';
export declare type Ver = 1 | 2;
export declare type Op = 2 | 3 | 5 | 7 | 8;
declare type PacketStruct = {
    packetLen?: number;
    headerLen?: number;
    ver: Ver;
    seq?: number;
};
export declare type DataPack = (PacketStruct & {
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
    body: string;
});
export declare type Options = {
    roomId: number;
    enableLog?: boolean;
    maxConnectTimes?: number;
    delay?: number;
};
export interface SubClient {
    options: Options;
    textDecoder: TextDecoder;
    textEncoder: TextEncoder;
}
export {};
